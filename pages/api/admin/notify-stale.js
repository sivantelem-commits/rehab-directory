// pages/api/admin/notify-stale.js
// שולח מייל לשירותים שלא עודכנו מעל 6 חודשים
// קריאה: POST /api/admin/notify-stale עם adminkey header
// אפשר לקרוא גם מ-cron job חיצוני (Vercel Cron / GitHub Actions)

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL    = process.env.FROM_EMAIL || 'noreply@rehabdirectoryil.vercel.app'
const SITE_URL      = 'https://rehabdirectoryil.vercel.app'
const STALE_MONTHS  = 6

async function sendStaleEmail({ to, serviceName, serviceId, type }) {
  const updateUrl = `${SITE_URL}/contact?type=fix&service=${encodeURIComponent(serviceName)}`
  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #333;">
      <div style="background: #1A3A5C; padding: 20px; text-align: center;">
        <h2 style="color: white; margin: 0; font-size: 20px;">בריאות נפש בישראל</h2>
      </div>
      <div style="padding: 28px 24px;">
        <h3 style="color: #1A3A5C; margin-top: 0;">האם השירות שלכם עדיין פעיל?</h3>
        <p>שלום,</p>
        <p>השירות <strong>"${serviceName}"</strong> רשום במאגר בריאות הנפש שלנו, אך לא עודכן מעל ${STALE_MONTHS} חודשים.</p>
        <p>כדי לשמור על מידע מדויק עבור המשתמשים שלנו, אנו מבקשים לאשר שהשירות עדיין פעיל ושהפרטים מעודכנים.</p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${updateUrl}" style="background: #8B00D4; color: white; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
            ✓ הפרטים מעודכנים — אשרו כאן
          </a>
        </div>
        <p style="font-size: 13px; color: #888;">
          אם השירות כבר אינו פעיל, אנא השיבו למייל זה ונסיר אותו מהמאגר.<br>
          אם לא תגיבו תוך 30 יום, השירות יוסר אוטומטית.
        </p>
      </div>
      <div style="background: #f5f5f5; padding: 16px; text-align: center; font-size: 12px; color: #aaa;">
        <a href="${SITE_URL}" style="color: #8B00D4; text-decoration: none;">rehabdirectoryil.vercel.app</a>
      </div>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject: `עדכון נדרש: האם השירות "${serviceName}" עדיין פעיל?`,
      html,
    }),
  })
  return res.ok
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const adminKey = req.headers['adminkey'] || req.body?.adminkey
  if (adminKey !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Unauthorized' })

  const staleDate = new Date()
  staleDate.setMonth(staleDate.getMonth() - STALE_MONTHS)
  const staleDateISO = staleDate.toISOString()

  // שיקום
  const { data: staleRehab } = await supabase
    .from('services')
    .select('id, name, email, contact_email, updated_at, stale_notified_at')
    .eq('status', 'approved')
    .lt('updated_at', staleDateISO)
    .not('email', 'is', null)

  // טיפול
  const { data: staleTreatment } = await supabase
    .from('treatment_services')
    .select('id, name, email, contact_email, updated_at, stale_notified_at')
    .eq('status', 'approved')
    .lt('updated_at', staleDateISO)
    .not('email', 'is', null)

  const allStale = [
    ...(staleRehab || []).map(s => ({ ...s, _type: 'rehab' })),
    ...(staleTreatment || []).map(s => ({ ...s, _type: 'treatment' })),
  ]

  // מסנן שירותים שכבר קיבלו התראה לאחרונה (עד 30 יום אחורה)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const toNotify = allStale.filter(s =>
    !s.stale_notified_at || s.stale_notified_at < thirtyDaysAgo
  )

  let sent = 0, failed = 0
  const results = []

  for (const service of toNotify) {
    const to = service.contact_email || service.email
    if (!to) continue

    const ok = await sendStaleEmail({ to, serviceName: service.name, serviceId: service.id, type: service._type })

    if (ok) {
      // מעדכן stale_notified_at
      const table = service._type === 'treatment' ? 'treatment_services' : 'services'
      await supabase.from(table).update({ stale_notified_at: new Date().toISOString() }).eq('id', service.id)
      sent++
      results.push({ id: service.id, name: service.name, email: to, status: 'sent' })
    } else {
      failed++
      results.push({ id: service.id, name: service.name, email: to, status: 'failed' })
    }
  }

  return res.status(200).json({
    totalStale: allStale.length,
    eligible:   toNotify.length,
    sent,
    failed,
    results,
  })
}
