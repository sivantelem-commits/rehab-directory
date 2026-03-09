import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import { CATEGORIES, CATEGORY_NAMES, getCategoryColor } from '../lib/categories'

const DISTRICTS = ['הכל', 'צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']

export default function MapPage() {
  const [allServices, setAllServices] = useState([])
  const [mounted, setMounted] = useState(false)
  const [district, setDistrict] = useState('הכל')
  const [category, setCategory] = useState('הכל')
  const [subcategory, setSubcategory] = useState('הכל')
  const mapRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => setAllServices(Array.isArray(data) ? data.filter(s => s.lat && s.lng) : []))
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    if (mapRef.current) return
    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')
    const map = L.map('map').setView([31.5, 34.8], 8)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)
    mapRef.current = map
  }, [mounted])

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return
    const L = require('leaflet')
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []
    const filtered = allServices.filter(s => {
      if (district !== 'הכל' && s.district !== district) return false
      if (category !== 'הכל' && s.category !== category) return false
      if (subcategory !== 'הכל' && s.subcategory !== subcategory) return false
      return true
    })
    filtered.forEach(s => {
      const color = getCategoryColor(s.category, s.subcategory)
      const icon = L.divIcon({
        html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        className: '',
        iconSize: [14, 14],
      })
      const marker = L.marker([s.lat, s.lng], { icon })
        .addTo(mapRef.current)
        .bindPopup(`<div dir="rtl"><strong>${s.name}</strong><br/>${s.city}<br/><span style="color:${color}">${s.category}${s.subcategory ? ` › ${s.subcategory}` : ''}</span>${s.phone ? `<br/>📞 ${s.phone}` : ''}</div>`)
      markersRef.current.push(marker)
    })
  }, [allServices, district, category, subcategory])

  const filtered = allServices.filter(s => {
    if (district !== 'הכל' && s.district !== district) return false
    if (category !== 'הכל' && s.category !== category) return false
    if (subcategory !== 'הכל' && s.subcategory !== subcategory) return false
    return true
  })

  const subcategories = category !== 'הכל' ? ['הכל', ...CATEGORIES[category].subcategories] : []

  if (!mounted) return null

  const sel = { padding: '8px 12px', borderRadius: 20, border: '1.5px solid #FFD4B0', fontSize: 13, background: '#FFF8F3', cursor: 'pointer', outline: 'none' }

  return (
    <>
      <Head>
        <title>מפת שירותים | סל שיקום</title>
        <meta name="description" content="מפת שירותי סל שיקום בישראל לפי אזור וקטגוריה" />
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

        <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>🗺️ מפת שירותים</h1>
              <p style={{ fontSize: 13, opacity: 0.85, margin: 0 }}>{filtered.length} שירותים מוצגים</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(CATEGORIES).map(([cat, val]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: val.color }} />
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>

        <div id="map" style={{ height: 'calc(100vh - 200px)', width: '100%' }} />

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13 }}>
          מאגר שירותי סל שיקום © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}
