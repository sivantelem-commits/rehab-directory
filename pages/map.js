import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'

const REHAB_COLORS = {
  'דיור': '#7B2D8B', 'תעסוקה': '#F47B20', 'השכלה': '#1A3A5C',
  'חברה ופנאי': '#2E7D32', 'ליווי ותמיכה': '#0277BD',
  'טיפולי שיניים': '#C2185B', 'שירותים נוספים': '#546E7A',
}

const TREATMENT_COLORS = {
  'בתי"מ': '#0277BD', 'מחלקות אשפוז': '#ee7a50',
  'מרפאות יום': '#2E7D32', 'חדרי מיון': '#C62828',
}

const DISTRICTS = ['הכל', 'צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']
const NAV = [['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register', 'הרשמת שירות'], ['/about', 'אודות'], ['/admin', 'ניהול']]

export default function MapPage() {
  const [rehabServices, setRehabServices] = useState([])
  const [treatmentServices, setTreatmentServices] = useState([])
  const [showRehab, setShowRehab] = useState(true)
  const [showTreatment, setShowTreatment] = useState(true)
  const [rehabCategory, setRehabCategory] = useState('הכל')
  const [treatmentCategory, setTreatmentCategory] = useState('הכל')
  const [district, setDistrict] = useState('הכל')
  const [mounted, setMounted] = useState(false)
  const [selected, setSelected] = useState(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(data => setRehabServices(Array.isArray(data) ? data.filter(s => s.lat) : []))
    fetch('/api/treatment').then(r => r.json()).then(data => setTreatmentServices(Array.isArray(data) ? data.filter(s => s.lat) : []))
  }, [])

  useEffect(() => {
    if (!mounted) return
    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')

    if (!mapRef.current) {
      mapRef.current = L.map('main-map').setView([31.5, 34.8], 8)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current)
    }

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const filteredRehab = rehabServices.filter(s =>
      (rehabCategory === 'הכל' || s.category === rehabCategory) &&
      (district === 'הכל' || s.district === district)
    )

    const filteredTreatment = treatmentServices.filter(s =>
      (treatmentCategory === 'הכל' || s.category === treatmentCategory) &&
      (district === 'הכל' || s.district === district)
    )

    if (showRehab) {
      filteredRehab.forEach(s => {
        const color = REHAB_COLORS[s.category] || '#4aab78'
        const icon = L.divIcon({
          html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
          className: '', iconSize: [14, 14],
        })
        const marker = L.marker([s.lat, s.lng], { icon }).addTo(mapRef.current)
        marker.on('click', () => setSelected({ ...s, type: 'rehab' }))
        markersRef.current.push(marker)
      })
    }

    if (showTreatment) {
      filteredTreatment.forEach(s => {
        const color = TREATMENT_COLORS[s.category] || '#ee7a50'
        const icon = L.divIcon({
          html: `<div style="background:${color};width:14px;height:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"></div>`,
          className: '', iconSize: [14, 14],
        })
        const marker = L.marker([s.lat, s.lng], { icon }).addTo(mapRef.current)
        marker.on('click', () => setSelected({ ...s, type: 'treatment' }))
        markersRef.current.push(marker)
      })
    }
  }, [mounted, rehabServices, treatmentServices, showRehab, showTreatment, rehabCategory, treatmentCategory, district])

  if (!mounted) return null

  const filteredRehabCount = rehabServices.filter(s =>
    (rehabCategory === 'הכל' || s.category === rehabCategory) &&
    (district === 'הכל' || s.district === district)
  ).length

  const filteredTreatmentCount = treatmentServices.filter(s =>
    (treatmentCategory === 'הכל' || s.category === treatmentCategory) &&
    (district === 'הכל' || s.district === district)
  ).length

  const sel = { padding: '7px 12px', borderRadius: '999px', border: '1.5px solid #ddd', fontSize: 13, background: 'white', cursor: 'pointer', outline: 'none' }

  return (
    <>
      <Head>
        <title>מפה | בריאות נפש בישראל</title>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>

        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="לוגו" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>מפת שירותים</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'white', borderBottom: '1px solid #e0e0e0', padding: '10px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={district} onChange={e => setDistrict(e.target.value)} style={sel}>
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setShowRehab(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px', border: `2px solid ${showRehab ? '#4aab78' : '#ddd'}`, background: showRehab ? '#f2faf4' : 'white', color: showRehab ? '#2d6a4f' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: showRehab ? '#4aab78' : '#ddd' }} />
              ♿ שיקום
            </button>
            {showRehab && (
              <select value={rehabCategory} onChange={e => setRehabCategory(e.target.value)} style={{ ...sel, borderColor: '#4aab78' }}>
                <option value="הכל">כל הקטגוריות</option>
                {Object.keys(REHAB_COLORS).map(c => <option key={c}>{c}</option>)}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setShowTreatment(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px', border: `2px solid ${showTreatment ? '#ee7a50' : '#ddd'}`, background: showTreatment ? '#fff8f3' : 'white', color: showTreatment ? '#c85e32' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
              <div style={{ width: 10, height: 10, background: showTreatment ? '#ee7a50' : '#ddd', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
              🏥 טיפול
            </button>
            {showTreatment && (
              <select value={treatmentCategory} onChange={e => setTreatmentCategory(e.target.value)} style={{ ...sel, borderColor: '#ee7a50' }}>
                <option value="הכל">כל הקטגוריות</option>
                {Object.keys(TREATMENT_COLORS).map(c => <option key={c}>{c}</option>)}
              </select>
            )}
          </div>

          <div style={{ fontSize: 13, color: '#888', marginRight: 'auto', fontWeight: 600 }}>
            {(showRehab ? filteredRehabCount : 0) + (showTreatment ? filteredTreatmentCount : 0)} שירותים
          </div>
        </div>

        <div style={{ position: 'relative', flex: 1 }}>
          <div id="main-map" style={{ height: 'calc(100vh - 130px)', width: '100%' }} />

          {selected && (
            <div style={{ position: 'absolute', bottom: 16, right: 16, left: 16, maxWidth: 360, margin: '0 auto', background: 'white', borderRadius: 16, padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', borderTop: `4px solid ${selected.type === 'rehab' ? (REHAB_COLORS[selected.category] || '#4aab78') : (TREATMENT_COLORS[selected.category] || '#ee7a50')}`, zIndex: 1000 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1A3A5C' }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>📍 {selected.city}{selected.district ? `, ${selected.district}` : ''}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa', padding: 0 }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <span style={{ background: selected.type === 'rehab' ? '#f2faf4' : '#fff8f3', color: selected.type === 'rehab' ? '#2d6a4f' : '#c85e32', borderRadius: '999px', padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                  {selected.type === 'rehab' ? '♿' : '🏥'} {selected.category}
                </span>
              </div>
              {selected.description && <div style={{ fontSize: 12, color: '#445', lineHeight: 1.55, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{selected.description}</div>}
              <a href={`/${selected.type === 'rehab' ? 'service' : 'treatment'}/${selected.id}`}
                style={{ display: 'block', textAlign: 'center', background: selected.type === 'rehab' ? '#4aab78' : '#ee7a50', color: 'white', borderRadius: '999px', padding: '8px 0', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                לפרטים המלאים ←
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
