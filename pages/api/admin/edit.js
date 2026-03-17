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
  if (req.method !== 'PATCH') return res.status(405).end()
  const { id, table, name, district, city, category, subcategory, categories,
          description, phone, email, website, address, is_national,
          age_groups, diagnoses, populations } = req.body
  const tableName = table === 'treatment' ? 'treatment_services' : 'services'
  const { data, error } = await supabase
    .from(tableName)
    .update({
      name, district, city, category, subcategory, description,
      phone, email, website, address, is_national,
      age_groups: age_groups || [],
      diagnoses: diagnoses || [],
      populations: populations || [],
      ...(table !== 'treatment' && { categories: categories || [] }),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json(data)
}
