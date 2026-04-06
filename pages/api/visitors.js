import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const ACTIVE_WINDOW = 2 * 60 * 1000 // 2 דקות

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const sessionId = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress
    || 'unknown'

  const now = new Date().toISOString()

  // בדוק אם הגולש כבר קיים
  const { data: existing } = await supabase
    .from('active_visitors')
    .select('session_id')
    .eq('session_id', sessionId)
    .single()

  // עדכן את הגולש הנוכחי
  await supabase
    .from('active_visitors')
    .upsert({ session_id: sessionId, last_seen: now }, { onConflict: 'session_id' })

  // אם גולש חדש — הגדל את הסכום הכולל
  if (!existing) {
    await supabase.rpc('increment_stat', { stat_key: 'total_visitors' })
  }

  // מחק גולשים ישנים
  const cutoff = new Date(Date.now() - ACTIVE_WINDOW).toISOString()
  await supabase
    .from('active_visitors')
    .delete()
    .lt('last_seen', cutoff)

  // קרא את הסכום הכולל
  const { data: stats } = await supabase
    .from('site_stats')
    .select('value')
    .eq('key', 'total_visitors')
    .single()

  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({ total: stats?.value || 113 })
}
