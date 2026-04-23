import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getCategoryColor } from '../../lib/categories'

const BASE_URL = 'https://rehabdirectoryil.vercel.app'

const TREATMENT_COLORS = {
  'בתים מאזנים': '#0A3040', 'מחלקות אשפוז': '#1565A8',
  'טיפול יום': '#0891B2', 'מרפאות בריאות נפש': '#0284C7',
  'חדרי מיון': '#06B6D4', 'אשפוז בית': '#0E7490', 'שירותים נוספים': '#0A6080',
}

const SUPPORTED_CITIES = [
  'תל-אביב', 'ירושלים', 'חיפה', 'באר-שבע', 'רמת-גן', 'פתח-תקווה',
  'נתניה', 'אשדוד', 'ראשון-לציון', 'חולון', 'בני-ברק', 'אשקלון',
  'רחובות', 'בת-ים', 'הרצליה', 'כפר-סבא', 'מודיעין', 'לוד',
  'רמלה', 'נהריה', 'עכו', 'טבריה', 'צפת', 'קריית-שמונה',
  'אילת', 'דימונה', 'קריית-גת', 'יבנה', 'נס-ציונה', 'רעננה',
  'הוד-השרון', 'גבעתיים', 'קריית-אונו', 'אור-יהודה', 'טירת-כרמל',
  'ראש-העין', 'קריית-ביאליק', 'קריית-אתא', 'נצרת', 'עפולה',
]

function slugToCity(slug) { return slug.replace(/-/g, ' ') }
function cityToSlug(city) { return city.replace(/\s/g, '-') }

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

  const [
    { data: rehabServices },
    { data: treatmentServices },
    { data: practitioners },
  ] = await Promise.all([
    supabase.from('services').select('id, name, city, district, category, subcategory, description, phone, is_national, created_at')
      .eq('status', 'approved')
      .or(`city.ilike.%${cityName}%,is_national.eq.true`)
      .order('created_at', { ascending: false }),
    supabase.from('treatment_services').select('id, name, city, district, category, description, phone, is_national, created_at')
      .eq('status', 'approved')
      .or(`city.ilike.%${cityName}%,is_national.eq.true`)
      .order('created_at', { ascending: false }),
    supabase.from('practitioners').select('id, name, city, profession, treatment_types, specializations, price_range, is_online, is_verified, photo_url, bio')
      .eq('status', 'approved')
      .ilike('city', `%${cityName}%`)
      .order('created_at', { ascending: false }),
  ])

  const totalCount = (rehabServices?.length || 0) + (treatmentServices?.length || 0) + (practitioners?.length || 0)
  if (totalCount === 0) return { notFound: true }

  return {
    props: {
      cityName,
      citySlug: params.city,
      rehabServices:     rehabServices     || [],
      treatmentServices: treatmentServices || [],
      practitioners:     practitioners     || [],
    },
    revalidate: 3600,
  }
}

export default function CityPage({ cityName, citySlug, rehabServices, treatmentServices, practitioners }) {
  const [activeTab, setActiveTab] = useState('all')

  const localRehab     = rehabServices.filter(s => !s.is_national)
  const nationalRehab  = rehabServices.filter(s => s.is_national)
  const localTreatment = treatmentServices.filter(s => !s.is_national)
  const nationalTreatment = treatmentServices.filter(s => s.is_national)

  const totalLocal = localRehab.length + localTreatment.length + practitioners.length
  const pageUrl    = `${BASE_URL}/city/${citySlug}`
  const pageTitle  = `בריאות נפש ב${cityName} | שיקום, טיפול ומטפלים פרטיים`
  const pageDesc   = `מדריך שלם לשירותי בריאות הנפש ב${cityName}: ${localRehab.length} שירותי שיקום, ${localTreatment.length} שירותי טיפול ו-${practitioners.length} מטפלים פרטיים. כולל בתים מאזנים, מרפאות, פסיכולוגים ועוד.`

  const tabs = [
    { id: 'all',          label: 'הכל',              count: totalLocal },
    { id: 'rehab',        label: '♿ שיקום',           count: localRehab.length,     color: '#8B00D4' },
    { id: 'treatment',    label: '🏥 טיפול',            count: localTreatment.length, color: '#0891B2' },
    { id: 'practitioners',label: '🧠 מטפלים פרטיים',   count: practitioners.length,  color: '#0F4C75' },
  ]

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="website" />
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
          about: { '@type': 'MedicalCondition', name: 'בריאות הנפש' },
          numberOfItems: totalLocal,
        }) }} />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f5f7fa' }}>

        {/* Header */}
        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/">
            <img src="/logo.png" alt="בריאות נפש בישראל" style={{ width: 40, height: 40, objectFit: 'contain', filter: 'brightness(0) invert(1)', cursor: 'pointer' }} />
          </Link>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>בריאות נפש בישראל</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>מדריך שירותים מקיף</div>
          </div>
          <nav style={{ marginRight: 'auto', display: 'flex', gap: 6 }}>
            {[['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/practitioners', 'מטפלים'], ['/map', 'מפה']].map(([href, label]) => (
              <Link key={href} href={href} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600, textDecoration: 'none', padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.1)' }}>{label}</Link>
            ))}
          </nav>
        </header>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '36px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>ראשי</Link>
            {' › '}בריאות נפש לפי עיר
            {' › '}{cityName}
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 800, margin: '0 0 12px' }}>
            בריאות נפש ב{cityName}
          </h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: '0 0 20px', maxWidth: 560, marginInline: 'auto' }}>
            {totalLocal} שירותים ומטפלים באזור {cityName} —
            שיקום, טיפול פסיכיאטרי ומטפלים פרטיים
          </p>

          {/* מדדים מהירים */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {[
              ['♿', localRehab.length, 'שירותי שיקום', '#f7f0ff', '#8B00D4'],
              ['🏥', localTreatment.length, 'שירותי טיפול', '#f0faff', '#0891B2'],
              ['🧠', practitioners.length, 'מטפלים פרטיים', '#e8f2f8', '#0F4C75'],
            ].map(([icon, count, label, bg, color]) => count > 0 && (
              <div key={label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 20px', textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontSize: 20 }}>{icon}</div>
                <div style={{ fontSize: 26, fontWeight: 800 }}>{count}</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <main style={{ maxWidth: 960, margin: '0 auto', padding: '28px 16px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
            {tabs.map(tab => tab.count > 0 || tab.id === 'all' ? (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ padding: '9px 18px', borderRadius: 20, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', border: `2px solid ${tab.color || '#1A3A5C'}`, background: activeTab === tab.id ? (tab.color || '#1A3A5C') : 'white', color: activeTab === tab.id ? 'white' : (tab.color || '#1A3A5C'), display: 'flex', alignItems: 'center', gap: 6 }}>
                {tab.label}
                <span style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : (tab.color || '#1A3A5C') + '22', color: activeTab === tab.id ? 'white' : (tab.color || '#1A3A5C'), borderRadius: 999, padding: '1px 7px', fontSize: 11 }}>{tab.count}</span>
              </button>
            ) : null)}
          </div>

          {/* ── שיקום ── */}
          {(activeTab === 'all' || activeTab === 'rehab') && localRehab.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#4C0080', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                ♿ שירותי שיקום ב{cityName}
                <span style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>({localRehab.length})</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {localRehab.map(s => <RehabCard key={s.id} service={s} />)}
              </div>
            </section>
          )}

          {/* ── טיפול ── */}
          {(activeTab === 'all' || activeTab === 'treatment') && localTreatment.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0A6080', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                🏥 שירותי טיפול ב{cityName}
                <span style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>({localTreatment.length})</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {localTreatment.map(s => <TreatmentCard key={s.id} service={s} />)}
              </div>
            </section>
          )}

          {/* ── מטפלים פרטיים ── */}
          {(activeTab === 'all' || activeTab === 'practitioners') && practitioners.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0F4C75', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                🧠 מטפלים פרטיים ב{cityName}
                <span style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>({practitioners.length})</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {practitioners.map(p => <PractitionerCard key={p.id} practitioner={p} />)}
              </div>
            </section>
          )}

          {/* ── שירותים ארציים ── */}
          {(activeTab === 'all' || activeTab === 'rehab') && nationalRehab.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1A3A5C', marginBottom: 12 }}>🌍 שירותי שיקום ארציים — זמינים גם ב{cityName}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {nationalRehab.map(s => <RehabCard key={s.id} service={s} compact />)}
              </div>
            </section>
          )}
          {(activeTab === 'all' || activeTab === 'treatment') && nationalTreatment.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1A3A5C', marginBottom: 12 }}>🌍 שירותי טיפול ארציים — זמינים גם ב{cityName}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {nationalTreatment.map(s => <TreatmentCard key={s.id} service={s} compact />)}
              </div>
            </section>
          )}

          {/* ── ערים קרובות ── */}
          <div style={{ marginTop: 48, padding: '20px 24px', background: 'white', borderRadius: 16, border: '1.5px solid #e0e0e0' }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1A3A5C', marginBottom: 12 }}>שירותי בריאות נפש בערים נוספות</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SUPPORTED_CITIES.filter(c => c !== citySlug).slice(0, 16).map(city => (
                <Link key={city} href={`/city/${city}`} style={{ padding: '5px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 600, background: '#f5f7fa', color: '#1A3A5C', textDecoration: 'none', border: '1.5px solid #ddd' }}>
                  {slugToCity(city)}
                </Link>
              ))}
            </div>
          </div>

        </main>

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
          <div style={{ marginBottom: 8 }}>
            <Link href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 8px' }}>צור קשר</Link>
            <span style={{ opacity: 0.4 }}>·</span>
            <Link href="/legal" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 8px' }}>תנאי שימוש</Link>
            <span style={{ opacity: 0.4 }}>·</span>
            <Link href="/accessibility" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 8px' }}>נגישות</Link>
          </div>
          בריאות נפש בישראל © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}

// ── כרטיסים ─────────────────────────────────────────────────────────────────

function RehabCard({ service: s, compact }) {
  const color = getCategoryColor(s.category, s.subcategory)
  return (
    <Link href={`/service/${s.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: 'white', borderRadius: 14, padding: compact ? '14px 16px' : '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1.5px solid #e8d5ff', borderTop: `4px solid ${color}`, height: '100%', boxSizing: 'border-box', transition: 'transform 0.12s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ fontWeight: 700, fontSize: compact ? 13 : 15, color: '#1A3A5C', flex: 1, lineHeight: 1.3 }}>{s.name}</div>
          <span style={{ background: color + '22', color, borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', marginRight: 6 }}>{s.category}</span>
        </div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: compact ? 0 : 8 }}>
          📍 {s.city}{s.district ? `, ${s.district}` : ''}
          {s.is_national && <span style={{ marginRight: 5, background: '#1A3A5C', color: 'white', borderRadius: 20, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>🌍 ארצי</span>}
        </div>
        {!compact && s.description && (
          <div style={{ fontSize: 12, color: '#556', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 6 }}>
            {s.description}
          </div>
        )}
        {s.phone && <div style={{ fontSize: 11, color, marginTop: 6 }}>📞 {s.phone}</div>}
      </div>
    </Link>
  )
}

function TreatmentCard({ service: s, compact }) {
  const color = TREATMENT_COLORS[s.category] || '#0891B2'
  return (
    <Link href={`/treatment/${s.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: 'white', borderRadius: 14, padding: compact ? '14px 16px' : '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1.5px solid #c8e8f0', borderTop: `4px solid ${color}`, height: '100%', boxSizing: 'border-box', transition: 'transform 0.12s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ fontWeight: 700, fontSize: compact ? 13 : 15, color: '#1A3A5C', flex: 1, lineHeight: 1.3 }}>{s.name}</div>
          <span style={{ background: color + '22', color, borderRadius: 20, padding: '2px 9px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', marginRight: 6 }}>{s.category}</span>
        </div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: compact ? 0 : 8 }}>
          📍 {s.city}{s.district ? `, ${s.district}` : ''}
          {s.is_national && <span style={{ marginRight: 5, background: '#1A3A5C', color: 'white', borderRadius: 20, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>🌍 ארצי</span>}
        </div>
        {!compact && s.description && (
          <div style={{ fontSize: 12, color: '#556', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 6 }}>
            {s.description}
          </div>
        )}
        {s.phone && <div style={{ fontSize: 11, color, marginTop: 6 }}>📞 {s.phone}</div>}
      </div>
    </Link>
  )
}

function PractitionerCard({ practitioner: p }) {
  const COLOR = '#0F4C75'
  return (
    <Link href={`/practitioner/${p.id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: 'white', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1.5px solid #c8dcea', borderTop: `4px solid ${COLOR}`, height: '100%', boxSizing: 'border-box', transition: 'transform 0.12s', display: 'flex', gap: 12 }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, background: p.photo_url ? 'transparent' : `linear-gradient(135deg, ${COLOR}, #0891B2)`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {p.photo_url ? <img src={p.photo_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20, color: 'white' }}>👤</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#1A3A5C' }}>{p.name}</span>
            {p.is_verified && <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: 20, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>✓ מאומת</span>}
          </div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
            {p.profession && <span style={{ background: COLOR + '15', color: COLOR, borderRadius: 20, padding: '1px 8px', fontSize: 10, fontWeight: 700, marginLeft: 6 }}>{p.profession}</span>}
            {p.is_online && <span style={{ color: '#0891B2', fontSize: 11, fontWeight: 600 }}>🌐 אונליין</span>}
          </div>
          {p.treatment_types?.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
              {p.treatment_types.slice(0, 2).map(t => (
                <span key={t} style={{ background: '#e0f0ff', color: COLOR, borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 600 }}>{t}</span>
              ))}
              {p.treatment_types.length > 2 && <span style={{ fontSize: 10, color: '#aaa' }}>+{p.treatment_types.length - 2}</span>}
            </div>
          )}
          {p.price_range && <div style={{ fontSize: 11, color: '#888' }}>💰 ₪{p.price_range}/שעה</div>}
        </div>
      </div>
    </Link>
  )
}
