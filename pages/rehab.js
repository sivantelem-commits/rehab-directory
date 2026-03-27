import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import ServiceCard from '../components/ServiceCard'
import { CATEGORIES, CATEGORY_NAMES } from '../lib/categories'
import { BasketPanel } from '../components/ServiceBasket'

const DISTRICTS = ['הכל', 'צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון', '🌍 ארצי']
const AGE_GROUPS = ['צעירים', 'מבוגרים', 'קשישים']
const DIAGNOSES = ['הפרעות אכילה', 'OCD', 'פוסט טראומה', 'פוסט טראומה מורכבת', 'התמכרויות']
const POPULATIONS = ['נשים', 'דתי/מסורתי', 'חרדי', 'להט"ב']

const SkeletonCard = () => (
  <div style={{
    background: 'white', borderRadius: 20, padding: '20px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1.5px solid #d4b0f0',
    borderTop: '4px solid #d4b0f0', minHeight: 200,
  }}>
    <style>{`
      @keyframes shimmer {
        0% { background-position: -400px 0 }
        100% { background-position: 400px 0 }
      }
      .skel-r {
        background: linear-gradient(90deg, #ede0f8 25%, #f7f0ff 50%, #ede0f8 75%);
        background-size: 800px 100%;
        animation: shimmer 1.4s infinite;
        border-radius: 8px;
      }
    `}</style>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
      <div className="skel-r" style={{ height: 18, width: '55%' }} />
      <div className="skel-r" style={{ height: 18, width: '28%', borderRadius: 999 }} />
    </div>
    <div className="skel-r" style={{ height: 14, width: '40%', marginBottom: 14 }} />
    <div className="skel-r" style={{ height: 13, width: '100%', marginBottom: 6 }} />
    <div className="skel-r" style={{ height: 13, width: '90%', marginBottom: 6 }} />
    <div className="skel-r" style={{ height: 13, width: '75%', marginBottom: 18 }} />
    <div style={{ display: 'flex', gap: 10 }}>
      <div className="skel-r" style={{ height: 13, width: 80 }} />
      <div className="skel-r" style={{ height: 13, width: 120 }} />
    </div>
  </div>
)

export default function Rehab() {
  const router = useRouter()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('הכל')
  const [category, setCategory] = useState('הכל')
  const [subcategory, setSubcategory] = useState('הכל')
  const [ageGroup, setAgeGroup] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [populations, setPopulations] = useState([])
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showTop, setShowTop] = useState(false)

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
      if (district === '🌍 ארצי') {
        params.set('national', 'true')
      } else if (district !== 'הכל') {
        params.set('district', district)
      }
      if (category !== 'הכל') params.set('category', category)
      if (subcategory !== 'הכל') params.set('subcategory', subcategory)
      if (ageGroup) params.set('age_group', ageGroup)
      if (diagnosis) params.set('diagnosis', diagnosis)
      populations.forEach(p => params.append('population', p))
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/services?${params}`)
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } finally { setLoading(false) }
  }, [district, category, subcategory, ageGroup, diagnosis, populations, debouncedSearch])

  useEffect(() => { fetchServices() }, [fetchServices])

  const subcategories = category !== 'הכל' ? ['הכל', ...CATEGORIES[category].subcategories] : []
  const activeExtraFilters = [ageGroup, diagnosis, ...populations].filter(Boolean).length

  function clearAll() {
    setSearch(''); setDistrict('הכל'); setCategory('הכל'); setSubcategory('הכל')
    setAgeGroup(''); setDiagnosis(''); setPopulations([])
  }

  if (!mounted) return null

  const filterBtn = (label, active, onClick, color = '#8B00D4') => (
    <button key={label} onClick={onClick} aria-pressed={active} style={{
      padding: '6px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 600,
      border: `1.5px solid ${active ? color : '#e0d0f0'}`,
      background: active ? color : 'white',
      color: active ? 'white' : '#555',
      cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
    }}>{label}</button>
  )

  return (
    <>
      <Head>
        <title>שירותי שיקום בקהילה | בריאות נפש בישראל</title>
        <meta name="description" content="מאגר שירותי סל שיקום בקהילה בישראל – דיור מוגן, תעסוקה נתמכת, השכלה וליווי שיקומי לפי אזור. מצאו שירות שיקום מתאים בצפון, מרכז, תל אביב, ירושלים ודרום." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rehabdirectoryil.vercel.app/rehab" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="שירותי שיקום בקהילה | בריאות נפש בישראל" />
        <meta property="og:description" content="מאגר שירותי סל שיקום בקהילה – דיור, תעסוקה, השכלה וליווי לפי אזור בישראל." />
        <meta property="og:url" content="https://rehabdirectoryil.vercel.app/rehab" />
        <meta property="og:image" content="https://rehabdirectoryil.vercel.app/icon-512.png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:image" content="https://rehabdirectoryil.vercel.app/icon-512.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'MedicalWebPage',
          name: 'שירותי שיקום בקהילה',
          url: 'https://rehabdirectoryil.vercel.app/rehab',
          description: 'מאגר שירותי סל שיקום בקהילה – דיור, תעסוקה, השכלה וליווי לפי אזור בישראל.',
          inLanguage: 'he',
          about: { '@type': 'MedicalCondition', name: 'שיקום נפשי' },
          audience: { '@type': 'Patient' },
          isPartOf: { '@type': 'WebSite', name: 'בריאות נפש בישראל', url: 'https://rehabdirectoryil.vercel.app' },
        })}} />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f7f0ff' }}>
        <a href="#main-content" style={{
            position: 'absolute',
            top: '-40px',
            right: 0,
            background: '#2E0060',
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

        <header style={{
          background: 'linear-gradient(135deg, #2E0060, #8B00D4)', color: 'white',
          padding: '10px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(76,0,128,0.2)',
          flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="בריאות נפש בישראל" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>שירותי שיקום בקהילה</div>
            </div>
          </div>
          <a href="/calculator" style={{ background: 'rgba(255,255,200,0.18)', border: '1.5px solid rgba(255,255,150,0.5)', color: 'white', borderRadius: '999px', padding: '8px 18px', fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>🧭 מחשבון מסלול</a>
          <nav aria-label="ניווט ראשי" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']].map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'white',
                background: href === '/rehab' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12,
                border: href === '/rehab' ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.2)',
                textDecoration: 'none', transition: 'background 0.15s',
              }}>{label}</a>
            ))}
          </nav>
        </header>

        {/* Hero + חיפוש */}
        <div style={{ background: 'linear-gradient(160deg, #4C0080, #8B00D4)', color: 'white', padding: '16px 20px', textAlign: 'center' }}>
          <img src='/rehab-logo.png' alt='' role='presentation' style={{ width: 220, height: 220, objectFit: 'contain', marginBottom: -40, filter: 'invert(1) brightness(10)' }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.3px' }}>שירותי שיקום בקהילה בישראל</h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: '0 0 8px', fontWeight: 500 }}>מצאו שירותי שיקום בקהילה לפי אזור וקטגוריה</p>
          <p style={{ fontSize: 13, opacity: 0.75, margin: '0 auto 20px', fontWeight: 400, maxWidth: 520, lineHeight: 1.6 }}>
            מאגר שירותי סל שיקום בקהילה – דיור מוגן, תעסוקה נתמכת, השכלה, חברה ופנאי וליווי שיקומי לאנשים עם מוגבלות נפשית בכל רחבי ישראל. סינון לפי מחוז, קטגוריה, גיל ואבחנה.
          </p>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <label htmlFor="rehab-search" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>חיפוש שירותי שיקום</label>
              <input id="rehab-search" type="text" placeholder="חפשו לפי שם, עיר או תיאור..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '14px 22px', borderRadius: '999px', border: 'none',
                fontSize: 15, outline: 'none', boxSizing: 'border-box',
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontFamily: "'Nunito', sans-serif", fontWeight: 500,
              }}
            />
          </div>
        </div>

        {/* מחוז */}
        <div style={{
          background: 'white', borderBottom: '1px solid #d4b0f0',
          padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        }}>
          {DISTRICTS.map(d => {
            const isNat = d === '🌍 ארצי'
            const active = district === d
            return (
              <button key={d} onClick={() => setDistrict(d)} style={{
                padding: '7px 14px', borderRadius: '999px', fontSize: 13, fontWeight: 600,
                border: `2px solid ${active ? (isNat ? '#1A3A5C' : '#8B00D4') : '#e0d0f0'}`,
                background: active ? (isNat ? '#1A3A5C' : '#8B00D4') : 'white',
                color: active ? 'white' : (isNat ? '#1A3A5C' : '#4C0080'),
                cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
              }}>{d}</button>
            )
          })}
          <div style={{ marginRight: 'auto', fontSize: 13, color: '#9B00CC', fontWeight: 600 }}>
            <span role="status" aria-live="polite" aria-atomic="true">{loading ? 'טוען...' : `${services.length} שירותים`}</span>
          </div>
        </div>

        {/* קטגוריות */}
        <div style={{
          background: 'white', borderBottom: `1px solid ${category !== 'הכל' ? '#d4b0f0' : '#f0e8ff'}`,
          padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        }}>
          {[['הכל', null], ...CATEGORY_NAMES.map(n => [n, CATEGORIES[n]])].map(([name, cat]) => {
            const color = cat ? cat.color : '#8B00D4'
            const active = category === name
            return (
              <button key={name} onClick={() => { setCategory(name); setSubcategory('הכל') }} style={{
                padding: '7px 16px', borderRadius: '999px', fontSize: 13, fontWeight: 700,
                border: `2px solid ${active ? color : '#e0d0f0'}`,
                background: active ? color : 'white',
                color: active ? 'white' : color,
                cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                transition: 'all 0.15s',
                boxShadow: active ? `0 3px 0 ${color}99` : 'none',
              }}>
                {name === 'הכל' ? '🔍 הכל' : name}
              </button>
            )
          })}
        </div>

        {/* תת-קטגוריות */}
        {category !== 'הכל' && subcategories.length > 0 && (
          <div style={{
            background: '#faf5ff', borderBottom: '1px solid #d4b0f0',
            padding: '8px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
          }}>
            {subcategories.map(s => {
              const active = subcategory === s
              const color = CATEGORIES[category]?.color || '#8B00D4'
              return (
                <button key={s} onClick={() => setSubcategory(s)} style={{
                  padding: '5px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 600,
                  border: `1.5px solid ${active ? color : '#d4b0f0'}`,
                  background: active ? `${color}22` : 'white',
                  color: active ? color : '#666',
                  cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
                }}>{s}</button>
              )
            })}
          </div>
        )}

        {/* פילטרים נוספים - גיל / אבחנה / אוכלוסייה */}
        <div style={{ background: '#fdf8ff', borderBottom: '1px solid #ede0f8' }}>
          {/* כפתור פתיחה */}
          <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowMoreFilters(v => !v)}
              style={{
                padding: '6px 16px', borderRadius: '999px', fontSize: 12, fontWeight: 700,
                border: `1.5px solid ${activeExtraFilters > 0 ? '#8B00D4' : '#d4b0f0'}`,
                background: activeExtraFilters > 0 ? '#8B00D4' : 'white',
                color: activeExtraFilters > 0 ? 'white' : '#666',
                cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              🎯 סינון מתקדם
              {activeExtraFilters > 0 && (
                <span style={{
                  background: 'rgba(255,255,255,0.3)', borderRadius: '999px',
                  padding: '1px 7px', fontSize: 11,
                }}>{activeExtraFilters}</span>
              )}
              <span style={{ fontSize: 10 }}>{showMoreFilters ? '▲' : '▼'}</span>
            </button>
            {activeExtraFilters > 0 && (
              <button onClick={() => { setAgeGroup(''); setDiagnosis(''); setPopulations([]) }} style={{
                fontSize: 12, color: '#9B00CC', background: 'none', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontFamily: "'Nunito', sans-serif",
              }}>✕ נקה</button>
            )}
          </div>

          {/* פילטרים מורחבים */}
          {showMoreFilters && (
            <div style={{ padding: '4px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

              {/* גיל */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9b88bb', marginBottom: 6 }}>קבוצת גיל</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {AGE_GROUPS.map(ag => filterBtn(ag, ageGroup === ag, () => setAgeGroup(ageGroup === ag ? '' : ag), '#6B21A8'))}
                </div>
              </div>

              {/* אבחנה */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9b88bb', marginBottom: 6 }}>אבחנה / התמחות</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {DIAGNOSES.map(d => filterBtn(d, diagnosis === d, () => setDiagnosis(diagnosis === d ? '' : d), '#0E7490'))}
                </div>
              </div>

              {/* אוכלוסייה */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9b88bb', marginBottom: 6 }}>אוכלוסייה ייעודית</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {POPULATIONS.map(p => filterBtn(p, populations.includes(p), () => setPopulations(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]), '#5E35B1'))}
                </div>
              </div>

            </div>
          )}
        </div>

        <main id="main-content" style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, alignItems: 'stretch' }}>
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: '#aaa' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#555' }}>לא נמצאו שירותים</div>
              <button onClick={clearAll} style={{
                background: 'linear-gradient(160deg, #8B00D4, #4C0080)', color: 'white', border: 'none',
                borderRadius: '999px', padding: '11px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif", boxShadow: '0 4px 0 #2E0060, 0 8px 20px rgba(76,0,128,0.3)',
              }}>נקה פילטרים</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, alignItems: 'stretch' }}>
              {services.map(s => (
                <div key={s.id} onClick={() => router.push(`/service/${s.id}`)} style={{ cursor: 'pointer', height: '100%' }}>
                  <ServiceCard service={s} />
                </div>
              ))}
            </div>
          )}
        </main>

        {showTop && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              position: 'fixed', bottom: 90, right: 16, width: 48, height: 48, borderRadius: '50%',
              background: 'linear-gradient(160deg, #8B00D4, #4C0080)', color: 'white', border: 'none',
              fontSize: 20, cursor: 'pointer', boxShadow: '0 4px 0 #2E0060, 0 8px 20px rgba(76,0,128,0.3)',
              zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >↑</button>
        )}

        <BasketPanel />

        <footer style={{
          background: 'linear-gradient(135deg, #2E0060, #4C0080)', color: 'rgba(255,255,255,0.75)',
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
