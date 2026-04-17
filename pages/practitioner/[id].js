// pages/practitioner/[id].js
import Head from 'next/head'
import { useRouter } from 'next/router'
import { PRACTITIONER_COLOR as COLOR, PRACTITIONER_DARK as DARK } from '../../lib/practitioner-constants'

const normalizePhotoUrl = (url) => {
  if (!url) return null
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (fileMatch) return `https://drive.google.com/thumbnail?sz=w400&id=${fileMatch[1]}`
  const openMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/)
  if (openMatch) return `https://drive.google.com/thumbnail?sz=w400&id=${openMatch[1]}`
  return url
}

export default function PractitionerPage({ practitioner: raw }) {
  const router = useRouter()
  const p = raw ? { ...raw, photo_url: normalizePhotoUrl(raw.photo_url) } : null
  const backHref = router.query.from === 'practitioners' ? '/practitioners' : '/treatment?tab=practitioners'
  const backLabel = '← חזרה למטפלים' 
  if (!p) return (
    <div dir="rtl" style={{ textAlign: 'center', padding: '80px 24px', fontFamily: 'Arial' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
      <h2 style={{ color: '#555' }}>המטפל/ת לא נמצא/ה</h2>
      <a href={backHref} style={{ color: COLOR }}>{backLabel}</a>
    </div>
  )

  return (
    <>
      <Head>
        <title>{p.name} | מטפלים פרטיים</title>
        <meta name="description" content={p.bio || `${p.name} – ${p.profession || 'מטפל/ת מוסמך/ת'}`} />
      </Head>
      <div dir="rtl" style={{ minHeight: '100vh', background: '#f0f7ff', fontFamily: "'Nunito','Arial',sans-serif" }}>

        <div style={{ background: `linear-gradient(135deg,${DARK},${COLOR})`, padding: '16px 24px' }}>
          <a href={backHref} style={{ color: 'rgba(255,255,255,.8)', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>{backLabel}</a>
        </div>

        <main style={{ maxWidth: 700, margin: '32px auto', padding: '0 16px' }}>
          <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.08)', border: `1.5px solid ${p.is_verified ? '#bfdbfe' : '#e0eef8'}` }}>

            {/* כותרת */}
            <div style={{ background: `linear-gradient(135deg,${DARK},${COLOR})`, padding: '32px', color: 'white', display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', flexShrink: 0, background: p.photo_url ? 'transparent' : 'rgba(255,255,255,.2)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,.4)' }}>
                {p.photo_url
                  ? <img src={p.photo_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 36 }}>👤</span>}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{p.name}</h1>
                  {p.is_verified && <span style={{ background: 'rgba(255,255,255,.25)', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>✓ מאומת</span>}
                </div>
                {p.profession && <div style={{ opacity: .9, marginTop: 4, fontSize: 15 }}>{p.profession}</div>}
                <div style={{ opacity: .75, fontSize: 13, marginTop: 4 }}>
                  {p.city}{p.district ? `, ${p.district}` : ''}
                  {p.is_online && <span style={{ marginRight: 10 }}>· 🌐 אונליין</span>}
                </div>
              </div>
            </div>

            <div style={{ padding: '28px 32px' }}>

              {/* תגיות */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
                {p.is_defense_ministry && <span style={{ background: '#ede9fe', color: '#6d28d9', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 700 }}>🎗️ ספק מאושר משרד הביטחון</span>}
                {p.price_range         && <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 700 }}>💰 ₪{p.price_range} לשעה</span>}
                {p.languages?.length > 0 && <span style={{ background: '#f0fdf4', color: '#166534', borderRadius: 20, padding: '6px 16px', fontSize: 13, fontWeight: 700 }}>🗣️ {p.languages.join(', ')}</span>}
              </div>

              {/* ביו */}
              {p.bio && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={h3}>קצת עליי</h3>
                  <p style={{ color: '#334', lineHeight: 1.7, fontSize: 14, margin: 0 }}>{p.bio}</p>
                </div>
              )}

              {/* סוגי טיפול */}
              {p.treatment_types?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={h3}>סוגי טיפול</h3>
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
                  <h3 style={h3}>תחומי התמחות</h3>
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
                  <h3 style={h3}>קופות חולים</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {p.health_funds.map(hf => (
                      <span key={hf} style={{ background: '#f0fdf4', color: '#059669', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>🏥 {hf}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* רישיון */}
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 18px', marginBottom: 24, fontSize: 13, color: '#555' }}>
                📜 מספר רישיון/תעודה: <strong style={{ color: '#333' }}>{p.license_number}</strong>
              </div>

              {/* קשר */}
              <div style={{ borderTop: '1.5px solid #e0eef8', paddingTop: 24 }}>
                <h3 style={h3}>יצירת קשר</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {p.phone && (
                    <a href={`tel:${p.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#333', textDecoration: 'none', fontSize: 14 }}>
                      <span style={iconCircle}>📞</span>{p.phone}
                    </a>
                  )}
                  {p.whatsapp_available && p.phone && (
                    <a href={`https://wa.me/972${p.phone.replace(/^0/, '').replace(/[-\s]/g, '')}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#25D366', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 700, padding: '10px 20px', borderRadius: 999, boxShadow: '0 3px 0 #1da851', transition: 'all .15s', alignSelf: 'flex-start' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 5px 0 #1da851' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 0 #1da851' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      שלחו הודעה בוואטסאפ
                    </a>
                  )}
                  {p.website && (
                    <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, color: COLOR, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                      <span style={iconCircle}>🌐</span>לאתר האישי
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer style={{ background: `linear-gradient(135deg,${DARK},${COLOR})`, color: 'rgba(255,255,255,.75)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}

const h3       = { color: '#0F4C75', fontSize: 15, fontWeight: 800, marginBottom: 10, marginTop: 0 }
const iconCircle = { background: '#e0f0ff', borderRadius: '50%', width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }

export async function getServerSideProps({ params }) {
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    const { data } = await supabase
      .from('practitioners')
      .select('*')
      .eq('id', params.id)
      .eq('status', 'approved')
      .single()
    return { props: { practitioner: data || null } }
  } catch {
    return { props: { practitioner: null } }
  }
}
