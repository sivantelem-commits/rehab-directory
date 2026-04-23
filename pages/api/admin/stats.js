import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  const adminKey = req.headers['adminkey']
  if (adminKey !== process.env.ADMIN_PASSWORD)
    return res.status(401).json({ error: 'Unauthorized' })

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: rehabData },
    { data: treatmentData },
    { data: practData },
  ] = await Promise.all([
    supabase.from('services').select('category, district, status, lat, lng, created_at'),
    supabase.from('treatment_services').select('category, district, status, lat, lng, created_at'),
    supabase.from('practitioners').select('profession, district, status, created_at, specializations'),
  ])

  const rehab    = rehabData    || []
  const treat    = treatmentData || []
  const pract    = practData    || []

  // ── שיקום ──
  const rehabApproved  = rehab.filter(s => s.status === 'approved')
  const rehabPending   = rehab.filter(s => s.status === 'pending')
  const rehabRejected  = rehab.filter(s => s.status === 'rejected')
  const rehabNoLoc     = rehabApproved.filter(s => !s.lat)
  const rehabNewWeek   = rehab.filter(s => s.created_at >= weekAgo)

  const rehabByCategory = {}
  rehabApproved.forEach(s => { rehabByCategory[s.category] = (rehabByCategory[s.category] || 0) + 1 })

  const rehabByDistrict = {}
  rehabApproved.forEach(s => { if (s.district) rehabByDistrict[s.district] = (rehabByDistrict[s.district] || 0) + 1 })

  const rehabCross = {}
  rehabApproved.forEach(s => {
    if (!rehabCross[s.category]) rehabCross[s.category] = {}
    if (s.district) rehabCross[s.category][s.district] = (rehabCross[s.category][s.district] || 0) + 1
  })

  // ── טיפול ──
  const treatApproved  = treat.filter(s => s.status === 'approved')
  const treatPending   = treat.filter(s => s.status === 'pending')
  const treatRejected  = treat.filter(s => s.status === 'rejected')
  const treatNoLoc     = treatApproved.filter(s => !s.lat)
  const treatNewWeek   = treat.filter(s => s.created_at >= weekAgo)

  const treatByCategory = {}
  treatApproved.forEach(s => { treatByCategory[s.category] = (treatByCategory[s.category] || 0) + 1 })

  const treatByDistrict = {}
  treatApproved.forEach(s => { if (s.district) treatByDistrict[s.district] = (treatByDistrict[s.district] || 0) + 1 })

  const treatCross = {}
  treatApproved.forEach(s => {
    if (!treatCross[s.category]) treatCross[s.category] = {}
    if (s.district) treatCross[s.category][s.district] = (treatCross[s.category][s.district] || 0) + 1
  })

  // ── מטפלים ──
  const practApproved  = pract.filter(p => p.status === 'approved')
  const practPending   = pract.filter(p => p.status === 'pending')
  const practRejected  = pract.filter(p => p.status === 'rejected')
  const practNewWeek   = pract.filter(p => p.created_at >= weekAgo)

  const practByProfession = {}
  practApproved.forEach(p => { if (p.profession) practByProfession[p.profession] = (practByProfession[p.profession] || 0) + 1 })

  const practByDistrict = {}
  practApproved.forEach(p => { if (p.district) practByDistrict[p.district] = (practByDistrict[p.district] || 0) + 1 })

  // ספירת התמחויות
  const practBySpecialization = {}
  practApproved.forEach(p => {
    (p.specializations || []).forEach(sp => {
      practBySpecialization[sp] = (practBySpecialization[sp] || 0) + 1
    })
  })

  res.status(200).json({
    // ── שיקום ──
    rehabTotal:    rehab.length,
    rehabApproved: rehabApproved.length,
    rehabPending:  rehabPending.length,
    rehabRejected: rehabRejected.length,
    rehabNoLoc:    rehabNoLoc.length,
    rehabNewWeek:  rehabNewWeek.length,
    rehabByCategory: Object.entries(rehabByCategory).map(([name, value]) => ({ name, value })),
    rehabByDistrict: Object.entries(rehabByDistrict).map(([name, value]) => ({ name, value })),
    rehabCross,

    // ── טיפול ──
    treatTotal:    treat.length,
    treatApproved: treatApproved.length,
    treatPending:  treatPending.length,
    treatRejected: treatRejected.length,
    treatNoLoc:    treatNoLoc.length,
    treatNewWeek:  treatNewWeek.length,
    treatByCategory: Object.entries(treatByCategory).map(([name, value]) => ({ name, value })),
    treatByDistrict: Object.entries(treatByDistrict).map(([name, value]) => ({ name, value })),
    treatCross,

    // ── מטפלים ──
    practTotal:    pract.length,
    practApproved: practApproved.length,
    practPending:  practPending.length,
    practRejected: practRejected.length,
    practNewWeek:  practNewWeek.length,
    practByProfession: Object.entries(practByProfession)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value })),
    practByDistrict: Object.entries(practByDistrict).map(([name, value]) => ({ name, value })),
    practBySpecialization: Object.entries(practBySpecialization)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([name, value]) => ({ name, value })),

    // ── סיכום כללי ──
    grandTotal:   rehabApproved.length + treatApproved.length + practApproved.length,
    totalNoLoc:   rehabNoLoc.length + treatNoLoc.length,
    totalNewWeek: rehabNewWeek.length + treatNewWeek.length + practNewWeek.length,
    totalPending: rehabPending.length + treatPending.length + practPending.length,

    // תאימות לאחור
    total: rehab.length, approved: rehabApproved.length, pending: rehabPending.length, rejected: rehabRejected.length,
    byCategory: Object.entries(rehabByCategory).map(([name, value]) => ({ name, value })),
    byDistrict: Object.entries(rehabByDistrict).map(([name, value]) => ({ name, value })),
    crossTable: rehabCross,
    totalTreatment: treat.length, approvedTreatment: treatApproved.length, pendingTreatment: treatPending.length, rejectedTreatment: treatRejected.length,
    byCategoryTreatment: Object.entries(treatByCategory).map(([name, value]) => ({ name, value })),
    byDistrictTreatment: Object.entries(treatByDistrict).map(([name, value]) => ({ name, value })),
    crossTableTreatment: treatCross,
  })
}
