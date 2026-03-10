import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Home() {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>בריאות נפש בישראל</title>
        <meta name="description" content="פורטל שירותי בריאות נפש בישראל – שיקום וטיפול" />
      </Head>
      <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', margin: '0 0 10px' }}>בריאות נפש בישראל</h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', margin: 0 }}>בחרו את סוג השירות שאתם מחפשים</p>
        </div>

        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => router.push('/rehab')}
            style={{ width: 220, height: 220, borderRadius: '50%', background: '#F47B20', border: '4px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 8px 32px rgba(244,123,32,0.5)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <span style={{ fontSize: 52 }}>♿</span>
            <span style={{ fontSize: 22, fontWeight: 800 }}>שיקום</span>
            <span style={{ fontSize: 13, opacity: 0.85 }}>סל שיקום בקהילה</span>
          </button>

          <button onClick={() => router.push('/treatment')}
            style={{ width: 220, height: 220, borderRadius: '50%', background: '#0277BD', border: '4px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: '0 8px 32px rgba(2,119,189,0.5)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <span style={{ fontSize: 52 }}>🏥</span>
            <span style={{ fontSize: 22, fontWeight: 800 }}>טיפול</span>
            <span style={{ fontSize: 13, opacity: 0.85 }}>בתי"מ, אשפוז ומרפאות</span>
          </button>
        </div>
      </div>
    </>
  )
}
