import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, district, city, type, description, phone, email, website, address } = req.body

  if (!name || !district || !city || !type) {
    return res.status(400).json({ error: 'שדות חובה חסרים' })
  }

  const { data, error } = await supabase
    .from('services')
    .insert([{ name, district, city, type, description, phone, email, website, address, status: 'pending' }])
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
}
