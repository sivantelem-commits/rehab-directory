import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { BasketButton, BasketPanel } from '../components/ServiceBasket'
import ServiceDetailModal from '../components/ServiceDetailModal'
import FilterBottomSheet from '../components/FilterBottomSheet'

const CATEGORIES = {
  'בתים מאזנים': { color: '#0A3040', icon: '🏠' },
  'מחלקות אשפוז': { color: '#1565A8', icon: '🏥' },
  'טיפול יום': { color: '#0891B2', icon: '☀️' },
  'מרפאות בריאות נפש': { color: '#0284C7', icon: '🏨' },
  'חדרי מיון': { color: '#06B6D4', icon: '🚨' },
  'שירותים נוספים': { color: '#0A6080', icon: '➕' },
}
const CATEGORY_NAMES = Object.keys(CATEGORIES)
const DISTRICTS = ['הכל', 'צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון', 'ארצי']
const AGE_GROUPS = ['ילדים', 'נוער', 'צעירים', 'מבוגרים', 'קשישים']
const DIAGNOSES = ['הפרעות אכילה', 'OCD', 'פוסט טראומה', 'פוסט טראומה מורכבת', 'התמכרויות']
const POPULATIONS = ['נשים', 'דתי/מסורתי', 'חרדי', 'להט"ב']
const BASE_URL = 'https://rehabdirectoryil.vercel.app'
const NAV = [['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']]

const SkeletonCard = () => (
  <div style={{
    background: 'white', borderRadius: 20, padding: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1.5px solid #a0d8e8',
    borderTop: '4px solid #a0d8e8', minHeight: 200,
  }}>
    <style>{`
      @keyframes shimmer {
        0% { background-position: -400px 0 }
        100% { background-position: 400px 0 }
      }
      .skel-t {
        background: linear-gradient(90deg, #d0edf8 25%, #e8f6fb 50%, #d0edf8 75%);
        background-size: 800px 100%;
        animation: shimmer 1.4s infinite;
        border-radius: 8px;
      }
    `}</style>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
      <div className="skel-t" style={{ height: 18, width: '55%' }} />
      <div className="skel-t" style={{ height: 18, width: '28%', borderRadius: 999 }} />
    </div>
    <div className="skel-t" style={{ height: 14, width: '40%', marginBottom: 14 }} />
    <div className="skel-t" style={{ height: 13, width: '100%', marginBottom: 6 }} />
    <div className="skel-t" style={{ height: 13, width: '90%', marginBottom: 6 }} />
    <div className="skel-t" style={{ height: 13, width: '75%', marginBottom: 18 }} />
    <div style={{ display: 'flex', gap: 10 }}>
      <div className="skel-t" style={{ height: 13, width: 80 }} />
      <div className="skel-t" style={{ height: 13, width: 120 }} />
    </div>
  </div>
)

function TreatmentCard({ service }) {
  const cat = CATEGORIES[service.category] || { color: '#0891B2', icon: '🏥' }
  const extraCats = (service.categories || []).filter(c => c && c !== service.category)
  const serviceWithType = { ...service, type: 'treatment' }
  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: '20px',
      boxShadow: '0 4px 16px rgba(8,145,178,0.08)',
      border: '1.5px solid #a0d8e8',
      borderTop: `4px solid ${cat.color}`,
      cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
      height: '100%', boxSizing: 'border-box',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(8,145,178,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(8,145,178,0.08)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#1A3A5C', lineHeight: 1.3 }}>{service.name}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <BasketButton service={serviceWithType} />
            <span style={{ background: cat.color, color: 'white', borderRadius: '999px', padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
              {service.category}
            </span>
          </div>
          {service.subcategory && service.subcategory !== service.category && (
            <span style={{ background: `${cat.color}22`, color: cat.color, borderRadius: '999px', padding: '2px 8px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
              {service.subcategory}
            </span>
          )}
          {extraCats.slice(0, 2).map(c => {
            const ec = CATEGORIES[c] || { color: '#0891B2' }
            return (
              <span key={c} style={{ background: `${ec.color}22`, color: ec.color, borderRadius: '999px', padding: '2px 8px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
                + {c}
              </span>
            )
          })}
        </div>
      </div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        {service.city}{service.district ? `, ${service.district}` : ''}
        {service.is_national && <span style={{ marginRight: 8, background: '#EEF2FF', color: '#1A3A5C', borderRadius: '999px', padding: '2px 8px', fontSize: 11 }}>ארצי</span>}
      </div>
      {service.description && (
        <div style={{ fontSize: 13.5, color: '#445', lineHeight: 1.55, marginBottom: 12,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {service.description}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
        {service.phone && <span style={{ fontSize: 13, color: cat.color }}>{ service.phone}</span>}
        {service.website && <span style={{ fontSize: 13, color: cat.color }}>אתר</span>}
      </div>
    </div>
  )
}

export default function TreatmentList() {
  const router = useRouter()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('הכל')
  const [category, setCategory] = useState('הכל')
  const [ageGroups, setAgeGroups] = useState([])
  const [diagnoses, setDiagnoses] = useState([])
  const [populations, setPopulations] = useState([])
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [modalService, setModalService] = useState(null)
  const [showSheet, setShowSheet] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    setMounted(true)
    if (router.isReady) {
      if (router.query.district) setDistrict(router.query.district)
      if (router.query.category) setCategory(router.query.category)
    }
  }, [router.isReady, router.query])

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
      if (district === 'ארצי') {
        params.set('national', 'true')
      } else if (district !== 'הכל') {
        params.set('district', district)
      }
      if (category !== 'הכל') params.set('category', category)
      if (ageGroups.length) ageGroups.forEach(ag => params.append('age_group', ag))
      if (diagnoses.length) diagnoses.forEach(d => params.append('diagnosis', d))
      populations.forEach(p => params.append('population', p))
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/treatment?${params}`)
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } finally { setLoading(false) }
  }, [district, category, ageGroups, diagnoses, populations, debouncedSearch])

  useEffect(() => { fetchServices() }, [fetchServices])

  const activeExtraFilters = [...ageGroups, ...diagnoses, ...populations].filter(Boolean).length

  function clearAll() {
    setSearch(''); setDistrict('הכל'); setCategory('הכל')
    setAgeGroups([]); setDiagnoses([]); setPopulations([])
  }

  if (!mounted) return null

  const filterBtn = (label, active, onClick, color = '#0891B2') => (
    <button key={label} onClick={onClick} style={{
      padding: '6px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 600,
      border: `1.5px solid ${active ? color : '#a0d8e8'}`,
      background: active ? color : 'white',
      color: active ? 'white' : '#555',
      cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
    }}>{label}</button>
  )

  return (
    <>
      <Head>
        <title>שירותי טיפול בבריאות הנפש | בריאות נפש בישראל</title>
        <meta name="description" content="מאגר שירותי טיפול בבריאות הנפש בישראל – בתים מאזנים, מחלקות אשפוז, טיפול יום ומרפאות פסיכיאטריות לפי אזור. מצאו שירות טיפולי מתאים בצפון, מרכז, תל אביב, ירושלים ודרום." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${BASE_URL}/treatment`} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="שירותי טיפול בבריאות הנפש | בריאות נפש בישראל" />
        <meta property="og:description" content="מאגר שירותי טיפול בבריאות הנפש – בתים מאזנים, מחלקות אשפוז, טיפול יום ומרפאות לפי אזור בישראל." />
        <meta property="og:url" content={`${BASE_URL}/treatment`} />
        <meta property="og:image" content={`${BASE_URL}/icon-512.png`} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content={`${BASE_URL}/icon-512.png`} />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f0faff' }}>
        <a href="#main-content" style={{
          position: 'absolute', top: '-40px', right: 0,
          background: '#0A3040', color: 'white', padding: '8px 16px',
          borderRadius: '0 0 8px 8px', fontWeight: 700, fontSize: 14,
          textDecoration: 'none', zIndex: 9999, transition: 'top 0.2s'
        }}
          onFocus={e => e.currentTarget.style.top = '0'}
          onBlur={e => e.currentTarget.style.top = '-40px'}
        >דלג לתוכן הראשי</a>

        <header style={{
          background: 'linear-gradient(135deg, #164E63, #0891B2)', color: 'white',
          padding: '10px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(22,78,99,0.2)',
          flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="בריאות נפש בישראל" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>שירותי טיפול</div>
            </div>
          </div>
          <a href="/calculator" style={{ background: 'rgba(255,255,200,0.18)', border: '1.5px solid rgba(255,255,150,0.5)', color: 'white', borderRadius: '999px', padding: '8px 18px', fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>🧭 מחשבון מסלול</a>
          <nav aria-label="ניווט ראשי" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'white',
                background: href === '/treatment' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12,
                border: href === '/treatment' ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.2)',
                textDecoration: 'none',
              }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(160deg, #164E63, #0891B2)', color: 'white', padding: '24px 20px', textAlign: 'center' }}>
          <img src='/treatment-logo.png' alt='' role='presentation' style={{ width: 180, height: 180, objectFit: 'contain', marginBottom: -30, filter: 'invert(1) brightness(10)' }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.3px' }}>שירותי טיפול בבריאות הנפש בישראל</h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: '0 0 8px', fontWeight: 500 }}>מצאו שירותי טיפול בבריאות הנפש לפי אזור וקטגוריה</p>
          <p style={{ fontSize: 13, opacity: 0.75, margin: '0 auto 20px', fontWeight: 400, maxWidth: 520, lineHeight: 1.6, textAlign: 'center' }}>
            מאגר שירותי טיפול בבריאות הנפש – בתים מאזנים, מחלקות אשפוז, טיפול יום, מרפאות בריאות נפש וחדרי מיון פסיכיאטריים בכל רחבי ישראל. סינון לפי מחוז, קטגוריה, גיל ואבחנה.
          </p>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <label htmlFor="treatment-search" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>חיפוש שירותי טיפול</label>
            <input id="treatment-search" type="text" placeholder="חפשו לפי שם, עיר או תיאור..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '14px 22px', borderRadius: '999px', border: 'none',
                fontSize: 15, outline: 'none', boxSizing: 'border-box',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontFamily: "'Nunito', sans-serif", fontWeight: 500,
              }}
            />
          </div>
        </div>

        {/* ── פילטרים - דסקטופ ── */}
        {!isMobile && (<>
          <div style={{ background: 'white', borderBottom: '1px solid #a0d8e8', padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {DISTRICTS.map(d => {
              const isNat = d === 'ארצי'
              const active = district === d
              return (
                <button key={d} onClick={() => setDistrict(d)} style={{ padding: '7px 14px', borderRadius: '999px', fontSize: 13, fontWeight: 600, border: `2px solid ${active ? (isNat ? '#1A3A5C' : '#0891B2') : '#a0d8e8'}`, background: active ? (isNat ? '#1A3A5C' : '#0891B2') : 'white', color: active ? 'white' : (isNat ? '#1A3A5C' : '#0A6080'), cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>{d}</button>
              )
            })}
            <div style={{ marginRight: 'auto', fontSize: 13, color: '#0891B2', fontWeight: 600 }}>
              <span role="status" aria-live="polite">{loading ? 'טוען...' : `${services.length} שירותים`}</span>
            </div>
          </div>
          <div style={{ background: 'white', borderBottom: '1px solid #d0edf8', padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {[['הכל', null], ...CATEGORY_NAMES.map(n => [n, CATEGORIES[n]])].map(([name, cat]) => {
              const color = cat ? cat.color : '#0891B2'
              const active = category === name
              return (
                <button key={name} onClick={() => setCategory(name)} style={{ padding: '7px 16px', borderRadius: '999px', fontSize: 13, fontWeight: 700, border: `2px solid ${active ? color : '#a0d8e8'}`, background: active ? color : 'white', color: active ? 'white' : color, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s', boxShadow: active ? `0 3px 0 ${color}99` : 'none' }}>{name}</button>
              )
            })}
          </div>
          <div style={{ background: '#f0faff', borderBottom: '1px solid #d0edf8' }}>
            <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setShowMoreFilters(v => !v)} style={{ padding: '6px 16px', borderRadius: '999px', fontSize: 12, fontWeight: 700, border: `1.5px solid ${activeExtraFilters > 0 ? '#0891B2' : '#a0d8e8'}`, background: activeExtraFilters > 0 ? '#0891B2' : 'white', color: activeExtraFilters > 0 ? 'white' : '#666', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                🎯 סינון מתקדם
                {activeExtraFilters > 0 && <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '999px', padding: '1px 7px', fontSize: 11 }}>{activeExtraFilters}</span>}
                <span style={{ fontSize: 10 }}>{showMoreFilters ? '▲' : '▼'}</span>
              </button>
              {activeExtraFilters > 0 && <button onClick={() => { setAgeGroups([]); setDiagnoses([]); setPopulations([]) }} style={{ fontSize: 12, color: '#0891B2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>נקה</button>}
            </div>
            {showMoreFilters && (
              <div style={{ padding: '4px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6899bb', marginBottom: 6 }}>קבוצת גיל</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{AGE_GROUPS.map(ag => filterBtn(ag, ageGroups.includes(ag), () => setAgeGroups(prev => prev.includes(ag) ? prev.filter(x => x !== ag) : [...prev, ag]), '#0284C7'))}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6899bb', marginBottom: 6 }}>אבחנה / התמחות</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{DIAGNOSES.map(d => filterBtn(d, diagnoses.includes(d), () => setDiagnoses(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]), '#0E7490'))}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6899bb', marginBottom: 6 }}>אוכלוסייה ייעודית</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{POPULATIONS.map(p => filterBtn(p, populations.includes(p), () => setPopulations(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]), '#1565A8'))}</div>
                </div>
              </div>
            )}
          </div>
        </>)}

        {/* ── פילטרים - נייד ── */}
        {isMobile && (
          <div style={{ background: 'white', borderBottom: '1px solid #a0d8e8', padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* כפתור פילטרים — קבוע בצד ימין */}
            <button onClick={() => setShowSheet(true)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: '999px', border: `2px solid ${activeExtraFilters > 0 || category !== 'הכל' ? '#0891B2' : '#a0d8e8'}`, background: activeExtraFilters > 0 || category !== 'הכל' ? '#0891B2' : 'white', color: activeExtraFilters > 0 || category !== 'הכל' ? 'white' : '#0A6080', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
              🎯 פילטרים
              {(activeExtraFilters > 0 || category !== 'הכל') && (
                <span style={{ background: 'rgba(255,255,255,0.35)', borderRadius: '999px', padding: '1px 7px', fontSize: 11 }}>{[category !== 'הכל' ? 1 : 0, activeExtraFilters].reduce((a, b) => a + b, 0)}</span>
              )}
            </button>
            {/* אזורים — גלילה שמאלה */}
            <div style={{ display: 'flex', gap: 6, flex: 1, overflowX: 'auto', paddingBottom: 2, direction: 'ltr' }}>
              {[...DISTRICTS].reverse().map(d => {
                const isNat = d === 'ארצי'
                const active = district === d
                return (
                  <button key={d} onClick={() => setDistrict(d)} style={{ flexShrink: 0, padding: '6px 12px', borderRadius: '999px', fontSize: 12, fontWeight: 600, border: `2px solid ${active ? (isNat ? '#1A3A5C' : '#0891B2') : '#a0d8e8'}`, background: active ? (isNat ? '#1A3A5C' : '#0891B2') : 'white', color: active ? 'white' : '#0A6080', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>{d}</button>
                )
              })}
            </div>
            <div style={{ flexShrink: 0, fontSize: 12, color: '#0891B2', fontWeight: 600 }}>{loading ? '...' : `${services.length}`}</div>
          </div>
        )}

        <FilterBottomSheet
          open={showSheet}
          onClose={() => setShowSheet(false)}
          title="סינון שירותי טיפול"
          color="#0891B2"
          activeCount={[category !== 'הכל' ? 1 : 0, activeExtraFilters].reduce((a, b) => a + b, 0)}
          onClear={() => { setCategory('הכל'); setAgeGroups([]); setDiagnoses([]); setPopulations([]) }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0A6080', marginBottom: 8 }}>קטגוריה</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[['הכל', null], ...CATEGORY_NAMES.map(n => [n, CATEGORIES[n]])].map(([name, cat]) => {
                  const color = cat ? cat.color : '#0891B2'
                  const active = category === name
                  return <button key={name} onClick={() => setCategory(name)} style={{ padding: '7px 14px', borderRadius: '999px', fontSize: 13, fontWeight: 700, border: `2px solid ${active ? color : '#a0d8e8'}`, background: active ? color : 'white', color: active ? 'white' : color, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>{name}</button>
                })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0A6080', marginBottom: 8 }}>קבוצת גיל</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{AGE_GROUPS.map(ag => filterBtn(ag, ageGroups.includes(ag), () => setAgeGroups(prev => prev.includes(ag) ? prev.filter(x => x !== ag) : [...prev, ag]), '#0284C7'))}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0A6080', marginBottom: 8 }}>אבחנה / התמחות</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{DIAGNOSES.map(d => filterBtn(d, diagnoses.includes(d), () => setDiagnoses(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]), '#0E7490'))}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0A6080', marginBottom: 8 }}>אוכלוסייה ייעודית</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{POPULATIONS.map(p => filterBtn(p, populations.includes(p), () => setPopulations(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]), '#1565A8'))}</div>
            </div>
          </div>
        </FilterBottomSheet>

        <main id="main-content" style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: '#aaa' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}></div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#555' }}>לא נמצאו שירותים</div>
              <button onClick={clearAll} style={{ background: 'linear-gradient(160deg, #0891B2, #164E63)', color: 'white', border: 'none', borderRadius: '999px', padding: '11px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", boxShadow: '0 4px 0 #0A3040' }}>נקה פילטרים</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, alignItems: 'stretch' }}>
              {services.map(s => (
                <div key={s.id} onClick={() => setModalService(s)} style={{ height: '100%', cursor: 'pointer' }}>
                  <TreatmentCard service={s} />
                </div>
              ))}
            </div>
          )}
        </main>

        {showTop && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              position: 'fixed', bottom: 24, right: 16, width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(160deg, #0891B2, #164E63)', color: 'white', border: 'none',
              fontSize: 20, cursor: 'pointer', boxShadow: '0 4px 0 #0A3040, 0 8px 20px rgba(8,145,178,0.3)',
              zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >↑</button>
        )}

        <BasketPanel />
        {modalService && (
          <ServiceDetailModal
            service={modalService}
            type="treatment"
            onClose={() => setModalService(null)}
          />
        )}

        <footer style={{
          background: 'linear-gradient(135deg, #0A3040, #164E63)', color: 'rgba(255,255,255,0.75)',
          textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48, fontWeight: 500,
        }}>
          <div style={{ marginBottom: 8 }}>
            <a href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>צור קשר</a>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <a href="/legal" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>תנאי שימוש</a>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <a href="/accessibility" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>הצהרת נגישות</a>
          </div>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}
