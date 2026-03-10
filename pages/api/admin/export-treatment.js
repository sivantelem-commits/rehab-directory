import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const adminKey = req.headers['adminkey']
  if (adminKey !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { status, district, category } = req.query

  let query = supabase.from('treatment_services').select('*')
  if (status) query = query.eq('status', status)
  if (district) query = query.eq('district', district)
  if (category) query = query.eq('category', category)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json(data || [])
}
