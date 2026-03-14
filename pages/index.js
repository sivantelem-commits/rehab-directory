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
        padding: '24px',
        paddingTop: 40,
      }}>

        {/* כותרת */}
        <div style={{ textAlign: 'center', marginBottom: 52, marginTop: 40 }}>
          <img src="/logo.png" alt="לוגו" style={{ width: 200, height: 200, objectFit: 'contain', marginBottom: 10, mixBlendMode: 'multiply' }} />
          <h1 style={{
            fontSize: 32, fontWeight: 800,
            color: '#3d2a6e', margin: '0 0 10px',
            letterSpacing: '-0.3px',
          }}>
            בריאות נפש בישראל
          </h1>
          <p style={{ fontSize: 15, color: '#9b88bb', margin: 0, fontWeight: 500 }}>
            בחרו את סוג השירות שאתם מחפשים
          </p>
        </div>

        {/* שני כפתורים */}
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>

          {/* שיקום */}
          <button
            onClick={() => router.push('/rehab')}
            style={{
              width: 210, height: 96,
              borderRadius: '999px',
              background: 'linear-gradient(160deg, #8B00D4, #4C0080)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              fontFamily: "'Nunito', sans-serif",
              boxShadow: '0 6px 0 #2E0060, 0 10px 24px rgba(76,0,128,0.3)',
              transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 0 #2E0060, 0 18px 36px rgba(76,0,128,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 6px 0 #2E0060, 0 10px 24px rgba(76,0,128,0.3)'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(2px)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-5px)'}
          >
            <span style={{ fontSize: 28 }}>♿</span>
            <span style={{ fontSize: 18, fontWeight: 800 }}>שיקום</span>
            <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>סל שיקום בקהילה</span>
          </button>

          {/* טיפול */}
          <button
            onClick={() => router.push('/treatment')}
            style={{
              width: 210, height: 96,
              borderRadius: '999px',
              background: 'linear-gradient(160deg, #0891B2, #164E63)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              fontFamily: "'Nunito', sans-serif",
              boxShadow: '0 6px 0 #0A3040, 0 10px 24px rgba(22,78,99,0.3)',
              transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 0 #0A3040, 0 18px 36px rgba(22,78,99,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 6px 0 #0A3040, 0 10px 24px rgba(22,78,99,0.3)'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(2px)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-5px)'}
          >
            <span style={{ fontSize: 28 }}>🏥</span>
            <span style={{ fontSize: 18, fontWeight: 800 }}>טיפול</span>
            <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>בתים מאזנים, אשפוז ומרפאות</span>
          </button>

        </div>

      </div>
    </>
  )
}
