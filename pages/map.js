import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import { BasketPanel, BasketButton } from '../components/ServiceBasket'

// ── צבעים ──────────────────────────────────────────────────
const REHAB_COLORS = {
  'דיור': '#2E0060', 'תעסוקה': '#6A0099', 'השכלה': '#9B00CC',
  'חברה ופנאי': '#5E35B1', 'ליווי ותמיכה': '#CE66F0',
  'טיפולי שיניים': '#7800BB', 'שירותים נוספים': '#E099F8',
}
const TREATMENT_COLORS = {
  'בתים מאזנים': '#0A3040', 'מחלקות אשפוז': '#1565A8',
  'טיפול יום': '#0891B2', 'מרפאות בריאות נפש': '#0284C7',
  'חדרי מיון': '#06B6D4', 'אשפוז בית': '#0E7490', 'שירותים נוספים': '#0A6080',
}
const PRACT_COLOR = '#0F4C75'

const CITY_COORDS = {
  'תל אביב':[32.0853,34.7818],'ירושלים':[31.7683,35.2137],'חיפה':[32.7940,34.9896],
  'באר שבע':[31.2530,34.7915],'ראשון לציון':[31.9730,34.7898],'פתח תקווה':[32.0871,34.8878],
  'אשדוד':[31.8044,34.6553],'נתניה':[32.3215,34.8532],'בני ברק':[32.0840,34.8340],
  'חולון':[32.0114,34.7800],'בת ים':[32.0200,34.7500],'רמת גן':[32.0700,34.8200],
  'אשקלון':[31.6689,34.5742],'רחובות':[31.8928,34.8113],'הרצליה':[32.1664,34.8438],
  'חדרה':[32.4340,34.9196],'מודיעין':[31.8960,35.0100],'כפר סבא':[32.1787,34.9087],
  'לוד':[31.9516,34.8951],'רמלה':[31.9285,34.8730],'נס ציונה':[31.9301,34.7993],
  'אילת':[29.5577,34.9519],'רעננה':[32.1840,34.8705],'גבעתיים':[32.0700,34.8100],
  'קריית גת':[31.6098,34.7642],'נהריה':[33.0068,35.0979],'עכו':[32.9230,35.0767],
  'טבריה':[32.7940,35.5300],'צפת':[32.9648,35.4961],'קריית שמונה':[33.2075,35.5700],
  'נצרת':[32.7021,35.2981],'קריית ביאליק':[32.8350,35.0900],'קריית אתא':[32.8091,35.1068],
  'יקנעם עלית':[32.6596,35.1047],'זכרון יעקב':[32.5712,34.9537],'עפולה':[32.6079,35.2895],
  'בית שאן':[32.4960,35.4990],'דימונה':[31.0671,35.0314],'שדרות':[31.5244,34.5966],
  'ראש העין':[32.0961,34.9557],'אלעד':[32.0528,34.9511],'בית שמש':[31.7435,34.9875],
  'מעלה אדומים':[31.7760,35.2972],'אריאל':[32.1063,35.1680],'יבנה':[31.8766,34.7406],
  'רמת השרון':[32.1461,34.8378],'הוד השרון':[32.1512,34.8879],'כפר יונה':[32.3138,34.9362],
  'נוף הגליל':[32.7083,35.3218],'שפרעם':[32.8087,35.1694],'מגדל העמק':[32.6767,35.2388],
  'גן יבנה':[31.7886,34.7063],'גדרה':[31.8135,34.7754],'מצפה רמון':[30.6105,34.8018],
  'קריית מוצקין':[32.8357,35.0741],'אום אל פחם':[32.5154,35.1525],
}

const DISTRICT_CENTERS = {
  'צפון':[32.89,35.50],'חיפה':[32.81,34.99],'מרכז':[32.08,34.88],
  'תל אביב':[32.07,34.78],'ירושלים':[31.78,35.22],'דרום':[31.25,34.79],
  'יהודה ושומרון':[31.95,35.27],
}

// ── מארקר עיגול פשוט ────────────────────────────────────────
function makeCircleIcon(L, color, size = 14, shape = 'circle') {
  const isPin = shape === 'pin'
  if (isPin) {
    const html = `<div style="position:relative;width:${size}px;height:${size*1.4}px">
      <div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>
    </div>`
    return L.divIcon({ html, className: '', iconSize: [size, size * 1.4], iconAnchor: [size / 2, size * 1.4] })
  }
  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`
  return L.divIcon({ html, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] })
}

// ── פיזור סמנים חופפים ──────────────────────────────────────
function applySpiral(services) {
  const THRESHOLD = 0.0003
  const groups = []
  services.forEach(s => {
    if (!s.lat) return
    const g = groups.find(g => Math.abs(g[0].lat - s.lat) < THRESHOLD && Math.abs(g[0].lng - s.lng) < THRESHOLD)
    if (g) g.push(s)
    else groups.push([s])
  })
  const result = []
  groups.forEach(group => {
    if (group.length === 1) { result.push(group[0]); return }
    group.forEach((s, i) => {
      if (i === 0) { result.push(s); return }
      const angle = (i / group.length) * 2 * Math.PI
      const radius = 0.0005 + Math.floor(i / 8) * 0.0003
      result.push({ ...s, lat: s.lat + radius * Math.cos(angle), lng: s.lng + radius * Math.sin(angle) })
    })
  })
  return result
}

const NAV = [['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']]

export default function MapPage() {
  const [rehabServices, setRehabServices]       = useState([])
  const [treatmentServices, setTreatmentServices] = useState([])
  const [practitioners, setPractitioners]       = useState([])
  const [showRehab, setShowRehab]               = useState(true)
  const [showTreatment, setShowTreatment]       = useState(true)
  const [showPractitioners, setShowPractitioners] = useState(true)
  const [searchText, setSearchText]             = useState('')
  const [citySearch, setCitySearch]             = useState('')
  const [selected, setSelected]                 = useState(null)
  const [sidebarOpen, setSidebarOpen]           = useState(true)
  const [mounted, setMounted]                   = useState(false)
  const [isMobile, setIsMobile]                 = useState(false)
  const mapRef    = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(r => r.json()).then(d => setRehabServices(Array.isArray(d) ? d : [])),
      fetch('/api/treatment').then(r => r.json()).then(d => setTreatmentServices(Array.isArray(d) ? d : [])),
      fetch('/api/practitioners').then(r => r.json()).then(d => setPractitioners(Array.isArray(d) ? d : [])),
    ])
  }, [])

  // ── map init + markers ──────────────────────────────────────
  useEffect(() => {
    if (!mounted) return
    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')

    if (!mapRef.current) {
      mapRef.current = L.map('main-map', { zoomControl: false }).setView([31.8, 35.0], 8)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current)
      L.control.zoom({ position: 'bottomleft' }).addTo(mapRef.current)
    }

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const search = searchText.toLowerCase()
    const allToPlace = []

    if (showRehab) {
      rehabServices
        .filter(s => !search || [s.name, s.city, s.category].some(f => f?.toLowerCase().includes(search)))
        .forEach(s => {
          if (s.lat) {
            allToPlace.push({ ...s, _type: 'rehab' })
          } else {
            const districts = [...new Set([...(s.districts || []), ...(s.district ? [s.district] : [])])]
            districts.forEach(d => {
              const c = DISTRICT_CENTERS[d]
              if (c) allToPlace.push({ ...s, _type: 'rehab', lat: c[0], lng: c[1], _regional: true, _districtLabel: d })
            })
          }
        })
    }

    if (showTreatment) {
      treatmentServices
        .filter(s => !search || [s.name, s.city, s.category].some(f => f?.toLowerCase().includes(search)))
        .forEach(s => {
          if (s.lat) {
            allToPlace.push({ ...s, _type: 'treatment' })
          } else {
            const districts = [...new Set([...(s.districts || []), ...(s.district ? [s.district] : [])])]
            districts.forEach(d => {
              const c = DISTRICT_CENTERS[d]
              if (c) allToPlace.push({ ...s, _type: 'treatment', lat: c[0], lng: c[1], _regional: true, _districtLabel: d })
            })
          }
        })
    }

    applySpiral(allToPlace).forEach(s => {
      const color = s._type === 'rehab'
        ? (REHAB_COLORS[s.category] || '#8B00D4')
        : (TREATMENT_COLORS[s.category] || '#0891B2')
      const size = s._regional ? 10 : 14
      const icon = makeCircleIcon(L, color, size)
      const marker = L.marker([s.lat, s.lng], { icon })
      marker.on('click', () => { setSelected({ ...s, type: s._type }); setSidebarOpen(true) })
      marker.addTo(mapRef.current)
      markersRef.current.push(marker)
    })

    if (showPractitioners) {
      const placed = {}
      practitioners
        .filter(p => p.city && CITY_COORDS[p.city])
        .filter(p => !search || [p.name, p.city, p.profession].some(f => f?.toLowerCase().includes(search)))
        .forEach(p => {
          const base = CITY_COORDS[p.city]
          placed[p.city] = (placed[p.city] || 0) + 1
          const n = placed[p.city]
          const angle = (n - 1) * 2.4
          const r = n === 1 ? 0 : 0.004
          const lat = base[0] + r * Math.cos(angle)
          const lng = base[1] + r * Math.sin(angle)
          const icon = makeCircleIcon(L, PRACT_COLOR, 16, 'pin')
          const marker = L.marker([lat, lng], { icon })
          marker.on('click', () => { setSelected({ ...p, type: 'practitioner', lat, lng }); setSidebarOpen(true) })
          marker.addTo(mapRef.current)
          markersRef.current.push(marker)
        })
    }
  }, [mounted, rehabServices, treatmentServices, practitioners, showRehab, showTreatment, showPractitioners, searchText])

  // ── fly to city ──────────────────────────────────────────────
  const flyToCity = (city) => {
    const coords = CITY_COORDS[city]
    if (coords && mapRef.current) {
      mapRef.current.flyTo(coords, 13, { duration: 1 })
    }
  }

  if (!mounted) return null

  // ── filtered lists for sidebar ───────────────────────────────
  const search = searchText.toLowerCase()
  const sideRehab = showRehab
    ? rehabServices.filter(s => !search || [s.name, s.city, s.category].some(f => f?.toLowerCase().includes(search))).filter(s => s.lat)
    : []
  const sideTreatment = showTreatment
    ? treatmentServices.filter(s => !search || [s.name, s.city, s.category].some(f => f?.toLowerCase().includes(search))).filter(s => s.lat)
    : []
  const sidePractitioners = showPractitioners
    ? practitioners.filter(p => p.city && CITY_COORDS[p.city]).filter(p => !search || [p.name, p.city, p.profession].some(f => f?.toLowerCase().includes(search)))
    : []
  const totalCount = sideRehab.length + sideTreatment.length + sidePractitioners.length

  const SIDEBAR_W = isMobile ? '100%' : 340

  return (
    <>
      <Head>
        <title>מפה | בריאות נפש בישראל</title>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div dir="rtl" style={{ fontFamily: "'Nunito',sans-serif", height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Header ────────────────────────────────────────────── */}
        <header style={{ background: '#1A3A5C', color: 'white', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', zIndex: 200, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', flexShrink: 0 }}>
          {/* לוגו */}
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'white' }}>
            <img src="/logo.png" alt="" style={{ width: 32, height: 32, filter: 'brightness(0) invert(1)' }} />
            <span style={{ fontWeight: 800, fontSize: 15 }}>בריאות נפש בישראל</span>
          </a>

          {/* חיפוש עיר */}
          <div style={{ position: 'relative', flex: 1, minWidth: 160, maxWidth: 260 }}>
            <input
              type="text"
              placeholder="🔍  חפשו עיר..."
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { flyToCity(citySearch); setCitySearch('') } }}
              style={{ width: '100%', padding: '7px 14px', borderRadius: 999, border: 'none', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: 'rgba(255,255,255,0.15)', color: 'white', '::placeholder': { color: 'rgba(255,255,255,0.6)' } }}
            />
            {/* suggestions */}
            {citySearch.length >= 2 && (
              <div style={{ position: 'absolute', top: '100%', right: 0, left: 0, background: 'white', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 500, maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
                {Object.keys(CITY_COORDS).filter(c => c.includes(citySearch)).slice(0, 8).map(city => (
                  <div key={city} onClick={() => { flyToCity(city); setCitySearch('') }}
                    style={{ padding: '8px 14px', cursor: 'pointer', fontSize: 13, color: '#1A3A5C', fontWeight: 600 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    📍 {city}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* חיפוש שם */}
          <div style={{ position: 'relative', flex: 1, minWidth: 140, maxWidth: 220 }}>
            <input
              type="text"
              placeholder="🔍  חפשו שירות..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: '100%', padding: '7px 14px', borderRadius: 999, border: 'none', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background: 'rgba(255,255,255,0.15)', color: 'white' }}
            />
          </div>

          {/* Layer toggles */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              [showRehab, setShowRehab, '♿', 'שיקום', '#8B00D4', '#f7f0ff'],
              [showTreatment, setShowTreatment, '🏥', 'טיפול', '#0891B2', '#f0faff'],
              [showPractitioners, setShowPractitioners, '🧠', 'מטפלים', PRACT_COLOR, '#e0f0ff'],
            ].map(([on, setter, icon, label, color, bg]) => (
              <button key={label} onClick={() => setter(v => !v)} style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 999,
                border: `2px solid ${on ? color : 'rgba(255,255,255,0.3)'}`,
                background: on ? 'white' : 'rgba(255,255,255,0.1)',
                color: on ? color : 'rgba(255,255,255,0.6)',
                fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              }}>
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* ניווט */}
          <nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginRight: 'auto' }}>
            {NAV.filter(([h]) => h !== '/map').map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'rgba(255,255,255,.75)', fontSize: 11, fontWeight: 600, textDecoration: 'none', padding: '4px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>{label}</a>
            ))}
          </nav>
        </header>

        {/* ── Main layout ────────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

          {/* ── Sidebar ── */}
          {(!isMobile || sidebarOpen) && (
            <div style={{
              width: SIDEBAR_W, flexShrink: 0, background: '#f8fafc',
              borderLeft: '1px solid #e0e8f0', overflowY: 'auto',
              display: 'flex', flexDirection: 'column',
              position: isMobile ? 'absolute' : 'relative',
              top: 0, right: 0, bottom: 0, zIndex: isMobile ? 150 : 'auto',
              boxShadow: isMobile ? '-4px 0 20px rgba(0,0,0,0.15)' : 'none',
            }}>
              {/* sidebar header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e8f0', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C' }}>{totalCount} תוצאות</span>
                {isMobile && <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888' }}>✕</button>}
              </div>

              {/* רשימות */}
              {[
                { items: sideRehab, type: 'rehab', label: '♿ שיקום', color: '#8B00D4' },
                { items: sideTreatment, type: 'treatment', label: '🏥 טיפול', color: '#0891B2' },
                { items: sidePractitioners, type: 'practitioner', label: '🧠 מטפלים פרטיים', color: PRACT_COLOR },
              ].filter(g => g.items.length > 0).map(group => (
                <div key={group.type}>
                  <div style={{ padding: '10px 16px 6px', fontSize: 11, fontWeight: 800, color: group.color, letterSpacing: 0.5, background: '#f8fafc', borderBottom: '1px solid #eef2f7' }}>
                    {group.label} ({group.items.length})
                  </div>
                  {group.items.slice(0, 30).map(s => {
                    const isSelected = selected?.id === s.id && selected?.type === group.type
                    const color = group.type === 'rehab'
                      ? (REHAB_COLORS[s.category] || '#8B00D4')
                      : group.type === 'treatment'
                        ? (TREATMENT_COLORS[s.category] || '#0891B2')
                        : PRACT_COLOR
                    return (
                      <div key={s.id}
                        onClick={() => {
                          setSelected({ ...s, type: group.type })
                          if (s.lat && mapRef.current) mapRef.current.flyTo([s.lat, s.lng], 14, { duration: 0.8 })
                          else if (group.type === 'practitioner' && s.city && CITY_COORDS[s.city] && mapRef.current) {
                            mapRef.current.flyTo(CITY_COORDS[s.city], 14, { duration: 0.8 })
                          }
                        }}
                        style={{
                          padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f0f4f8',
                          background: isSelected ? '#f0f7ff' : 'white', borderRight: `3px solid ${isSelected ? color : 'transparent'}`,
                          transition: 'all .1s',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'white' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: group.type === 'practitioner' ? '50% 50% 50% 0' : '50%', background: color, flexShrink: 0, marginTop: 5 }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#1A3A5C', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: '#888', display: 'flex', gap: 6 }}>
                              {s.city && <span>📍 {s.city}</span>}
                              {(s.category || s.profession) && <span style={{ background: color + '18', color, borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>{s.category || s.profession}</span>}
                              {s.is_online && <span style={{ color: '#0891B2', fontWeight: 700 }}>🌐</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {group.items.length > 30 && (
                    <div style={{ padding: '8px 16px', fontSize: 12, color: '#888', textAlign: 'center', borderBottom: '1px solid #eef2f7' }}>+ {group.items.length - 30} נוספים — סמנו/הגדילו את המפה לסינון</div>
                  )}
                </div>
              ))}
              {totalCount === 0 && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#aaa' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  <div style={{ fontWeight: 600 }}>לא נמצאו תוצאות</div>
                </div>
              )}
            </div>
          )}

          {/* ── Map ── */}
          <div style={{ flex: 1, position: 'relative' }}>
            <div id="main-map" style={{ width: '100%', height: '100%' }} />

            {/* כפתור פתיחת sidebar בנייד */}
            {isMobile && !sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} style={{
                position: 'absolute', top: 12, right: 12, zIndex: 100,
                background: 'white', border: 'none', borderRadius: 999,
                padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)', fontFamily: 'inherit', color: '#1A3A5C',
              }}>📋 {totalCount} תוצאות</button>
            )}

            {/* ── Legend ── */}
            <div style={{ position: 'absolute', bottom: 40, left: 16, background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '8px 12px', boxShadow: '0 2px 10px rgba(0,0,0,0.12)', zIndex: 100, fontSize: 12, fontFamily: 'inherit', lineHeight: 1.9, direction: 'rtl' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#8B00D4', display: 'inline-block' }} />שיקום</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0891B2', display: 'inline-block' }} />טיפול</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: PRACT_COLOR, display: 'inline-block' }} />מטפל/ת פרטי/ת</div>
            </div>

            {/* ── Popup על המפה ── */}
            {selected && (
              <div style={{
                position: 'absolute', bottom: 0, left: isMobile ? 0 : 16, right: isMobile ? 0 : 'auto',
                width: isMobile ? '100%' : 320,
                background: 'white', borderRadius: isMobile ? '16px 16px 0 0' : 14,
                padding: '16px', zIndex: 200,
                boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
                borderTop: `4px solid ${selected.type === 'rehab' ? (REHAB_COLORS[selected.category] || '#8B00D4') : selected.type === 'treatment' ? (TREATMENT_COLORS[selected.category] || '#0891B2') : PRACT_COLOR}`,
                marginBottom: isMobile ? 0 : 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0, paddingLeft: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#1A3A5C', marginBottom: 3 }}>{selected.name}</div>
                    <div style={{ fontSize: 12, color: '#666', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {selected.city && <span>📍 {selected.city}</span>}
                      {(selected.category || selected.profession) && (
                        <span style={{ fontWeight: 700, color: selected.type === 'rehab' ? '#8B00D4' : selected.type === 'treatment' ? '#0891B2' : PRACT_COLOR }}>
                          {selected.category || selected.profession}
                        </span>
                      )}
                      {selected.is_online && <span style={{ color: '#0891B2', fontWeight: 700 }}>🌐 אונליין</span>}
                      {selected.price_range && <span>₪{selected.price_range}/שעה</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <BasketButton service={selected} />
                    <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#aaa', padding: 0, lineHeight: 1 }}>✕</button>
                  </div>
                </div>

                {selected.description && (
                  <div style={{ fontSize: 12, color: '#555', lineHeight: 1.55, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {selected.description || selected.bio}
                  </div>
                )}
                {selected.bio && !selected.description && (
                  <div style={{ fontSize: 12, color: '#555', lineHeight: 1.55, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{selected.bio}</div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={selected.type === 'rehab' ? `/service/${selected.id}` : selected.type === 'treatment' ? `/treatment/${selected.id}` : `/practitioner/${selected.id}`}
                    style={{ flex: 1, display: 'block', textAlign: 'center', background: selected.type === 'rehab' ? '#8B00D4' : selected.type === 'treatment' ? '#0891B2' : PRACT_COLOR, color: 'white', borderRadius: 999, padding: '8px 0', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                    לפרטים המלאים ←
                  </a>
                  {selected.type === 'practitioner' && selected.whatsapp_available && selected.phone && (
                    <a href={`https://wa.me/972${(selected.phone || '').replace(/^0/, '').replace(/[-\s]/g, '')}`} target="_blank" rel="noopener noreferrer"
                      style={{ padding: '8px 14px', background: '#25D366', color: 'white', borderRadius: 999, fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>💬</a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <BasketPanel />
      </div>
    </>
  )
}
