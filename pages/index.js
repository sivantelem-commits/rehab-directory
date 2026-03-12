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
        background: 'linear-gradient(160deg, #e8faf7 0%, #fdf6f0 60%, #fde8dc 100%)',
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
            color: '#1e9e88',
            margin: '0 0 10px',
            letterSpacing: '-0.5px',
          }}>
            בריאות נפש בישראל
          </h1>
          <p style={{ fontSize: 15, color: '#999', margin: 0, fontWeight: 400 }}>
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
              background: 'white',
              border: '3px solid #f4956a',
              color: '#e07a52',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 6px 24px rgba(244,149,106,0.18)',
              transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.04)'
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(244,149,106,0.32)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(244,149,106,0.18)'
            }}
          >
            <span style={{ fontSize: 48 }}>♿</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#e07a52' }}>שיקום</span>
            <span style={{ fontSize: 12, color: '#bbb', fontWeight: 400 }}>סל שיקום בקהילה</span>
          </button>

          {/* טיפול */}
          <button
            onClick={() => router.push('/treatment')}
            style={{
              width: 210, height: 210,
              borderRadius: '50%',
              background: 'white',
              border: '3px solid #2db8a0',
              color: '#1e9e88',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: '0 6px 24px rgba(45,184,160,0.18)',
              transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.04)'
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(45,184,160,0.32)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(45,184,160,0.18)'
            }}
          >
            <span style={{ fontSize: 48 }}>🏥</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#1e9e88' }}>טיפול</span>
            <span style={{ fontSize: 12, color: '#bbb', fontWeight: 400 }}>בתי"מ, אשפוז ומרפאות</span>
          </button>

        </div>

        {/* כיתוב תחתון */}
        <p style={{ marginTop: 52, fontSize: 12, color: '#ccc', fontWeight: 400 }}>
          בריאות נפש בישראל · שירותי שיקום בקהילה
        </p>

      </div>
    </>
  )
}
