import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const router = useRouter()
  const [newService, setNewService] = useState(null)

  useEffect(() => {
    // מביא את השירות האחרון שנוסף מכל אחת מהטבלאות
    Promise.all([
      fetch('/api/services').then(r => r.json()).catch(() => []),
      fetch('/api/treatment').then(r => r.json()).catch(() => []),
    ]).then(([rehab, treatment]) => {
      const rehabLatest = Array.isArray(rehab) ? rehab[0] : null
      const treatmentLatest = Array.isArray(treatment) ? treatment[0] : null

      // בוחר את החדש יותר לפי created_at
      if (!rehabLatest && !treatmentLatest) return
      if (!rehabLatest) return setNewService({ ...treatmentLatest, type: 'treatment' })
      if (!treatmentLatest) return setNewService({ ...rehabLatest, type: 'rehab' })

      const r = new Date(rehabLatest.created_at || 0)
      const t = new Date(treatmentLatest.created_at || 0)
      setNewService(r > t
        ? { ...rehabLatest, type: 'rehab' }
        : { ...treatmentLatest, type: 'treatment' }
      )
    })
  }, [])

  const handleBannerClick = () => {
    if (!newService) return
    router.push(newService.type === 'rehab'
      ? `/service/${newService.id}`
      : `/treatment/${newService.id}`
    )
  }

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

        {/* באנר שירות חדש */}
        {newService && (
          <div
            onClick={handleBannerClick}
            style={{
              width: '100%', maxWidth: 480,
              background: 'white',
              border: `2px solid ${newService.type === 'rehab' ? '#4aab78' : '#ee7a50'}`,
              borderRadius: 16,
              padding: '12px 18px',
              marginBottom: 32,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: `0 4px 16px ${newService.type === 'rehab' ? 'rgba(74,171,120,0.15)' : 'rgba(238,122,80,0.15)'}`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${newService.type === 'rehab' ? 'rgba(74,171,120,0.25)' : 'rgba(238,122,80,0.25)'}` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 16px ${newService.type === 'rehab' ? 'rgba(74,171,120,0.15)' : 'rgba(238,122,80,0.15)'}` }}
          >
            {/* אייקון */}
            <div style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              background: newService.type === 'rehab' ? '#f2faf4' : '#fff8f3',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {newService.type === 'rehab' ? '♿' : '🏥'}
            </div>

            {/* טקסט */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{
                  background: newService.type === 'rehab' ? '#4aab78' : '#ee7a50',
                  color: 'white', borderRadius: '999px', padding: '2px 8px',
                  fontSize: 10, fontWeight: 700,
                }}>✨ חדש!</span>
                <span style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>
                  {newService.type === 'rehab' ? 'שיקום' : 'טיפול'}
                </span>
              </div>
              <div style={{
                fontWeight: 700, fontSize: 14, color: '#1a1a2e',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{newService.name}</div>
              <div style={{ fontSize: 12, color: '#aaa', fontWeight: 500 }}>
                📍 {newService.city}{newService.district ? `, ${newService.district}` : ''}
              </div>
            </div>

            {/* חץ */}
            <div style={{ fontSize: 18, color: newService.type === 'rehab' ? '#4aab78' : '#ee7a50', flexShrink: 0 }}>←</div>
          </div>
        )}

        {/* כותרת */}
        <div style={{ textAlign: 'center', marginBottom: 52, marginTop: newService ? 0 : 40 }}>
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
              background: 'linear-gradient(160deg, #7ec8a0, #4aab78)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              fontFamily: "'Nunito', sans-serif",
              boxShadow: '0 6px 0 #3a8a5e, 0 10px 24px rgba(74,171,120,0.3)',
              transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 0 #3a8a5e, 0 18px 36px rgba(74,171,120,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 6px 0 #3a8a5e, 0 10px 24px rgba(74,171,120,0.3)'
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
              background: 'linear-gradient(160deg, #f4a27a, #ee7a50)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              fontFamily: "'Nunito', sans-serif",
              boxShadow: '0 6px 0 #c85e32, 0 10px 24px rgba(238,122,80,0.3)',
              transition: 'transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 10px 0 #c85e32, 0 18px 36px rgba(238,122,80,0.4)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 6px 0 #c85e32, 0 10px 24px rgba(238,122,80,0.3)'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(2px)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(-5px)'}
          >
            <span style={{ fontSize: 28 }}>🏥</span>
            <span style={{ fontSize: 18, fontWeight: 800 }}>טיפול</span>
            <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>בתי"מ, אשפוז ומרפאות</span>
          </button>

        </div>

      </div>
    </>
  )
}
