import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, district, city, category, description, phone, email, website, address } = req.body

  if (!name || !district || !city || !category || !phone || !email) {
    return res.status(400).json({ error: 'שדות חובה חסרים' })
  }

  const { data, error } = await supabase.from('treatment_services').insert([{
    name, district, city, category, description, phone, email, website, address,
    status: 'pending',
  }]).select()

  if (error) return res.status(500).json({ error: error.message })

  // מייל לאדמין
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'sivantelem@gmail.com',
    subject: `בקשת שירות טיפולי חדש: ${name}`,
    html: `
      <div dir="rtl" style="font-family: Arial; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0277BD;">בקשת שירות טיפולי חדש</h2>
        <p><strong>שם:</strong> ${name}</p>
        <p><strong>קטגוריה:</strong> ${category}</p>
        <p><strong>עיר:</strong> ${city}, ${district}</p>
        <p><strong>טלפון:</strong> ${phone}</p>
        <p><strong>מייל:</strong> ${email}</p>
        ${website ? `<p><strong>אתר:</strong> ${website}</p>` : ''}
        ${description ? `<p><strong>תיאור:</strong> ${description}</p>` : ''}
        <a href="https://rehabdirectoryil.vercel.app/admin" style="background:#0277BD;color:white;padding:10px 20px;border-radius:20px;text-decoration:none;display:inline-block;margin-top:16px;">
          לפאנל הניהול
        </a>
      </div>
    `,
  })

  res.status(200).json({ success: true })
}
