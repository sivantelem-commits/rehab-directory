import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { BasketPanel, BasketButton } from '../components/ServiceBasket'

const DISTRICTS = ['צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']
const AGE_GROUPS = ['ילדים', 'נוער', 'צעירים', 'מבוגרים', 'קשישים']
const DIAGNOSES = ['הפרעות אכילה', 'OCD', 'פוסט טראומה', 'פוסט טראומה מורכבת', 'התמכרויות']
const POPULATIONS = ['נשים', 'דתי/מסורתי', 'חרדי', 'להט"ב']

const CATEGORIES = {
  'בתים מאזנים': { color: '#0A3040' },
  'מחלקות אשפוז': { color: '#0A6080' },
  'מרפאות יום': { color: '#0891B2' },
  'מרפאות בריאות נפש': { color: '#0284C7' },
  'חדרי מיון': { color: '#06B6D4' },
  'אשפוז בית': { color: '#0E7490' },
  'שירותים נוספים': { color: '#0A6080' },
}

const NAV = [['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']]
const COLOR = '#0891B2'

const SkeletonCard = () => (
  <div style={{ background: 'white', borderRadius: 20, padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1.5px solid #a0d8e8', borderTop: '4px solid #a0d8e8', minHeight: 200 }}>
    <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}.skel-t{background:linear-gradient(90deg,#d0eef8 25%,#f0faff 50%,#d0eef8 75%);background-size:800px 100%;animation:shimmer 1.4s infinite;border-radius:8px;}`}</style>
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

export default function Treatment() {
  const router = useRouter()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDistricts, setSelectedDistricts] = useState([])
  const [national, setNational] = useState(false)
  const [category, setCategory] = useState('הכל')
  const [ageGroup, setAgeGroup] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [population, setPopulation] = useState('')
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleScroll = () => setShowTop(window.scrollY > 200)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  function toggleDistrict(d) {
    setNational(false)
    setSelectedDistricts(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  function setNationalMode() { setNational(true); setSelectedDistricts([]) }
  function clearDistricts() { setNational(false); setSelectedDistricts([]) }

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      if (selectedDistricts.length > 1) {
        const results = await Promise.all(
          selectedDistricts.map(d => {
            const p = new URLSearchParams()
            p.set('district', d)
            if (category !== 'הכל') p.set('category', category)
            if (ageGroup) p.set('age_group', ageGroup)
            if (diagnosis) p.set('diagnosis', diagnosis)
            if (population) p.set('population', population)
            if (debouncedSearch) p.set('search', debouncedSearch)
            return fetch(`/api/treatment?${p}`).then(r => r.json())
          })
        )
        const merged = results.flat().filter(s => s?.id)
        const seen = new Set()
        const unique = merged.filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true })
        setServices(unique)
        setLoading(false)
        return
      }
      const params = new URLSearchParams()
      if (national) { params.set('national', 'true') }
      else if (selectedDistricts.length === 1) { params.set('district', selectedDistricts[0]) }
      if (category !== 'הכל') params.set('category', category)
      if (ageGroup) params.set('age_group', ageGroup)
      if (diagnosis) params.set('diagnosis', diagnosis)
      if (population) params.set('population', population)
      if (debouncedSearch) params.set('search', debouncedSearch)
      const res = await fetch(`/api/treatment?${params}`)
      const data = await res.json()
      setServices(Array.isArray(data) ? data : [])
    } finally { setLoading(false) }
  }, [national, selectedDistricts, category, ageGroup, diagnosis, population, debouncedSearch])

  useEffect(() => { fetchServices() }, [fetchServices])

  const activeExtraFilters = [ageGroup, diagnosis, population].filter(Boolean).length

  function clearAll() {
    setSearch(''); clearDistricts(); setCategory('הכל')
    setAgeGroup(''); setDiagnosis(''); setPopulation('')
  }

  const filterBtn = (label, active, onClick) => (
    <button key={label} onClick={onClick} style={{
      padding: '6px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 600,
      border: `1.5px solid ${active ? COLOR : '#c8eaf2'}`,
      background: active ? COLOR : 'white', color: active ? 'white' : '#555',
      cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
    }}>{label}</button>
  )

  if (!mounted) return null

  return (
    <>
      <Head>
        <title>שירותי טיפול פסיכיאטרי | בריאות נפש בישראל</title>
        <meta name="description" content="בתים מאזנים, מחלקות אשפוז פסיכיאטרי, מרפאות יום וחדרי מיון בישראל." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rehabdirectoryil.vercel.app/treatment" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="שירותי טיפול פסיכיאטרי | בריאות נפש בישראל" />
        <meta property="og:description" content="בתים מאזנים, מחלקות אשפוז פסיכיאטרי, מרפאות יום וחדרי מיון בישראל." />
        <meta property="og:url" content="https://rehabdirectoryil.vercel.app/treatment" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f0faff' }}>

        <header style={{ background: 'linear-gradient(135deg, #164E63, #0891B2)', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(22,78,99,0.2)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="לוגו" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>שירותי טיפול</div>
            </div>
          </div>
          <a href="/calculator" style={{ background: 'rgba(255,255,200,0.18)', border: '1.5px solid rgba(255,255,150,0.5)', color: 'white', borderRadius: '999px', padding: '8px 18px', fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>🧭 מחשבון מסלול</a>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: href === '/treatment' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12, border: href === '/treatment' ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(160deg, #164E63, #0891B2)', color: 'white', padding: '16px 20px', textAlign: 'center' }}>
          <img src='/treatment-logo.png' alt='טיפול' style={{ width: 220, height: 220, objectFit: 'contain', marginBottom: -40, filter: 'invert(1) brightness(10)' }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.3px' }}>שירותי טיפול</h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: '0 0 24px', fontWeight: 500 }}>בתים מאזנים, מחלקות אשפוז, מרפאות יום, חדרי מיון ועוד</p>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <input type="text" placeholder="חפשו לפי שם, עיר או תיאור..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '14px 22px', borderRadius: '999px', border: 'none', fontSize: 15, outline: 'none', boxSizing: 'border-box', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontFamily: "'Nunito', sans-serif", fontWeight: 500 }} />
          </div>
        </div>

        {/* מחוז - multi select */}
        <div style={{ background: 'white', borderBottom: '1px solid #a0d8e8', padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={clearDistricts} style={{ padding: '7px 14px', borderRadius: '999px', fontSize: 13, fontWeight: 600, border: `2px solid ${selectedDistricts.length === 0 && !national ? COLOR : '#c8eaf2'}`, background: selectedDistricts.length === 0 && !national ? COLOR : 'white', color: selectedDistricts.length === 0 && !national ? 'white' : '#0A6080', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>הכל</button>

          {DISTRICTS.map(d => {
            const active = selectedDistricts.includes(d)
            return (
              <button key={d} onClick={() => toggleDistrict(d)} style={{ padding: '7px 14px', borderRadius: '999px', fontSize: 13, fontWeight: 600, border: `2px solid ${active ? COLOR : '#c8eaf2'}`, background: active ? COLOR : 'white', color: active ? 'white' : '#0A6080', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>{d}</button>
            )
          })}

          <button onClick={setNationalMode} style={{ padding: '7px 14px', borderRadius: '999px', fontSize: 13, fontWeight: 600, border: `2px solid ${national ? '#1A3A5C' : '#c8eaf2'}`, background: national ? '#1A3A5C' : 'white', color: national ? 'white' : '#1A3A5C', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s' }}>🌍 ארצי</button>

          <div style={{ marginRight: 'auto', fontSize: 13, color: COLOR, fontWeight: 600 }}>
            {loading ? 'טוען...' : `${services.length} שירותים`}
          </div>
        </div>

        {selectedDistricts.length > 1 && (
          <div style={{ background: '#f0faff', borderBottom: '1px solid #a0d8e8', padding: '6px 16px', fontSize: 12, color: COLOR, fontWeight: 600 }}>
            מציג שירותים מ: {selectedDistricts.join(', ')}
            <button onClick={clearDistricts} style={{ marginRight: 8, background: 'none', border: 'none', color: COLOR, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✕ נקה</button>
          </div>
        )}

        {/* קטגוריות */}
        <div style={{ background: 'white', borderBottom: '1px solid #a0d8e8', padding: '10px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[['הכל', COLOR], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.color])].map(([name, color]) => {
            const active = category === name
            return (
              <button key={name} onClick={() => setCategory(name)} style={{ padding: '7px 16px', borderRadius: '999px', fontSize: 13, fontWeight: 700, border: `2px solid ${active ? color : '#c8eaf2'}`, background: active ? color : 'white', color: active ? 'white' : color, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s', boxShadow: active ? `0 3px 0 ${color}99` : 'none' }}>{name}</button>
            )
          })}
        </div>

        {/* סינון מתקדם */}
        <div style={{ background: '#f0faff', borderBottom: '1px solid #c8eaf2' }}>
          <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setShowMoreFilters(v => !v)} style={{ padding: '6px 16px', borderRadius: '999px', fontSize: 12, fontWeight: 700, border: `1.5px solid ${activeExtraFilters > 0 ? COLOR : '#c8eaf2'}`, background: activeExtraFilters > 0 ? COLOR : 'white', color: activeExtraFilters > 0 ? 'white' : '#666', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
              🎯 סינון מתקדם
              {activeExtraFilters > 0 && <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '999px', padding: '1px 7px', fontSize: 11 }}>{activeExtraFilters}</span>}
              <span style={{ fontSize: 10 }}>{showMoreFilters ? '▲' : '▼'}</span>
            </button>
            {activeExtraFilters > 0 && <button onClick={() => { setAgeGroup(''); setDiagnosis(''); setPopulation('') }} style={{ fontSize: 12, color: COLOR, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>✕ נקה</button>}
          </div>
          {showMoreFilters && (
            <div style={{ padding: '4px 16px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b99aa', marginBottom: 6 }}>קבוצת גיל</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{AGE_GROUPS.map(ag => filterBtn(ag, ageGroup === ag, () => setAgeGroup(ageGroup === ag ? '' : ag)))}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b99aa', marginBottom: 6 }}>אבחנה / התמחות</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{DIAGNOSES.map(d => filterBtn(d, diagnosis === d, () => setDiagnosis(diagnosis === d ? '' : d)))}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#6b99aa', marginBottom: 6 }}>אוכלוסייה ייעודית</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{POPULATIONS.map(p => filterBtn(p, population === p, () => setPopulation(population === p ? '' : p)))}</div>
              </div>
            </div>
          )}
        </div>

        <main style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: '#aaa' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#555' }}>לא נמצאו שירותים</div>
              <button onClick={clearAll} style={{ background: 'linear-gradient(160deg, #0891B2, #164E63)', color: 'white', border: 'none', borderRadius: '999px', padding: '11px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>נקה פילטרים</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {services.map(s => {
                const cat = CATEGORIES[s.category] || { color: COLOR }
                return (
                  <div key={s.id} onClick={() => router.push(`/treatment/${s.id}`)}
                    style={{ background: 'white', borderRadius: 20, padding: '20px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', border: '1.5px solid #a0d8e8', borderTop: `4px solid ${cat.color}`, display: 'flex', flexDirection: 'column', minHeight: 200, transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(8,145,178,0.15)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#3a1a0a', flex: 1 }}>{s.name}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <BasketButton service={{ ...s, type: 'treatment' }} />
                          <span style={{ background: cat.color, color: 'white', borderRadius: '999px', padding: '3px 12px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{s.category}</span>
                        </div>
                        {(s.categories || []).filter(c => c && c !== s.category).map(c => (
                          <span key={c} style={{ background: `${COLOR}22`, color: COLOR, borderRadius: '999px', padding: '2px 8px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>+ {c}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: '#aaa', marginBottom: 8, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      📍 {s.city}{s.district ? `, ${s.district}` : ''}
                      {s.is_national && <span style={{ background: '#1A3A5C', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>🌍 ארצי</span>}
                    </div>
                    <div style={{ flex: 1, fontSize: 13.5, color: '#555', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.description}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 13, color: cat.color, flexWrap: 'wrap', marginTop: 12, fontWeight: 600 }}>
                      {s.phone && <span>📞 {s.phone}</span>}
                      {s.email && <span>{s.email}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>

        {showTop && (
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ position: 'fixed', bottom: 24, left: 24, width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(160deg, #0891B2, #164E63)', color: 'white', border: 'none', fontSize: 20, cursor: 'pointer', boxShadow: '0 4px 0 #0A3040, 0 8px 20px rgba(8,145,178,0.3)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >↑</button>
        )}

        <BasketPanel />

        <footer style={{ background: 'linear-gradient(135deg, #0A3040, #164E63)', color: 'rgba(255,255,255,0.75)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48, fontWeight: 500 }}>
          <div style={{ marginBottom: 8 }}>
            <a href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>צור קשר</a>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <a href="/legal" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>תנאי שימוש</a>
          </div>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}
