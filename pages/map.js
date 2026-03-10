import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'

const REHAB_COLORS = {
  'דיור': '#7B2D8B', 'תעסוקה': '#F47B20', 'השכלה': '#1A3A5C',
  'חברה ופנאי': '#2E7D32', 'ליווי ותמיכה': '#0277BD',
  'טיפולי שיניים': '#C2185B', 'שירותים נוספים': '#546E7A',
}

const TREATMENT_COLORS = {
  'בתי"מ': '#0277BD', 'מחלקות אשפוז': '#7B2D8B',
  'מרפאות יום': '#2E7D32', 'חדרי מיון': '#C62828',
}

const NAV = [['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/admin', 'ניהול']]

export default function MapPage() {
  const [rehabServices, setRehabServices] = useState([])
  const [treatmentServices, setTreatmentServices] = useState([])
  const [showRehab, setShowRehab] = useState(true)
  const [showTreatment, setShowTreatment] = useState(true)
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

    if (showRehab) {
      rehabServices.forEach(s => {
        const color = REHAB_COLORS[s.category] || '#F47B20'
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
      treatmentServices.forEach(s => {
        const color = TREATMENT_COLORS[s.category] || '#0277BD'
        const icon = L.divIcon({
          html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"></div>`,
          className: '', iconSize: [14, 14],
        })
        const marker = L.marker([s.lat, s.lng], { icon }).addTo(mapRef.current)
        marker.on('click', () => setSelected({ ...s, type: 'treatment' }))
        markersRef.current.push(marker)
      })
    }
  }, [mounted, rehabServices, treatmentServices, showRehab, showTreatment])

  if (!mounted) return null

  const total = (showRehab ? rehabServices.length : 0) + (showTreatment ? treatmentServices.length : 0)

  return (
    <>
      <Head>
        <title>מפה | בריאות נפש בישראל</title>
      </Head>
      <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#FFF8F3', display: 'flex', flexDirection: 'column' }}>
        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F47B20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>♿</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 19 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>מפת שירותים</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 12px', fontWeight: 600, fontSize: 12, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'white', borderBottom: '1px solid #FFE8D6', padding: '10px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setShowRehab(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, border: `2px solid ${showRehab ? '#F47B20' : '#ddd'}`, background: showRehab ? '#FFF3E8' : 'white', color: showRehab ? '#F47B20' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: showRehab ? '#F47B20' : '#ddd' }} />
            ♿ שיקום ({rehabServices.length})
          </button>
          <button onClick={() => setShowTreatment(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, border: `2px solid ${showTreatment ? '#0277BD' : '#ddd'}`, background: showTreatment ? '#E3F2FD' : 'white', color: showTreatment ? '#0277BD' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            <div style={{ width: 12, height: 12, background: showTreatment ? '#0277BD' : '#ddd', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
            🏥 טיפול ({treatmentServices.length})
          </button>
          <div style={{ fontSize: 13, color: '#888', marginRight: 'auto' }}>
            {total} שירותים על המפה
          </div>
        </div>

        <div style={{ position: 'relative', flex: 1 }}>
          <div id="main-map" style={{ height: 'calc(100vh - 180px)', width: '100%' }} />

          {selected && (
            <div style={{ position: 'absolute', bottom: 16, right: 16, left: 16, maxWidth: 360, margin: '0 auto', background: 'white', borderRadius: 16, padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', borderTop: `4px solid ${selected.type === 'rehab' ? (REHAB_COLORS[selected.category] || '#F47B20') : (TREATMENT_COLORS[selected.category] || '#0277BD')}`, zIndex: 1000 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1A3A5C' }}>{selected.name}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>📍 {selected.city}{selected.district ? `, ${selected.district}` : ''}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa', padding: 0 }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <span style={{ background: selected.type === 'rehab' ? '#FFF3E8' : '#E3F2FD', color: selected.type === 'rehab' ? '#F47B20' : '#0277BD', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                  {selected.type === 'rehab' ? '♿' : '🏥'} {selected.category}
                </span>
              </div>
              {selected.description && <div style={{ fontSize: 12, color: '#445', lineHeight: 1.55, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{selected.description}</div>}
              <a href={`/${selected.type === 'rehab' ? 'service' : 'treatment'}/${selected.id}`}
                style={{ display: 'block', textAlign: 'center', background: selected.type === 'rehab' ? '#F47B20' : '#0277BD', color: 'white', borderRadius: 20, padding: '8px 0', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                לפרטים המלאים ←
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
