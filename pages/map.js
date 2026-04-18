import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import { BasketPanel, BasketButton } from '../components/ServiceBasket'

// ─── צבעים ───────────────────────────────────────────────
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

const DISTRICTS = ['הכל', 'צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']

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
  'נצרת':[32.7021,35.2981],'אום אל פחם':[32.5154,35.1525],'קריית ביאליק':[32.8350,35.0900],
  'קריית אתא':[32.8091,35.1068],'קריית מוצקין':[32.8357,35.0741],'יקנעם עלית':[32.6596,35.1047],
  'זכרון יעקב':[32.5712,34.9537],'עפולה':[32.6079,35.2895],'בית שאן':[32.4960,35.4990],
  'דימונה':[31.0671,35.0314],'ערד':[31.2589,35.2119],'שדרות':[31.5244,34.5966],
  'ראש העין':[32.0961,34.9557],'אלעד':[32.0528,34.9511],'בית שמש':[31.7435,34.9875],
  'מעלה אדומים':[31.7760,35.2972],'אריאל':[32.1063,35.1680],'יבנה':[31.8766,34.7406],
  'רמת השרון':[32.1461,34.8378],'הוד השרון':[32.1512,34.8879],'כפר יונה':[32.3138,34.9362],
  'נוף הגליל':[32.7083,35.3218],'שפרעם':[32.8087,35.1694],'מגדל העמק':[32.6767,35.2388],
  'גן יבנה':[31.7886,34.7063],'גדרה':[31.8135,34.7754],'מצפה רמון':[30.6105,34.8018],
}

const NAV = [['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']]

const TABS = [
  { key: 'rehab',        label: 'שיקום',          icon: '♿', color: '#8B00D4', lightBg: '#f7f0ff', textColor: '#4C0080', badgeBg: '#f0e0ff' },
  { key: 'treatment',    label: 'טיפול',           icon: '🏥', color: '#0891B2', lightBg: '#f0faff', textColor: '#0A6080', badgeBg: '#dff4fb' },
  { key: 'practitioner', label: 'מטפלים פרטיים',  icon: '🧠', color: PRACT_COLOR, lightBg: '#e8f2f8', textColor: PRACT_COLOR, badgeBg: '#d8eaf5' },
]

// ─── SVG עוגה לסמני שיקום ────────────────────────────────
function buildPieSVG(colors, size) {
  const r = size / 2
  const n = colors.length
  if (n === 1) {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${r}" cy="${r}" r="${r-1}" fill="${colors[0]}" stroke="white" stroke-width="2"/></svg>`
  }
  const sliceAngle = (2 * Math.PI) / n
  let paths = ''
  for (let i = 0; i < n; i++) {
    const a0 = i * sliceAngle - Math.PI / 2
    const a1 = a0 + sliceAngle
    const x1 = (r + (r-1) * Math.cos(a0)).toFixed(2)
    const y1 = (r + (r-1) * Math.sin(a0)).toFixed(2)
    const x2 = (r + (r-1) * Math.cos(a1)).toFixed(2)
    const y2 = (r + (r-1) * Math.sin(a1)).toFixed(2)
    const large = sliceAngle > Math.PI ? 1 : 0
    paths += `<path d="M${r},${r} L${x1},${y1} A${r-1},${r-1} 0 ${large},1 ${x2},${y2} Z" fill="${colors[i]}"/>`
  }
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${r}" cy="${r}" r="${r-1}" fill="white"/>${paths}<circle cx="${r}" cy="${r}" r="${r-1}" fill="none" stroke="white" stroke-width="2"/></svg>`
}

function buildRehabMarkerIcon(L, s, isNational) {
  const allCats = [...new Set([s.category, ...(s.categories || [])])].filter(Boolean).filter(c => REHAB_COLORS[c])
  const colors = allCats.length > 0 ? allCats.map(c => REHAB_COLORS[c]) : ['#888888']
  const size = isNational ? 22 : 16
  const svg = buildPieSVG(colors, size)
  const encoded = encodeURIComponent(svg)
  if (isNational) {
    return L.divIcon({
      html: `<div style="position:relative;width:30px;height:30px"><img src="data:image/svg+xml,${encoded}" width="${size}" height="${size}" style="border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35)"/><div style="position:absolute;top:-6px;right:-6px;font-size:11px;line-height:1">🌍</div></div>`,
      className: '', iconSize: [30, 30], iconAnchor: [15, 15],
    })
  }
  return L.divIcon({
    html: `<img src="data:image/svg+xml,${encoded}" width="${size}" height="${size}" style="border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"/>`,
    className: '', iconSize: [size, size], iconAnchor: [size/2, size/2],
  })
}

function applySpiral(services) {
  const THRESHOLD = 0.0003
  const groups = []
  services.forEach(s => {
    if (!s.lat) return
    const group = groups.find(g => Math.abs(g[0].lat - s.lat) < THRESHOLD && Math.abs(g[0].lng - s.lng) < THRESHOLD)
    if (group) group.push(s)
    else groups.push([s])
  })
  const result = []
  groups.forEach(group => {
    if (group.length === 1) { result.push({ ...group[0] }); return }
    const radius = 0.0012
    group.forEach((s, i) => {
      const angle = (2 * Math.PI / group.length) * i - Math.PI / 2
      result.push({ ...s, lat: s.lat + radius * Math.cos(angle), lng: s.lng + radius * Math.sin(angle) })
    })
  })
  return result
}

export default function MapPage() {
  const [rehabServices, setRehabServices]         = useState([])
  const [treatmentServices, setTreatmentServices] = useState([])
  const [practitioners, setPractitioners]         = useState([])
  const [mapLoading, setMapLoading]               = useState(true)
  const [mounted, setMounted]                     = useState(false)
  const [isMobile, setIsMobile]                   = useState(false)

  const [showRehab, setShowRehab]                 = useState(true)
  const [showTreatment, setShowTreatment]         = useState(true)
  const [showPractitioners, setShowPractitioners] = useState(true)

  const [searchText, setSearchText]               = useState('')
  const [district, setDistrict]                   = useState('הכל')
  const [cityInput, setCityInput]                 = useState('')
  const [showNationalOnly, setShowNationalOnly]   = useState(false)

  const [rehabCategory, setRehabCategory]         = useState('הכל')
  const [rehabSubcategory, setRehabSubcategory]   = useState('הכל')
  const [treatmentCategory, setTreatmentCategory] = useState('הכל')
  const [practTreatmentType, setPractTreatmentType] = useState('הכל')
  const [ageGroup, setAgeGroup]                   = useState('')
  const [diagnosis, setDiagnosis]                 = useState('')
  const [populations, setPopulations]             = useState([])

  const [activeTab, setActiveTab]                 = useState('rehab')
  const [drawerOpen, setDrawerOpen]               = useState(true)
  const [selected, setSelected]                   = useState(null)

  const mapRef     = useRef(null)
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
    ]).finally(() => setMapLoading(false))
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

    const DISTRICT_CENTERS = {
      'צפון':[32.89,35.50],'חיפה':[32.81,34.99],'מרכז':[32.08,34.88],
      'תל אביב':[32.07,34.78],'ירושלים':[31.78,35.22],'דרום':[31.25,34.79],'יהודה ושומרון':[31.95,35.27]
    }

    const matchesGlobal = s =>
      (district === 'הכל' || s.is_national || s.district === district || (s.districts || []).includes(district)) &&
      (!showNationalOnly || s.is_national) &&
      (!searchText || [s.name, s.description, s.city, s.category, s.subcategory, ...(s.categories || [])].some(f => f?.toLowerCase().includes(searchText.toLowerCase())))

    const matchesRehabFilter = s =>
      (rehabCategory === 'הכל' || s.category === rehabCategory || (s.categories || []).includes(rehabCategory)) &&
      (rehabSubcategory === 'הכל' || s.subcategory === rehabSubcategory) &&
      (!ageGroup || (s.age_groups || []).includes(ageGroup)) &&
      (!diagnosis || (s.diagnoses || []).includes(diagnosis)) &&
      (!populations.length || populations.every(p => (s.populations || []).includes(p)))

    const matchesTreatmentFilter = s =>
      (treatmentCategory === 'הכל' || s.category === treatmentCategory) &&
      (!ageGroup || (s.age_groups || []).includes(ageGroup)) &&
      (!diagnosis || (s.diagnoses || []).includes(diagnosis)) &&
      (!populations.length || populations.every(p => (s.populations || []).includes(p)))

    const matchesPractFilter = p =>
      (practTreatmentType === 'הכל' || (p.treatment_types || []).includes(practTreatmentType)) &&
      (!ageGroup || (p.age_groups || []).includes(ageGroup)) &&
      (!populations.length || populations.every(pop => (p.populations || []).includes(pop)))

    const allToPlace = []

    if (showRehab) {
      rehabServices.filter(s => matchesGlobal(s) && matchesRehabFilter(s)).forEach(s => {
        if (s.lat) {
          allToPlace.push({ ...s, _type: 'rehab', _isRegionalPin: false })
        } else {
          const allDistricts = [...new Set([...(s.districts || []), ...(s.district ? [s.district] : [])])]
          allDistricts.forEach(d => {
            const center = DISTRICT_CENTERS[d]
            if (center) allToPlace.push({ ...s, _type: 'rehab', lat: center[0], lng: center[1], _districtLabel: d, _isRegionalPin: true })
          })
        }
      })
    }

    if (showTreatment) {
      treatmentServices.filter(s => matchesGlobal(s) && matchesTreatmentFilter(s)).forEach(s => {
        if (s.lat) {
          allToPlace.push({ ...s, _type: 'treatment', _isRegionalPin: false })
        } else {
          const allDistricts = [...new Set([...(s.districts || []), ...(s.district ? [s.district] : [])])]
          allDistricts.forEach(d => {
            const center = DISTRICT_CENTERS[d]
            if (center) allToPlace.push({ ...s, _type: 'treatment', lat: center[0], lng: center[1], _districtLabel: d, _isRegionalPin: true })
          })
        }
      })
    }

    applySpiral(allToPlace).forEach(s => {
      let icon
      if (s._type === 'rehab') {
        icon = buildRehabMarkerIcon(L, s, s.is_national)
        if (s._isRegionalPin) {
          const base = icon.options.html
          const sz = s.is_national ? 30 : 22
          icon = L.divIcon({ html: `<div style="position:relative;display:inline-block">${base}<div style="position:absolute;top:-8px;right:-8px;font-size:12px">🗺️</div></div>`, className: '', iconSize: [sz+8,sz+8], iconAnchor: [(sz+8)/2,(sz+8)/2] })
        }
      } else {
        const color = TREATMENT_COLORS[s.category] || '#ee7a50'
        if (s._isRegionalPin) {
          const svg = buildPieSVG([color], 22)
          icon = L.divIcon({
            html: `<div style="position:relative;width:32px;height:32px"><img src="data:image/svg+xml,${encodeURIComponent(svg)}" width="22" height="22" style="clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%)"/><div style="position:absolute;top:-8px;right:-8px;font-size:12px">🗺️</div></div>`,
            className: '', iconSize: [32,32], iconAnchor: [16,16],
          })
        } else {
          icon = L.divIcon({
            html: s.is_national
              ? `<div style="position:relative;width:22px;height:22px"><div style="width:20px;height:20px;clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);background:white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center"><div style="width:13px;height:13px;clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);background:${color}"></div></div><div style="position:absolute;top:-6px;right:-6px;font-size:11px">🌍</div></div>`
              : `<div style="width:18px;height:18px;clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);background:white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><div style="width:12px;height:12px;clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);background:${color}"></div></div>`,
            className: '',
            iconSize: s.is_national ? [22,22] : [18,18],
            iconAnchor: s.is_national ? [11,11] : [9,9],
          })
        }
      }
      const marker = L.marker([s.lat, s.lng], { icon }).addTo(mapRef.current)
      marker.on('click', () => setSelected({ ...s, type: s._type }))
      markersRef.current.push(marker)
    })

    if (showPractitioners) {
      const placed = {}
      practitioners
        .filter(p => p.city && CITY_COORDS[p.city])
        .filter(p => matchesGlobal(p) && matchesPractFilter(p))
        .filter(p => !searchText || [p.name, p.city, p.profession].some(f => f?.toLowerCase().includes(searchText.toLowerCase())))
        .forEach(p => {
          const base = CITY_COORDS[p.city]
          placed[p.city] = (placed[p.city] || 0) + 1
          const n = placed[p.city]
          const angle = (n - 1) * 2.4
          const r = n === 1 ? 0 : 0.004
          const lat = base[0] + r * Math.cos(angle)
          const lng = base[1] + r * Math.sin(angle)
          const icon = L.divIcon({
            html: `<div style="width:14px;height:14px;border-radius:50% 50% 50% 0;background:${PRACT_COLOR};transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
            className: '', iconSize: [14,14], iconAnchor: [7,14],
          })
          const marker = L.marker([lat, lng], { icon })
          marker.on('click', () => setSelected({ ...p, type: 'practitioner', _lat: lat, _lng: lng }))
          marker.addTo(mapRef.current)
          markersRef.current.push(marker)
        })
    }

  }, [mounted, rehabServices, treatmentServices, practitioners,
      showRehab, showTreatment, showPractitioners,
      rehabCategory, rehabSubcategory, treatmentCategory, practTreatmentType,
      district, showNationalOnly, ageGroup, diagnosis, populations, searchText])

  if (!mounted) return null

  // ─── ספירות ─────────────────────────────────────────────
  const filteredRehab = rehabServices.filter(s =>
    (rehabCategory === 'הכל' || s.category === rehabCategory || (s.categories || []).includes(rehabCategory)) &&
    (rehabSubcategory === 'הכל' || s.subcategory === rehabSubcategory) &&
    (district === 'הכל' || s.is_national || s.district === district || (s.districts || []).includes(district)) &&
    (!showNationalOnly || s.is_national) &&
    (!ageGroup || (s.age_groups || []).includes(ageGroup)) &&
    (!searchText || [s.name, s.description, s.city, s.category].some(f => f?.toLowerCase().includes(searchText.toLowerCase())))
  )
  const filteredTreatment = treatmentServices.filter(s =>
    (treatmentCategory === 'הכל' || s.category === treatmentCategory) &&
    (district === 'הכל' || s.is_national || s.district === district || (s.districts || []).includes(district)) &&
    (!showNationalOnly || s.is_national) &&
    (!ageGroup || (s.age_groups || []).includes(ageGroup)) &&
    (!searchText || [s.name, s.description, s.city, s.category].some(f => f?.toLowerCase().includes(searchText.toLowerCase())))
  )
  const filteredPract = practitioners.filter(p =>
    p.city && CITY_COORDS[p.city] &&
    (practTreatmentType === 'הכל' || (p.treatment_types || []).includes(practTreatmentType)) &&
    (!ageGroup || (p.age_groups || []).includes(ageGroup)) &&
    (!searchText || [p.name, p.city, p.profession].some(f => f?.toLowerCase().includes(searchText.toLowerCase())))
  )

  const counts = { rehab: filteredRehab.length, treatment: filteredTreatment.length, practitioner: filteredPract.length }

  const { CATEGORIES: CATS } = require('../lib/categories')
  const { PRACTITIONER_TREATMENT_TYPES } = require('../lib/practitioner-constants')

  const DRAWER_HEIGHT = isMobile ? '55vh' : '240px'

  const chipStyle = (active, color) => ({
    padding: '4px 12px', borderRadius: '999px',
    border: `1.5px solid ${active ? color : '#e0e0e0'}`,
    background: active ? color : 'white',
    color: active ? 'white' : '#555',
    fontSize: 12, fontWeight: 600,
    cursor: 'pointer', whiteSpace: 'nowrap',
    fontFamily: "'Nunito', sans-serif",
    transition: 'all 0.12s',
    flexShrink: 0,
  })

  const layerBtnStyle = (active, color, bg) => ({
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', borderRadius: '999px',
    border: `1.5px solid ${active ? color : '#ddd'}`,
    background: active ? bg : 'white',
    color: active ? color : '#aaa',
    fontWeight: 700, fontSize: 12,
    cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
    whiteSpace: 'nowrap', transition: 'all 0.12s',
  })

  return (
    <>
      <Head>
        <title>מפת שירותים | בריאות נפש בישראל</title>
        <meta name="description" content="מפה אינטראקטיבית של שירותי שיקום וטיפול פסיכיאטרי בישראל – סננו לפי אזור וקטגוריה." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rehabdirectoryil.vercel.app/map" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="מפת שירותים | בריאות נפש בישראל" />
        <meta property="og:description" content="מפה אינטראקטיבית של שירותי שיקום וטיפול פסיכיאטרי בישראל" />
        <meta property="og:url" content="https://rehabdirectoryil.vercel.app/map" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", height: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <a href="#main-content" style={{ position:'absolute', top:'-40px', right:0, background:'#1A3A5C', color:'white', padding:'8px 16px', borderRadius:'0 0 8px 8px', fontWeight:700, fontSize:14, textDecoration:'none', zIndex:9999, transition:'top 0.2s' }}
          onFocus={e => e.currentTarget.style.top='0'} onBlur={e => e.currentTarget.style.top='-40px'}>
          דלג לתוכן הראשי
        </a>

        {/* ── Header ── */}
        <header style={{ background:'#1A3A5C', color:'white', padding: isMobile ? '8px 14px' : '10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 2px 12px rgba(0,0,0,0.15)', flexWrap:'wrap', gap:8, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <img src="/logo.png" alt="בריאות נפש בישראל" style={{ width: isMobile ? 32 : 44, height: isMobile ? 32 : 44, objectFit:'contain', filter:'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight:800, fontSize: isMobile ? 15 : 18 }}>בריאות נפש בישראל</div>
              {!isMobile && <div style={{ fontSize:11, opacity:0.75 }}>מפת שירותים</div>}
            </div>
          </div>
          {isMobile ? (
            <div style={{ display:'flex', gap:8 }}>
              <a href="/calculator" style={{ background:'rgba(255,255,200,0.18)', border:'1.5px solid rgba(255,255,150,0.5)', color:'white', borderRadius:'999px', padding:'6px 12px', fontWeight:700, fontSize:12, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>🧭 מסלול</a>
              <a href="https://links.payboxapp.com/g9hdYBPr71b" target="_blank" rel="noopener noreferrer" style={{ background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.35)', color:'white', borderRadius:'999px', padding:'6px 12px', fontWeight:700, fontSize:12, textDecoration:'none' }}>💙 תמכו</a>
            </div>
          ) : (
            <>
              <a href="/calculator" style={{ background:'rgba(255,255,200,0.18)', border:'1.5px solid rgba(255,255,150,0.5)', color:'white', borderRadius:'999px', padding:'8px 18px', fontWeight:800, fontSize:13, textDecoration:'none', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>🧭 מחשבון מסלול</a>
              <a href="https://links.payboxapp.com/g9hdYBPr71b" target="_blank" rel="noopener noreferrer" style={{ background:'rgba(255,255,255,0.15)', border:'1.5px solid rgba(255,255,255,0.35)', color:'white', borderRadius:'999px', padding:'8px 18px', fontWeight:700, fontSize:13, textDecoration:'none', display:'flex', alignItems:'center', gap:6 }}>💙 תמכו</a>
              <nav aria-label="ניווט ראשי" style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {NAV.map(([href, label]) => (
                  <a key={href} href={href} style={{ color:'white', background: href==='/map' ? 'rgba(255,255,255,0.25)':'rgba(255,255,255,0.12)', borderRadius:'999px', padding:'6px 14px', fontWeight:600, fontSize:12, border: href==='/map' ? '1.5px solid rgba(255,255,255,0.6)':'1.5px solid rgba(255,255,255,0.25)', textDecoration:'none' }}>{label}</a>
                ))}
              </nav>
            </>
          )}
        </header>

        {/* ── Filter bar ── */}
        <div style={{ background:'white', borderBottom:'1px solid #e0e0e0', padding: isMobile ? '7px 12px' : '8px 14px', display:'flex', gap:8, alignItems:'center', flexWrap: isMobile ? 'nowrap' : 'wrap', flexShrink:0 }}>
          <div style={{ position:'relative', flex:1 }}>
            <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#aaa', pointerEvents:'none' }}>🔍</span>
            <input type="text" placeholder="חיפוש..." value={searchText} onChange={e => setSearchText(e.target.value)}
              style={{ padding:'7px 30px 7px 10px', borderRadius:'999px', border:`1.5px solid ${searchText ? '#8B00D4':'#ddd'}`, fontSize:13, fontFamily:"'Nunito', sans-serif", outline:'none', width:'100%', direction:'rtl', background: searchText ? '#fdf8ff':'white', boxSizing:'border-box' }} />
            {searchText && <button onClick={() => setSearchText('')} style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:13, color:'#aaa', padding:0 }}>✕</button>}
          </div>

          {!isMobile && (
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#aaa', pointerEvents:'none' }}>📍</span>
              <input type="text" placeholder="מעוף לעיר..." value={cityInput} onChange={e => setCityInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const match = Object.keys(CITY_COORDS).find(c => c.includes(cityInput))
                    if (match && mapRef.current) { mapRef.current.flyTo(CITY_COORDS[match], 13, { duration:1 }); setCityInput('') }
                  }
                }}
                style={{ padding:'7px 30px 7px 10px', borderRadius:'999px', border:`1.5px solid ${cityInput ? PRACT_COLOR:'#ddd'}`, fontSize:13, fontFamily:"'Nunito', sans-serif", outline:'none', width:150, direction:'rtl' }} />
              {cityInput && Object.keys(CITY_COORDS).filter(c => c.includes(cityInput)).slice(0,5).length > 0 && (
                <div style={{ position:'absolute', top:'100%', right:0, background:'white', borderRadius:8, boxShadow:'0 4px 16px rgba(0,0,0,0.12)', zIndex:600, minWidth:150, marginTop:4 }}>
                  {Object.keys(CITY_COORDS).filter(c => c.includes(cityInput)).slice(0,5).map(city => (
                    <div key={city} onClick={() => { if (mapRef.current) mapRef.current.flyTo(CITY_COORDS[city], 13, { duration:1 }); setCityInput('') }}
                      style={{ padding:'8px 14px', cursor:'pointer', fontSize:13, color:'#1A3A5C', fontWeight:600 }}
                      onMouseEnter={e => e.currentTarget.style.background='#f0f9ff'}
                      onMouseLeave={e => e.currentTarget.style.background='white'}>
                      📍 {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <select value={district} onChange={e => setDistrict(e.target.value)}
            style={{ padding:'7px 10px', borderRadius:'999px', border:'1.5px solid #ddd', fontSize:12, background:'white', cursor:'pointer', outline:'none' }}>
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>

          {!isMobile && (
            <>
              <button onClick={() => setShowRehab(v => !v)} style={layerBtnStyle(showRehab, '#8B00D4', '#f7f0ff')}>
                <span style={{ width:8, height:8, borderRadius:'50%', background: showRehab ? '#8B00D4':'#ccc', display:'inline-block' }}/>♿ שיקום
              </button>
              <button onClick={() => setShowTreatment(v => !v)} style={layerBtnStyle(showTreatment, '#0891B2', '#f0faff')}>
                <span style={{ width:8, height:8, clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)', background: showTreatment ? '#0891B2':'#ccc', display:'inline-block' }}/>🏥 טיפול
              </button>
              <button onClick={() => setShowPractitioners(v => !v)} style={layerBtnStyle(showPractitioners, PRACT_COLOR, '#e8f2f8')}>
                <span style={{ width:8, height:8, borderRadius:'50% 50% 50% 0', transform:'rotate(-45deg)', background: showPractitioners ? PRACT_COLOR:'#ccc', display:'inline-block' }}/>🧠 מטפלים
              </button>
              <button onClick={() => setShowNationalOnly(v => !v)} style={layerBtnStyle(showNationalOnly, '#1A3A5C', '#EEF2FF')}>
                🌍 ארצי בלבד
              </button>
            </>
          )}

          <div style={{ marginRight:'auto', fontSize:12, color:'#888', fontWeight:600 }}>
            {counts.rehab + counts.treatment + counts.practitioner} שירותים
          </div>
        </div>

        {/* ── Main content ── */}
        <div id="main-content" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Map */}
          <div style={{ flex:1, position:'relative', minHeight:0 }}>
            <div id="main-map" style={{ width:'100%', height:'100%' }} />

            {mapLoading && (
              <div style={{ position:'absolute', inset:0, background:'#e8e8e8', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <style>{`@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,#ddd 25%,#eee 50%,#ddd 75%)', backgroundSize:'1200px 100%', animation:'shimmer 1.6s infinite' }} />
                <div style={{ position:'relative', zIndex:1, background:'white', borderRadius:12, padding:'14px 24px', boxShadow:'0 4px 20px rgba(0,0,0,0.12)', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:18, height:18, border:'3px solid #e0e0e0', borderTop:'3px solid #1A3A5C', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  <span style={{ fontSize:14, fontWeight:700, color:'#1A3A5C' }}>טוען שירותים...</span>
                </div>
              </div>
            )}

            {/* Legend */}
            <div style={{ position:'absolute', bottom:12, left:12, background:'rgba(255,255,255,0.95)', borderRadius:10, padding:'7px 11px', boxShadow:'0 2px 10px rgba(0,0,0,0.12)', zIndex:400, fontSize:11, fontFamily:"'Nunito',sans-serif", lineHeight:1.9, direction:'rtl' }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:9, height:9, borderRadius:'50%', background:'#8B00D4', display:'inline-block' }}/>שיקום</div>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:9, height:9, clipPath:'polygon(50% 0%,100% 50%,50% 100%,0% 50%)', background:'#0891B2', display:'inline-block' }}/>טיפול</div>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:9, height:9, borderRadius:'50% 50% 50% 0', transform:'rotate(-45deg)', background:PRACT_COLOR, display:'inline-block' }}/>מטפל/ת</div>
            </div>

            {/* Selected popup */}
            {selected && (
              <div style={{
                position:'absolute', bottom:12, right:12,
                width: isMobile ? 'calc(100% - 24px)' : 290,
                background:'white', borderRadius:14, padding:'14px 16px',
                boxShadow:'0 4px 24px rgba(0,0,0,0.18)',
                borderTop:`4px solid ${selected.type==='rehab' ? (REHAB_COLORS[selected.category]||'#8B00D4') : selected.type==='practitioner' ? PRACT_COLOR : (TREATMENT_COLORS[selected.category]||'#0891B2')}`,
                zIndex:1000,
              }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14, color:'#1A3A5C' }}>{selected.name} {selected.is_national && '🌍'}</div>
                    {selected.type === 'practitioner' ? (
                      <div style={{ fontSize:11, color:'#666', marginTop:3, display:'flex', gap:5, flexWrap:'wrap', alignItems:'center' }}>
                        {selected.profession && <span style={{ background:PRACT_COLOR, color:'white', borderRadius:20, padding:'1px 8px', fontWeight:700 }}>{selected.profession}</span>}
                        {selected.city && <span>📍 {selected.city}</span>}
                        {selected.is_online && <span style={{ color:'#0891B2', fontWeight:700 }}>🌐 אונליין</span>}
                        {selected.price_range && <span>₪{selected.price_range}/שעה</span>}
                      </div>
                    ) : (
                      <div style={{ fontSize:11, color:'#888', marginTop:2 }}>📍 {selected.city}{selected.district ? `, ${selected.district}`:''}</div>
                    )}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <BasketButton service={selected} />
                    <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#aaa', padding:0 }}>✕</button>
                  </div>
                </div>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:10 }}>
                  {[...new Set([selected.category, ...(selected.categories||[])])].filter(Boolean).map((cat, i) => {
                    const colorMap = selected.type==='rehab' ? REHAB_COLORS : TREATMENT_COLORS
                    const color = colorMap[cat] || '#888'
                    return <span key={i} style={{ background:color+'22', color, borderRadius:'999px', padding:'2px 9px', fontSize:11, fontWeight:700 }}>{cat}</span>
                  })}
                </div>
                {selected.description && (
                  <div style={{ fontSize:12, color:'#445', lineHeight:1.5, marginBottom:10, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {selected.description}
                  </div>
                )}
                {selected.type === 'practitioner' ? (
                  <div style={{ display:'flex', gap:8 }}>
                    <a href={`/practitioner/${selected.id}`} style={{ flex:1, display:'block', textAlign:'center', background:PRACT_COLOR, color:'white', borderRadius:'999px', padding:'8px 0', fontWeight:700, fontSize:13, textDecoration:'none' }}>לפרטים ←</a>
                    {selected.whatsapp_available && selected.phone && (
                      <a href={`https://wa.me/972${(selected.phone||'').replace(/^0/,'').replace(/[-\s]/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ padding:'8px 14px', background:'#25D366', color:'white', borderRadius:'999px', fontWeight:700, fontSize:13, textDecoration:'none' }}>💬</a>
                    )}
                  </div>
                ) : (
                  <a href={`/${selected.type==='rehab' ? 'service':'treatment'}/${selected.id}`}
                    style={{ display:'block', textAlign:'center', background: selected.type==='rehab' ? '#8B00D4':'#0891B2', color:'white', borderRadius:'999px', padding:'8px 0', fontWeight:700, fontSize:13, textDecoration:'none' }}>
                    לפרטים ←
                  </a>
                )}
              </div>
            )}
          </div>

          {/* ══════════════ DRAWER ══════════════ */}
          <div style={{
            background: 'white',
            borderTop: '1px solid #e8e8e8',
            boxShadow: '0 -3px 16px rgba(0,0,0,0.07)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            height: drawerOpen ? DRAWER_HEIGHT : '44px',
            transition: 'height 0.25s cubic-bezier(0.32,0.72,0,1)',
            overflow: 'hidden',
            zIndex: 300,
          }}>

            {/* Drag handle */}
            <div onClick={() => setDrawerOpen(v => !v)}
              style={{ display:'flex', justifyContent:'center', alignItems:'center', padding:'6px 0 4px', cursor:'pointer', flexShrink:0 }}>
              <div style={{ width:36, height:4, background:'#ddd', borderRadius:999 }} />
              {!drawerOpen && (
                <span style={{ marginRight:10, fontSize:12, color:'#888', fontWeight:600 }}>
                  ▲ {counts.rehab + counts.treatment + counts.practitioner} תוצאות
                </span>
              )}
            </div>

            {/* Tab headers */}
            <div style={{ display:'flex', borderBottom:'1px solid #f0f0f0', flexShrink:0 }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.key
                return (
                  <button key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setDrawerOpen(true) }}
                    style={{
                      flex:1, padding:'8px 4px',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                      background: isActive ? tab.lightBg : 'white',
                      border:'none',
                      borderBottom:`2.5px solid ${isActive ? tab.color : 'transparent'}`,
                      color: isActive ? tab.color : '#999',
                      fontWeight:700, fontSize: isMobile ? 11 : 13,
                      cursor:'pointer', fontFamily:"'Nunito', sans-serif",
                      transition:'all 0.15s',
                    }}>
                    {tab.icon}
                    {isMobile ? tab.label.split(' ')[0] : tab.label}
                    <span style={{
                      background: isActive ? tab.badgeBg : '#f0f0f0',
                      color: isActive ? tab.textColor : '#bbb',
                      borderRadius:999, padding:'1px 6px', fontSize:10, fontWeight:700,
                    }}>{counts[tab.key]}</span>
                  </button>
                )
              })}
            </div>

            {/* Tab bodies */}
            {TABS.map(tab => {
              if (activeTab !== tab.key) return null

              let chips = [], activeChip = 'הכל', onChipClick = () => {}
              if (tab.key === 'rehab') {
                chips = ['הכל', ...Object.keys(REHAB_COLORS)]
                activeChip = rehabCategory
                onChipClick = c => { setRehabCategory(c); setRehabSubcategory('הכל') }
              } else if (tab.key === 'treatment') {
                chips = ['הכל', ...Object.keys(TREATMENT_COLORS)]
                activeChip = treatmentCategory
                onChipClick = setTreatmentCategory
              } else {
                chips = ['הכל', ...PRACTITIONER_TREATMENT_TYPES]
                activeChip = practTreatmentType
                onChipClick = setPractTreatmentType
              }

              const rehabSubs = tab.key === 'rehab' && rehabCategory !== 'הכל'
                ? (CATS[rehabCategory]?.subcategories || []) : []

              const items = tab.key === 'rehab' ? filteredRehab
                : tab.key === 'treatment' ? filteredTreatment
                : filteredPract

              return (
                <div key={tab.key} style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

                  {/* Category chips */}
                  <div style={{ padding:'7px 14px 0', display:'flex', gap:6, overflowX:'auto', flexShrink:0, scrollbarWidth:'none', msOverflowStyle:'none' }}>
                    {chips.map(c => (
                      <button key={c} onClick={() => onChipClick(c)} style={chipStyle(activeChip === c, tab.color)}>
                        {c}
                      </button>
                    ))}
                  </div>

                  {/* Sub-category chips (שיקום בלבד) */}
                  {rehabSubs.length > 0 && (
                    <div style={{ padding:'5px 14px 0', display:'flex', gap:5, overflowX:'auto', flexShrink:0, scrollbarWidth:'none' }}>
                      {['הכל', ...rehabSubs].map(s => (
                        <button key={s} onClick={() => setRehabSubcategory(s)}
                          style={{ ...chipStyle(rehabSubcategory === s, '#4C0080'), fontSize:11, padding:'3px 9px' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Result cards */}
                  {isMobile ? (
                    <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'7px 12px 12px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      {items.length === 0 ? (
                        <div style={{ gridColumn:'1/-1', fontSize:13, color:'#ccc', padding:'12px 0', textAlign:'center' }}>
                          אין תוצאות לפילטר הנוכחי
                        </div>
                      ) : items.slice(0, 40).map(item => {
                        const isSelected = selected?.id === item.id && selected?.type === tab.key
                        const color = tab.key === 'rehab' ? (REHAB_COLORS[item.category] || tab.color)
                          : tab.key === 'treatment' ? (TREATMENT_COLORS[item.category] || tab.color)
                          : tab.color
                        const coords = tab.key === 'practitioner' && item.city ? CITY_COORDS[item.city]
                          : (item.lat ? [item.lat, item.lng] : null)
                        return (
                          <div key={item.id + tab.key}
                            onClick={() => {
                              setSelected({ ...item, type: tab.key })
                              if (coords && mapRef.current) mapRef.current.flyTo(coords, 14, { duration:0.6 })
                            }}
                            style={{
                              background: isSelected ? tab.lightBg : 'white',
                              border: `1px solid ${isSelected ? tab.color : '#eaeaea'}`,
                              borderTop: `3px solid ${isSelected ? tab.color : color + '66'}`,
                              borderRadius: 10,
                              padding: '9px 10px',
                              cursor: 'pointer',
                            }}>
                            <div style={{ fontWeight:700, fontSize:12, color:'#1A3A5C', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {item.name}{item.is_national ? ' 🌍' : ''}
                            </div>
                            <div style={{ fontSize:11, color:'#888', display:'flex', flexDirection:'column', gap:2 }}>
                              {(item.category || item.profession) && (
                                <span style={{ background: tab.badgeBg, color: tab.textColor, borderRadius:999, padding:'1px 6px', fontSize:10, fontWeight:700, alignSelf:'flex-start' }}>
                                  {item.category || item.profession}
                                </span>
                              )}
                              {item.city && <span>📍 {item.city}</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                  <div style={{ flex:1, overflowX:'auto', overflowY:'hidden', padding:'7px 14px 10px', display:'flex', gap:8, alignItems:'flex-start', scrollbarWidth:'none', msOverflowStyle:'none' }}>
                    {items.length === 0 ? (
                      <div style={{ fontSize:13, color:'#ccc', padding:'8px 0', whiteSpace:'nowrap', alignSelf:'center' }}>
                        אין תוצאות לפילטר הנוכחי
                      </div>
                    ) : items.slice(0, 40).map(item => {
                      const isSelected = selected?.id === item.id && selected?.type === tab.key
                      const color = tab.key === 'rehab' ? (REHAB_COLORS[item.category] || tab.color)
                        : tab.key === 'treatment' ? (TREATMENT_COLORS[item.category] || tab.color)
                        : tab.color
                      const coords = tab.key === 'practitioner' && item.city ? CITY_COORDS[item.city]
                        : (item.lat ? [item.lat, item.lng] : null)

                      return (
                        <div key={item.id + tab.key}
                          onClick={() => {
                            setSelected({ ...item, type: tab.key })
                            if (coords && mapRef.current) mapRef.current.flyTo(coords, 14, { duration:0.6 })
                          }}
                          style={{
                            minWidth: 180, maxWidth: 195,
                            flexShrink: 0,
                            background: isSelected ? tab.lightBg : 'white',
                            border: `1px solid ${isSelected ? tab.color : '#eaeaea'}`,
                            borderTop: `3px solid ${isSelected ? tab.color : color + '55'}`,
                            borderRadius: 10,
                            padding: '9px 11px',
                            cursor: 'pointer',
                            transition: 'all 0.12s',
                          }}
                          onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = tab.color + '88'; e.currentTarget.style.background = tab.lightBg + 'aa' } }}
                          onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#eaeaea'; e.currentTarget.style.background = 'white' } }}
                        >
                          <div style={{ fontWeight:700, fontSize:12, color:'#1A3A5C', marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {item.name}{item.is_national ? ' 🌍' : ''}
                          </div>
                          <div style={{ fontSize:11, color:'#888', display:'flex', gap:4, alignItems:'center', flexWrap:'wrap' }}>
                            {(item.category || item.profession) && (
                              <span style={{ background: tab.badgeBg, color: tab.textColor, borderRadius:999, padding:'1px 6px', fontSize:10, fontWeight:700 }}>
                                {item.category || item.profession}
                              </span>
                            )}
                            {item.city && <span>📍 {item.city}</span>}
                            {item.is_online && <span style={{ color:'#0891B2' }}>🌐</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <footer style={{ background:'#1A3A5C', color:'rgba(255,255,255,0.7)', textAlign:'center', padding:'10px', fontSize:12, flexShrink:0 }}>
          <a href="/accessibility" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none', margin:'0 8px' }}>הצהרת נגישות</a>
          <span style={{ opacity:0.4 }}>·</span>
          <a href="/legal" style={{ color:'rgba(255,255,255,0.7)', textDecoration:'none', margin:'0 8px' }}>תנאי שימוש</a>
        </footer>
      </div>
      <BasketPanel />
    </>
  )
}
