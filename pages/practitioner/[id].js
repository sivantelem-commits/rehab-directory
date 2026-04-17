// pages/practitioner/[id].js
import Head from 'next/head'
import { PRACTITIONER_COLOR as COLOR, PRACTITIONER_DARK as DARK } from '../../lib/practitioner-constants'

export default function PractitionerPage({ practitioner: p }) {
  if (!p) return (
    <div dir="rtl" style={{ textAlign: 'center', padding: '80px 24px', fontFamily: 'Arial' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
      <h2 style={{ color: '#555' }}>המטפל/ת לא נמצא/ה</h2>
      <a href="/practitioners" style={{ color: COLOR }}>← חזרה לרשימה</a>
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
          <a href="/practitioners" style={{ color: 'rgba(255,255,255,.8)', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>← חזרה לרשימת המטפלים</a>
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
