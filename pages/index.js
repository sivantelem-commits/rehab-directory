import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState, useEffect } from 'react'

const NAV = [['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register', 'הרשמת שירות'], ['/about', 'אודות'], ['/contact', '✉️ צור קשר']]

const CATEGORY_COLORS = {
  'דיור': '#7B2D8B', 'תעסוקה': '#F47B20', 'השכלה': '#1A3A5C',
  'חברה ופנאי': '#2E7D32', 'ליווי ותמיכה': '#0277BD',
  'טיפולי שיניים': '#C2185B', 'שירותים נוספים': '#546E7A',
  'בתי"מ': '#0277BD', 'מחלקות אשפוז': '#7B2D8B',
  'מרפאות יום': '#2E7D32', 'חדרי מיון': '#C62828',
}

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!target) return
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(start)
    }, 16)
    return () => clearInterval(timer)
  }, [target])
  return val
}

export default function Home() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch('/api/home-stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  const totalCount = useCountUp(stats?.total || 0)
  const rehabCount = useCountUp(stats?.rehabCount || 0)
  const treatmentCount = useCountUp(stats?.treatmentCount || 0)

  if (!mounted) return null

  return (
    <>
      <Head>
        <title>בריאות נפש בישראל | פורטל שירותי שיקום וטיפול</title>
        <meta name="description" content="פורטל שירותי בריאות נפש בישראל – שיקום וטיפול. מצאו שירותי סל שיקום, בתי חולים פסיכיאטריים, מרפאות יום וחדרי מיון בכל הארץ." />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f7f3ff' }}>

        {/* NAV */}
        <header style={{
          background: 'linear-gradient(135deg, #3d2a6e, #6a4bc4)',
          color: 'white', padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="לוגו" style={{ width: 40, height: 40, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div style={{ fontWeight: 800, fontSize: 17 }}>בריאות נפש בישראל</div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'white',
                background: href === '/' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12,
                border: href === '/' ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.2)',
                textDecoration: 'none',
              }}>{label}</a>
            ))}
          </nav>
        </header>

        {/* HERO */}
        <div style={{
          background: 'linear-gradient(160deg, #3d2a6e, #6a4bc4)',
          color: 'white', padding: '48px 20px 56px', textAlign: 'center',
        }}>
          <img src="/logo.png" alt="לוגו" style={{ width: 100, height: 100, objectFit: 'contain', filter: 'brightness(0) invert(1)', marginBottom: 16 }} />
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.3px' }}>
            בריאות נפש בישראל
          </h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: '0 0 32px', fontWeight: 500 }}>
            המאגר המקיף לשירותי שיקום וטיפול בבריאות הנפש
          </p>

          {/* CTA כפתורים */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
            <button onClick={() => router.push('/rehab')} style={{
              width: 200, height: 88, borderRadius: '999px',
              background: 'linear-gradient(160deg, #7ec8a0, #4aab78)',
              border: 'none', color: 'white', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              fontFamily: "'Nunito', sans-serif",
              boxShadow: '0 6px 0 #3a8a5e, 0 10px 24px rgba(74,171,120,0.35)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 0 #3a8a5e, 0 18px 36px rgba(74,171,120,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 0 #3a8a5e, 0 10px 24px rgba(74,171,120,0.35)' }}
            >
              <span style={{ fontSize: 26 }}>♿</span>
              <span style={{ fontSize: 17, fontWeight: 800 }}>שיקום</span>
              <span style={{ fontSize: 11, opacity: 0.85 }}>סל שיקום בקהילה</span>
            </button>

            <button onClick={() => router.push('/treatment')} style={{
              width: 200, height: 88, borderRadius: '999px',
              background: 'linear-gradient(160deg, #f4a27a, #ee7a50)',
              border: 'none', color: 'white', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
              fontFamily: "'Nunito', sans-serif",
              boxShadow: '0 6px 0 #c85e32, 0 10px 24px rgba(238,122,80,0.35)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 0 #c85e32, 0 18px 36px rgba(238,122,80,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 0 #c85e32, 0 10px 24px rgba(238,122,80,0.35)' }}
            >
              <span style={{ fontSize: 26 }}>🏥</span>
              <span style={{ fontSize: 17, fontWeight: 800 }}>טיפול</span>
              <span style={{ fontSize: 11, opacity: 0.85 }}>בתי"מ, אשפוז ומרפאות</span>
            </button>
          </div>

          {/* סטטיסטיקות */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              [totalCount, 'שירותים במאגר', '📋'],
              [rehabCount, 'שירותי שיקום', '♿'],
              [treatmentCount, 'שירותי טיפול', '🏥'],
            ].map(([val, label, icon]) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                borderRadius: 16, padding: '14px 22px', textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.2)', minWidth: 100,
              }}>
                <div style={{ fontSize: 22 }}>{icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
                  {stats ? val : '—'}
                </div>
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* שירותים חדשים */}
        <main style={{ maxWidth: 800, margin: '0 auto', padding: '36px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#3d2a6e', margin: 0 }}>
              ✨ שירותים שנוספו לאחרונה
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href="/rehab" style={{ fontSize: 12, color: '#4aab78', fontWeight: 700, textDecoration: 'none' }}>כל השיקום ←</a>
              <span style={{ color: '#ccc' }}>|</span>
              <a href="/treatment" style={{ fontSize: 12, color: '#ee7a50', fontWeight: 700, textDecoration: 'none' }}>כל הטיפול ←</a>
            </div>
          </div>

          {!stats ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ background: '#eee', borderRadius: 16, height: 100, animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : stats.recent?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 14 }}>אין שירותים עדיין</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {stats.recent.map(s => {
                const color = CATEGORY_COLORS[s.category] || '#6a4bc4'
                const isRehab = s._type === 'rehab'
                const href = isRehab ? '/rehab' : '/treatment'
                return (
                  <a key={s.id} href={href} style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'white', borderRadius: 16, padding: '16px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
                      borderRight: `4px solid ${color}`,
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      cursor: 'pointer',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <span style={{
                          background: isRehab ? '#f0faf5' : '#FFF8F3',
                          color: isRehab ? '#4aab78' : '#ee7a50',
                          borderRadius: 999, padding: '2px 8px', fontSize: 10, fontWeight: 700,
                        }}>
                          {isRehab ? '♿ שיקום' : '🏥 טיפול'}
                        </span>
                        {s.is_national && <span style={{ fontSize: 14 }} title="פריסה ארצית">🌍</span>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1A3A5C', marginBottom: 4, lineHeight: 1.3 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>
                        📍 {s.city}{s.district ? `, ${s.district}` : ''}
                      </div>
                      <span style={{
                        background: `${color}18`, color, borderRadius: 999,
                        padding: '2px 8px', fontSize: 11, fontWeight: 700,
                      }}>{s.category}</span>
                    </div>
                  </a>
                )
              })}
            </div>
          )}

          {/* קישורים מהירים */}
          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {[
              ['/map', '🗺️', 'מפת שירותים', '#6a4bc4'],
              ['/register', '➕', 'הוסף שירות', '#4aab78'],
              ['/contact', '✉️', 'צור קשר', '#ee7a50'],
              ['/about', 'ℹ️', 'אודות הפורטל', '#0277BD'],
            ].map(([href, icon, label, color]) => (
              <a key={href} href={href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'white', borderRadius: 16, padding: '18px 14px',
                  textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  border: `1.5px solid ${color}22`, cursor: 'pointer',
                  transition: 'transform 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color }}>{label}</div>
                </div>
              </a>
            ))}
          </div>
        </main>

        <footer style={{
          background: 'linear-gradient(135deg, #3d2a6e, #6a4bc4)',
          color: 'rgba(255,255,255,0.75)', textAlign: 'center',
          padding: '24px', fontSize: 13, fontWeight: 500,
        }}>
          <div style={{ marginBottom: 8 }}>
            <a href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>✉️ צור קשר</a>
          </div>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}
