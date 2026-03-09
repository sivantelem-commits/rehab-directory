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

  const { data, error } = await supabase.from('services').select('category, district, status')
  if (error) return res.status(500).json({ error: error.message })

  const approved = data.filter(s => s.status === 'approved')
  const pending = data.filter(s => s.status === 'pending')
  const rejected = data.filter(s => s.status === 'rejected')

  // לפי קטגוריה
  const byCategory = {}
  approved.forEach(s => {
    byCategory[s.category] = (byCategory[s.category] || 0) + 1
  })

  // לפי מחוז
  const byDistrict = {}
  approved.forEach(s => {
    byDistrict[s.district] = (byDistrict[s.district] || 0) + 1
  })

  // טבלת קטגוריה × מחוז
  const crossTable = {}
  approved.forEach(s => {
    if (!crossTable[s.category]) crossTable[s.category] = {}
    crossTable[s.category][s.district] = (crossTable[s.category][s.district] || 0) + 1
  })

  res.status(200).json({
    total: data.length,
    approved: approved.length,
    pending: pending.length,
    rejected: rejected.length,
    byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
    byDistrict: Object.entries(byDistrict).map(([name, value]) => ({ name, value })),
    crossTable,
  })
}
