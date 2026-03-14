import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import ServiceCard from '../components/ServiceCard'
import { CATEGORIES, CATEGORY_NAMES } from '../lib/categories'

const DISTRICTS = ['הכל', 'צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון', '🌍 ארצי']


const SkeletonCard = () => (
  <div style={{
    background: 'white', borderRadius: 20, padding: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1.5px solid #d4b0f0',
    borderTop: '4px solid #d4b0f0', minHeight: 200,
  }}>
    <style>{`
      @keyframes shimmer {
        0% { background-position: -400px 0 }
        100% { background-position: 400px 0 }
      }
      .skel-r {
        background: linear-gradient(90deg, #ede0f8 25%, #f7f0ff 50%, #ede0f8 75%);
        background-size: 800px 100%;
        animation: shimmer 1.4s infinite;
        border-radius: 8px;
      }
    `}</style>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
      <div className="skel-r" style={{ height: 18, width: '55%' }} />
      <div className="skel-r" style={{ height: 18, width: '28%', borderRadius: 999 }} />
    </div>
    <div className="skel-r" style={{ height: 14, width: '40%', marginBottom: 14 }} />
    <div className="skel-r" style={{ height: 13, width: '100%', marginBottom: 6 }} />
    <div className="skel-r" style={{ height: 13, width: '90%', marginBottom: 6 }} />
    <div className="skel-r" style={{ height: 13, width: '75%', marginBottom: 18 }} />
    <div style={{ display: 'flex', gap: 10 }}>
      <div className="skel-r" style={{ height: 13, width: 80 }} />
      <div className="skel-r" style={{ height: 13, width: 120 }} />
    </div>
  </div>
)

export default function Rehab() {
  const router = useRouter()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('הכל')
  const [category, setCategory] = useState('הכל')
  const [subcategory, setSubcategory] = useState('הכל')
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
      if (district === '🌍 ארצי') {
        params.set('national', 'true')
      } else if (district !== 'הכל') {
        params.set('district', district)
      }
      if (category !== 'הכל') params.set('category', category)
      if (subcategory !== 'הכל') params.set('subcategory', subcategory)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/services?${params}`)
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } finally { setLoading(false) }
  }, [district, category, subcategory, debouncedSearch])

  useEffect(() => { fetchServices() }, [fetchServices])

  const subcategories = category !== 'הכל' ? ['הכל', ...CATEGORIES[category].subcategories] : []
  const isNational = district === '🌍 ארצי'

  if (!mounted) return null

  return (
    <>
            <Head>
        <title>שירותי שיקום בקהילה | בריאות נפש בישראל</title>
        <meta name="description" content="מאגר שירותי סל שיקום בקהילה – דיור, תעסוקה, השכלה וליווי לפי אזור בישראל. מצאו שירותי שיקום מוכרים לאנשים עם מגבלה נפשית." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rehabdirectoryil.vercel.app/rehab" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="שירותי שיקום בקהילה | בריאות נפש בישראל" />
        <meta property="og:description" content="מאגר שירותי סל שיקום בקהילה – דיור, תעסוקה, השכלה וליווי לפי אזור בישראל. מצאו שירותי שיקום מוכרים לאנשים עם מגבלה נפשית." />
        <meta property="og:url" content="https://rehabdirectoryil.vercel.app/rehab" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f7f0ff' }}>

        <header style={{
          background: 'linear-gradient(135deg, #2E0060, #8B00D4)', color: 'white',
          padding: '10px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(76,0,128,0.2)',
          flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="לוגו" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>שירותי שיקום בקהילה</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register', 'הרשמת שירות'], ['/about', 'אודות'], ['/contact', '✉️ צור קשר'], ['/admin', 'ניהול']].map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'white',
                background: href === '/rehab' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12,
                border: href === '/rehab' ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.2)',
                textDecoration: 'none', transition: 'background 0.15s',
              }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(160deg, #4C0080, #8B00D4)', color: 'white', padding: '40px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.3px' }}>♿ שירותי שיקום</h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: '0 0 24px', fontWeight: 500 }}>מצאו שירותי שיקום בקהילה לפי אזור וקטגוריה</p>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <input type="text" placeholder="חפשו לפי שם, עיר או תיאור..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '14px 22px', borderRadius: '999px', border: 'none',
                fontSize: 15, outline: 'none', boxSizing: 'border-box',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontFamily: "'Nunito', sans-serif", fontWeight: 500,
              }}
            />
          </div>
        </div>

        {/* שורת מחוז + ספירה */}
        <div style={{
          background: 'white', borderBottom: '1px solid #d4b0f0',
          padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        }}>
          {DISTRICTS.map(d => {
            const isNat = d === '🌍 ארצי'
            const active = district === d
            return (
              <button key={d} onClick={() => setDistrict(d)} style={{
                padding: '7px 14px', borderRadius: '999px', fontSize: 13, fontWeight: 600,
                border: `2px solid ${active ? (isNat ? '#1A3A5C' : '#8B00D4') : '#e0d0f0'}`,
                background: active ? (isNat ? '#1A3A5C' : '#8B00D4') : 'white',
                color: active ? 'white' : (isNat ? '#1A3A5C' : '#4C0080'),
                cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                transition: 'all 0.15s',
              }}>{d}</button>
            )
          })}
          <div style={{ marginRight: 'auto', fontSize: 13, color: '#9B00CC', fontWeight: 600 }}>
            {loading ? 'טוען...' : `${services.length} שירותים`}
          </div>
        </div>

        {/* שורת קטגוריות */}
        <div style={{
          background: 'white', borderBottom: `1px solid ${category !== 'הכל' ? '#d4b0f0' : '#f0e8ff'}`,
          padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        }}>
          {[['הכל', null], ...CATEGORY_NAMES.map(n => [n, CATEGORIES[n]])].map(([name, cat]) => {
            const color = cat ? cat.color : '#8B00D4'
            const active = category === name
            return (
              <button key={name} onClick={() => { setCategory(name); setSubcategory('הכל') }} style={{
                padding: '7px 16px', borderRadius: '999px', fontSize: 13, fontWeight: 700,
                border: `2px solid ${active ? color : '#e0d0f0'}`,
                background: active ? color : 'white',
                color: active ? 'white' : color,
                cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                transition: 'all 0.15s',
                boxShadow: active ? `0 3px 0 ${color}99` : 'none',
              }}>
                {name === 'הכל' ? '🔍 הכל' : name}
              </button>
            )
          })}
        </div>

        {/* שורת תת-קטגוריות */}
        {category !== 'הכל' && subcategories.length > 0 && (
          <div style={{
            background: '#faf5ff', borderBottom: '1px solid #d4b0f0',
            padding: '8px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
          }}>
            {subcategories.map(s => {
              const active = subcategory === s
              const color = CATEGORIES[category]?.color || '#8B00D4'
              return (
                <button key={s} onClick={() => setSubcategory(s)} style={{
                  padding: '5px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${active ? color : '#d4b0f0'}`,
                  background: active ? `${color}22` : 'white',
                  color: active ? color : '#666',
                  cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                  transition: 'all 0.15s',
                }}>{s}</button>
              )
            })}
          </div>
        )}

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, alignItems: 'stretch' }}>
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: '#aaa' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#555' }}>לא נמצאו שירותים</div>
              <button
                onClick={() => { setSearch(''); setDistrict('הכל'); setCategory('הכל'); setSubcategory('הכל') }}
                style={{
                  background: 'linear-gradient(160deg, #8B00D4, #4C0080)', color: 'white', border: 'none',
                  borderRadius: '999px', padding: '11px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  fontFamily: "'Nunito', sans-serif", boxShadow: '0 4px 0 #2E0060, 0 8px 20px rgba(76,0,128,0.3)',
                }}
              >נקה פילטרים</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, alignItems: 'stretch' }}>
              {services.map(s => (
                <div key={s.id} onClick={() => router.push(`/service/${s.id}`)} style={{ cursor: 'pointer', height: '100%' }}>
                  <ServiceCard service={s} />
                </div>
              ))}
            </div>
          )}
        </main>

        {showTop && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              position: 'fixed', bottom: 24, left: 24, width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(160deg, #8B00D4, #4C0080)', color: 'white', border: 'none',
              fontSize: 20, cursor: 'pointer', boxShadow: '0 4px 0 #3a8a5e, 0 8px 20px rgba(74,171,120,0.35)',
              zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >↑</button>
        )}

        <footer style={{
          background: 'linear-gradient(135deg, #2E0060, #4C0080)', color: 'rgba(255,255,255,0.75)',
          textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48, fontWeight: 500,
        }}>
          <div style={{ marginBottom: 8 }}>
            <a href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>✉️ צור קשר</a>
          </div>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}
