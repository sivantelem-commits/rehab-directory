import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState, useEffect } from 'react'

const SITE_URL = 'https://rehabdirectoryil.vercel.app'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'בריאות נפש בישראל',
  url: SITE_URL,
  description: 'פורטל שירותי בריאות נפש בישראל – שיקום וטיפול לפי אזור',
  inLanguage: 'he',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/rehab?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export default function Home() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [visitors, setVisitors] = useState(null)

  useEffect(() => {
    fetch('/api/home-stats')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const ping = () =>
      fetch('/api/visitors', { method: 'POST' })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setVisitors(data.total) })
        .catch(() => {})
    ping()
    const interval = setInterval(ping, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Head>
        <title>בריאות נפש בישראל</title>
        <meta name="description" content="פורטל שירותי בריאות נפש בישראל – שיקום וטיפול לפי אזור" />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="בריאות נפש בישראל" />
        <meta property="og:description" content="פורטל שירותי בריאות נפש בישראל – שיקום וטיפול לפי אזור" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/icon-512.png`} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content={`${SITE_URL}/icon-512.png`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div dir="rtl" style={{
        fontFamily: "'Nunito', sans-serif",
        minHeight: '100vh',
        background: '#f7f3ff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '24px 16px 16px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        width: '100%',
      }}>

        <a href="#main-content" style={{
            position: 'absolute',
            top: '-40px',
            right: 0,
            background: '#3d2a6e',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '0 0 8px 8px',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            zIndex: 9999,
            transition: 'top 0.2s'
          }}
          onFocus={e => e.currentTarget.style.top = '0'}
          onBlur={e => e.currentTarget.style.top = '-40px'}
        >דלג לתוכן הראשי</a>

        <main id="main-content" style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* כותרת */}
          <div style={{ textAlign: 'center', marginBottom: 28, marginTop: 16 }}>
            <img src="/logo.png" alt="בריאות נפש בישראל" style={{ width: 'min(160px, 40vw)', height: 'min(160px, 40vw)', objectFit: 'contain', marginBottom: 8, mixBlendMode: 'multiply' }} />
            <h1 style={{ fontSize: 'clamp(22px, 6vw, 32px)', fontWeight: 800, color: '#3d2a6e', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
              בריאות נפש בישראל
            </h1>
            <p style={{ fontSize: 15, color: '#6b5b8a', margin: '0 0 0', fontWeight: 600 }}>
              מצאו שירות מתאים לפי הצורך שלכם
            </p>
          </div>

          {/* שלושה כפתורים ראשיים */}
          <div style={{ display: 'flex', gap: 14, flexDirection: 'column', alignItems: 'center', width: '100%' }}>

            {/* מחשבון — הכי בולט */}
            <button aria-label="פתח מחשבון איתור שירות" onClick={() => router.push('/calculator')}
              style={{ width: '100%', padding: '18px 24px', borderRadius: '999px', boxSizing: 'border-box', background: 'linear-gradient(160deg, #4C0080, #8B00D4)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: "'Nunito', sans-serif", boxShadow: '0 6px 0 #2E0060, 0 10px 24px rgba(76,0,128,0.3)', transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 0 #2E0060, 0 18px 36px rgba(76,0,128,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 0 #2E0060, 0 10px 24px rgba(76,0,128,0.3)' }}>
              <span style={{ fontSize: 22 }}>🧭</span>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 17, fontWeight: 800 }}>לא יודעים מאיפה להתחיל?</div>
                <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>מחשבון מותאם אישית ← כמה שאלות קצרות</div>
              </div>
            </button>

            {/* מפריד */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <div style={{ flex: 1, height: 1, background: '#ddd6f3' }} />
              <span style={{ fontSize: 12, color: '#9b88bb', fontWeight: 600, whiteSpace: 'nowrap' }}>או בחרו ישירות</span>
              <div style={{ flex: 1, height: 1, background: '#ddd6f3' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
              {/* שיקום */}
              <button onClick={() => router.push('/rehab')}
                aria-label="שיקום — סל שיקום בקהילה"
                style={{ height: 80, borderRadius: 20, background: 'linear-gradient(160deg, #8B00D4, #4C0080)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: "'Nunito', sans-serif", boxShadow: '0 4px 0 #2E0060', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 7px 0 #2E0060' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 #2E0060' }}>
                <span style={{ fontSize: 16, fontWeight: 800 }}>♿ שיקום</span>
                <span style={{ fontSize: 10, opacity: 0.8 }}>סל שיקום בקהילה</span>
              </button>

              {/* טיפול */}
              <button onClick={() => router.push('/treatment')}
                aria-label="טיפול — מרכזי טיפול ומרפאות"
                style={{ height: 80, borderRadius: 20, background: 'linear-gradient(160deg, #0891B2, #164E63)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: "'Nunito', sans-serif", boxShadow: '0 4px 0 #0A3040', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 7px 0 #0A3040' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 #0A3040' }}>
                <span style={{ fontSize: 16, fontWeight: 800 }}>🏥 טיפול</span>
                <span style={{ fontSize: 10, opacity: 0.8 }}>מרכזים ומרפאות</span>
              </button>
            </div>

            {/* מטפלים פרטיים — כפתור נפרד */}
            <button onClick={() => router.push('/practitioners')}
              aria-label="מטפלים פרטיים — פסיכולוגים, פסיכיאטרים ומטפלים"
              style={{ width: '100%', height: 72, borderRadius: 20, background: 'linear-gradient(160deg, #0F4C75, #082840)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: "'Nunito', sans-serif", boxShadow: '0 4px 0 #041820', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 7px 0 #041820' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 #041820' }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>🧠 מטפלים פרטיים</span>
              <span style={{ fontSize: 11, opacity: 0.8 }}>פסיכולוגים, פסיכיאטרים ומטפלים</span>
            </button>

          </div>

          {/* אינדיקטור חיות + הערת מאגר */}
          <div style={{ marginTop: 28, width: '100%', padding: '14px 18px', boxSizing: 'border-box', background: 'rgba(255,255,255,0.6)', borderRadius: 14, border: '1px solid #e9d5ff' }}>
            {stats ? (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 10, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#4C0080', lineHeight: 1 }}>{stats.rehabCount}</div>
                  <div style={{ fontSize: 11, color: '#9b88bb', fontWeight: 600, marginTop: 2 }}>שירותי שיקום</div>
                </div>
                <div style={{ width: 1, background: '#e9d5ff' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0891B2', lineHeight: 1 }}>{stats.treatmentCount}</div>
                  <div style={{ fontSize: 11, color: '#9b88bb', fontWeight: 600, marginTop: 2 }}>שירותי טיפול</div>
                </div>
                <div style={{ width: 1, background: '#e9d5ff' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#0F4C75', lineHeight: 1 }}>{stats.practitionerCount}</div>
                  <div style={{ fontSize: 11, color: '#9b88bb', fontWeight: 600, marginTop: 2 }}>מטפלים פרטיים</div>
                </div>
                <div style={{ width: 1, background: '#e9d5ff' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#1D9E75', lineHeight: 1 }}>{stats.total}</div>
                  <div style={{ fontSize: 11, color: '#9b88bb', fontWeight: 600, marginTop: 2 }}>סה"כ</div>
                </div>
              </div>
            ) : (
              <div style={{ height: 38, marginBottom: 10 }} />
            )}
            <div style={{ textAlign: 'center', fontSize: 12, color: '#b8a8d0', lineHeight: 1.7, fontWeight: 500 }}>
              {visitors !== null && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>
                    <span style={{ fontWeight: 700, color: '#4C0080', fontSize: 15 }}>{visitors.toLocaleString()}</span> אנשים ביקרו באתר
                  </span>
                </div>
              )}
              המאגר נבנה על סמך הרשמת השירותים – ייתכן שיש שירותים שטרם נוספו.
              <br/>
              <a href="/register" style={{ color: '#8B00D4', fontWeight: 700, textDecoration: 'none' }}>הוספת שירות ←</a>
            </div>
          </div>

        </main>

        {/* שירותים לפי עיר */}
        <div style={{ width: '100%', maxWidth: 460, marginTop: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9b88bb', marginBottom: 10, textAlign: 'center' }}>שירותים לפי עיר</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {[['תל-אביב','תל אביב'],['ירושלים','ירושלים'],['חיפה','חיפה'],['באר-שבע','באר שבע'],['ראשון-לציון','ראשון לציון'],['פתח-תקווה','פתח תקווה'],['נתניה','נתניה'],['רמת-גן','רמת גן'],['אשדוד','אשדוד'],['הרצליה','הרצליה'],['כפר-סבא','כפר סבא'],['חולון','חולון']].map(([slug, label]) => (
              <a key={slug} href={`/city/${slug}`} style={{ fontSize: 12, fontWeight: 600, color: '#6b4fa0', textDecoration: 'none', background: 'rgba(255,255,255,0.7)', borderRadius: 999, padding: '4px 12px', border: '1px solid #e9d5ff' }}>
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* קישורים תחתונים */}
        <div style={{ display: 'flex', gap: 16, marginTop: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            ['/about', 'אודות'],
            ['/contact', 'צור קשר'],
            ['/legal', 'תנאי שימוש'],
            ['/accessibility', 'הצהרת נגישות'],
          ].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: 13, fontWeight: 600, color: '#6b5b8a', textDecoration: 'none', padding: '4px 0' }}>{label}</a>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="https://links.payboxapp.com/g9hdYBPr71b" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 18px', borderRadius: '999px', border: '1.5px solid #c4a8e0', background: 'white', color: '#6b2fa0', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            💙 האתר חינמי — אפשר לתמוך
          </a>
        </div>

      </div>
    </>
  )
}
