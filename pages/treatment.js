import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const DISTRICTS = ['הכל', 'צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']

const CATEGORIES = {
  'בתי"מ': { color: '#0277BD', icon: '🏠', desc: 'בתים מאזנים' },
  'מחלקות אשפוז': { color: '#7B2D8B', icon: '🏥', desc: 'אשפוז פסיכיאטרי' },
  'מרפאות יום': { color: '#2E7D32', icon: '☀️', desc: 'טיפול יומי' },
  'חדרי מיון': { color: '#C62828', icon: '🚨', desc: 'מיון פסיכיאטרי' },
}

const NAV = [['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register-treatment', 'הרשמת שירות'], ['/about', 'אודות'], ['/admin', 'ניהול']]

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

  const sel = { padding: '9px 14px', borderRadius: 20, border: '1.5px solid #B3D4E8', fontSize: 14, background: 'white', cursor: 'pointer', outline: 'none' }

  return (
    <>
      <Head>
        <title>טיפול | בריאות נפש בישראל</title>
        <meta name="description" content="בתי מאזנים, מחלקות אשפוז, מרפאות יום וחדרי מיון פסיכיאטריים בישראל" />
      </Head>
      <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F0F7FF' }}>
        <header style={{ background: '#0277BD', color: 'white', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🧠</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 19 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>שירותי טיפול</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 12px', fontWeight: 600, fontSize: 12, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(135deg, #0277BD, #0288D1)', color: 'white', padding: '36px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 10px' }}>🏥 שירותי טיפול</h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: '0 0 24px' }}>בתי"מ, מחלקות אשפוז, מרפאות יום וחדרי מיון</p>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <input type="text" placeholder="חפשו לפי שם, עיר או תיאור..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '14px 20px', borderRadius: 30, border: 'none', fontSize: 15, outline: 'none', boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }} />
          </div>
        </div>

        <div style={{ background: 'white', borderBottom: '1px solid #B3D4E8', padding: '16px', display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['הכל', '#0277BD', '🔍'], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.color, v.icon])].map(([cat, col, icon]) => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 20, border: `2px solid ${category === cat ? col : '#ddd'}`, background: category === cat ? col : 'white', color: category === cat ? 'white' : '#555', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              <span>{icon}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        <div style={{ background: 'white', borderBottom: '1px solid #B3D4E8', padding: '10px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={district} onChange={e => setDistrict(e.target.value)} style={sel}>
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <div style={{ marginRight: 'auto', fontSize: 13, color: '#888' }}>
            {loading ? 'טוען...' : `${services.length} שירותים`}
          </div>
        </div>

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 64, color: '#0277BD' }}>טוען שירותים...</div>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: '#aaa' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>לא נמצאו שירותים</div>
              <button onClick={() => { setSearch(''); setDistrict('הכל'); setCategory('הכל') }}
                style={{ background: '#0277BD', color: 'white', border: 'none', borderRadius: 20, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
                נקה פילטרים
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {services.map(s => {
                const cat = CATEGORIES[s.category] || { color: '#0277BD', icon: '🏥' }
                return (
                  <div key={s.id} onClick={() => router.push(`/treatment/${s.id}`)}
                    style={{ background: 'white', borderRadius: 16, padding: '20px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', border: '1.5px solid #B3D4E8', borderTop: `4px solid ${cat.color}`, display: 'flex', flexDirection: 'column', minHeight: 200 }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#1A3A5C', flex: 1 }}>{s.name}</div>
                      <span style={{ background: cat.color, color: 'white', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', marginRight: 8 }}>{cat.icon} {s.category}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>📍 {s.city}{s.district ? `, ${s.district}` : ''}</div>
                    <div style={{ flex: 1, fontSize: 13.5, color: '#445', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {s.description}
                    </div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 13, color: cat.color, flexWrap: 'wrap', marginTop: 12 }}>
                      {s.phone && <span>📞 {s.phone}</span>}
                      {s.email && <span>✉️ {s.email}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>

        {showTop && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ position: 'fixed', bottom: 24, left: 24, width: 48, height: 48, borderRadius: '50%', background: '#0277BD', color: 'white', border: 'none', fontSize: 22, cursor: 'pointer', boxShadow: '0 4px 16px rgba(2,119,189,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ↑
          </button>
        )}

        <footer style={{ background: '#0277BD', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
          בריאות נפש בישראל © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}
