import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const [
    { count: rehabCount },
    { count: treatmentCount },
    { data: recentRehab },
    { data: recentTreatment },
  ] = await Promise.all([
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('treatment_services').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('services').select('id, name, city, district, category, subcategory, created_at, is_national')
      .eq('status', 'approved').order('created_at', { ascending: false }).limit(4),
    supabase.from('treatment_services').select('id, name, city, district, category, created_at, is_national')
      .eq('status', 'approved').order('created_at', { ascending: false }).limit(4),
  ])

  // מיזוג + מיון לפי תאריך — 5 הכי חדשים
  const recent = [...(recentRehab || []).map(s => ({ ...s, _type: 'rehab' })), ...(recentTreatment || []).map(s => ({ ...s, _type: 'treatment' }))]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  res.status(200).json({
    rehabCount: rehabCount || 0,
    treatmentCount: treatmentCount || 0,
    total: (rehabCount || 0) + (treatmentCount || 0),
    recent,
  })
}
