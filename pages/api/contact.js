import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const TYPE_LABELS = {
  improvement: '💡 הצעה לשיפור הפורטל',
  fix: '🔧 תיקון/עדכון פרטי שירות קיים',
  inactive: '⚠️ דיווח על שירות לא פעיל',
  general: '💬 פנייה כללית / שאלה',
  new_service: '➕ הצעה לשירות חדש שחסר',
}

async function sendContactNotification({ type, name, email, message, serviceName }) {
  const typeLabel = TYPE_LABELS[type] || type
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'sivantelem@gmail.com',
        subject: `📩 פנייה חדשה – ${typeLabel}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1A3A5C; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 20px;">פנייה חדשה בפורטל</h1>
              <p style="color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 14px;">${typeLabel}</p>
            </div>
            <div style="background: white; padding: 32px; border: 1px solid #e0e0e0; border-radius: 0 0 12px 12px;">
              <div style="background: #F8F9FF; border-right: 4px solid #1A3A5C; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.8;">
                  👤 <strong>שם:</strong> ${name || 'אנונימי'}<br/>
                  ✉️ <strong>מייל:</strong> ${email || '-'}
                  ${serviceName ? `<br/>🔍 <strong>שירות:</strong> ${serviceName}` : ''}
                </p>
              </div>
              <div style="background: #FFFDF5; border: 1px solid #FFE8A0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 0 0 6px; font-weight: 700; color: #1A3A5C; font-size: 13px;">ההודעה:</p>
                <p style="margin: 0; color: #334; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
              </div>
              <a href="https://rehabdirectoryil.vercel.app/admin" style="display: block; text-align: center; background: #1A3A5C; color: white; padding: 12px 24px; border-radius: 20px; text-decoration: none; font-weight: 700; margin-top: 20px;">
                עברי לפאנל הניהול
              </a>
            </div>
          </div>
        `,
      }),
    })
  } catch (e) {
    console.error('Email error:', e)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { type, name, email, message, serviceName } = req.body

  if (!type || !message?.trim()) {
    return res.status(400).json({ error: 'נא למלא סוג פנייה והודעה' })
  }

  // שמירה ב-Supabase
  const { error } = await supabase
    .from('contact_messages')
    .insert([{ type, name: name || null, email: email || null, message, service_name: serviceName || null }])

  if (error) {
    console.error('Supabase error:', error)
    // ממשיכים גם אם השמירה נכשלה - עדיין שולחים מייל
  }

  await sendContactNotification({ type, name, email, message, serviceName })

  res.status(200).json({ ok: true })
}
