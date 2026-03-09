import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { district, category, subcategory, search } = req.query

  let query = supabase
    .from('services')
    .select('*')
    .eq('status', 'approved')

  if (district) query = query.eq('district', district)
  if (category) query = query.eq('category', category)
  if (subcategory) query = query.eq('subcategory', subcategory)
  if (search) query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,description.ilike.%${search}%`)

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json(data || [])
}
