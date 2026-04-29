import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'
import { PRACTITIONER_COLOR as COLOR, PRACTITIONER_DARK as DARK } from '../../lib/practitioner-constants'
import { SiteHeader, SiteFooter, CallToAction, NAV } from '../../components/Layout'

const BASE_URL = 'https://rehabdirectoryil.vercel.app'

const normalizePhotoUrl = (url) => {
  if (!url) return null
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (fileMatch) return `https://drive.google.com/thumbnail?sz=w400&id=${fileMatch[1]}`
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/)
  if (openMatch) return `https://drive.google.com/thumbnail?sz=w400&id=${openMatch[1]}`
  return url
}

export async function getStaticPaths() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { data } = await supabase.from('practitioners').select('id').eq('status', 'approved')
  return {
    paths: (data || []).map(p => ({ params: { id: String(p.id) } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { data, error } = await supabase
    .from('practitioners')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'approved')
    .single()

  if (error || !data) return { notFound: true }
  return { props: { practitioner: data }, revalidate: 600 }
}

export default function PractitionerPage({ practitioner: raw }) {
  const p = raw ? { ...raw, photo_url: normalizePhotoUrl(raw.photo_url) } : null
  if (!p) return (
    <div dir="rtl" style={{ textAlign: 'center', padding: '80px 24px', fontFamily: "'Nunito', sans-serif" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <h2 style={{ color: '#555' }}>המטפל/ת לא נמצא/ה</h2>
      <a href="/practitioners" style={{ color: COLOR }}>← חזרה למטפלים</a>
    </div>
  )

  const pageUrl  = `${BASE_URL}/practitioner/${p.id}`
  const pageDesc = p.bio
    ? p.bio.slice(0, 155)
    : `${p.name} – ${p.profession || 'מטפל/ת מוסמך/ת'} ב${p.city || 'ישראל'}. ${p.treatment_types?.slice(0, 2).join(', ') || ''}`

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Person', 'MedicalBusiness'],
        name: p.name,
        description: p.bio || pageDesc,
        url: pageUrl,
        telephone: p.phone || undefined,
        email: p.email || undefined,
        address: p.city ? { '@type': 'PostalAddress', addressLocality: p.city, addressCountry: 'IL' } : undefined,
        jobTitle: p.profession || undefined,
        knowsAbout: p.specializations || undefined,
        availableService: p.treatment_types?.map(t => ({ '@type': 'MedicalTherapy', name: t })),
        image: p.photo_url || undefined,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'ראשי', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'מטפלים פרטיים', item: `${BASE_URL}/practitioners` },
          { '@type': 'ListItem', position: 3, name: p.name, item: pageUrl },
        ],
      },
    ],
  }

  return (
    <>
      <Head>
        <title>{p.name} – {p.profession || 'מטפל/ת'} ב{p.city || 'ישראל'} | בריאות נפש בישראל</title>
        <meta name="description" content={pageDesc} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={`${p.name} | מטפלים פרטיים`} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={pageUrl} />
        {p.photo_url && <meta property="og:image" content={p.photo_url} />}
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div dir="rtl" style={{ minHeight: '100vh', background: '#f0f7ff', fontFamily: "'Nunito','Arial',sans-serif", position: 'relative' }}>

        <SiteHeader currentPath="/practitioners" subtitle="מטפלים פרטיים" headerBg={DARK} />

        {/* Breadcrumb */}
        <div style={{ background: `linear-gradient(160deg, ${DARK}, ${COLOR})`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="/practitioners" aria-label="חזרה לרשימת המטפלים"
            style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '999px', padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            ← חזרה למטפלים
          </a>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>←</span>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
        </div>

        <main id="main-content" style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>

          <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.08)', border: `1.5px solid ${p.is_verified ? '#bfdbfe' : '#e0eef8'}` }}>

            {/* Header */}
            <div style={{ background: `linear-gradient(135deg,${DARK},${COLOR})`, padding: 'clamp(20px,4vw,32px)', color: 'white', display: 'flex', gap: 'clamp(12px,3vw,20px)', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 'clamp(64px,15vw,80px)', height: 'clamp(64px,15vw,80px)', borderRadius: '50%', flexShrink: 0, background: p.photo_url ? 'transparent' : 'rgba(255,255,255,.2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,.4)' }}>
                {p.photo_url
                  ? <img src={p.photo_url} alt={`תמונת פרופיל של ${p.name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 'clamp(28px,8vw,36px)' }}>👤</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                  <h1 style={{ margin: 0, fontSize: 'clamp(20px,5vw,24px)', fontWeight: 900, lineHeight: 1.2 }}>{p.name}</h1>
                  {p.is_verified && <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>✓ מאומת</span>}
                </div>
                {p.profession && <div style={{ opacity: .9, fontSize: 'clamp(13px,3.5vw,15px)', marginBottom: 3 }}>{p.profession}</div>}
                <div style={{ opacity: .75, fontSize: 13, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {p.city && <span>📍 {p.city}</span>}
                  {p.is_online && <span>🌐 אונליין</span>}
                  {p.price_range && <span>💰 ₪{p.price_range}/שעה</span>}
                </div>
              </div>
            </div>

            <div style={{ padding: 'clamp(20px,4vw,28px) clamp(16px,5vw,32px)' }}>

              {/* ── CTA ── */}
              <div style={{ marginBottom: 24 }}>
                <CallToAction
                  phone={p.phone}
                  whatsapp={p.whatsapp_available}
                  email={p.email}
                  website={p.website}
                  color={COLOR}
                  name={p.name}
                />
              </div>

              {/* תגיות */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {p.is_defense_ministry && <span style={{ background: '#ede9fe', color: '#6d28d9', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 700 }}>🎗️ ספק משה״ב</span>}
                {p.languages?.length > 0 && <span style={{ background: '#f0fdf4', color: '#166534', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 700 }}>🗣️ {p.languages.join(', ')}</span>}
              </div>

              {/* ביו */}
              {p.bio && (
                <div style={{ marginBottom: 24 }}>
                  <h2 style={h2}>קצת עליי</h2>
                  <p style={{ color: '#334', lineHeight: 1.7, fontSize: 14, margin: 0 }}>{p.bio}</p>
                </div>
              )}

              {/* סוגי טיפול */}
              {p.treatment_types?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h2 style={h2}>סוגי טיפול</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {p.treatment_types.map(t => (
                      <span key={t} style={{ background: '#e0f0ff', color: COLOR, borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* התמחויות */}
              {p.specializations?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h2 style={h2}>תחומי התמחות</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {p.specializations.map(s => (
                      <span key={s} style={{ background: '#f5f3ff', color: '#6d28d9', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* קופות חולים */}
              {p.health_funds?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h2 style={h2}>קופות חולים</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {p.health_funds.map(hf => (
                      <span key={hf} style={{ background: '#f0fdf4', color: '#059669', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>🏥 {hf}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* מספר רישיון */}
              {p.license_number && (
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#555', border: '1px solid #e2e8f0' }}>
                  📜 מספר רישיון: <strong style={{ color: '#1A3A5C', fontSize: 15 }}>{p.license_number}</strong>
                </div>
              )}

              {/* הערה */}
              <div style={{ background: '#FFF8F0', border: '1.5px solid #FFD0A0', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#7A4500', lineHeight: 1.7 }}>
                <strong>שימו לב:</strong> המידע מסופק על ידי המטפל/ת ואינו מהווה המלצה רפואית. במצב חירום — פנו ל-<strong>1201</strong> או <strong>101</strong>.
              </div>

              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <a href={`/contact?type=fix&serviceName=${encodeURIComponent(p.name)}`}
                  style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 12, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", textDecoration: 'underline' }}>
                  ⚠️ דווח על שגיאה או מידע לא עדכני
                </a>
              </div>
            </div>
          </div>
        </main>

        <SiteFooter color={DARK} />
      </div>
    </>
  )
}

const h2 = { color: '#0F4C75', fontSize: 15, fontWeight: 800, marginBottom: 10, marginTop: 0 }
