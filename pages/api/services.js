import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { district, category, subcategory, search, national, age_group, diagnosis, population } = req.query

  let query = supabase
    .from('services')
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

  if (subcategory) {
    query = query.eq('subcategory', subcategory)
  }

  if (age_group) {
    // הצג שירות אם: סימן את הגיל המבוקש, או לא סימן גיל בכלל
    query = query.or(`age_groups.cs.{${age_group}},age_groups.eq.{}`)
  }

  if (diagnosis) {
    query = query.or(`diagnoses.cs.{${diagnosis}},diagnoses.eq.{}`)
  }

  if (population) {
    query = query.or(`populations.cs.{${population}},populations.eq.{}`)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json(data || [])
}
