import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BASE_URL = 'https://rehabdirectoryil.vercel.app'

const SUPPORTED_CITIES = [
  'תל-אביב', 'ירושלים', 'חיפה', 'באר-שבע', 'רמת-גן', 'פתח-תקווה',
  'נתניה', 'אשדוד', 'ראשון-לציון', 'חולון', 'בני-ברק', 'אשקלון',
  'רחובות', 'בת-ים', 'הרצליה', 'כפר-סבא', 'מודיעין', 'לוד',
  'רמלה', 'נהריה', 'עכו', 'טבריה', 'צפת', 'קריית-שמונה',
  'אילת', 'דימונה', 'קריית-גת', 'יבנה', 'נס-ציונה', 'רעננה',
  'הוד-השרון', 'גבעתיים', 'קריית-אונו', 'אור-יהודה', 'טירת-כרמל',
]

const STATIC_PAGES = [
  { url: '/',              priority: '1.0', changefreq: 'weekly'  },
  { url: '/rehab',         priority: '0.9', changefreq: 'daily'   },
  { url: '/treatment',     priority: '0.9', changefreq: 'daily'   },
  { url: '/practitioners', priority: '0.9', changefreq: 'daily'   },
  { url: '/map',           priority: '0.7', changefreq: 'weekly'  },
  { url: '/calculator',    priority: '0.7', changefreq: 'monthly' },
  { url: '/about',         priority: '0.5', changefreq: 'monthly' },
  { url: '/guide',         priority: '0.6', changefreq: 'monthly' },
  { url: '/register',      priority: '0.5', changefreq: 'monthly' },
  { url: '/contact',       priority: '0.4', changefreq: 'monthly' },
  { url: '/legal',         priority: '0.3', changefreq: 'yearly'  },
  { url: '/accessibility', priority: '0.3', changefreq: 'yearly'  },
]

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const [
    { data: rehabServices },
    { data: treatmentServices },
    { data: practitioners },
  ] = await Promise.all([
    supabase.from('services').select('id, updated_at').eq('status', 'approved'),
    supabase.from('treatment_services').select('id, updated_at').eq('status', 'approved'),
    supabase.from('practitioners').select('id, updated_at').eq('status', 'approved'),
  ])

  const today = new Date().toISOString().split('T')[0]

  const urls = [
    // עמודים סטטיים
    ...STATIC_PAGES.map(p => `
  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),

    // עמודי ערים — מאוחד (שיקום + טיפול + מטפלים)
    ...SUPPORTED_CITIES.map(city => `
  <url>
    <loc>${BASE_URL}/city/${encodeURIComponent(city)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`),

    // עמודי ערים — שיקום
    ...SUPPORTED_CITIES.map(city => `
  <url>
    <loc>${BASE_URL}/rehab/${encodeURIComponent(city)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),

    // עמודי ערים — טיפול
    ...SUPPORTED_CITIES.map(city => `
  <url>
    <loc>${BASE_URL}/treatment-city/${encodeURIComponent(city)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`),

    // שירותי שיקום
    ...(rehabServices || []).map(s => `
  <url>
    <loc>${escapeXml(`${BASE_URL}/service/${s.id}`)}</loc>
    <lastmod>${s.updated_at ? s.updated_at.split('T')[0] : today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`),

    // שירותי טיפול
    ...(treatmentServices || []).map(s => `
  <url>
    <loc>${escapeXml(`${BASE_URL}/treatment/${s.id}`)}</loc>
    <lastmod>${s.updated_at ? s.updated_at.split('T')[0] : today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`),

    // מטפלים פרטיים
    ...(practitioners || []).map(p => `
  <url>
    <loc>${escapeXml(`${BASE_URL}/practitioner/${p.id}`)}</loc>
    <lastmod>${p.updated_at ? p.updated_at.split('T')[0] : today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
  res.status(200).send(xml)
}
