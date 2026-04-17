// pages/api/practitioners.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { id, treatment_type, certification, specialization, health_fund_agreement, online, defense, search } = req.query

  if (id) {
    const { data, error } = await supabase
      .from('practitioners')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .single()
    if (error) return res.status(404).json({ error: 'Not found' })
    return res.status(200).json(data)
  }

  let query = supabase
    .from('practitioners')
    .select('*')
    .eq('status', 'approved')

  if (treatment_type)             query = query.contains('treatment_types', [treatment_type])
  if (certification)              query = query.contains('certifications', [certification])
  if (specialization)             query = query.contains('specializations', [specialization])
  if (health_fund_agreement === 'true') query = query.eq('has_health_fund_agreement', true)
  if (online === 'true')          query = query.eq('is_online', true)
  if (defense === 'true')         query = query.eq('is_defense_ministry', true)

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,city.ilike.%${search}%,bio.ilike.%${search}%`
    )
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json(data || [])
}
