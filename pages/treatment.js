import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const DISTRICTS = ['הכל', 'צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']

const CATEGORIES = {
  'בתי"מ': { color: '#e07a50', icon: '🏠', desc: 'בתים מאזנים' },
  'מחלקות אשפוז': { color: '#c85e32', icon: '🏥', desc: 'אשפוז פסיכיאטרי' },
  'מרפאות יום': { color: '#f4a27a', icon: '☀️', desc: 'טיפול יומי' },
  'חדרי מיון': { color: '#b84a2a', icon: '🚨', desc: 'מיון פסיכיאטרי' },
}

const NAV = [['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register', 'הרשמת שירות'], ['/about', 'אודות'], ['/admin', 'ניהול']]

export default function Treatment() {
  const router = useRouter()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('הכל')
  const [category, setCategory] = useState('הכל')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 200)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (district !== 'הכל') params.set('district', district)
      if (category !== 'הכל') params.set('category', category)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/treatment?${params}`)
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } finally { setLoading(false) }
  }, [district, category, debouncedSearch])

  useEffect(() => { fetchServices() }, [fetchServices])

  if (!mounted) return null

  const sel = {
    padding: '9px 16px',
    borderRadius: '999px',
    border: '1.5px solid #f4c4a8',
    fontSize: 14,
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'Nunito', sans-serif",
    color: '#c85e32',
    fontWeight: 600,
  }

  return (
    <>
      <Head>
        <title>טיפול | בריאות נפש בישראל</title>
        <meta name="description" content="בתי מאזנים, מחלקות אשפוז, מרפאות יום וחדרי מיון פסיכיאטריים בישראל" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#fff8f3' }}>

        {/* HEADER */}
       <header style={{
  background: 'linear-gradient(135deg, #c85e32, #ee7a50)',
  color: 'white',
  padding: '10px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 2px 12px rgba(200,94,50,0.2)',
  flexWrap: 'wrap',
  gap: 8,
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <img
      src="/logo.png"
      alt="לוגו"
      style={{
        width: 44,
        height: 44,
        objectFit: 'contain',
        filter: 'brightness(0) invert(1)',
      }}
    />
    <div>
      <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
      <div style={{ fontSize: 11, opacity: 0.8 }}>שירותי טיפול</div>
    </div>
  </div>
  <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    {NAV.map(([href, label]) => (
      <a key={href} href={href} style={{
        color: 'white',
        background: href === '/treatment' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
        borderRadius: '999px',
        padding: '6px 14px',
        fontWeight: 600,
        fontSize: 12,
        border: href === '/treatment' ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.2)',
        textDecoration: 'none',
      }}>{label}</a>
    ))}
  </nav>
</header>

        {/* HERO */}
        <div style={{
          background: 'linear-gradient(160deg, #d4693a, #ee7a50)',
          color: 'white',
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.3px' }}>
            🏥 שירותי טיפול
          </h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: '0 0 24px', fontWeight: 500 }}>
            בתי"מ, מחלקות אשפוז, מרפאות יום וחדרי מיון
          </p>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <input
              type="text"
              placeholder="חפשו לפי שם, עיר או תיאור..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 22px',
                borderRadius: '999px',
                border: 'none',
                fontSize: 15,
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 500,
              }}
            />
          </div>
        </div>

        {/* CATEGORY FILTERS */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid #fad4b8',
          padding: '16px',
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {[['הכל', '#ee7a50', '🔍'], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.color, v.icon])].map(([cat, col, icon]) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '9px 18px',
                borderRadius: '999px',
                border: `2px solid ${category === cat ? col : '#f4c4a8'}`,
                background: category === cat ? col : 'white',
                color: category === cat ? 'white' : '#c85e32',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
                transition: 'all 0.15s ease',
                boxShadow: category === cat ? `0 4px 0 ${col}99, 0 6px 16px ${col}44` : 'none',
              }}
              onMouseEnter={e => { if (category !== cat) e.currentTarget.style.background = '#fff3ee' }}
              onMouseLeave={e => { if (category !== cat) e.currentTarget.style.background = 'white' }}
            >
              <span>{icon}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* DISTRICT FILTER */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid #fad4b8',
          padding: '12px 20px',
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <select value={district} onChange={e => setDistrict(e.target.value)} style={sel}>
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <div style={{ marginRight: 'auto', fontSize: 13, color: '#f4a27a', fontWeight: 600 }}>
            {loading ? 'טוען...' : `${services.length} שירותים`}
          </div>
        </div>

        {/* MAIN */}
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 64, color: '#ee7a50', fontSize: 16, fontWeight: 600 }}>
              טוען שירותים...
            </div>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: '#aaa' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#555' }}>לא נמצאו שירותים</div>
              <button
                onClick={() => { setSearch(''); setDistrict('הכל'); setCategory('הכל') }}
                style={{
                  background: 'linear-gradient(160deg, #f4a27a, #ee7a50)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '11px 28px',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: "'Nunito', sans-serif",
                  boxShadow: '0 4px 0 #c85e32, 0 8px 20px rgba(238,122,80,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 7px 0 #c85e32, 0 14px 28px rgba(238,122,80,0.35)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 0 #c85e32, 0 8px 20px rgba(238,122,80,0.3)'
                }}
              >
                נקה פילטרים
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {services.map(s => {
                const cat = CATEGORIES[s.category] || { color: '#ee7a50', icon: '🏥' }
                return (
                  <div
                    key={s.id}
                    onClick={() => router.push(`/treatment/${s.id}`)}
                    style={{
                      background: 'white',
                      borderRadius: 20,
                      padding: '20px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      border: '1.5px solid #fad4b8',
                      borderTop: `4px solid ${cat.color}`,
                      display: 'flex', flexDirection: 'column',
                      minHeight: 200,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.boxShadow = '0 10px 28px rgba(238,122,80,0.15)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#3a1a0a', flex: 1 }}>{s.name}</div>
                      <span style={{
                        background: cat.color, color: 'white',
                        borderRadius: '999px', padding: '3px 12px',
                        fontSize: 11, fontWeight: 700,
                        whiteSpace: 'nowrap', marginRight: 8,
                      }}>{cat.icon} {s.category}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#aaa', marginBottom: 8, fontWeight: 500 }}>
                      📍 {s.city}{s.district ? `, ${s.district}` : ''}
                    </div>
                    <div style={{
                      flex: 1, fontSize: 13.5, color: '#555',
                      lineHeight: 1.6,
                      display: '-webkit-box', WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {s.description}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 13, color: cat.color, flexWrap: 'wrap', marginTop: 12, fontWeight: 600 }}>
                      {s.phone && <span>📞 {s.phone}</span>}
                      {s.email && <span>✉️ {s.email}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>

        {/* SCROLL TO TOP */}
        {showTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              position: 'fixed', bottom: 24, left: 24,
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(160deg, #f4a27a, #ee7a50)',
              color: 'white', border: 'none', fontSize: 20,
              cursor: 'pointer',
              boxShadow: '0 4px 0 #c85e32, 0 8px 20px rgba(238,122,80,0.35)',
              zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ↑
          </button>
        )}

        {/* FOOTER */}
        <footer style={{
          background: 'linear-gradient(135deg, #c85e32, #d4693a)',
          color: 'rgba(255,255,255,0.75)',
          textAlign: 'center',
          padding: '24px',
          fontSize: 13,
          marginTop: 48,
          fontWeight: 500,
        }}>
          בריאות נפש בישראל © 2026
        </footer>

      </div>
    </>
  )
}
