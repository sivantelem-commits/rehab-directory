import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'

const REHAB_COLORS = {
  'דיור': '#2E0060', 'תעסוקה': '#6A0099', 'השכלה': '#9B00CC',
  'חברה ופנאי': '#5E35B1', 'ליווי ותמיכה': '#CE66F0',
  'טיפולי שיניים': '#7800BB', 'שירותים נוספים': '#E099F8',
}

const TREATMENT_COLORS = {
  'בתים מאזנים': '#0A3040', 'מחלקות אשפוז': '#1565A8',
  'מרפאות יום': '#0891B2', 'חדרי מיון': '#06B6D4',
  'אשפוז בית': '#0E7490',
  'שירותים נוספים': '#0A6080',
}

const DISTRICTS = ['הכל', 'צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']

const DISTRICT_CENTERS = {
  'צפון':           [32.89, 35.50],
  'חיפה':           [32.81, 34.99],
  'מרכז':           [32.08, 34.88],
  'תל אביב':        [32.07, 34.78],
  'ירושלים':        [31.78, 35.22],
  'דרום':           [31.25, 34.79],
  'יהודה ושומרון':  [31.95, 35.27],
}
const NAV = [['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/guide', 'מדריך'], ['/register', 'הרשמת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']]

export default function MapPage() {
  const [rehabServices, setRehabServices] = useState([])
  const [treatmentServices, setTreatmentServices] = useState([])
  const [showRehab, setShowRehab] = useState(true)
  const [showTreatment, setShowTreatment] = useState(true)
  const [rehabCategory, setRehabCategory] = useState('הכל')
  const [treatmentCategory, setTreatmentCategory] = useState('הכל')
  const [district, setDistrict] = useState('הכל')
  const [showNationalOnly, setShowNationalOnly] = useState(false)
  const [showNationalPanel, setShowNationalPanel] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selected, setSelected] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(data => setRehabServices(Array.isArray(data) ? data : []))
    fetch('/api/treatment').then(r => r.json()).then(data => setTreatmentServices(Array.isArray(data) ? data : []))
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
      s.lat &&
      (rehabCategory === 'הכל' || s.category === rehabCategory) &&
      (district === 'הכל' || s.district === district) &&
      (!showNationalOnly || s.is_national)
    )

    const filteredTreatment = treatmentServices.filter(s =>
      s.lat &&
      (treatmentCategory === 'הכל' || s.category === treatmentCategory) &&
      (district === 'הכל' || s.district === district) &&
      (!showNationalOnly || s.is_national)
    )

    if (showRehab) {
      // שירותים איזוריים ללא מיקום — הצג בנקודות מרכז המחוז
      rehabServices.filter(s =>
        !s.lat && s.districts && s.districts.length > 0 &&
        (rehabCategory === 'הכל' || s.category === rehabCategory) &&
        (district === 'הכל' || s.districts.includes(district)) &&
        (!showNationalOnly || s.is_national)
      ).forEach(s => {
        s.districts.forEach(d => {
          const center = DISTRICT_CENTERS[d]
          if (!center) return
          const color = REHAB_COLORS[s.category] || '#4aab78'
          const icon = L.divIcon({
            html: `<div style="position:relative;width:28px;height:28px"><div style="width:26px;height:26px;border-radius:50%;background:white;border:3px solid ${color};box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="width:14px;height:14px;border-radius:50%;background:${color}"></div></div><div style="position:absolute;top:-8px;right:-8px;font-size:12px;line-height:1">🗺️</div></div>`,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          })
          const marker = L.marker(center, { icon }).addTo(mapRef.current)
          marker.on('click', () => setSelected({ ...s, type: 'rehab', _districtLabel: d }))
          markersRef.current.push(marker)
        })
      })

      filteredRehab.forEach(s => {
        const color = REHAB_COLORS[s.category] || '#4aab78'
        const isNational = s.is_national
        const icon = L.divIcon({
          html: isNational
            ? `<div style="position:relative;width:20px;height:20px">
                <div style="width:18px;height:18px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>
                <div style="position:absolute;top:-6px;right:-6px;font-size:11px;line-height:1">🌍</div>
               </div>`
            : `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
          className: '',
          iconSize: isNational ? [20, 20] : [14, 14],
          iconAnchor: isNational ? [10, 10] : [7, 7],
        })
        const marker = L.marker([s.lat, s.lng], { icon }).addTo(mapRef.current)
        marker.on('click', () => setSelected({ ...s, type: 'rehab' }))
        markersRef.current.push(marker)
      })
    }

    if (showTreatment) {
      // שירותים איזוריים ללא מיקום — הצג בנקודות מרכז המחוז
      treatmentServices.filter(s =>
        !s.lat && s.districts && s.districts.length > 0 &&
        (treatmentCategory === 'הכל' || s.category === treatmentCategory) &&
        (district === 'הכל' || s.districts.includes(district)) &&
        (!showNationalOnly || s.is_national)
      ).forEach(s => {
        s.districts.forEach(d => {
          const center = DISTRICT_CENTERS[d]
          if (!center) return
          const color = TREATMENT_COLORS[s.category] || '#ee7a50'
          const icon = L.divIcon({
            html: `<div style="position:relative;width:28px;height:28px"><div style="width:26px;height:26px;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);background:white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;border:3px solid ${color}"><div style="width:14px;height:14px;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);background:${color}"></div></div><div style="position:absolute;top:-8px;right:-8px;font-size:12px;line-height:1">🗺️</div></div>`,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          })
          const marker = L.marker(center, { icon }).addTo(mapRef.current)
          marker.on('click', () => setSelected({ ...s, type: 'treatment', _districtLabel: d }))
          markersRef.current.push(marker)
        })
      })

      filteredTreatment.forEach(s => {
        const color = TREATMENT_COLORS[s.category] || '#ee7a50'
        const isNational = s.is_national
        const icon = L.divIcon({
          html: isNational
            ? `<div style="position:relative;width:22px;height:22px">
                <div style="width:20px;height:20px;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);background:white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center"><div style="width:13px;height:13px;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);background:${color}"></div></div>
                <div style="position:absolute;top:-6px;right:-6px;font-size:11px;line-height:1">🌍</div>
               </div>`
            : `<div style="width:18px;height:18px;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);background:white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="width:12px;height:12px;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);background:${color}"></div></div>`,
          className: '',
          iconSize: isNational ? [22, 22] : [18, 18],
          iconAnchor: isNational ? [11, 11] : [9, 9],
        })
        const marker = L.marker([s.lat, s.lng], { icon }).addTo(mapRef.current)
        marker.on('click', () => setSelected({ ...s, type: 'treatment' }))
        markersRef.current.push(marker)
      })
    }
  }, [mounted, rehabServices, treatmentServices, showRehab, showTreatment, rehabCategory, treatmentCategory, district, showNationalOnly])

  if (!mounted) return null

  const filteredRehabCount = rehabServices.filter(s =>
    s.lat &&
    (rehabCategory === 'הכל' || s.category === rehabCategory) &&
    (district === 'הכל' || s.district === district) &&
    (!showNationalOnly || s.is_national)
  ).length

  const filteredTreatmentCount = treatmentServices.filter(s =>
    s.lat &&
    (treatmentCategory === 'הכל' || s.category === treatmentCategory) &&
    (district === 'הכל' || s.district === district) &&
    (!showNationalOnly || s.is_national)
  ).length

  const nationalRehab = rehabServices.filter(s =>
    s.is_national &&
    (rehabCategory === 'הכל' || s.category === rehabCategory)
  )
  const nationalTreatment = treatmentServices.filter(s =>
    s.is_national &&
    (treatmentCategory === 'הכל' || s.category === treatmentCategory)
  )
  const nationalCount = nationalRehab.length + nationalTreatment.length

  const sel = { padding: '7px 12px', borderRadius: '999px', border: '1.5px solid #ddd', fontSize: 13, background: 'white', cursor: 'pointer', outline: 'none' }

  return (
    <>
      <Head>
        <title>מפת שירותים | בריאות נפש בישראל</title>
        <meta name="description" content="מפה אינטראקטיבית של שירותי שיקום וטיפול פסיכיאטרי בישראל – סננו לפי אזור וקטגוריה." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rehabdirectoryil.vercel.app/map" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="מפת שירותים | בריאות נפש בישראל" />
        <meta property="og:description" content="מפה אינטראקטיבית של שירותי שיקום וטיפול פסיכיאטרי בישראל – סננו לפי אזור וקטגוריה." />
        <meta property="og:url" content="https://rehabdirectoryil.vercel.app/map" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>

        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/map-logo.png" alt="מפה" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'invert(1) brightness(10)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>מפת שירותים</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'white',
                background: href === '/map' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
                borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12,
                border: href === '/map' ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.25)',
                textDecoration: 'none',
              }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'white', borderBottom: '1px solid #e0e0e0', padding: '10px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={district} onChange={e => setDistrict(e.target.value)} style={sel}>
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setShowRehab(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px', border: `2px solid ${showRehab ? '#8B00D4' : '#ddd'}`, background: showRehab ? '#f7f0ff' : 'white', color: showRehab ? '#4C0080' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: showRehab ? '#8B00D4' : '#ddd' }} />
              ♿ שיקום
            </button>
            {showRehab && (
              <select value={rehabCategory} onChange={e => setRehabCategory(e.target.value)} style={{ ...sel, borderColor: '#8B00D4' }}>
                <option value="הכל">כל הקטגוריות</option>
                {Object.keys(REHAB_COLORS).map(c => <option key={c}>{c}</option>)}
              </select>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setShowTreatment(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px', border: `2px solid ${showTreatment ? '#0891B2' : '#ddd'}`, background: showTreatment ? '#f0faff' : 'white', color: showTreatment ? '#0A6080' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
              <div style={{ width: 10, height: 10, background: showTreatment ? '#0891B2' : '#ddd', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
              🏥 טיפול
            </button>
            {showTreatment && (
              <select value={treatmentCategory} onChange={e => setTreatmentCategory(e.target.value)} style={{ ...sel, borderColor: '#0891B2' }}>
                <option value="הכל">כל הקטגוריות</option>
                {Object.keys(TREATMENT_COLORS).map(c => <option key={c}>{c}</option>)}
              </select>
            )}
          </div>

          <button onClick={() => setShowNationalOnly(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px',
            border: `2px solid ${showNationalOnly ? '#1A3A5C' : '#ddd'}`,
            background: showNationalOnly ? '#EEF2FF' : 'white',
            color: showNationalOnly ? '#1A3A5C' : '#aaa',
            fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
          }}>🌍 ארצי בלבד</button>

          {nationalCount > 0 && (
            <button onClick={() => setShowNationalPanel(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px',
              border: `2px solid #7B2D8B`, background: showNationalPanel ? '#F3E5F5' : 'white',
              color: '#7B2D8B', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
            }}>📋 שירותים ארציים ({nationalCount})</button>
          )}

          <div style={{ fontSize: 13, color: '#888', marginRight: 'auto', fontWeight: 600 }}>
            {(showRehab ? filteredRehabCount : 0) + (showTreatment ? filteredTreatmentCount : 0)} שירותים
          </div>
        </div>

        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div id="main-map" style={{ height: isMobile ? '55vw' : 'calc(100vh - 130px)', minHeight: isMobile ? 260 : undefined, width: '100%' }} />

          {showNationalPanel && (
            <div style={{
              position: 'absolute', top: 12, right: 12, width: 300,
              maxHeight: 'calc(100vh - 200px)', overflowY: 'auto',
              background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              borderTop: '4px solid #7B2D8B', zIndex: 1000,
            }}>
              <div style={{ padding: '14px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, background: 'white', borderRadius: '16px 16px 0 0' }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#1A3A5C' }}>🌍 שירותים ארציים</div>
                <button onClick={() => setShowNationalPanel(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#aaa' }}>✕</button>
              </div>
              <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {showRehab && nationalRehab.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#8B00D4', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>♿ שיקום</div>
                    {nationalRehab.map(s => (
                      <div key={s.id} onClick={() => { setSelected({ ...s, type: 'rehab' }); setShowNationalPanel(false) }}
                        style={{ padding: '10px 12px', borderRadius: 12, background: '#f9f9f9', cursor: 'pointer', border: '1.5px solid #eee' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f7f0ff'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f9f9f9'}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A3A5C', marginBottom: 2 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          <span style={{ background: '#f7f0ff', color: '#4C0080', borderRadius: 999, padding: '1px 7px', fontWeight: 600 }}>{s.category}</span>
                          {s.phone && <span style={{ marginRight: 6 }}>· 📞 {s.phone}</span>}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {showTreatment && nationalTreatment.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0891B2', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>🏥 טיפול</div>
                    {nationalTreatment.map(s => (
                      <div key={s.id} onClick={() => { setSelected({ ...s, type: 'treatment' }); setShowNationalPanel(false) }}
                        style={{ padding: '10px 12px', borderRadius: 12, background: '#f9f9f9', cursor: 'pointer', border: '1.5px solid #eee' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0faff'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f9f9f9'}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A3A5C', marginBottom: 2 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          <span style={{ background: '#f0faff', color: '#0A6080', borderRadius: 999, padding: '1px 7px', fontWeight: 600 }}>{s.category}</span>
                          {s.phone && <span style={{ marginRight: 6 }}>· 📞 {s.phone}</span>}
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {nationalRehab.length === 0 && nationalTreatment.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#aaa', fontSize: 13 }}>אין שירותים ארציים</div>
                )}
              </div>
            </div>
          )}

          {selected && (
            <div style={{
              position: isMobile ? 'relative' : 'absolute',
              bottom: isMobile ? undefined : 16,
              right: isMobile ? undefined : 16,
              left: isMobile ? undefined : 16,
              maxWidth: isMobile ? '100%' : 360,
              margin: isMobile ? '0' : '0 auto',
              background: 'white', borderRadius: isMobile ? 0 : 16, padding: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              borderTop: `4px solid ${selected.type === 'rehab' ? (REHAB_COLORS[selected.category] || '#4aab78') : (TREATMENT_COLORS[selected.category] || '#ee7a50')}`,
              zIndex: 1000,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1A3A5C' }}>
                    {selected.name} {selected.is_national && <span title="פריסה ארצית">🌍</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>📍 {selected.city}{selected.district ? `, ${selected.district}` : ''}{selected._districtLabel && <span style={{ marginRight: 6, background: '#EEF2FF', color: '#1A3A5C', borderRadius: 999, padding: '1px 7px', fontSize: 11 }}>🗺️ שירות איזורי — {selected._districtLabel}</span>}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa', padding: 0 }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                <span style={{ background: selected.type === 'rehab' ? '#f7f0ff' : '#f0faff', color: selected.type === 'rehab' ? '#4C0080' : '#0A6080', borderRadius: '999px', padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                  {selected.type === 'rehab' ? '♿' : '🏥'} {selected.category}
                </span>
                {selected.is_national && (
                  <span style={{ background: '#EEF2FF', color: '#1A3A5C', borderRadius: '999px', padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>🌍 פריסה ארצית</span>
                )}
              </div>
              {selected.description && (
                <div style={{ fontSize: 12, color: '#445', lineHeight: 1.55, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {selected.description}
                </div>
              )}
              <a href={`/${selected.type === 'rehab' ? 'service' : 'treatment'}/${selected.id}`}
                style={{ display: 'block', textAlign: 'center', background: selected.type === 'rehab' ? '#8B00D4' : '#0891B2', color: 'white', borderRadius: '999px', padding: '8px 0', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                לפרטים המלאים ←
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
