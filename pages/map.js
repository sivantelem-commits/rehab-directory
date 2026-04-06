import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import { BasketPanel, BasketButton } from '../components/ServiceBasket'

const REHAB_COLORS = {
  'דיור': '#2E0060', 'תעסוקה': '#6A0099', 'השכלה': '#9B00CC',
  'חברה ופנאי': '#5E35B1', 'ליווי ותמיכה': '#CE66F0',
  'טיפולי שיניים': '#7800BB', 'שירותים נוספים': '#E099F8',
}

const TREATMENT_COLORS = {
  'בתים מאזנים': '#0A3040', 'מחלקות אשפוז': '#1565A8',
  'טיפול יום': '#0891B2', 'מרפאות בריאות נפש': '#0284C7', 'חדרי מיון': '#06B6D4',
  'אשפוז בית': '#0E7490',
  'שירותים נוספים': '#0A6080',
}

const DISTRICTS = ['הכל', 'צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']

const NAV = [['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']]


// ─── פונקציית SVG עוגה ───────────────────────────────────
function buildPieSVG(colors, size) {
  const r = size / 2
  const n = colors.length
  if (n === 1) {
    return '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg"><circle cx="' + r + '" cy="' + r + '" r="' + (r-1) + '" fill="' + colors[0] + '" stroke="white" stroke-width="2"/></svg>'
  }
  const sliceAngle = (2 * Math.PI) / n
  let paths = ''
  for (let i = 0; i < n; i++) {
    const startAngle = i * sliceAngle - Math.PI / 2
    const endAngle = startAngle + sliceAngle
    const x1 = r + (r - 1) * Math.cos(startAngle)
    const y1 = r + (r - 1) * Math.sin(startAngle)
    const x2 = r + (r - 1) * Math.cos(endAngle)
    const y2 = r + (r - 1) * Math.sin(endAngle)
    const large = sliceAngle > Math.PI ? 1 : 0
    paths += '<path d="M' + r + ',' + r + ' L' + x1.toFixed(2) + ',' + y1.toFixed(2) + ' A' + (r-1) + ',' + (r-1) + ' 0 ' + large + ',1 ' + x2.toFixed(2) + ',' + y2.toFixed(2) + ' Z" fill="' + colors[i] + '"/>'
  }
  return '<svg width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg"><circle cx="' + r + '" cy="' + r + '" r="' + (r-1) + '" fill="white"/>' + paths + '<circle cx="' + r + '" cy="' + r + '" r="' + (r-1) + '" fill="none" stroke="white" stroke-width="2"/></svg>'
}

function buildRehabMarkerIcon(L, s, isNational) {
  const allCats = [...new Set([s.category, ...(s.categories || [])])].filter(Boolean).filter(c => REHAB_COLORS[c])
  const colors = allCats.length > 0 ? allCats.map(c => REHAB_COLORS[c]) : ['#888888']
  const size = isNational ? 22 : 16
  const svg = buildPieSVG(colors, size)
  const encoded = encodeURIComponent(svg)
  if (isNational) {
    return L.divIcon({
      html: '<div style="position:relative;width:30px;height:30px"><img src="data:image/svg+xml,' + encoded + '" width="' + size + '" height="' + size + '" style="border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35)"/><div style="position:absolute;top:-6px;right:-6px;font-size:11px;line-height:1">🌍</div></div>',
      className: '', iconSize: [30, 30], iconAnchor: [15, 15],
    })
  }
  return L.divIcon({
    html: '<img src="data:image/svg+xml,' + encoded + '" width="' + size + '" height="' + size + '" style="border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"/>',
    className: '', iconSize: [size, size], iconAnchor: [size/2, size/2],
  })
}

// ─── פיזור סמנים חופפים במעגל ───────────────────────────
function applySpiral(services) {
  const THRESHOLD = 0.0003 // ~30 מטר
  const groups = []

  services.forEach(s => {
    if (!s.lat) return
    const group = groups.find(g =>
      Math.abs(g[0].lat - s.lat) < THRESHOLD &&
      Math.abs(g[0].lng - s.lng) < THRESHOLD
    )
    if (group) group.push(s)
    else groups.push([s])
  })

  const result = []
  groups.forEach(group => {
    if (group.length === 1) {
      result.push({ ...group[0] })
    } else {
      const radius = 0.0005
      group.forEach((s, i) => {
        const angle = (2 * Math.PI / group.length) * i - Math.PI / 2
        result.push({
          ...s,
          lat: s.lat + radius * Math.cos(angle),
          lng: s.lng + radius * Math.sin(angle),
        })
      })
    }
  })
  return result
}

export default function MapPage() {
  const [rehabServices, setRehabServices] = useState([])
  const [treatmentServices, setTreatmentServices] = useState([])
  const [showRehab, setShowRehab] = useState(true)
  const [showTreatment, setShowTreatment] = useState(true)
  const [rehabCategory, setRehabCategory] = useState('הכל')
  const [rehabSubcategory, setRehabSubcategory] = useState('הכל')
  const [treatmentCategory, setTreatmentCategory] = useState('הכל')
  const [district, setDistrict] = useState('הכל')
  const [showNationalOnly, setShowNationalOnly] = useState(false)
  const [showNationalPanel, setShowNationalPanel] = useState(false)
  const [ageGroup, setAgeGroup] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [populations, setPopulations] = useState([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchText, setSearchText] = useState('')
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

    const DISTRICT_CENTERS = {'צפון':[32.89,35.50],'חיפה':[32.81,34.99],'מרכז':[32.08,34.88],'תל אביב':[32.07,34.78],'ירושלים':[31.78,35.22],'דרום':[31.25,34.79],'יהודה ושומרון':[31.95,35.27]}

    if (showRehab) {
      const rehabToPlace = []

      rehabServices.filter(s =>
        (rehabCategory === 'הכל' || s.category === rehabCategory || (s.categories || []).includes(rehabCategory)) &&
        (rehabSubcategory === 'הכל' || s.subcategory === rehabSubcategory) &&
        (district === 'הכל' || s.district === district || (s.districts || []).includes(district)) &&
        (!showNationalOnly || s.is_national) &&
        (!ageGroup || (s.age_groups || []).includes(ageGroup)) &&
        (!diagnosis || (s.diagnoses || []).includes(diagnosis)) &&
        (!populations.length || populations.every(p => (s.populations || []).includes(p))) &&
        (!searchText || [s.name, s.description, s.city, s.category, s.subcategory].some(f => f && f.toLowerCase().includes(searchText.toLowerCase())))
      ).forEach(s => {
        if (s.lat) {
          // שירות עם מיקום - מופיע פעם אחת בדיוק במיקום האמיתי שלו
          // אם הוא איזורי, מסמנים כדי שיקבל 🗺️
          rehabToPlace.push({ ...s, _isRegionalPin: s.is_regional || false })
        } else {
          // שירות ללא מיקום - מופיע במרכז כל מחוז שלו עם 🗺️
          const allDistricts = [...new Set([...(s.districts || []), ...(s.district ? [s.district] : [])])]
          allDistricts.forEach(d => {
            const center = DISTRICT_CENTERS[d]
            if (!center) return
            rehabToPlace.push({ ...s, lat: center[0], lng: center[1], _districtLabel: d, _isRegionalPin: true })
          })
        }
      })

      applySpiral(rehabToPlace).forEach(s => {
        let icon
        if (s._isRegionalPin) {
          const baseIcon = buildRehabMarkerIcon(L, s, s.is_national)
          const baseHtml = baseIcon.options.html
          const size = s.is_national ? 30 : 22
          icon = L.divIcon({
            html: '<div style="position:relative;display:inline-block">' + baseHtml + '<div style="position:absolute;top:-8px;right:-8px;font-size:12px;line-height:1">🗺️</div></div>',
            className: '', iconSize: [size + 8, size + 8], iconAnchor: [(size + 8) / 2, (size + 8) / 2],
          })
        } else {
          icon = buildRehabMarkerIcon(L, s, s.is_national)
        }
        const marker = L.marker([s.lat, s.lng], { icon }).addTo(mapRef.current)
        marker.on('click', () => setSelected({ ...s, type: 'rehab' }))
        markersRef.current.push(marker)
      })
    }

    if (showTreatment) {
      const treatmentToPlace = []

      treatmentServices.filter(s =>
        (treatmentCategory === 'הכל' || s.category === treatmentCategory) &&
        (district === 'הכל' || s.district === district || (s.districts || []).includes(district)) &&
        (!showNationalOnly || s.is_national) &&
        (!ageGroup || (s.age_groups || []).includes(ageGroup)) &&
        (!diagnosis || (s.diagnoses || []).includes(diagnosis)) &&
        (!populations.length || populations.every(p => (s.populations || []).includes(p))) &&
        (!searchText || [s.name, s.description, s.city, s.category, s.subcategory].some(f => f && f.toLowerCase().includes(searchText.toLowerCase())))
      ).forEach(s => {
        if (s.lat) {
          // שירות עם מיקום - מופיע פעם אחת בדיוק במיקום האמיתי שלו
          // אם הוא איזורי, מסמנים כדי שיקבל 🗺️
          treatmentToPlace.push({ ...s, _isRegionalPin: s.is_regional || false })
        } else {
          // שירות ללא מיקום - מופיע במרכז כל מחוז שלו עם 🗺️
          const allDistricts = [...new Set([...(s.districts || []), ...(s.district ? [s.district] : [])])]
          allDistricts.forEach(d => {
            const center = DISTRICT_CENTERS[d]
            if (!center) return
            treatmentToPlace.push({ ...s, lat: center[0], lng: center[1], _districtLabel: d, _isRegionalPin: true })
          })
        }
      })

      applySpiral(treatmentToPlace).forEach(s => {
        const color = TREATMENT_COLORS[s.category] || '#ee7a50'
        const isNational = s.is_national
        let icon
        if (s._isRegionalPin) {
          const svg = buildPieSVG([color], 22)
          const encoded = encodeURIComponent(svg)
          icon = L.divIcon({
            html: '<div style="position:relative;width:32px;height:32px"><img src="data:image/svg+xml,' + encoded + '" width="22" height="22" style="clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);box-shadow:0 2px 8px rgba(0,0,0,0.3)"/><div style="position:absolute;top:-8px;right:-8px;font-size:12px;line-height:1">🗺️</div></div>',
            className: '', iconSize: [32, 32], iconAnchor: [16, 16],
          })
        } else {
          icon = L.divIcon({
            html: isNational
              ? `<div style="position:relative;width:22px;height:22px"><div style="width:20px;height:20px;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);background:white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center"><div style="width:13px;height:13px;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);background:${color}"></div></div><div style="position:absolute;top:-6px;right:-6px;font-size:11px;line-height:1">🌍</div></div>`
              : `<div style="width:18px;height:18px;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);background:white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="width:12px;height:12px;clip-path:polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);background:${color}"></div></div>`,
            className: '',
            iconSize: isNational ? [22, 22] : [18, 18],
            iconAnchor: isNational ? [11, 11] : [9, 9],
          })
        }
        const marker = L.marker([s.lat, s.lng], { icon }).addTo(mapRef.current)
        marker.on('click', () => setSelected({ ...s, type: 'treatment' }))
        markersRef.current.push(marker)
      })
    }
  }, [mounted, rehabServices, treatmentServices, showRehab, showTreatment, rehabCategory, rehabSubcategory, treatmentCategory, district, showNationalOnly, ageGroup, diagnosis, populations, searchText])

  if (!mounted) return null

  const filteredRehabCount = rehabServices.filter(s =>
    (rehabCategory === 'הכל' || s.category === rehabCategory || (s.categories || []).includes(rehabCategory)) &&
    (rehabSubcategory === 'הכל' || s.subcategory === rehabSubcategory) &&
    (district === 'הכל' || s.district === district || (s.districts || []).includes(district)) &&
    (!showNationalOnly || s.is_national) &&
    (!ageGroup || (s.age_groups || []).includes(ageGroup)) &&
    (!diagnosis || (s.diagnoses || []).includes(diagnosis)) &&
    (!populations.length || populations.every(p => (s.populations || []).includes(p))) &&
    (!searchText || [s.name, s.description, s.city, s.category, s.subcategory].some(f => f && f.toLowerCase().includes(searchText.toLowerCase())))
  ).length

  const filteredTreatmentCount = treatmentServices.filter(s =>
    (treatmentCategory === 'הכל' || s.category === treatmentCategory) &&
    (district === 'הכל' || s.district === district || (s.districts || []).includes(district)) &&
    (!showNationalOnly || s.is_national) &&
    (!ageGroup || (s.age_groups || []).includes(ageGroup)) &&
    (!diagnosis || (s.diagnoses || []).includes(diagnosis)) &&
    (!populations.length || populations.every(p => (s.populations || []).includes(p))) &&
    (!searchText || [s.name, s.description, s.city, s.category, s.subcategory].some(f => f && f.toLowerCase().includes(searchText.toLowerCase())))
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

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <a href="#main-content" style={{
            position: 'absolute',
            top: '-40px',
            right: 0,
            background: '#1A3A5C',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '0 0 8px 8px',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
            zIndex: 9999,
            transition: 'top 0.2s'
          }}
          onFocus={e => e.currentTarget.style.top = '0'}
          onBlur={e => e.currentTarget.style.top = '-40px'}
        >דלג לתוכן הראשי</a>

        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="בריאות נפש בישראל" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>מפת שירותים</div>
            </div>
          </div>
          <a href="/calculator" style={{
            background: 'rgba(255,255,200,0.18)', border: '1.5px solid rgba(255,255,150,0.5)',
            color: 'white', borderRadius: '999px', padding: '8px 18px',
            fontWeight: 800, fontSize: 13, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
          }}>🧭 מחשבון מסלול</a>
          <nav aria-label="ניווט ראשי" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
          {/* חיפוש טקסטואלי */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', right: 10, fontSize: 14, color: '#aaa', pointerEvents: 'none' }}>🔍</span>
            <input
              type="text"
              placeholder="חיפוש לפי שם, עיר, תיאור..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{
                padding: '7px 32px 7px 12px', borderRadius: '999px', border: `1.5px solid ${searchText ? '#8B00D4' : '#ddd'}`,
                fontSize: 13, fontFamily: "'Nunito', sans-serif", outline: 'none', width: 200,
                background: searchText ? '#fdf8ff' : 'white', direction: 'rtl',
              }}
            />
            {searchText && (
              <button onClick={() => setSearchText('')} style={{ position: 'absolute', left: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#aaa', padding: 0, lineHeight: 1 }}>✕</button>
            )}
          </div>
          <select id="map-district" value={district} onChange={e => setDistrict(e.target.value)} style={sel}>
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button aria-pressed={showRehab} onClick={() => setShowRehab(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px', border: `2px solid ${showRehab ? '#8B00D4' : '#ddd'}`, background: showRehab ? '#f7f0ff' : 'white', color: showRehab ? '#4C0080' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: showRehab ? '#8B00D4' : '#ddd' }} />
              ♿ שיקום
            </button>
            {showRehab && (
              <>
                <label htmlFor="map-rehab-cat" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>קטגוריית שיקום</label>
                <select id="map-rehab-cat" value={rehabCategory} onChange={e => { setRehabCategory(e.target.value); setRehabSubcategory('הכל') }} style={{ ...sel, borderColor: '#8B00D4' }}>
                  <option value="הכל">כל הקטגוריות</option>
                  {Object.keys(REHAB_COLORS).map(c => <option key={c}>{c}</option>)}
                </select>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button aria-pressed={showTreatment} onClick={() => setShowTreatment(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px', border: `2px solid ${showTreatment ? '#0891B2' : '#ddd'}`, background: showTreatment ? '#f0faff' : 'white', color: showTreatment ? '#0A6080' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
              <div style={{ width: 10, height: 10, background: showTreatment ? '#0891B2' : '#ddd', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
              🏥 טיפול
            </button>
            {showTreatment && (
              <>
                <label htmlFor="map-treatment-cat" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>קטגוריית טיפול</label>
                <select id="map-treatment-cat" value={treatmentCategory} onChange={e => setTreatmentCategory(e.target.value)} style={{ ...sel, borderColor: '#0891B2' }}>
                  <option value="הכל">כל הקטגוריות</option>
                  {Object.keys(TREATMENT_COLORS).map(c => <option key={c}>{c}</option>)}
                </select>
              </>
            )}
          </div>

          <button aria-pressed={showNationalOnly} onClick={() => setShowNationalOnly(v => !v)} style={{
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

          {/* סינון מתקדם */}
          {(() => {
            const activeCount = [ageGroup, diagnosis, ...populations, rehabSubcategory !== 'הכל' ? rehabSubcategory : '', searchText].filter(Boolean).length
            return (
              <button onClick={() => setShowAdvanced(v => !v)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px',
                border: `2px solid ${activeCount > 0 ? '#1A3A5C' : '#ddd'}`,
                background: activeCount > 0 ? '#EEF2FF' : 'white',
                color: activeCount > 0 ? '#1A3A5C' : '#888',
                fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
              }}>
                🎯 סינון מתקדם
                {activeCount > 0 && <span style={{ background: '#1A3A5C', color: 'white', borderRadius: 999, padding: '1px 7px', fontSize: 11 }}>{activeCount}</span>}
                <span style={{ fontSize: 10 }}>{showAdvanced ? '▲' : '▼'}</span>
              </button>
            )
          })()}

          <div style={{ fontSize: 13, color: '#888', marginRight: 'auto', fontWeight: 600 }}>
            {(showRehab ? filteredRehabCount : 0) + (showTreatment ? filteredTreatmentCount : 0)} שירותים
          </div>
        </div>

        {/* שורת פילטרים מתקדמים */}
        {showAdvanced && (
          <div style={{ background: '#f8f9ff', borderBottom: '1px solid #dde', padding: '10px 16px', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>

            {/* תת-קטגוריה לשיקום */}
            {showRehab && rehabCategory !== 'הכל' && (() => {
              const { CATEGORIES: CATS } = require('../lib/categories')
              const subs = CATS[rehabCategory]?.subcategories || []
              if (!subs.length) return null
              return (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9b88bb', marginBottom: 5 }}>תת-קטגוריה (שיקום)</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {['הכל', ...subs].map(s => (
                      <button key={s} onClick={() => setRehabSubcategory(s)} style={{
                        padding: '5px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 600,
                        border: `1.5px solid ${rehabSubcategory === s ? '#8B00D4' : '#d4b0f0'}`,
                        background: rehabSubcategory === s ? '#8B00D4' : 'white',
                        color: rehabSubcategory === s ? 'white' : '#555',
                        cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* קבוצת גיל */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9b88bb', marginBottom: 5 }}>קבוצת גיל</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {['ילדים', 'נוער', 'צעירים', 'מבוגרים', 'קשישים'].map(ag => (
                  <button key={ag} onClick={() => setAgeGroup(ageGroup === ag ? '' : ag)} style={{
                    padding: '5px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 600,
                    border: `1.5px solid ${ageGroup === ag ? '#6B21A8' : '#ddd'}`,
                    background: ageGroup === ag ? '#6B21A8' : 'white',
                    color: ageGroup === ag ? 'white' : '#555',
                    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                  }}>{ag}</button>
                ))}
              </div>
            </div>

            {/* אבחנה */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9b88bb', marginBottom: 5 }}>אבחנה / התמחות</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {['הפרעות אכילה', 'OCD', 'פוסט טראומה', 'פוסט טראומה מורכבת', 'התמכרויות'].map(d => (
                  <button key={d} onClick={() => setDiagnosis(diagnosis === d ? '' : d)} style={{
                    padding: '5px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 600,
                    border: `1.5px solid ${diagnosis === d ? '#0E7490' : '#ddd'}`,
                    background: diagnosis === d ? '#0E7490' : 'white',
                    color: diagnosis === d ? 'white' : '#555',
                    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                  }}>{d}</button>
                ))}
              </div>
            </div>

            {/* אוכלוסייה */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9b88bb', marginBottom: 5 }}>אוכלוסייה ייעודית</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {['נשים', 'דתי/מסורתי', 'חרדי', 'להט"ב'].map(p => (
                  <button key={p} onClick={() => setPopulations(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} style={{
                    padding: '5px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 600,
                    border: `1.5px solid ${populations.includes(p) ? '#5E35B1' : '#ddd'}`,
                    background: populations.includes(p) ? '#5E35B1' : 'white',
                    color: populations.includes(p) ? 'white' : '#555',
                    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                  }}>{p}</button>
                ))}
              </div>
            </div>

            {/* נקה הכל */}
            {[ageGroup, diagnosis, ...populations, rehabSubcategory !== 'הכל' ? rehabSubcategory : '', searchText].some(Boolean) && (
              <button onClick={() => { setAgeGroup(''); setDiagnosis(''); setPopulations([]); setRehabSubcategory('הכל'); setSearchText('') }} style={{
                alignSelf: 'flex-end', fontSize: 12, color: '#888', background: 'none',
                border: '1.5px solid #ddd', borderRadius: '999px', padding: '5px 12px',
                cursor: 'pointer', fontWeight: 600, fontFamily: "'Nunito', sans-serif",
              }}>✕ נקה הכל</button>
            )}
          </div>
        )}

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
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              maxWidth: isMobile ? '100%' : 360,
              margin: isMobile ? '0' : '0 16px 16px auto',
              background: 'white',
              borderRadius: isMobile ? '16px 16px 0 0' : 16,
              padding: '16px',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.18)',
              borderTop: `4px solid ${selected.type === 'rehab' ? (REHAB_COLORS[selected.category] || '#4aab78') : (TREATMENT_COLORS[selected.category] || '#ee7a50')}`,
              zIndex: 1000,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1A3A5C' }}>
                    {selected.name} {selected.is_national && <span title="פריסה ארצית">🌍</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>📍 {selected.city}{selected.district ? `, ${selected.district}` : ''}{selected._districtLabel && <span style={{ marginRight: 6, background: '#EEF2FF', color: '#1A3A5C', borderRadius: 999, padding: '1px 7px', fontSize: 11 }}>🗺️ שירות איזורי - {selected._districtLabel}</span>}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BasketButton service={selected} />
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa', padding: 0 }}>✕</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                {[...new Set([selected.category, ...(selected.categories || [])])].filter(Boolean).map((cat, i) => {
                  const colorMap = selected.type === 'rehab' ? REHAB_COLORS : TREATMENT_COLORS
                  const color = colorMap[cat] || '#888'
                  return <span key={i} style={{ background: color + '22', color, borderRadius: '999px', padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{i === 0 ? (selected.type === 'rehab' ? '♿ ' : '🏥 ') : '+ '}{cat}</span>
                })}
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
      <BasketPanel />
        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '12px', fontSize: 12 }}>
          <a href="/accessibility" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 8px' }}>הצהרת נגישות</a>
          <span style={{ opacity: 0.4 }}>·</span>
          <a href="/legal" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 8px' }}>תנאי שימוש</a>
        </footer>
    </>
  )
}
