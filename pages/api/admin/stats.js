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
  const [{ data: rehabData, error: e1 }, { data: treatmentData, error: e2 }] = await Promise.all([
    supabase.from('services').select('category, district, status'),
    supabase.from('treatment_services').select('category, district, status'),
  ])
  if (e1 || e2) return res.status(500).json({ error: e1?.message || e2?.message })

  const approved = rehabData.filter(s => s.status === 'approved')
  const pending = rehabData.filter(s => s.status === 'pending')
  const rejected = rehabData.filter(s => s.status === 'rejected')

  const approvedTreatment = treatmentData.filter(s => s.status === 'approved')
  const pendingTreatment = treatmentData.filter(s => s.status === 'pending')
  const rejectedTreatment = treatmentData.filter(s => s.status === 'rejected')

  const byCategory = {}
  approved.forEach(s => { byCategory[s.category] = (byCategory[s.category] || 0) + 1 })

  const byDistrict = {}
  approved.forEach(s => { byDistrict[s.district] = (byDistrict[s.district] || 0) + 1 })

  const crossTable = {}
  approved.forEach(s => {
    if (!crossTable[s.category]) crossTable[s.category] = {}
    crossTable[s.category][s.district] = (crossTable[s.category][s.district] || 0) + 1
  })

  const byCategoryTreatment = {}
  approvedTreatment.forEach(s => { byCategoryTreatment[s.category] = (byCategoryTreatment[s.category] || 0) + 1 })

  const byDistrictTreatment = {}
  approvedTreatment.forEach(s => { byDistrictTreatment[s.district] = (byDistrictTreatment[s.district] || 0) + 1 })

  const crossTableTreatment = {}
  approvedTreatment.forEach(s => {
    if (!crossTableTreatment[s.category]) crossTableTreatment[s.category] = {}
    crossTableTreatment[s.category][s.district] = (crossTableTreatment[s.category][s.district] || 0) + 1
  })

  res.status(200).json({
    total: rehabData.length,
    approved: approved.length,
    pending: pending.length,
    rejected: rejected.length,
    byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
    byDistrict: Object.entries(byDistrict).map(([name, value]) => ({ name, value })),
    crossTable,
    totalTreatment: treatmentData.length,
    approvedTreatment: approvedTreatment.length,
    pendingTreatment: pendingTreatment.length,
    rejectedTreatment: rejectedTreatment.length,
    byCategoryTreatment: Object.entries(byCategoryTreatment).map(([name, value]) => ({ name, value })),
    byDistrictTreatment: Object.entries(byDistrictTreatment).map(([name, value]) => ({ name, value })),
    crossTableTreatment,
  })
}
