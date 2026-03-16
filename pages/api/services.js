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
    query = query.eq('district', district)
  }

  if (category) {
    // חפש הן בעמודת category הן במערך categories
    query = query.or(`category.eq.${category},categories.cs.{${category}}`)
  }

  if (subcategory) {
    query = query.eq('subcategory', subcategory)
  }

  if (age_group) {
    query = query.contains('age_groups', [age_group])
  }

  if (diagnosis) {
    query = query.contains('diagnoses', [diagnosis])
  }

  if (population) {
    query = query.contains('populations', [population])
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json(data || [])
}
