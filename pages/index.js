import { useState, useEffect, useCallback } from 'react'
import ServiceCard from '../components/ServiceCard'
import ServiceModal from '../components/ServiceModal'

const DISTRICTS = ['הכל', 'צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']
const SERVICE_TYPES = ['הכל', 'שיקום תעסוקתי', 'בית מאזן', 'דיור מוגן']
const TYPE_COLORS = { 'שיקום תעסוקתי': '#F47B20', 'בית מאזן': '#1A3A5C', 'דיור מוגן': '#E85D9A' }

export default function Home() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('הכל')
  const [type, setType] = useState('הכל')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchServices = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (district !== 'הכל') params.set('district', district)
    if (type !== 'הכל') params.set('type', type)
    if (debouncedSearch) params.set('search', debouncedSearch)
    try {
      const res = await fetch(`/api/services?${params}`)
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [district, type, debouncedSearch])

  useEffect(() => { fetchServices() }, [fetchServices])

  if (!mounted) return null

  return (
    <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#FFF8F3' }}>
      <header style={{ background: '#1A3A5C', color: 'white', padding: '0 32px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F47B20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>♿</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: 0.3 }}>סל שיקום</div>
            <div style={{ fontSize: 11, opacity: 0.75 }}>מאגר שירותי שיקום בקהילה</div>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 8 }}>
          {[['/', 'שירותים'], ['/map', '🗺️ מפה'], ['/register', 'הרשמת שירות'], ['/admin', 'ניהול']].map(([href, label]) => (
            <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '7px 18px', fontWeight: 600, fontSize: 13, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
          ))}
        </nav>
      </header>

      <div style={{ background: 'linear-gradient(135deg, #1A3A5C 0%, #2A5298 100%)', color: 'white', padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🌈</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.3 }}>מאגר שירותי סל שיקום</h1>
          <p style={{ fontSize: 16, opacity: 0.88, margin: 0, lineHeight: 1.7 }}>
            מצאו את השירות המתאים לכם — לפי מיקום, סוג שירות ותחום
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', marginBottom: 28, boxShadow: '0 4px 20px rgba(244,123,32,0.1)', border: '1.5px solid #FFE0C8', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 חיפוש לפי שם, עיר..."
            style={{ flex: '1 1 200px', padding: '10px 14px', borderRadius: 20, border: '1.5px solid #FFD4B0', fontSize: 14, background: '#FFF8F3', outline: 'none' }}
          />
          <select value={district} onChange={e => setDistrict(e.target.value)} style={{ flex: '1 1 140px', padding: '10px 14px', borderRadius: 20, border: '1.5px solid #FFD4B0', fontSize: 14, background: '#FFF8F3', cursor: 'pointer', outline: 'none' }}>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={type} onChange={e => setType(e.target.value)} style={{ flex: '1 1 160px', padding: '10px 14px', borderRadius: 20, border: '1.5px solid #FFD4B0', fontSize: 14, background: '#FFF8F3', cursor: 'pointer', outline: 'none' }}>
            {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <span style={{ fontSize: 13.5, color: '#F47B20', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {loading ? '...' : `${services.length} שירותים`}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 64, color: '#F47B20' }}>טוען שירותים...</div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 64, color: '#aaa' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 17, fontWeight: 600 }}>לא נמצאו שירותים</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {services.map(s => <ServiceCard key={s.id} service={s} typeColors={TYPE_COLORS} onClick={setSelected} />)}
          </div>
        )}
      </main>

      <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
        מאגר שירותי סל שיקום © {new Date().getFullYear()}
      </footer>

      {selected && <ServiceModal service={selected} onClose={() => setSelected(null)} typeColors={TYPE_COLORS} />}
    </div>
  )
}
