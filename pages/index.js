import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Home() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>בריאות נפש בישראל</title>
        <meta name="description" content="פורטל שירותי בריאות נפש בישראל – שיקום וטיפול" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{
        fontFamily: "'Nunito', sans-serif",
        minHeight: '100vh',
        background: '#f7f3ff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '16px',
        paddingTop: 24,
      }}>

        {/* כותרת */}
        <div style={{ textAlign: 'center', marginBottom: 28, marginTop: 16 }}>
          <img src="/logo.png" alt="לוגו" style={{ width: 'min(160px, 40vw)', height: 'min(160px, 40vw)', objectFit: 'contain', marginBottom: 8, mixBlendMode: 'multiply' }} />
          <h1 style={{ fontSize: 'clamp(22px, 6vw, 32px)', fontWeight: 800, color: '#3d2a6e', margin: '0 0 10px', letterSpacing: '-0.3px' }}>
            בריאות נפש בישראל
          </h1>
          <p style={{ fontSize: 15, color: '#9b88bb', margin: 0, fontWeight: 500 }}>
            בחרו את סוג השירות שאתם מחפשים
          </p>
        </div>

        {/* שני כפתורים ראשיים */}
        <div style={{ display: 'flex', gap: 16, flexDirection: 'column', alignItems: 'center' }}>

          {/* שיקום */}
          <button onClick={() => router.push('/rehab')} style={{ width: 'min(320px, 80vw)', height: 88, borderRadius: '999px', background: 'linear-gradient(160deg, #8B00D4, #4C0080)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: "'Nunito', sans-serif", boxShadow: '0 6px 0 #2E0060, 0 10px 24px rgba(76,0,128,0.3)', transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 0 #2E0060, 0 18px 36px rgba(76,0,128,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 0 #2E0060, 0 10px 24px rgba(76,0,128,0.3)' }}
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(2px)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-5px)'}
          >
            <span style={{ fontSize: 18, fontWeight: 800 }}>שיקום</span>
            <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>סל שיקום בקהילה</span>
          </button>

          {/* טיפול */}
          <button onClick={() => router.push('/treatment')} style={{ width: 'min(320px, 80vw)', height: 88, borderRadius: '999px', background: 'linear-gradient(160deg, #0891B2, #164E63)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, fontFamily: "'Nunito', sans-serif", boxShadow: '0 6px 0 #0A3040, 0 10px 24px rgba(22,78,99,0.3)', transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 0 #0A3040, 0 18px 36px rgba(22,78,99,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 0 #0A3040, 0 10px 24px rgba(22,78,99,0.3)' }}
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(2px)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-5px)'}
          >
            <span style={{ fontSize: 18, fontWeight: 800 }}>טיפול</span>
            <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>בתים מאזנים, אשפוז ומרפאות</span>
          </button>

        </div>

        {/* מפריד */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '36px 0 28px', width: '100%', maxWidth: 460 }}>
          <div style={{ flex: 1, height: 1, background: '#ddd6f3' }} />
          <span style={{ fontSize: 13, color: '#9b88bb', fontWeight: 600, whiteSpace: 'nowrap' }}>לא יודעים מאיזו מסגרת להתחיל?</span>
          <div style={{ flex: 1, height: 1, background: '#ddd6f3' }} />
        </div>

        {/* כפתור מחשבון */}
        <button onClick={() => router.push('/calculator')} style={{ width: '100%', maxWidth: 460, padding: '18px 24px', borderRadius: '999px', background: 'white', border: '2px solid #e9d5ff', color: '#4C0080', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: "'Nunito', sans-serif", boxShadow: '0 4px 16px rgba(76,0,128,0.08)', transition: 'all 0.2s ease' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#faf5ff'; e.currentTarget.style.borderColor = '#a855f7'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(76,0,128,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e9d5ff'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(76,0,128,0.08)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <span style={{ fontSize: 22 }}>🧭</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>מחשבון איתור מסלול</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#9b88bb', marginTop: 2 }}>8 שאלות קצרות - וקבל המלצה מותאמת אישית</div>
          </div>
          <span style={{ marginRight: 'auto', fontSize: 18, color: '#a855f7' }}>←</span>
        </button>

        {/* הערת מאגר */}
        <div style={{ marginTop: 28, maxWidth: 460, textAlign: 'center', fontSize: 12, color: '#b8a8d0', lineHeight: 1.7, fontWeight: 500, padding: '12px 16px', background: 'rgba(255,255,255,0.5)', borderRadius: 12, border: '1px solid #e9d5ff' }}>
          המאגר נבנה על סמך הרשמת השירותים - ייתכן שיש שירותים שטרם נוספו.
          <br/>
          <a href="/register" style={{ color: '#8B00D4', fontWeight: 700, textDecoration: 'none' }}>הוספת שירות ←</a>
        </div>

        {/* קישורים תחתונים */}
        <div style={{ display: 'flex', gap: 16, marginTop: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            ['/about', 'אודות'],
            ['/contact', 'צור קשר'],
            ['/legal', 'תנאי שימוש'],
            ['/accessibility', 'הצהרת נגישות'],
          ].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: 13, fontWeight: 600, color: '#9b88bb', textDecoration: 'none', padding: '4px 0' }}>{label}</a>
          ))}
        </div>

      </div>
    </>
  )
}
