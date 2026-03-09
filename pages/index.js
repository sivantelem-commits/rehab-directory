import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import ServiceCard from '../components/ServiceCard'
import { CATEGORIES, CATEGORY_NAMES } from '../lib/categories'

const DISTRICTS = ['הכל', 'צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']

export default function Home() {
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

  const sel = { padding: '9px 14px', borderRadius: 20, border: '1.5px solid #FFD4B0', fontSize: 14, background: 'white', cursor: 'pointer', outline: 'none' }

  return (
    <>
      <Head>
        <title>מאגר שירותי סל שיקום</title>
        <meta name="description" content="מצאו שירותי שיקום בקהילה – דיור, תעסוקה, השכלה וליווי לפי אזור בישראל" />
        <meta property="og:title" content="מאגר שירותי סל שיקום" />
        <meta property="og:description" content="מצאו שירותי שיקום בקהילה לפי אזור וקטגוריה" />
        <meta property="og:url" content="https://rehabdirectoryil.vercel.app/" />
      </Head>
      <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#FFF8F3' }}>
        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F47B20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>♿</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 19 }}>סל שיקום</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>מאגר שירותי שיקום בקהילה</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['/', 'שירותים'], ['/map', '🗺️ מפה'], ['/register', 'הרשמת שירות'], ['/about', 'אודות'], ['/admin', 'ניהול']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 12px', fontWeight: 600, fontSize: 12, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '36px 20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 10px' }}>מאגר שירותי סל שיקום</h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: '0 0 24px' }}>מצאו שירותי שיקום בקהילה לפי אזור וקטגוריה</p>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <input
              type="text"
              placeholder="חפשו לפי שם, עיר או תיאור..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '14px 20px', borderRadius: 30, border: 'none', fontSize: 15, outline: 'none', boxSizing: 'border-box', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
            />
          </div>
        </div>

        <div style={{ background: 'white', borderBottom: '1px solid #FFE8D6', padding: '12px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
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
          <div style={{ marginRight: 'auto', fontSize: 13, color: '#888' }}>
            {loading ? 'טוען...' : `${services.length} שירותים`}
          </div>
        </div>

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 64, color: '#F47B20' }}>טוען שירותים...</div>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: '#aaa' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>לא נמצאו שירותים</div>
              <button onClick={() => { setSearch(''); setDistrict('הכל'); setCategory('הכל'); setSubcategory('הכל') }}
                style={{ background: '#F47B20', color: 'white', border: 'none', borderRadius: 20, padding: '10px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
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

        {showTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ position: 'fixed', bottom: 24, left: 24, width: 48, height: 48, borderRadius: '50%', background: '#F47B20', color: 'white', border: 'none', fontSize: 22, cursor: 'pointer', boxShadow: '0 4px 16px rgba(244,123,32,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ↑
          </button>
        )}

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
          מאגר שירותי סל שיקום © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}
