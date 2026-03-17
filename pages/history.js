import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  const adminKey = req.headers['adminkey']
  if (adminKey !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const { service_id } = req.query
    const query = supabase.from('edit_history').select('*').order('changed_at', { ascending: false }).limit(50)
    if (service_id) query.eq('service_id', service_id)
    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'POST') {
    const { service_id, service_name, table, changes } = req.body
    const { error } = await supabase.from('edit_history').insert([{
      service_id, service_name, table_name: table, changes, changed_at: new Date().toISOString()
    }])
    if (error) return res.status(500).json({ error: error.message })
    return res.status(201).json({ ok: true })
  }

  res.status(405).end()
}
