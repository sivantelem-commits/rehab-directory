import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Home() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>בריאות נפש בישראל</title>
        <meta name="description" content="פורטל שירותי בריאות נפש בישראל – שיקום וטיפול" />
        <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{
        fontFamily: "'Heebo', sans-serif",
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f3eeff 0%, #ece4fb 60%, #e4d8f7 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>

        {/* כותרת */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🧠</div>
          <h1 style={{
            fontSize: 34, fontWeight: 800,
            color: '#5b2d8e',
            margin: '0 0 10px',
            letterSpacing: '-0.5px',
          }}>
            בריאות נפש בישראל
          </h1>
          <p style={{ fontSize: 15, color: '#7a5fa0', margin: 0, fontWeight: 400 }}>
            בחרו את סוג השירות שאתם מחפשים
          </p>
        </div>

        {/* עיגולים */}
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center' }}>

          {/* שיקום */}
          <button
            onClick={() => router.push('/rehab')}
            style={{
              width: 210, height: 210,
              borderRadius: '50%',
              background: '#c9a8e8',
              border: '3px solid #b084d4',
              color: '#3d1a6e',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 6px 24px rgba(176,132,212,0.28)',
              transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.04)'
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(176,132,212,0.42)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(176,132,212,0.28)'
            }}
          >
            <span style={{ fontSize: 48 }}>♿</span>
            <span style={{ fontSize: 20, fontWeight: 800 }}>שיקום</span>
            <span style={{ fontSize: 12, color: '#5d3a8a', fontWeight: 400 }}>סל שיקום בקהילה</span>
          </button>

          {/* טיפול */}
          <button
            onClick={() => router.push('/treatment')}
            style={{
              width: 210, height: 210,
              borderRadius: '50%',
              background: '#b094d6',
              border: '3px solid #9370c4',
              color: '#3d1a6e',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 6px 24px rgba(147,112,196,0.28)',
              transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.04)'
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(147,112,196,0.42)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(147,112,196,0.28)'
            }}
          >
            <span style={{ fontSize: 48 }}>🏥</span>
            <span style={{ fontSize: 20, fontWeight: 800 }}>טיפול</span>
            <span style={{ fontSize: 12, color: '#5d3a8a', fontWeight: 400 }}>בתי"מ, אשפוז ומרפאות</span>
          </button>

        </div>

        <p style={{ marginTop: 52, fontSize: 12, color: '#7a5fa0', fontWeight: 400 }}>
          בריאות נפש בישראל · שירותי שיקום בקהילה
        </p>

      </div>
    </>
  )
}
