// pages/api/submit-practitioner.js
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const {
    name, email, license_number, profession,
    treatment_types, specializations,
    city, district, is_online,
    health_funds, is_defense_ministry,
    languages, price_range, bio, photo_url,
    phone, website,
  } = req.body

  if (!name || !email || !license_number || !city) {
    return res.status(400).json({ error: 'שדות חובה חסרים: שם, מייל, מספר רישיון ועיר' })
  }

  const { data, error } = await supabase
    .from('practitioners')
    .insert([{
      name, email, license_number,
      profession: profession || null,
      treatment_types:  Array.isArray(treatment_types)  ? treatment_types  : [],
      specializations:  Array.isArray(specializations)  ? specializations  : [],
      city,
      district: district || null,
      is_online: !!is_online,
      health_funds:     Array.isArray(health_funds)     ? health_funds     : [],
      is_defense_ministry: !!is_defense_ministry,
      languages:        Array.isArray(languages)        ? languages        : [],
      price_range: price_range || null,
      bio:       bio       || null,
      photo_url: photo_url || null,
      phone:     phone     || null,
      website:   website   || null,
      status: 'pending',
      is_verified: false,
    }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'sivantelem@gmail.com',
      subject: `🧠 מטפל/ת חדש/ה להוספה – ${name}`,
      html: `
        <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0F4C75;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:20px">בקשת מטפל/ת חדש/ה לאישור</h1>
          </div>
          <div style="background:white;padding:32px;border:1px solid #e0f0ff;border-radius:0 0 12px 12px">
            <h2 style="margin:0 0 8px;color:#0F4C75">${name}</h2>
            <p style="color:#666;font-size:14px;margin:0;line-height:1.8">
              🏷️ ${profession || 'לא צוין מקצוע'}<br/>
              📍 ${city}${district ? `, ${district}` : ''}<br/>
              📜 מספר רישיון: ${license_number}<br/>
              ✉️ ${email}<br/>
              ${phone                  ? `📞 ${phone}<br/>`                                             : ''}
              ${is_online              ? '🌐 מטפל/ת אונליין<br/>'                                      : ''}
              ${is_defense_ministry    ? '🎗️ ספק משרד הביטחון<br/>'                                    : ''}
              ${treatment_types?.length  ? `💊 סוגי טיפול: ${treatment_types.join(', ')}<br/>`         : ''}
              ${specializations?.length  ? `🎯 התמחויות: ${specializations.join(', ')}<br/>`           : ''}
              ${health_funds?.length     ? `🏥 קופות חולים: ${health_funds.join(', ')}<br/>`           : ''}
            </p>
            ${bio ? `<p style="color:#334;font-size:14px;margin-top:16px;border-top:1px solid #eee;padding-top:16px">${bio}</p>` : ''}
            <a href="https://rehabdirectoryil.vercel.app/admin"
               style="display:block;text-align:center;background:#0F4C75;color:white;padding:12px 24px;border-radius:20px;text-decoration:none;font-weight:700;margin-top:20px">
              לפאנל הניהול לאישור
            </a>
          </div>
        </div>
      `,
    })
  } catch (e) { console.error('Email error:', e) }

  res.status(201).json(data)
}
