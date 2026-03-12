import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import ServiceCard from '../components/ServiceCard'
import { CATEGORIES, CATEGORY_NAMES } from '../lib/categories'

const DISTRICTS = ['הכל', 'צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']

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
      if (district !== 'הכל') params.set('district', district)
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

  if (!mounted) return null

  const sel = {
    padding: '9px 16px',
    borderRadius: '999px',
    border: '1.5px solid #a8d8b0',
    fontSize: 14,
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: "'Nunito', sans-serif",
    color: '#2d6a4f',
    fontWeight: 600,
  }

  return (
    <>
      <Head>
        <title>שיקום | בריאות נפש בישראל</title>
        <meta name="description" content="מאגר שירותי סל שיקום בקהילה – דיור, תעסוקה, השכלה וליווי לפי אזור בישראל" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f2faf4' }}>

        {/* HEADER */}
        <header style={{
  background: 'linear-gradient(135deg, #2d6a4f, #4aab78)',
  color: 'white',
  padding: '10px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 2px 12px rgba(45,106,79,0.2)',
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
      <div style={{ fontSize: 11, opacity: 0.8 }}>שירותי שיקום בקהילה</div>
    </div>
  </div>
  <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
    {[['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register', 'הרשמת שירות'], ['/about', 'אודות'], ['/admin', 'ניהול']].map(([href, label]) => (
      <a key={href} href={href} style={{
        color: 'white',
        background: href === '/rehab' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
        borderRadius: '999px',
        padding: '6px 14px',
        fontWeight: 600,
        fontSize: 12,
        border: href === '/rehab' ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.2)',
        textDecoration: 'none',
        transition: 'background 0.15s',
      }}>{label}</a>
    ))}
  </nav>
</header>

        {/* HERO */}
        <div style={{
          background: 'linear-gradient(160deg, #3a8a5e, #4aab78)',
          color: 'white',
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.3px' }}>
            ♿ שירותי שיקום
          </h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: '0 0 24px', fontWeight: 500 }}>
            מצאו שירותי שיקום בקהילה לפי אזור וקטגוריה
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

        {/* FILTERS */}
        <div style={{
          background: 'white',
          borderBottom: '1px solid #d4edda',
          padding: '12px 20px',
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <select value={district} onChange={e => setDistrict(e.target.value)} style={sel}>
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={category} onChange={e => { setCategory(e.target.value); setSubcategory('הכל') }} style={sel}>
            <option value="הכל">כל הקטגוריות</option>
            {CATEGORY_NAMES.map(c => <option key={c}>{c}</option>)}
          </select>
          {category !== 'הכל' && (
            <select value={subcategory} onChange={e => setSubcategory(e.target.value)} style={sel}>
              {subcategories.map(s => <option key={s}>{s}</option>)}
            </select>
          )}
          <div style={{ marginRight: 'auto', fontSize: 13, color: '#7aaa88', fontWeight: 600 }}>
            {loading ? 'טוען...' : `${services.length} שירותים`}
          </div>
        </div>

        {/* MAIN */}
        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 64, color: '#4aab78', fontSize: 16, fontWeight: 600 }}>
              טוען שירותים...
            </div>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: '#aaa' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#555' }}>לא נמצאו שירותים</div>
              <button
                onClick={() => { setSearch(''); setDistrict('הכל'); setCategory('הכל'); setSubcategory('הכל') }}
                style={{
                  background: 'linear-gradient(160deg, #7ec8a0, #4aab78)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '11px 28px',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: "'Nunito', sans-serif",
                  boxShadow: '0 4px 0 #3a8a5e, 0 8px 20px rgba(74,171,120,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 7px 0 #3a8a5e, 0 14px 28px rgba(74,171,120,0.35)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 0 #3a8a5e, 0 8px 20px rgba(74,171,120,0.3)'
                }}
              >
                נקה פילטרים
              </button>
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

        {/* SCROLL TO TOP */}
        {showTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              position: 'fixed', bottom: 24, left: 24,
              width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(160deg, #7ec8a0, #4aab78)',
              color: 'white', border: 'none', fontSize: 20,
              cursor: 'pointer',
              boxShadow: '0 4px 0 #3a8a5e, 0 8px 20px rgba(74,171,120,0.35)',
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
          background: 'linear-gradient(135deg, #2d6a4f, #3a8a5e)',
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
