import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { name, city, category, type } = req.query
  if (!name || name.length < 2) return res.status(200).json([])

  const table = type === 'treatment' ? 'treatment_services' : 'services'

  let query = supabase
    .from(table)
    .select('id, name, city, category, district, phone')
    .neq('status', 'rejected')
    .ilike('name', `%${name}%`)
    .limit(5)

  if (city) query = query.ilike('city', `%${city}%`)
  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) return res.status(500).json([])

  res.status(200).json(data || [])
}
