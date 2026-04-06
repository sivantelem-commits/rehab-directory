import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// נרמול טקסט עברי — מסיר וואו השמוש ומאחד וריאנטים
function normalizeHebrew(str) {
  return str
    .replace(/[בכלמשו](?=\S)/g, '') // וואו השמוש: ב/כ/ל/מ/ש/ו בתחילת מילה
    .replace(/[^\u05D0-\u05EAa-zA-Z0-9\s]/g, '') // רק אותיות ומספרים
    .trim()
}

// בניית תנאי חיפוש מורחב
function buildSearchClauses(search) {
  const base = search.trim()
  const normalized = normalizeHebrew(base)
  const terms = [...new Set([base, normalized].filter(Boolean))]

  const fields = ['name', 'city', 'description', 'category', 'subcategory']
  const clauses = []
  terms.forEach(term => {
    fields.forEach(field => {
      clauses.push(`${field}.ilike.%${term}%`)
    })
  })
  return [...new Set(clauses)].join(',')
}

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
    query = query.contains('age_groups', [age_group])
  }

  if (diagnosis) {
    query = query.contains('diagnoses', [diagnosis])
  }

  if (population) {
    const pops = Array.isArray(population) ? population : [population]
    pops.forEach(p => { query = query.contains('populations', [p]) })
  }

  if (search) {
    query = query.or(buildSearchClauses(search))
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.status(200).json(data || [])
}
