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
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
    }
  } catch (e) {}
  return { lat: null, lng: null }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, district, city, type, description, phone, email, website, address } = req.body

  if (!name || !district || !city || !type || !phone || !email) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { lat, lng } = await geocode(city, address)

  const { data, error } = await supabase
    .from('services')
    .insert([{ name, district, city, type, description, phone, email, website, address, status: 'pending', lat, lng }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
}
