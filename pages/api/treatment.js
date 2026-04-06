import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { id, district, category, search, national, age_group, diagnosis, population } = req.query

  if (id) {
    const { data, error } = await supabase
      .from('treatment_services')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .single()
    if (error) return res.status(404).json({ error: 'Service not found' })
    return res.status(200).json(data)
  }

  let query = supabase
    .from('treatment_services')
    .select('*')
    .eq('status', 'approved')

  if (national === 'true') {
    query = query.eq('is_national', true)
  } else if (district) {
    query = query.or(`district.eq.${district},districts.cs.{${district}}`)
  }

  if (category) {
    query = query.or(`category.eq.${category},categories.cs.{${category}}`)
  }

  if (age_group) {
    const ags = Array.isArray(age_group) ? age_group : [age_group]
    ags.forEach(ag => { query = query.contains('age_groups', [ag]) })
  }

  if (diagnosis) {
    const diags = Array.isArray(diagnosis) ? diagnosis : [diagnosis]
    diags.forEach(d => { query = query.contains('diagnoses', [d]) })
  }

  if (population) {
    const pops = Array.isArray(population) ? population : [population]
    pops.forEach(p => { query = query.contains('populations', [p]) })
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json(data || [])
}
