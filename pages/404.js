import Head from 'next/head'
import { useRouter } from 'next/router'

const NAV = [['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', '✉️ צור קשר']]

export default function Custom404() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>הדף לא נמצא | בריאות נפש בישראל</title>
        <meta name="robots" content="noindex" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#F8F9FF', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <a href="#main-content" style={{
            position: 'absolute',
            top: '-40px',
            right: 0,
            background: '#1A3A5C',
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

        <header style={{
          background: '#1A3A5C', color: 'white', padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="בריאות נפש בישראל" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
          </div>
          <nav aria-label="ניווט ראשי" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'white', background: 'rgba(255,255,255,0.1)', borderRadius: '999px',
                padding: '6px 14px', fontWeight: 600, fontSize: 12,
                border: '1.5px solid rgba(255,255,255,0.2)', textDecoration: 'none',
              }}>{label}</a>
            ))}
          </nav>
        </header>

        {/* תוכן מרכזי */}
        <main id="main-content" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>

            {/* לוגו */}
            <img
              src="/logo.png"
              alt="בריאות נפש בישראל"
              style={{ width: 90, height: 90, objectFit: 'contain', marginBottom: 24, opacity: 0.85 }}
            />

            {/* 404 */}
            <div style={{
              fontSize: 96, fontWeight: 800, lineHeight: 1,
              background: 'linear-gradient(135deg, #1A3A5C, #2A5298)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: 8,
            }}>404</div>

            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1A3A5C', margin: '0 0 12px' }}>
              אופס, הדף לא נמצא
            </h1>
            <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, margin: '0 0 32px' }}>
              ייתכן שהקישור שגוי, הדף הוסר, או שהכתובת שהקלדת אינה קיימת.
            </p>

            {/* כפתורים */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => router.push('/')}
                style={{
                  background: '#1A3A5C', color: 'white', border: 'none',
                  borderRadius: '999px', padding: '12px 28px', fontWeight: 700,
                  fontSize: 14, cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                  boxShadow: '0 4px 16px rgba(26,58,92,0.25)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#2A5298'}
                onMouseLeave={e => e.currentTarget.style.background = '#1A3A5C'}
              >
                🏠 חזרה לדף הבית
              </button>
              <button
                onClick={() => router.back()}
                style={{
                  background: 'white', color: '#1A3A5C',
                  border: '1.5px solid #C5D0F0', borderRadius: '999px',
                  padding: '12px 28px', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#F0F4FF'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                ← חזרה לדף הקודם
              </button>
            </div>

            {/* קישורים מהירים */}
            <div style={{ marginTop: 40, padding: '24px', background: 'white', borderRadius: 16, border: '1.5px solid #C5D0F0', boxShadow: '0 2px 12px rgba(26,58,92,0.06)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 14 }}>אולי חיפשת את...</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[['♿ שיקום בקהילה', '/rehab'], ['🏥 שירותי טיפול', '/treatment'], ['🗺️ מפת שירותים', '/map'], ['➕ הוספת שירות', '/register']].map(([label, href]) => (
                  <a key={href} href={href} style={{
                    background: '#F0F4FF', color: '#1A3A5C', borderRadius: '999px',
                    padding: '8px 16px', fontSize: 13, fontWeight: 600,
                    textDecoration: 'none', border: '1px solid #C5D0F0',
                  }}>{label}</a>
                ))}
              </div>
            </div>

          </div>
        </main>

        <footer style={{
          background: '#1A3A5C', color: 'rgba(255,255,255,0.7)',
          textAlign: 'center', padding: '20px', fontSize: 13,
        }}>
          <div style={{ marginBottom: 8 }}>
            <a href="/accessibility" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 8px' }}>הצהרת נגישות</a>
            <span style={{ opacity: 0.4 }}>·</span>
            <a href="/legal" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 8px' }}>תנאי שימוש</a>
          </div>
          בריאות נפש בישראל © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}
