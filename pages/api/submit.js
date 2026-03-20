import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function geocode(city, address) {
  try {
    const query = encodeURIComponent(`${address || ''} ${city} ישראל`)
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: { 'User-Agent': 'rehab-directory/1.0' }
    })
    const data = await res.json()
    if (data && data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch (e) {}
  return { lat: null, lng: null }
}

async function sendAdminNotification(service) {
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
        subject: `🔔 בקשה חדשה לאישור – ${service.name}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1A3A5C; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 20px;">בקשה חדשה לאישור שירות</h1>
            </div>
            <div style="background: white; padding: 32px; border: 1px solid #FFE8D6; border-radius: 0 0 12px 12px;">
              <div style="background: #FFF8F3; border-right: 4px solid #F47B20; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 8px; color: #1A3A5C;">${service.name}</h2>
                <p style="margin: 0; color: #666; font-size: 14px;">
                  📍 ${service.city}, ${service.district || 'ארצי'}<br/>
                  🏷️ ${service.category}${service.subcategory ? ` › ${service.subcategory}` : ''}
                  ${service.categories?.length ? `<br/>📂 קטגוריות נוספות: ${service.categories.join(', ')}` : ''}<br/>
                  📞 ${service.phone || '-'}<br/>
                  ✉️ ${service.email || '-'}<br/>
                  👤 איש קשר: ${service.contact_name || '-'}${service.contact_role ? ` (${service.contact_role})` : ''}<br/>
                  📱 טלפון לבירורים: ${service.contact_phone || '-'}<br/>
                  ✉️ מייל לבירורים: ${service.contact_email || '-'}
                </p>
              </div>
              ${service.description ? `<p style="color: #334; font-size: 14px; line-height: 1.6;">${service.description}</p>` : ''}
              <a href="https://rehabdirectoryil.vercel.app/admin" style="display: block; text-align: center; background: #F47B20; color: white; padding: 12px 24px; border-radius: 20px; text-decoration: none; font-weight: 700; margin-top: 20px;">
                עברי לפאנל הניהול לאישור
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

  const {
    name, district, city, category, subcategory, categories,
    age_groups, diagnoses, populations,
    description, phone, email, website, address, is_national,
    contact_name, contact_role, contact_phone, contact_email
  } = req.body

  if (!name || (!district && !is_national) || !city || !phone || !email) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { lat, lng } = await geocode(city, address)

  // בנה מערך קטגוריות מלא - הקטגוריה הראשית + הנוספות
  const allCategories = Array.from(new Set([
    ...(category ? [category] : []),
    ...(Array.isArray(categories) ? categories : []),
  ]))

  const { data, error } = await supabase
    .from('services')
    .insert([{
      name, district, city, category, subcategory,
      categories: allCategories,
      age_groups: Array.isArray(age_groups) ? age_groups : [],
      diagnoses: Array.isArray(diagnoses) ? diagnoses : [],
      populations: Array.isArray(populations) ? populations : [],
      description, phone, email, website, address,
      is_national: !!is_national,
      contact_name: contact_name || null,
      contact_role: contact_role || null,
      contact_phone: contact_phone || null,
      contact_email: contact_email || null,
      status: 'pending', lat, lng,
    }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })

  await sendAdminNotification({ name, district, city, category, subcategory, categories, description, phone, email, contact_name, contact_role, contact_phone, contact_email })
  res.status(201).json(data)
}
