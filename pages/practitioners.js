// pages/api/admin/practitioners.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  const adminKey = req.headers['adminkey']
  if (adminKey !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const { status } = req.query
    let query = supabase.from('practitioners').select('*')
    if (status) query = query.eq('status', status)
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'PATCH') {
    const { id, status, is_verified } = req.body
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const updates = { updated_at: new Date().toISOString() }
    if (status      !== undefined) updates.status      = status
    if (is_verified !== undefined) updates.is_verified = is_verified
    const { error } = await supabase.from('practitioners').update(updates).eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    const { error } = await supabase.from('practitioners').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  res.status(405).end()
}
