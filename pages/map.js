import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import { BasketPanel, BasketButton } from '../components/ServiceBasket'
import FilterBottomSheet from '../components/FilterBottomSheet'

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


const PRACTITIONER_COLOR_MAP = '#0F4C75'

const CITY_COORDS = {
  'תל אביב': [32.0853, 34.7818], 'ירושלים': [31.7683, 35.2137], 'חיפה': [32.7940, 34.9896],
  'באר שבע': [31.2530, 34.7915], 'ראשון לציון': [31.9730, 34.7898], 'פתח תקווה': [32.0871, 34.8878],
  'אשדוד': [31.8044, 34.6553], 'נתניה': [32.3215, 34.8532], 'בני ברק': [32.0840, 34.8340],
  'חולון': [32.0114, 34.7800], 'בת ים': [32.0200, 34.7500], 'רמת גן': [32.0700, 34.8200],
  'אשקלון': [31.6689, 34.5742], 'רחובות': [31.8928, 34.8113], 'הרצליה': [32.1664, 34.8438],
  'חדרה': [32.4340, 34.9196], 'מודיעין': [31.8960, 35.0100], 'כפר סבא': [32.1787, 34.9087],
  'לוד': [31.9516, 34.8951], 'רמלה': [31.9285, 34.8730], 'נס ציונה': [31.9301, 34.7993],
  'אילת': [29.5577, 34.9519], 'רעננה': [32.1840, 34.8705], 'גבעתיים': [32.0700, 34.8100],
  'קריית גת': [31.6098, 34.7642], 'נהריה': [33.0068, 35.0979], 'עכו': [32.9230, 35.0767],
  'טבריה': [32.7940, 35.5300], 'צפת': [32.9648, 35.4961], 'קריית שמונה': [33.2075, 35.5700],
  'נצרת': [32.7021, 35.2981], 'אום אל פחם': [32.5154, 35.1525], 'קריית ביאליק': [32.8350, 35.0900],
  'קריית אתא': [32.8091, 35.1068], 'קריית מוצקין': [32.8357, 35.0741], 'יקנעם עלית': [32.6596, 35.1047],
  'זכרון יעקב': [32.5712, 34.9537], 'עפולה': [32.6079, 35.2895], 'בית שאן': [32.4960, 35.4990],
  'דימונה': [31.0671, 35.0314], 'ערד': [31.2589, 35.2119], 'מצפה רמון': [30.6105, 34.8018],
  'שדרות': [31.5244, 34.5966], 'קריית ים': [32.8490, 35.0702], 'טייבה': [32.2680, 35.0030],
  'ראש העין': [32.0961, 34.9557], 'אלעד': [32.0528, 34.9511], 'בית שמש': [31.7435, 34.9875],
  'מעלה אדומים': [31.7760, 35.2972], 'אריאל': [32.1063, 35.1680], 'יבנה': [31.8766, 34.7406],
  'רמת השרון': [32.1461, 34.8378], 'הוד השרון': [32.1512, 34.8879], 'כפר יונה': [32.3138, 34.9362],
  'נוף הגליל': [32.7083, 35.3218], 'שפרעם': [32.8087, 35.1694], 'מגדל העמק': [32.6767, 35.2388],
  'גן יבנה': [31.7886, 34.7063], 'גדרה': [31.8135, 34.7754],
}

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
      const radius = 0.0012
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
  const [practitioners, setPractitioners] = useState([])
  const [mapLoading, setMapLoading] = useState(true)
  const [showRehab, setShowRehab] = useState(true)
  const [showTreatment, setShowTreatment] = useState(true)
  const [showPractitioners, setShowPractitioners] = useState(true)
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
  const [showSheet, setShowSheet] = useState(false)
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
    Promise.all([
      fetch('/api/services').then(r => r.json()).then(data => setRehabServices(Array.isArray(data) ? data : [])),
      fetch('/api/treatment').then(r => r.json()).then(data => setTreatmentServices(Array.isArray(data) ? data : [])),
      fetch('/api/practitioners').then(r => r.json()).then(data => setPractitioners(Array.isArray(data) ? data : [])),
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

    const DISTRICT_CENTERS = {'צפון':[32.89,35.50],'חיפה':[32.81,34.99],'מרכז':[32.08,34.88],'תל אביב':[32.07,34.78],'ירושלים':[31.78,35.22],'דרום':[31.25,34.79],'יהודה ושומרון':[31.95,35.27]}

    // ── בנייה משולבת של כל הסמנים לפני applySpiral ──────────────────
    // חשוב: applySpiral חייבת לרוץ על כל השירותים יחד (שיקום + טיפול)
    // כדי שגם שירות שיקום ושירות טיפול שחולקים אותן קואורדינטות יתפזרו
    const allToPlace = []

    if (showRehab) {
      rehabServices.filter(s =>
        (rehabCategory === 'הכל' || s.category === rehabCategory || (s.categories || []).includes(rehabCategory)) &&
        (rehabSubcategory === 'הכל' || s.subcategory === rehabSubcategory) &&
        (district === 'הכל' || s.is_national || s.district === district || (s.districts || []).includes(district)) &&
        (!showNationalOnly || s.is_national) &&
        (!ageGroup || (s.age_groups || []).includes(ageGroup)) &&
        (!diagnosis || (s.diagnoses || []).includes(diagnosis)) &&
        (!populations.length || populations.every(p => (s.populations || []).includes(p))) &&
        (!searchText || [s.name, s.description, s.city, s.category, s.subcategory, ...(s.categories || [])].some(f => f && f.toLowerCase().includes(searchText.toLowerCase())))
      ).forEach(s => {
        if (s.lat) {
          allToPlace.push({ ...s, _type: 'rehab', _isRegionalPin: s.is_regional || false })
        } else {
          const allDistricts = [...new Set([...(s.districts || []), ...(s.district ? [s.district] : [])])]
          allDistricts.forEach(d => {
            const center = DISTRICT_CENTERS[d]
            if (!center) return
            allToPlace.push({ ...s, _type: 'rehab', lat: center[0], lng: center[1], _districtLabel: d, _isRegionalPin: true })
          })
        }
      })
    }

    if (showTreatment) {
      treatmentServices.filter(s =>
        (treatmentCategory === 'הכל' || s.category === treatmentCategory) &&
        (district === 'הכל' || s.is_national || s.district === district || (s.districts || []).includes(district)) &&
        (!showNationalOnly || s.is_national) &&
        (!ageGroup || (s.age_groups || []).includes(ageGroup)) &&
        (!diagnosis || (s.diagnoses || []).includes(diagnosis)) &&
        (!populations.length || populations.every(p => (s.populations || []).includes(p))) &&
        (!searchText || [s.name, s.description, s.city, s.category, s.subcategory, ...(s.categories || [])].some(f => f && f.toLowerCase().includes(searchText.toLowerCase())))
      ).forEach(s => {
        if (s.lat) {
          allToPlace.push({ ...s, _type: 'treatment', _isRegionalPin: s.is_regional || false })
        } else {
          const allDistricts = [...new Set([...(s.districts || []), ...(s.district ? [s.district] : [])])]
          allDistricts.forEach(d => {
            const center = DISTRICT_CENTERS[d]
            if (!center) return
            allToPlace.push({ ...s, _type: 'treatment', lat: center[0], lng: center[1], _districtLabel: d, _isRegionalPin: true })
          })
        }
      })
    }

    // הפעלת applySpiral על הרשימה המשולבת
    applySpiral(allToPlace).forEach(s => {
      let icon
      if (s._type === 'rehab') {
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
      } else {
        const color = TREATMENT_COLORS[s.category] || '#ee7a50'
        const isNational = s.is_national
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
      }
    })

    // ── מטפלים פרטיים ──
    if (showPractitioners) {
      practitioners
        .filter(p => p.city && CITY_COORDS[p.city])
        .forEach(p => {
          const [lat, lng] = CITY_COORDS[p.city]
          const jLat = lat + (Math.random() - 0.5) * 0.008
          const jLng = lng + (Math.random() - 0.5) * 0.008
          const icon = L.divIcon({
            html: '<div style="width:22px;height:22px;border-radius:50%;background:#0F4C75;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:10px;">🧠</div>',
            className: '', iconSize: [22, 22], iconAnchor: [11, 11],
          })
          const marker = L.marker([jLat, jLng], { icon })
          marker.on('click', () => setSelected({ ...p, type: 'practitioner', lat: jLat, lng: jLng }))
          marker.addTo(mapRef.current)
          markersRef.current.push(marker)
        })
    }
  }, [mounted, rehabServices, treatmentServices, practitioners, showRehab, showTreatment, showPractitioners, rehabCategory, rehabSubcategory, treatmentCategory, district, showNationalOnly, ageGroup, diagnosis, populations, searchText])

  if (!mounted) return null

  const filteredRehabCount = rehabServices.filter(s =>
    (rehabCategory === 'הכל' || s.category === rehabCategory || (s.categories || []).includes(rehabCategory)) &&
    (rehabSubcategory === 'הכל' || s.subcategory === rehabSubcategory) &&
    (district === 'הכל' || s.is_national || s.district === district || (s.districts || []).includes(district)) &&
    (!showNationalOnly || s.is_national) &&
    (!ageGroup || (s.age_groups || []).includes(ageGroup)) &&
    (!diagnosis || (s.diagnoses || []).includes(diagnosis)) &&
    (!populations.length || populations.every(p => (s.populations || []).includes(p))) &&
    (!searchText || [s.name, s.description, s.city, s.category, s.subcategory, ...(s.categories || [])].some(f => f && f.toLowerCase().includes(searchText.toLowerCase())))
  ).length

  const filteredTreatmentCount = treatmentServices.filter(s =>
    (treatmentCategory === 'הכל' || s.category === treatmentCategory) &&
    (district === 'הכל' || s.is_national || s.district === district || (s.districts || []).includes(district)) &&
    (!showNationalOnly || s.is_national) &&
    (!ageGroup || (s.age_groups || []).includes(ageGroup)) &&
    (!diagnosis || (s.diagnoses || []).includes(diagnosis)) &&
    (!populations.length || populations.every(p => (s.populations || []).includes(p))) &&
    (!searchText || [s.name, s.description, s.city, s.category, s.subcategory, ...(s.categories || [])].some(f => f && f.toLowerCase().includes(searchText.toLowerCase())))
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
          <a href="https://links.payboxapp.com/g9hdYBPr71b" target="_blank" rel="noopener noreferrer" style={{
            background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.35)',
            color: 'white', borderRadius: '999px', padding: '8px 18px',
            fontWeight: 700, fontSize: 13, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
          }}>💙 תמכו</a>
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

        {/* ── שורת פילטרים - דסקטופ ── */}
        {!isMobile && (<>
          <div style={{ background: 'white', borderBottom: '1px solid #e0e0e0', padding: '10px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* חיפוש */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', right: 10, fontSize: 14, color: '#aaa', pointerEvents: 'none' }}>🔍</span>
              <input type="text" placeholder="חיפוש לפי שם, עיר, תיאור..." value={searchText} onChange={e => setSearchText(e.target.value)}
                style={{ padding: '7px 32px 7px 12px', borderRadius: '999px', border: `1.5px solid ${searchText ? '#8B00D4' : '#ddd'}`, fontSize: 13, fontFamily: "'Nunito', sans-serif", outline: 'none', width: 200, background: searchText ? '#fdf8ff' : 'white', direction: 'rtl' }} />
              {searchText && <button onClick={() => setSearchText('')} style={{ position: 'absolute', left: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#aaa', padding: 0 }}>✕</button>}
            </div>
            <select id="map-district" value={district} onChange={e => setDistrict(e.target.value)} style={sel}>
              {DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button aria-pressed={showRehab} onClick={() => setShowRehab(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px', border: `2px solid ${showRehab ? '#8B00D4' : '#ddd'}`, background: showRehab ? '#f7f0ff' : 'white', color: showRehab ? '#4C0080' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: showRehab ? '#8B00D4' : '#ddd' }} />♿ שיקום
              </button>
              {showRehab && (
                <select value={rehabCategory} onChange={e => { setRehabCategory(e.target.value); setRehabSubcategory('הכל') }} style={{ ...sel, borderColor: '#8B00D4' }}>
                  <option value="הכל">כל הקטגוריות</option>
                  {Object.keys(REHAB_COLORS).map(c => <option key={c}>{c}</option>)}
                </select>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button aria-pressed={showTreatment} onClick={() => setShowTreatment(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px', border: `2px solid ${showTreatment ? '#0891B2' : '#ddd'}`, background: showTreatment ? '#f0faff' : 'white', color: showTreatment ? '#0A6080' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
                <div style={{ width: 10, height: 10, background: showTreatment ? '#0891B2' : '#ddd', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />🏥 טיפול
              </button>
              {showTreatment && (
                <select value={treatmentCategory} onChange={e => setTreatmentCategory(e.target.value)} style={{ ...sel, borderColor: '#0891B2' }}>
                  <option value="הכל">כל הקטגוריות</option>
                  {Object.keys(TREATMENT_COLORS).map(c => <option key={c}>{c}</option>)}
                </select>
              )}
            </div>
            <button aria-pressed={showNationalOnly} onClick={() => setShowNationalOnly(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px', border: `2px solid ${showNationalOnly ? '#1A3A5C' : '#ddd'}`, background: showNationalOnly ? '#EEF2FF' : 'white', color: showNationalOnly ? '#1A3A5C' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>🌍 ארצי בלבד</button>
            {nationalCount > 0 && (
              <button onClick={() => setShowNationalPanel(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px', border: '2px solid #7B2D8B', background: showNationalPanel ? '#F3E5F5' : 'white', color: '#7B2D8B', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>📋 שירותים ארציים ({nationalCount})</button>
            )}
            {(() => {
              const activeCount = [ageGroup, diagnosis, ...populations, rehabSubcategory !== 'הכל' ? rehabSubcategory : '', searchText].filter(Boolean).length
              return (
                <button onClick={() => setShowAdvanced(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: '999px', border: `2px solid ${activeCount > 0 ? '#1A3A5C' : '#ddd'}`, background: activeCount > 0 ? '#EEF2FF' : 'white', color: activeCount > 0 ? '#1A3A5C' : '#888', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
                  🎯 סינון מתקדם
                  {activeCount > 0 && <span style={{ background: '#1A3A5C', color: 'white', borderRadius: 999, padding: '1px 7px', fontSize: 11 }}>{activeCount}</span>}
                  <span style={{ fontSize: 10 }}>{showAdvanced ? '▲' : '▼'}</span>
                </button>
              )
            })()}
            <div style={{ fontSize: 13, color: '#888', marginRight: 'auto', fontWeight: 600 }}>
              {(showRehab ? filteredRehabCount : 0) + (showTreatment ? filteredTreatmentCount : 0) + (showPractitioners ? practitioners.filter(p => p.city && CITY_COORDS[p.city]).length : 0)} שירותים ומטפלים
            </div>
          </div>
          {showAdvanced && (() => {
            const { CATEGORIES: CATS } = require('../lib/categories')
            return (
              <div style={{ background: '#f8f9ff', borderBottom: '1px solid #dde', padding: '10px 16px', display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {showRehab && rehabCategory !== 'הכל' && (() => {
                  const subs = CATS[rehabCategory]?.subcategories || []
                  if (!subs.length) return null
                  return (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9b88bb', marginBottom: 5 }}>תת-קטגוריה (שיקום)</div>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {['הכל', ...subs].map(s => <button key={s} onClick={() => setRehabSubcategory(s)} style={{ padding: '5px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 600, border: `1.5px solid ${rehabSubcategory === s ? '#8B00D4' : '#d4b0f0'}`, background: rehabSubcategory === s ? '#8B00D4' : 'white', color: rehabSubcategory === s ? 'white' : '#555', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>{s}</button>)}
                      </div>
                    </div>
                  )
                })()}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9b88bb', marginBottom: 5 }}>קבוצת גיל</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {['ילדים', 'נוער', 'צעירים', 'מבוגרים', 'קשישים'].map(ag => <button key={ag} onClick={() => setAgeGroup(ageGroup === ag ? '' : ag)} style={{ padding: '5px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 600, border: `1.5px solid ${ageGroup === ag ? '#6B21A8' : '#ddd'}`, background: ageGroup === ag ? '#6B21A8' : 'white', color: ageGroup === ag ? 'white' : '#555', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>{ag}</button>)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9b88bb', marginBottom: 5 }}>אבחנה / התמחות</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {['הפרעות אכילה', 'OCD', 'פוסט טראומה', 'פוסט טראומה מורכבת', 'התמכרויות'].map(d => <button key={d} onClick={() => setDiagnosis(diagnosis === d ? '' : d)} style={{ padding: '5px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 600, border: `1.5px solid ${diagnosis === d ? '#0E7490' : '#ddd'}`, background: diagnosis === d ? '#0E7490' : 'white', color: diagnosis === d ? 'white' : '#555', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>{d}</button>)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#9b88bb', marginBottom: 5 }}>אוכלוסייה ייעודית</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {['נשים', 'דתי/מסורתי', 'חרדי', 'להט"ב'].map(p => <button key={p} onClick={() => setPopulations(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} style={{ padding: '5px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 600, border: `1.5px solid ${populations.includes(p) ? '#5E35B1' : '#ddd'}`, background: populations.includes(p) ? '#5E35B1' : 'white', color: populations.includes(p) ? 'white' : '#555', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>{p}</button>)}
                  </div>
                </div>
                {[ageGroup, diagnosis, ...populations, rehabSubcategory !== 'הכל' ? rehabSubcategory : '', searchText].some(Boolean) && (
                  <button onClick={() => { setAgeGroup(''); setDiagnosis(''); setPopulations([]); setRehabSubcategory('הכל'); setSearchText('') }} style={{ alignSelf: 'flex-end', fontSize: 12, color: '#888', background: 'none', border: '1.5px solid #ddd', borderRadius: '999px', padding: '5px 12px', cursor: 'pointer', fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>✕ נקה הכל</button>
                )}
              </div>
            )
          })()}
        </>)}

        {/* ── שורת פילטרים - נייד ── */}
        {isMobile && (
          <div style={{ background: 'white', borderBottom: '1px solid #e0e0e0', padding: '8px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* חיפוש */}
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#aaa', pointerEvents: 'none' }}>🔍</span>
              <input type="text" placeholder="חיפוש..." value={searchText} onChange={e => setSearchText(e.target.value)}
                style={{ width: '100%', padding: '8px 30px 8px 10px', borderRadius: '999px', border: `1.5px solid ${searchText ? '#8B00D4' : '#ddd'}`, fontSize: 13, fontFamily: "'Nunito', sans-serif", outline: 'none', boxSizing: 'border-box', direction: 'rtl' }} />
              {searchText && <button onClick={() => setSearchText('')} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#aaa', padding: 0 }}>✕</button>}
            </div>
            {/* אזור */}
            <select value={district} onChange={e => setDistrict(e.target.value)} style={{ ...sel, fontSize: 12, padding: '7px 8px' }}>
              {DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
            {/* כפתור פילטרים */}
            {(() => {
              const activeCount = [ageGroup, diagnosis, ...populations, rehabSubcategory !== 'הכל' ? rehabSubcategory : '', !showRehab ? 'r' : '', !showTreatment ? 't' : '', rehabCategory !== 'הכל' ? rehabCategory : '', treatmentCategory !== 'הכל' ? treatmentCategory : ''].filter(Boolean).length
              return (
                <button onClick={() => setShowSheet(true)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: '999px', border: `2px solid ${activeCount > 0 ? '#1A3A5C' : '#ddd'}`, background: activeCount > 0 ? '#1A3A5C' : 'white', color: activeCount > 0 ? 'white' : '#555', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
                  🎯 פילטרים
                  {activeCount > 0 && <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '999px', padding: '1px 7px', fontSize: 11 }}>{activeCount}</span>}
                </button>
              )
            })()}
            <div style={{ flexShrink: 0, fontSize: 12, color: '#888', fontWeight: 600 }}>
              {(showRehab ? filteredRehabCount : 0) + (showTreatment ? filteredTreatmentCount : 0)}
            </div>
          </div>
        )}

        {/* Bottom Sheet נייד */}
        {(() => {
          const { CATEGORIES: CATS } = require('../lib/categories')
          const activeCount = [ageGroup, diagnosis, ...populations, rehabSubcategory !== 'הכל' ? rehabSubcategory : '', !showRehab ? 'r' : '', !showTreatment ? 't' : '', rehabCategory !== 'הכל' ? rehabCategory : '', treatmentCategory !== 'הכל' ? treatmentCategory : ''].filter(Boolean).length
          return (
            <FilterBottomSheet
              open={showSheet}
              onClose={() => setShowSheet(false)}
              title="פילטרים"
              color="#1A3A5C"
              activeCount={activeCount}
              onClear={() => { setShowRehab(true); setShowTreatment(true); setRehabCategory('הכל'); setRehabSubcategory('הכל'); setTreatmentCategory('הכל'); setAgeGroup(''); setDiagnosis(''); setPopulations([]); setShowNationalOnly(false) }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* הצגה */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1A3A5C', marginBottom: 8 }}>הצגה</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setShowRehab(v => !v)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `2px solid ${showRehab ? '#8B00D4' : '#ddd'}`, background: showRehab ? '#f7f0ff' : 'white', color: showRehab ? '#4C0080' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>♿ שיקום</button>
                    <button onClick={() => setShowTreatment(v => !v)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `2px solid ${showTreatment ? '#0891B2' : '#ddd'}`, background: showTreatment ? '#f0faff' : 'white', color: showTreatment ? '#0A6080' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>🏥 טיפול</button>
                    <button onClick={() => setShowPractitioners(v => !v)} style={{ flex: 1, padding: '10px', borderRadius: 12, border: `2px solid ${showPractitioners ? '#0F4C75' : '#ddd'}`, background: showPractitioners ? '#e0f0ff' : 'white', color: showPractitioners ? '#0F4C75' : '#aaa', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>🧠 מטפלים</button>
                  </div>
                </div>
                {/* קטגוריית שיקום */}
                {showRehab && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#4C0080', marginBottom: 8 }}>קטגוריית שיקום</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['הכל', ...Object.keys(REHAB_COLORS)].map(c => <button key={c} onClick={() => { setRehabCategory(c); setRehabSubcategory('הכל') }} style={{ padding: '6px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 600, border: `1.5px solid ${rehabCategory === c ? '#8B00D4' : '#d4b0f0'}`, background: rehabCategory === c ? '#8B00D4' : 'white', color: rehabCategory === c ? 'white' : '#555', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>{c}</button>)}
                    </div>
                    {rehabCategory !== 'הכל' && (() => {
                      const subs = CATS[rehabCategory]?.subcategories || []
                      if (!subs.length) return null
                      return (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#9b88bb', marginBottom: 6 }}>תת-קטגוריה</div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {['הכל', ...subs].map(s => <button key={s} onClick={() => setRehabSubcategory(s)} style={{ padding: '5px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 600, border: `1.5px solid ${rehabSubcategory === s ? '#8B00D4' : '#d4b0f0'}`, background: rehabSubcategory === s ? '#8B00D4' : 'white', color: rehabSubcategory === s ? 'white' : '#555', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>{s}</button>)}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
                {/* קטגוריית טיפול */}
                {showTreatment && (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0A6080', marginBottom: 8 }}>קטגוריית טיפול</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['הכל', ...Object.keys(TREATMENT_COLORS)].map(c => <button key={c} onClick={() => setTreatmentCategory(c)} style={{ padding: '6px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 600, border: `1.5px solid ${treatmentCategory === c ? '#0891B2' : '#a0d8e8'}`, background: treatmentCategory === c ? '#0891B2' : 'white', color: treatmentCategory === c ? 'white' : '#0A6080', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>{c}</button>)}
                    </div>
                  </div>
                )}
                {/* גיל */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1A3A5C', marginBottom: 8 }}>קבוצת גיל</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['ילדים', 'נוער', 'צעירים', 'מבוגרים', 'קשישים'].map(ag => <button key={ag} onClick={() => setAgeGroup(ageGroup === ag ? '' : ag)} style={{ padding: '7px 14px', borderRadius: '999px', fontSize: 13, fontWeight: 600, border: `1.5px solid ${ageGroup === ag ? '#6B21A8' : '#ddd'}`, background: ageGroup === ag ? '#6B21A8' : 'white', color: ageGroup === ag ? 'white' : '#555', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>{ag}</button>)}
                  </div>
                </div>
                {/* אבחנה */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1A3A5C', marginBottom: 8 }}>אבחנה / התמחות</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['הפרעות אכילה', 'OCD', 'פוסט טראומה', 'פוסט טראומה מורכבת', 'התמכרויות'].map(d => <button key={d} onClick={() => setDiagnosis(diagnosis === d ? '' : d)} style={{ padding: '7px 14px', borderRadius: '999px', fontSize: 13, fontWeight: 600, border: `1.5px solid ${diagnosis === d ? '#0E7490' : '#ddd'}`, background: diagnosis === d ? '#0E7490' : 'white', color: diagnosis === d ? 'white' : '#555', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>{d}</button>)}
                  </div>
                </div>
                {/* אוכלוסייה */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1A3A5C', marginBottom: 8 }}>אוכלוסייה ייעודית</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['נשים', 'דתי/מסורתי', 'חרדי', 'להט"ב'].map(p => <button key={p} onClick={() => setPopulations(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} style={{ padding: '7px 14px', borderRadius: '999px', fontSize: 13, fontWeight: 600, border: `1.5px solid ${populations.includes(p) ? '#5E35B1' : '#ddd'}`, background: populations.includes(p) ? '#5E35B1' : 'white', color: populations.includes(p) ? 'white' : '#555', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>{p}</button>)}
                  </div>
                </div>
                {/* ארצי */}
                <div>
                  <button onClick={() => setShowNationalOnly(v => !v)} style={{ padding: '10px 20px', borderRadius: '999px', border: `2px solid ${showNationalOnly ? '#1A3A5C' : '#ddd'}`, background: showNationalOnly ? '#EEF2FF' : 'white', color: showNationalOnly ? '#1A3A5C' : '#555', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>🌍 ארצי בלבד</button>
                </div>
              </div>
            </FilterBottomSheet>
          )
        })()}

        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div id="main-map" style={{ height: isMobile ? '55vw' : 'calc(100vh - 130px)', minHeight: isMobile ? 260 : undefined, width: '100%' }} />
          {mapLoading && (
            <div style={{
              position: 'absolute', inset: 0, background: '#e8e8e8', zIndex: 500,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <style>{`
                @keyframes map-shimmer {
                  0% { background-position: -600px 0 }
                  100% { background-position: 600px 0 }
                }
                .map-skel {
                  background: linear-gradient(90deg, #ddd 25%, #eee 50%, #ddd 75%);
                  background-size: 1200px 100%;
                  animation: map-shimmer 1.6s infinite;
                  border-radius: 8px;
                }
              `}</style>
              {/* דמוי מפה */}
              <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                <div className="map-skel" style={{ width: '100%', height: '100%' }} />
              </div>
              {/* אינדיקטור טעינה מעל */}
              <div style={{ position: 'relative', zIndex: 1, background: 'white', borderRadius: 12, padding: '14px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 18, height: 18, border: '3px solid #e0e0e0', borderTop: '3px solid #1A3A5C', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1A3A5C', fontFamily: "'Nunito', sans-serif" }}>טוען שירותים...</span>
              </div>
            </div>
          )}

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
              borderTop: `4px solid ${selected.type === 'rehab' ? (REHAB_COLORS[selected.category] || '#4aab78') : selected.type === 'practitioner' ? '#0F4C75' : (TREATMENT_COLORS[selected.category] || '#ee7a50')}`,
              zIndex: 1000,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1A3A5C' }}>
                    {selected.name} {selected.is_national && <span title="פריסה ארצית">🌍</span>}
                  </div>
                  {selected.type === 'practitioner' ? (
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {selected.profession && <span style={{ background: '#0F4C75', color: 'white', borderRadius: 20, padding: '1px 8px', fontWeight: 700, marginLeft: 6 }}>{selected.profession}</span>}
                      📍 {selected.city}
                      {selected.is_online && <span style={{ color: '#0891B2', fontWeight: 700, marginRight: 6 }}> · 🌐 אונליין</span>}
                      {selected.price_range && <span> · ₪{selected.price_range}/שעה</span>}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>📍 {selected.city}{selected.district ? `, ${selected.district}` : ''}{selected._districtLabel && <span style={{ marginRight: 6, background: '#EEF2FF', color: '#1A3A5C', borderRadius: 999, padding: '1px 7px', fontSize: 11 }}>🗺️ שירות איזורי - {selected._districtLabel}</span>}</div>
                  )}
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
              {selected.type === 'practitioner' ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={`/practitioner/${selected.id}`} style={{ flex: 1, display: 'block', textAlign: 'center', background: '#0F4C75', color: 'white', borderRadius: '999px', padding: '8px 0', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>לפרטים המלאים ←</a>
                  {selected.whatsapp_available && selected.phone && (
                    <a href={`https://wa.me/972${selected.phone.replace(/^0/, '').replace(/[-\s]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: '#25D366', color: 'white', borderRadius: '999px', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>💬</a>
                  )}
                </div>
              ) : (
                <a href={`/${selected.type === 'rehab' ? 'service' : 'treatment'}/${selected.id}`}
                  style={{ display: 'block', textAlign: 'center', background: selected.type === 'rehab' ? '#8B00D4' : '#0891B2', color: 'white', borderRadius: '999px', padding: '8px 0', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  לפרטים המלאים ←
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      <BasketPanel />

        {/* ── Legend ── */}
        <div style={{ position: 'fixed', bottom: isMobile ? 80 : 24, left: 16, background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', zIndex: 900, fontSize: 12, fontFamily: "'Nunito',sans-serif", lineHeight: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#8B00D4', display: 'inline-block' }} />שיקום</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#0891B2', display: 'inline-block' }} />טיפול</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 12, height: 12, borderRadius: '50%', background: '#0F4C75', display: 'inline-block', fontSize: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>🧠</span>מטפל/ת פרטי/ת</div>
        </div>

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '12px', fontSize: 12 }}>
          <a href="/accessibility" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 8px' }}>הצהרת נגישות</a>
          <span style={{ opacity: 0.4 }}>·</span>
          <a href="/legal" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', margin: '0 8px' }}>תנאי שימוש</a>
        </footer>
    </>
  )
}
