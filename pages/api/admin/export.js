import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  const adminKey = req.headers['adminkey']
  if (adminKey !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'GET') return res.status(405).end()

  const { district, category, subcategory, status } = req.query

  let query = supabase.from('services').select('*')

  if (status) query = query.eq('status', status)
  if (district) query = query.eq('district', district)
  if (category) query = query.eq('category', category)
  if (subcategory) query = query.eq('subcategory', subcategory)

  const { data, error } = await query.order('category').order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  res.status(200).json(data || [])
}
