import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const CITY_COORDS = {
  'תל אביב': [32.0853, 34.7818],
  'ירושלים': [31.7683, 35.2137],
  'חיפה': [32.7940, 34.9896],
  'באר שבע': [31.2518, 34.7913],
  'נתניה': [32.3215, 34.8532],
  'פתח תקווה': [32.1833, 34.8667],
  'ראשון לציון': [31.9730, 34.7925],
  'אשדוד': [31.8014, 34.6510],
  'אשקלון': [31.6693, 34.5714],
  'רמת גן': [32.0667, 34.8167],
  'רחובות': [31.9522, 34.8008],
  'חדרה': [32.4340, 34.9186],
  'טבריה': [32.7996, 35.5315],
  'צפת': [32.9646, 35.4956],
  'אילת': [29.5581, 34.9482],
  'יקנעם עילית': [32.6667, 35.1000],
  'עפולה': [32.6081, 35.2897],
  'נצרת': [32.6996, 35.3035],
  'עכו': [32.9251, 35.0748],
  'נהריה': [33.0048, 35.0980],
  'קריית שמונה': [33.2074, 35.5695],
  'טירת כרמל': [32.7603, 34.9703],
  'לוד': [31.9516, 34.8956],
  'רמלה': [31.9298, 34.8709],
  'כפר סבא': [32.1752, 34.9077],
  'הוד השרון': [32.1500, 34.8833],
  'רעננה': [32.1840, 34.8710],
  'מודיעין': [31.8969, 35.0097],
  'בית שמש': [31.7458, 34.9894],
  'קריית גת': [31.6100, 34.7642],
  'דימונה': [31.0689, 35.0317],
  'אריאל': [32.1061, 35.1671],
  'מעלה אדומים': [31.7775, 35.2986],
  'שדרות': [31.5239, 34.5963],
}

export default async function handler(req, res) {
  const adminKey = req.headers['adminkey']
  if (adminKey !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data || [])
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body
    const { data, error } = await supabase
      .from('services')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'DELETE') {
    const { id } = req.query
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'POST') {
    // עדכון קואורדינטות לפי עיר
    const { id, city } = req.body
    const coords = CITY_COORDS[city]
    if (!coords) return res.status(404).json({ error: 'עיר לא נמצאה' })
    const { data, error } = await supabase
      .from('services')
      .update({ lat: coords[0], lng: coords[1] })
      .eq('id', id)
      .select()
      .single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  res.status(405).end()
}
