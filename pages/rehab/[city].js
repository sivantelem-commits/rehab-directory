import Head from 'next/head'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { getCategoryColor } from '../../lib/categories'

const BASE_URL = 'https://rehabdirectoryil.vercel.app'

// רשימת ערים נתמכות — הוסיפו ערים לפי הצורך
const SUPPORTED_CITIES = [
  'תל-אביב', 'ירושלים', 'חיפה', 'באר-שבע', 'רמת-גן', 'פתח-תקווה',
  'נתניה', 'אשדוד', 'ראשון-לציון', 'חולון', 'בני-ברק', 'אשקלון',
  'רחובות', 'בת-ים', 'הרצליה', 'כפר-סבא', 'מודיעין', 'לוד',
  'רמלה', 'נהריה', 'עכו', 'טבריה', 'צפת', 'קריית-שמונה',
  'אילת', 'דימונה', 'קריית-גת', 'יבנה', 'נס-ציונה', 'רעננה',
  'הוד-השרון', 'גבעתיים', 'קריית-אונו', 'אור-יהודה', 'טירת-כרמל',
]

function slugToCity(slug) {
  return slug.replace(/-/g, ' ')
}

function cityToSlug(city) {
  return city.replace(/\s/g, '-')
}

export async function getStaticPaths() {
  return {
    paths: SUPPORTED_CITIES.map(city => ({ params: { city } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const cityName = slugToCity(params.city)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('status', 'approved')
    .or(`city.ilike.%${cityName}%,is_national.eq.true`)
    .order('created_at', { ascending: false })

  if (!services || services.length === 0) return { notFound: true }

  return {
    props: { services, cityName, citySlug: params.city },
    revalidate: 3600,
  }
}

export default function RehabCityPage({ services, cityName, citySlug }) {
  const localServices = services.filter(s => !s.is_national)
  const nationalServices = services.filter(s => s.is_national)
  const pageUrl = `${BASE_URL}/rehab/${citySlug}`
  const pageTitle = `שיקום נפשי ב${cityName} | שירותי סל שיקום בקהילה`
  const pageDesc = `מצאו שירותי שיקום נפשי ב${cityName} — דיור מוגן, תעסוקה נתמכת, השכלה וליווי שיקומי. ${localServices.length} שירותים באזור ${cityName}.`

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: pageTitle,
          description: pageDesc,
          url: pageUrl,
          inLanguage: 'he',
          about: { '@type': 'MedicalCondition', name: 'שיקום נפשי' },
        }) }} />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f7f0ff' }}>

        {/* Header */}
        <header style={{ background: 'linear-gradient(135deg, #2E0060, #8B00D4)', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src="/logo.png" alt="בריאות נפש בישראל" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>שירותי שיקום בקהילה</div>
          </div>
        </header>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(160deg, #4C0080, #8B00D4)', color: 'white', padding: '32px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800, margin: '0 0 10px' }}>
            שיקום נפשי ב{cityName}
          </h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: '0 0 6px' }}>
            {localServices.length} שירותי שיקום באזור {cityName}
          </p>
          <p style={{ fontSize: 13, opacity: 0.7, margin: '0 0 20px', maxWidth: 520, marginInline: 'auto' }}>
            דיור מוגן, תעסוקה נתמכת, השכלה, חברה ופנאי וליווי שיקומי
          </p>
          <Link href="/rehab" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '999px', padding: '8px 20px', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            ← כל שירותי השיקום בישראל
          </Link>
        </div>

        <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 16px' }}>

          {/* שירותים מקומיים */}
          {localServices.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#4C0080', marginBottom: 16 }}>
                שירותים ב{cityName} ({localServices.length})
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {localServices.map(s => (
                  <ServiceCard key={s.id} service={s} />
                ))}
              </div>
            </section>
          )}

          {/* שירותים ארציים */}
          {nationalServices.length > 0 && (
            <section>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1A3A5C', marginBottom: 8 }}>
                🌍 שירותים ארציים — זמינים גם ב{cityName}
              </h2>
              <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>שירותים אלה פעילים בכל רחבי ישראל</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {nationalServices.map(s => (
                  <ServiceCard key={s.id} service={s} />
                ))}
              </div>
            </section>
          )}

          {/* ערים קרובות */}
          <div style={{ marginTop: 48, padding: '20px', background: 'white', borderRadius: 16, border: '1.5px solid #d4b0f0' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#4C0080', marginBottom: 12 }}>חיפוש באזורים נוספים</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SUPPORTED_CITIES.filter(c => c !== cityToSlug(cityName)).slice(0, 12).map(city => (
                <Link key={city} href={`/rehab/${city}`} style={{ padding: '5px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 600, background: '#f7f0ff', color: '#4C0080', textDecoration: 'none', border: '1.5px solid #d4b0f0' }}>
                  {slugToCity(city)}
                </Link>
              ))}
            </div>
          </div>

        </main>

        <footer style={{ background: 'linear-gradient(135deg, #2E0060, #4C0080)', color: 'rgba(255,255,255,0.75)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}

function ServiceCard({ service }) {
  const color = getCategoryColor(service.category, service.subcategory)
  return (
    <Link href={`/service/${service.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '18px 20px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', border: '1.5px solid #d4b0f0', borderTop: `4px solid ${color}`, cursor: 'pointer', transition: 'transform 0.15s', height: '100%', boxSizing: 'border-box' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1A3A5C', flex: 1, lineHeight: 1.3 }}>{service.name}</div>
          <span style={{ background: color, color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', marginRight: 8 }}>{service.category}</span>
        </div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
          📍 {service.city}{service.district ? `, ${service.district}` : ''}
          {service.is_national && <span style={{ marginRight: 6, background: '#1A3A5C', color: 'white', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>🌍 ארצי</span>}
        </div>
        {service.description && (
          <div style={{ fontSize: 13, color: '#445', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {service.description}
          </div>
        )}
        {service.phone && <div style={{ fontSize: 12, color, marginTop: 8 }}>📞 {service.phone}</div>}
      </div>
    </Link>
  )
}
