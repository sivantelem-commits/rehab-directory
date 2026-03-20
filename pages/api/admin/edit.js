import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
export default async function handler(req, res) {
  const adminKey = req.headers['adminkey']
  if (adminKey !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' })
  if (req.method !== 'PATCH') return res.status(405).end()
  const { id, table, name, district, districts, city, category, subcategory, categories,
          description, phone, email, website, address, is_national, is_regional,
          age_groups, diagnoses, populations } = req.body
  const tableName = table === 'treatment' ? 'treatment_services' : 'services'
  const { data: before } = await supabase.from(tableName).select('*').eq('id', id).single()
  const updates = {
    name, district, city, category, subcategory, description,
    phone, email, website, address, is_national,
    districts: districts || [],
    is_regional: !!is_regional,
    age_groups: age_groups || [],
    diagnoses: diagnoses || [],
    populations: populations || [],
    ...(table !== 'treatment' && { categories: categories || [] }),
    updated_at: new Date().toISOString()
  }
  const { data, error } = await supabase.from(tableName).update(updates).eq('id', id).select().single()
  if (error) return res.status(500).json({ error: error.message })
  if (before) {
    const TRACKED = ['name','district','districts','city','category','subcategory','description','phone','email','website','address','is_national','is_regional','age_groups','diagnoses','populations','categories']
    const changes = {}
    for (const key of TRACKED) {
      const bv = JSON.stringify(before[key] ?? null)
      const av = JSON.stringify(updates[key] ?? null)
      if (bv !== av) changes[key] = { before: before[key], after: updates[key] }
    }
    if (Object.keys(changes).length > 0) {
      await supabase.from('edit_history').insert([{
        service_id: id,
        service_name: name,
        table_name: tableName,
        changes,
        changed_at: new Date().toISOString()
      }])
    }
  }
  res.status(200).json(data)
}
