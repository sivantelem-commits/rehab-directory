import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { district, category, search, national, age_group, diagnosis, population } = req.query

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
    // סינון לפי קטגוריה ראשית או קטגוריות נוספות
    query = query.or(`category.eq.${category},categories.cs.{${category}}`)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (age_group) {
    query = query.contains('age_groups', [age_group])
  }

  if (diagnosis) {
    query = query.contains('diagnoses', [diagnosis])
  }

  if (population) {
    const pops = Array.isArray(population) ? population : [population]
    pops.forEach(p => { query = query.contains('populations', [p]) })
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json(data || [])
}
