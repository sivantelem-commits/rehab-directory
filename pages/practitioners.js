// pages/practitioners.js
import { useState, useEffect } from 'react'
import Head from 'next/head'
import {
  PRACTITIONER_TREATMENT_TYPES,
  PRACTITIONER_SPECIALIZATIONS,
  HEALTH_FUNDS,
  DISTRICTS,
  PRACTITIONER_COLOR as COLOR,
  PRACTITIONER_DARK  as DARK,
} from '../lib/practitioner-constants'

const NAV = [
  ['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'],
  ['/map', 'מפה'], ['/register', 'הוספת שירות'], ['/about', 'אודות'],
  ['/contact', 'צור קשר'], ['/admin', 'ניהול'],
]

const chip = (selected, color = COLOR) => ({
  padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700,
  cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
  border: `2px solid ${selected ? color : '#c0d8e8'}`,
  background: selected ? color : 'white',
  color: selected ? 'white' : color,
})

export default function Practitioners() {
  const [practitioners, setPractitioners] = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [district, setDistrict]           = useState('')
  const [treatmentType, setTreatmentType] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [healthFund, setHealthFund]       = useState('')
  const [onlineOnly, setOnlineOnly]       = useState(false)
  const [defenseOnly, setDefenseOnly]     = useState(false)
  const [mounted, setMounted]             = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const p = new URLSearchParams()
        if (district)       p.set('district', district)
        if (treatmentType)  p.set('treatment_type', treatmentType)
        if (specialization) p.set('specialization', specialization)
        if (healthFund)     p.set('health_fund', healthFund)
        if (onlineOnly)     p.set('online', 'true')
        if (defenseOnly)    p.set('defense', 'true')
        if (search)         p.set('search', search)
        const res  = await fetch(`/api/practitioners?${p}`)
        const data = await res.json()
        setPractitioners(Array.isArray(data) ? data : [])
      } catch { setPractitioners([]) }
      finally   { setLoading(false) }
    }
    fetchData()
  }, [mounted, district, treatmentType, specialization, healthFund, onlineOnly, defenseOnly, search])

  const hasFilters = district || treatmentType || specialization || healthFund || onlineOnly || defenseOnly || search
  const clearAll   = () => { setDistrict(''); setTreatmentType(''); setSpecialization(''); setHealthFund(''); setOnlineOnly(false); setDefenseOnly(false); setSearch('') }

  if (!mounted) return null

  return (
    <>
      <Head>
        <title>מטפלים פרטיים | מאגר בריאות הנפש</title>
        <meta name="description" content="מאגר מטפלים פרטיים מוסמכים – פסיכולוגים, פסיכיאטרים, מטפלים רגשיים ועוד" />
      </Head>
      <div dir="rtl" style={{ minHeight: '100vh', background: '#f0f7ff', fontFamily: "'Nunito','Arial',sans-serif" }}>

        <header style={{
          background: 'linear-gradient(135deg, #164E63, #0891B2)', color: 'white',
          padding: '10px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(22,78,99,0.2)',
          flexWrap: 'wrap', gap: 8, position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="בריאות נפש בישראל" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>מטפלים פרטיים</div>
            </div>
          </div>
          <a href="/calculator" style={{ background: 'rgba(255,255,200,0.18)', border: '1.5px solid rgba(255,255,150,0.5)', color: 'white', borderRadius: '999px', padding: '8px 18px', fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>🧭 מחשבון מסלול</a>
          <a href="https://links.payboxapp.com/g9hdYBPr71b" target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.35)', color: 'white', borderRadius: '999px', padding: '8px 18px', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>💙 תמכו</a>
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

        {/* באנר הפניה */}
        <div style={{ background: '#e0f2fe', borderBottom: '1px solid #bae6fd', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 13, color: '#0369a1', fontWeight: 600 }}>
          💡 מטפלים פרטיים נמצאים עכשיו גם תחת עמוד
          <a href="/treatment" style={{ color: '#0891B2', fontWeight: 800, textDecoration: 'none', borderBottom: '1.5px solid #0891B2' }}>טיפול ←</a>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #164E63, #0891B2)', padding: '40px 24px 56px', textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🧠</div>
          <h1 style={{ margin: '0 0 10px', fontSize: 28, fontWeight: 900 }}>מטפלים פרטיים</h1>
          <p style={{ margin: 0, opacity: .85, fontSize: 15 }}>פסיכולוגים, פסיכיאטרים, מטפלים רגשיים ועוד – כולם בעלי רישיון מוסמך</p>
        </div>

        <div style={{ maxWidth: 680, margin: '-28px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
          <input type="text" placeholder="חיפוש לפי שם, עיר, התמחות..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '16px 20px', borderRadius: 999, fontSize: 15, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.12)', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <main style={{ maxWidth: 920, margin: '0 auto', padding: '28px 16px' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 16 }}>
              {[
                [district,   setDistrict,   'כל המחוזות',      DISTRICTS],
                [healthFund, setHealthFund, 'כל קופות החולים', HEALTH_FUNDS],
              ].map(([val, setter, placeholder, opts]) => (
                <select key={placeholder} value={val} onChange={e => setter(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: 12, border: '1.5px solid #c0d8e8', fontSize: 13.5, fontFamily: "'Nunito',sans-serif", background: 'white', color: '#333', outline: 'none', cursor: 'pointer' }}>
                  <option value="">{placeholder}</option>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 8 }}>סוג טיפול</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PRACTITIONER_TREATMENT_TYPES.map(t => (
                  <button key={t} onClick={() => setTreatmentType(treatmentType === t ? '' : t)} style={chip(treatmentType === t)}>{t}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#888', marginBottom: 8 }}>תחום התמחות</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PRACTITIONER_SPECIALIZATIONS.map(s => (
                  <button key={s} onClick={() => setSpecialization(specialization === s ? '' : s)} style={chip(specialization === s, '#6d28d9')}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {[[onlineOnly, setOnlineOnly, '🌐 אונליין בלבד'], [defenseOnly, setDefenseOnly, '🎗️ ספק משרד הביטחון']].map(([val, setter, label]) => (
                <button key={label} onClick={() => setter(!val)} style={chip(val)}>{label}</button>
              ))}
              {hasFilters && (
                <button onClick={clearAll} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '2px solid #fca5a5', background: '#fff5f5', color: '#dc2626' }}>✕ נקה הכל</button>
              )}
            </div>
          </div>

          <div style={{ fontSize: 13, color: '#666', marginBottom: 14, fontWeight: 600 }}>
            {loading ? 'טוען...' : `${practitioners.length} מטפלים נמצאו`}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: COLOR, fontSize: 18 }}>טוען מטפלים...</div>
          ) : practitioners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div>לא נמצאו מטפלים עם הפילטרים הנוכחיים</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {practitioners.map(p => (
                <a key={p.id} href={`/practitioner/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,.06)', border: `1.5px solid ${p.is_verified ? '#bfdbfe' : '#e0eef8'}`, borderTop: `4px solid ${COLOR}`, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', flexShrink: 0, background: p.photo_url ? 'transparent' : `linear-gradient(135deg,${COLOR},${DARK})`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.photo_url ? <img src={p.photo_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 26, color: 'white' }}>👤</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: 17, color: '#1A3A5C' }}>{p.name}</span>
                          {p.is_verified         && <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>✓ מאומת</span>}
                          {p.is_defense_ministry && <span style={{ background: '#ede9fe', color: '#6d28d9', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>🎗️ מה"ב</span>}
                        </div>
                        {p.profession && <span style={{ background: COLOR, color: 'white', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{p.profession}</span>}
                      </div>
                      <div style={{ fontSize: 13, color: '#666', marginBottom: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {p.city        && <span>📍 {p.city}{p.district ? `, ${p.district}` : ''}</span>}
                        {p.is_online   && <span style={{ color: '#0891B2', fontWeight: 700 }}>🌐 אונליין</span>}
                        {p.price_range && <span>💰 ₪{p.price_range} לשעה</span>}
                      </div>
                      {p.treatment_types?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 5 }}>
                          {p.treatment_types.slice(0, 3).map(t => <span key={t} style={{ background: '#e0f0ff', color: COLOR, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{t}</span>)}
                          {p.treatment_types.length > 3 && <span style={{ fontSize: 11, color: '#888' }}>+{p.treatment_types.length - 3}</span>}
                        </div>
                      )}
                      {p.specializations?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
                          {p.specializations.slice(0, 3).map(s => <span key={s} style={{ background: '#f5f3ff', color: '#6d28d9', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{s}</span>)}
                          {p.specializations.length > 3 && <span style={{ fontSize: 11, color: '#888' }}>+{p.specializations.length - 3}</span>}
                        </div>
                      )}
                      {p.health_funds?.length > 0 && <div style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>🏥 {p.health_funds.join(', ')}</div>}
                      {p.bio && <div style={{ fontSize: 13, color: '#556', marginTop: 6, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.bio}</div>}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </main>

        <footer style={{ background: 'linear-gradient(135deg, #0A3040, #164E63)', color: 'rgba(255,255,255,.75)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48, fontWeight: 500 }}>
          <div style={{ marginBottom: 8 }}>
            <a href="/contact" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>צור קשר</a>
            <span style={{ margin: '0 8px', opacity: .4 }}>·</span>
            <a href="/legal" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>תנאי שימוש</a>
            <span style={{ margin: '0 8px', opacity: .4 }}>·</span>
            <a href="/register" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>הוספת מטפל/ת</a>
          </div>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}
