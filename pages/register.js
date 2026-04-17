// pages/register.js  – גרסה מלאה עם טאב מטפל/ת פרטי/ת
// העתיקו את כל הקובץ הזה ותחליפו את register.js הקיים

import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { CATEGORIES, CATEGORY_NAMES } from '../lib/categories'
import {
  PRACTITIONER_TREATMENT_TYPES,
  PRACTITIONER_SPECIALIZATIONS,
  PRACTITIONER_PROFESSIONS,
  HEALTH_FUNDS,
  PRACTITIONER_LANGUAGES,
  PRACTITIONER_COLOR,
  PRACTITIONER_DARK,
} from '../lib/practitioner-constants'

const DISTRICTS           = ['צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']
const TREATMENT_CATEGORIES = ['בתים מאזנים', 'מחלקות אשפוז', 'טיפול יום', 'מרפאות בריאות נפש', 'חדרי מיון', 'שירותים נוספים']
const AGE_GROUPS_REHAB    = ['צעירים', 'מבוגרים', 'קשישים']
const AGE_GROUPS_TREATMENT = ['ילדים', 'נוער', 'צעירים', 'מבוגרים', 'קשישים']
const DIAGNOSES           = ['הפרעות אכילה', 'OCD', 'פוסט טראומה', 'פוסט טראומה מורכבת', 'התמכרויות']
const POPULATIONS         = ['נשים', 'דתי/מסורתי', 'חרדי', 'להט"ב']

const NAV = [['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']]

const emptyForm = {
  name: '', district: '', city: '', category: '', subcategory: '',
  categories: [], age_groups: [], diagnoses: [], populations: [],
  description: '', phone: '', email: '', website: '', address: '', is_national: false,
}

const emptyPractitionerForm = {
  name: '', email: '', license_number: '', profession: '',
  treatment_types: [], specializations: [],
  city: '', district: '', is_online: false,
  health_funds: [], is_defense_ministry: false,
  languages: [], price_range: '', bio: '', photo_url: '',
  phone: '', website: '',
}

export default function Register() {
  // ── state קיים ──
  const [tab, setTab]                     = useState('')
  const [form, setForm]                   = useState(emptyForm)
  const [loading, setLoading]             = useState(false)
  const [success, setSuccess]             = useState(false)
  const [error, setError]                 = useState('')
  const [mounted, setMounted]             = useState(false)
  const [duplicates, setDuplicates]       = useState([])
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  const [confirmedNotDuplicate, setConfirmedNotDuplicate] = useState(false)
  const [truthDeclaration, setTruthDeclaration] = useState(false)
  const debounceRef = useRef(null)

  // ── state חדש למטפלים ──
  const [pForm, setPForm]         = useState(emptyPractitionerForm)
  const [pLoading, setPLoading]   = useState(false)
  const [pSuccess, setPSuccess]   = useState(false)
  const [pError, setPError]       = useState('')
  const [pTruth, setPTruth]       = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // בדיקת כפילויות (רק לשיקום / טיפול)
  useEffect(() => {
    if (tab === 'practitioner') return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setConfirmedNotDuplicate(false)
    if (!form.name || form.name.length < 2) { setDuplicates([]); return }
    debounceRef.current = setTimeout(async () => {
      setCheckingDuplicates(true)
      try {
        const params = new URLSearchParams({ name: form.name, type: tab })
        if (form.city)     params.set('city', form.city)
        if (form.category) params.set('category', form.category)
        const res  = await fetch(`/api/check-duplicates?${params}`)
        const data = await res.json()
        setDuplicates(Array.isArray(data) ? data : [])
      } catch { setDuplicates([]) }
      finally   { setCheckingDuplicates(false) }
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [form.name, form.city, form.category, tab])

  function handleTabChange(newTab) {
    setTab(newTab)
    setForm(emptyForm)
    setPForm(emptyPractitionerForm)
    setError(''); setPError('')
    setSuccess(false); setPSuccess(false)
    setDuplicates([])
    setConfirmedNotDuplicate(false)
    setTruthDeclaration(false); setPTruth(false)
  }

  function toggleField(field, value) {
    setForm(f => {
      const arr = f[field] || []
      return arr.includes(value)
        ? { ...f, [field]: arr.filter(c => c !== value) }
        : { ...f, [field]: [...arr, value] }
    })
  }

  function toggleCategory(cat) {
    setForm(f => {
      const cats = f.categories || []
      return cats.includes(cat)
        ? { ...f, categories: cats.filter(c => c !== cat) }
        : { ...f, categories: [...cats, cat] }
    })
  }

  function togglePField(field, value) {
    setPForm(f => {
      const arr = f[field] || []
      return arr.includes(value)
        ? { ...f, [field]: arr.filter(x => x !== value) }
        : { ...f, [field]: [...arr, value] }
    })
  }

  // submit שיקום / טיפול
  async function handleSubmit() {
    setError('')
    const { name, district, city, phone, email } = form
    if (!name || (!district && !form.is_national) || !city || !phone || !email) {
      setError('יש למלא את כל שדות החובה המסומנים ב-*'); return
    }
    if (duplicates.length > 0 && !confirmedNotDuplicate) {
      setError('נמצאו שירותים דומים – אנא אשרו שזהו שירות שונה לפני השליחה'); return
    }
    if (!truthDeclaration) { setError('יש לאשר את הצהרת האמת לפני השליחה'); return }
    setLoading(true)
    try {
      const endpoint = tab === 'rehab' ? '/api/submit' : '/api/submit-treatment'
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { setSuccess(true); setForm(emptyForm); setDuplicates([]) }
      else { const d = await res.json(); setError(d.error || 'שגיאה בשליחה') }
    } catch { setError('שגיאת רשת') }
    finally { setLoading(false) }
  }

  // submit מטפל פרטי
  async function handlePractitionerSubmit() {
    setPError('')
    const { name, email, license_number, city } = pForm
    if (!name || !email || !license_number || !city) {
      setPError('יש למלא את כל שדות החובה: שם, מייל, מספר רישיון ועיר'); return
    }
    if (!pTruth) { setPError('יש לאשר את הצהרת האמת לפני השליחה'); return }
    setPLoading(true)
    try {
      const res = await fetch('/api/submit-practitioner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pForm) })
      if (res.ok) { setPSuccess(true); setPForm(emptyPractitionerForm); setPTruth(false) }
      else { const d = await res.json(); setPError(d.error || 'שגיאה בשליחה') }
    } catch { setPError('שגיאת רשת') }
    finally { setPLoading(false) }
  }

  const isRehab  = tab === 'rehab'
  const color    = tab === 'treatment' ? '#0891B2' : tab === 'practitioner' ? PRACTITIONER_COLOR : '#8B00D4'
  const darkColor = tab === 'treatment' ? '#164E63' : tab === 'practitioner' ? PRACTITIONER_DARK  : '#4C0080'

  const subcategories = isRehab && form.category ? (CATEGORIES[form.category]?.subcategories || []) : []

  const inp = {
    width: '100%', padding: '11px 16px', borderRadius: 20,
    border: `1.5px solid ${isRehab ? '#d4b0f0' : tab === 'treatment' ? '#a0d8e8' : '#a0c8e0'}`,
    fontSize: 14, outline: 'none', background: 'white',
    fontFamily: "'Nunito', sans-serif", color: '#222', boxSizing: 'border-box',
  }
  const lbl = { display: 'block', fontSize: 13, fontWeight: 700, color: darkColor, marginBottom: 6 }

  // סגנונות ספציפיים למטפלים
  const pInp = { ...inp, border: '1.5px solid #a0c8e0' }
  const pLbl = { ...lbl, color: PRACTITIONER_DARK }

  if (!mounted) return null

  return (
    <>
      <Head>
        <title>הוספת שירות | מאגר בריאות הנפש</title>
      </Head>
      <div dir="rtl" style={{ minHeight: '100vh', background: tab === 'practitioner' ? '#f0f7ff' : isRehab ? '#faf5ff' : '#f0faff', fontFamily: "'Nunito','Arial',sans-serif" }}>

        {/* ניווט */}
        <header style={{
          background: `linear-gradient(135deg,${darkColor || '#1A3A5C'},${color || '#2563EB'})`,
          color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,.2)',
          flexWrap: 'wrap', gap: 8, position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="בריאות נפש בישראל" style={{ width: 40, height: 40, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 17 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>הוספת שירות</div>
            </div>
          </div>
          <a href="/calculator" style={{ background: 'rgba(255,255,200,0.18)', border: '1.5px solid rgba(255,255,150,0.5)', color: 'white', borderRadius: '999px', padding: '8px 16px', fontWeight: 800, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>🧭 מחשבון מסלול</a>
          <a href="https://links.payboxapp.com/g9hdYBPr71b" target="_blank" rel="noopener noreferrer" style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.35)', color: 'white', borderRadius: '999px', padding: '8px 16px', fontWeight: 700, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>💙 תמכו</a>
          <nav aria-label="ניווט ראשי" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'white',
                background: href === '/register' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12,
                border: href === '/register' ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.2)',
                textDecoration: 'none',
              }}>{label}</a>
            ))}
          </nav>
        </header>

        {/* כותרת */}
        <div style={{ background: `linear-gradient(135deg,${darkColor || '#1A3A5C'},${color || '#2563EB'})`, padding: '32px 24px 52px', textAlign: 'center', color: 'white' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 900 }}>הוספת שירות למאגר</h1>
          <p style={{ margin: 0, opacity: .8, fontSize: 14 }}>כל השירותים עוברים אישור לפני פרסום</p>
        </div>

        <main style={{ maxWidth: 640, margin: '-20px auto 0', padding: '0 16px 60px', position: 'relative' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 28px', boxShadow: '0 8px 32px rgba(0,0,0,.1)' }}>

            {/* ── כפתורי טאב ── */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
              {[
                ['rehab',        '♿ שיקום',           '#8B00D4'],
                ['treatment',    '🏥 טיפול',           '#0891B2'],
                ['practitioner', '🧠 מטפל/ת פרטי/ת',  PRACTITIONER_COLOR],
              ].map(([id, label, col]) => (
                <button key={id} onClick={() => handleTabChange(id)} style={{
                  padding: '10px 20px', borderRadius: 999, fontWeight: 800, fontSize: 14,
                  cursor: 'pointer', fontFamily: "'Nunito',sans-serif", transition: 'all .15s',
                  border: `2px solid ${tab === id ? col : '#e0e0e0'}`,
                  background: tab === id ? col : 'white',
                  color: tab === id ? 'white' : '#666',
                  boxShadow: tab === id ? `0 4px 12px ${col}44` : 'none',
                }}>{label}</button>
              ))}
            </div>

            {/* ── בחרו סוג ── */}
            {!tab && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👆</div>
                <div style={{ fontSize: 15 }}>בחרו את סוג השירות לעיל</div>
              </div>
            )}

            {/* ══════════════════════════════════════
                טופס שיקום + טיפול (קיים)
            ══════════════════════════════════════ */}
            {(tab === 'rehab' || tab === 'treatment') && (
              <div>
                {success ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                    <h2 style={{ color, marginBottom: 12 }}>הבקשה נשלחה!</h2>
                    <p style={{ color: '#555', fontSize: 15, lineHeight: 1.7 }}>תודה! השירות יבדק ויפורסם לאחר אישור.</p>
                    <button onClick={() => setSuccess(false)} style={{ marginTop: 24, background: color, color: 'white', border: 'none', borderRadius: 999, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>הוספת שירות נוסף</button>
                  </div>
                ) : (
                  <div>
                    {/* שם */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={lbl}>שם השירות *</label>
                      <input type="text" placeholder="שם המוסד / השירות" value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inp} />
                    </div>

                    {/* כפילויות */}
                    {checkingDuplicates && <div style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>🔍 בודק כפילויות...</div>}
                    {duplicates.length > 0 && !checkingDuplicates && (
                      <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 8 }}>⚠️ נמצאו שירותים דומים:</div>
                        {duplicates.map(d => (
                          <div key={d.id} style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>• {d.name} – {d.city}</div>
                        ))}
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#92400E', marginTop: 8 }}>
                          <input type="checkbox" checked={confirmedNotDuplicate} onChange={e => setConfirmedNotDuplicate(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#F59E0B' }} />
                          אני מאשר/ת שזהו שירות שונה
                        </label>
                      </div>
                    )}

                    {/* שדות בסיסיים */}
                    {[
                      ['city',    'עיר *',              'text', 'עיר המרכז'],
                      ['phone',   'טלפון *',             'tel',  '04-XXXXXXX'],
                      ['email',   'מייל *',              'email','info@example.co.il'],
                      ['address', 'כתובת',               'text', 'רחוב, מספר'],
                      ['website', 'אתר אינטרנט',         'url',  'https://...'],
                    ].map(([key, label, type, placeholder]) => (
                      <div key={key} style={{ marginBottom: 16 }}>
                        <label style={lbl}>{label}</label>
                        <input id={`reg-${key}`} type={type} placeholder={placeholder} value={form[key]}
                          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
                      </div>
                    ))}

                    {/* מחוז */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: darkColor, marginBottom: 10, cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.is_national}
                          onChange={e => setForm(f => ({ ...f, is_national: e.target.checked, district: e.target.checked ? '' : f.district }))}
                          style={{ width: 18, height: 18 }} />
                        פריסה ארצית
                      </label>
                      {!form.is_national && (
                        <>
                          <label style={lbl}>מחוז *</label>
                          <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} style={inp}>
                            <option value="">בחרו מחוז</option>
                            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                          </select>
                        </>
                      )}
                    </div>

                    {/* קטגוריה */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={lbl}>קטגוריה ראשית</label>
                      <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))} style={inp}>
                        <option value="">בחרו קטגוריה</option>
                        {isRehab ? CATEGORY_NAMES.map(c => <option key={c}>{c}</option>) : TREATMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>

                    {isRehab && subcategories.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <label style={lbl}>תת קטגוריה</label>
                        <select value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} style={inp}>
                          <option value="">בחרו תת קטגוריה</option>
                          {subcategories.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    )}

                    {/* קטגוריות נוספות */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={lbl}>קטגוריות נוספות <span style={{ fontWeight: 400, color: '#9ca3af' }}>(אופציונלי)</span></label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {(isRehab ? CATEGORY_NAMES : TREATMENT_CATEGORIES).filter(c => c !== form.category).map(cat => {
                          const selected = (form.categories || []).includes(cat)
                          return (
                            <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{
                              padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                              border: `2px solid ${selected ? color : '#e0d0f0'}`,
                              background: selected ? color : 'white', color: selected ? 'white' : color,
                              fontFamily: "'Nunito',sans-serif", transition: 'all .15s',
                            }}>{cat}</button>
                          )
                        })}
                      </div>
                    </div>

                    {/* קבוצות גיל */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={lbl}>קבוצות גיל <span style={{ fontWeight: 400, color: '#9ca3af' }}>(אופציונלי)</span></label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {(isRehab ? AGE_GROUPS_REHAB : AGE_GROUPS_TREATMENT).map(ag => {
                          const selected = (form.age_groups || []).includes(ag)
                          return (
                            <button key={ag} type="button" onClick={() => toggleField('age_groups', ag)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", transition: 'all .15s', border: `2px solid ${selected ? color : '#e0d0f0'}`, background: selected ? color : 'white', color: selected ? 'white' : color }}>{ag}</button>
                          )
                        })}
                      </div>
                    </div>

                    {/* אבחנות */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={lbl}>אבחנות / התמחויות <span style={{ fontWeight: 400, color: '#9ca3af' }}>(אופציונלי)</span></label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {DIAGNOSES.map(d => {
                          const selected = (form.diagnoses || []).includes(d)
                          return <button key={d} type="button" onClick={() => toggleField('diagnoses', d)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", transition: 'all .15s', border: `2px solid ${selected ? '#0E7490' : '#e0d0f0'}`, background: selected ? '#0E7490' : 'white', color: selected ? 'white' : '#0E7490' }}>{d}</button>
                        })}
                      </div>
                    </div>

                    {/* אוכלוסייה */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={lbl}>אוכלוסייה ייעודית <span style={{ fontWeight: 400, color: '#9ca3af' }}>(אופציונלי)</span></label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {POPULATIONS.map(p => {
                          const selected = (form.populations || []).includes(p)
                          return <button key={p} type="button" onClick={() => toggleField('populations', p)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", transition: 'all .15s', border: `2px solid ${selected ? '#5E35B1' : '#e0d0f0'}`, background: selected ? '#5E35B1' : 'white', color: selected ? 'white' : '#5E35B1' }}>{p}</button>
                        })}
                      </div>
                    </div>

                    {/* תיאור */}
                    <div style={{ marginBottom: 24 }}>
                      <label style={lbl}>תיאור השירות</label>
                      <textarea placeholder={`תארו את שירותי ה${isRehab ? 'שיקום' : 'טיפול'} שאתם מציעים...`}
                        value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        rows={4} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', borderRadius: 12 }} />
                    </div>

                    {error && <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 12, padding: '10px 16px', fontSize: 14, color: '#C62828', marginBottom: 16 }}>⚠️ {error}</div>}

                    {/* הצהרת אמת */}
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, cursor: 'pointer', background: truthDeclaration ? (isRehab ? '#f7f0ff' : '#f0faff') : '#fff', borderRadius: 12, padding: '12px 14px', border: `1.5px solid ${truthDeclaration ? color : '#e0d0f0'}` }}>
                      <input type="checkbox" checked={truthDeclaration} onChange={e => setTruthDeclaration(e.target.checked)} style={{ width: 16, height: 16, marginTop: 2, accentColor: color, cursor: 'pointer', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>אני מצהיר/ה שהמידע שמסרתי הוא מלא, נכון ומדויק, וכי יש לי הסמכה למסור פרטים אלה בשם השירות הנרשם.</span>
                    </label>

                    <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', background: loading ? '#ccc' : `linear-gradient(160deg,${isRehab ? '#8B00D4,#4C0080' : '#0891B2,#164E63'})`, color: 'white', border: 'none', borderRadius: 999, padding: '14px 0', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Nunito',sans-serif", boxShadow: loading ? 'none' : `0 4px 0 ${darkColor},0 8px 20px ${color}44` }}>
                      {loading ? 'שולח...' : 'שליחת בקשה לאישור ←'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════
                טופס מטפל/ת פרטי/ת (חדש)
            ══════════════════════════════════════ */}
            {tab === 'practitioner' && (
              <div>
                {pSuccess ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                    <h2 style={{ color: PRACTITIONER_COLOR, marginBottom: 12 }}>הבקשה נשלחה!</h2>
                    <p style={{ color: '#555', fontSize: 15, lineHeight: 1.7 }}>תודה שהצטרפת למאגר. הבקשה תיבדק ותאושר בהקדם.</p>
                    <button onClick={() => setPSuccess(false)} style={{ marginTop: 24, background: PRACTITIONER_COLOR, color: 'white', border: 'none', borderRadius: 999, padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>הוספת מטפל/ת נוסף/ת</button>
                  </div>
                ) : (
                  <div>

                    {/* שם מלא */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={pLbl}>שם מלא *</label>
                      <input type="text" placeholder="ד״ר / שם פרטי ומשפחה" value={pForm.name}
                        onChange={e => setPForm(f => ({ ...f, name: e.target.value }))} style={pInp} />
                    </div>

                    {/* מייל */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={pLbl}>מייל * <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 12 }}>(לא יפורסם, לתקשורת מנהלית בלבד)</span></label>
                      <input type="email" placeholder="your@email.com" value={pForm.email}
                        onChange={e => setPForm(f => ({ ...f, email: e.target.value }))} style={pInp} />
                    </div>

                    {/* רישיון */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={pLbl}>מספר רישיון / תעודה *</label>
                      <input type="text" placeholder="מספר רישיון ממשרד הבריאות או גוף מוסמך" value={pForm.license_number}
                        onChange={e => setPForm(f => ({ ...f, license_number: e.target.value }))} style={pInp} />
                    </div>

                    {/* מקצוע */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={pLbl}>מקצוע</label>
                      <select value={pForm.profession} onChange={e => setPForm(f => ({ ...f, profession: e.target.value }))} style={pInp}>
                        <option value="">בחרו מקצוע</option>
                        {PRACTITIONER_PROFESSIONS.map(p => <option key={p}>{p}</option>)}
                      </select>
                    </div>

                    {/* סוגי טיפול */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={pLbl}>סוגי טיפול <span style={{ fontWeight: 400, color: '#9ca3af' }}>(ניתן לסמן כמה)</span></label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {PRACTITIONER_TREATMENT_TYPES.map(t => {
                          const sel = pForm.treatment_types.includes(t)
                          return <button key={t} type="button" onClick={() => togglePField('treatment_types', t)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", transition: 'all .15s', border: `2px solid ${sel ? PRACTITIONER_COLOR : '#c0d8e8'}`, background: sel ? PRACTITIONER_COLOR : 'white', color: sel ? 'white' : PRACTITIONER_COLOR }}>{t}</button>
                        })}
                      </div>
                    </div>

                    {/* תחומי התמחות */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={pLbl}>תחומי התמחות <span style={{ fontWeight: 400, color: '#9ca3af' }}>(ניתן לסמן כמה)</span></label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {PRACTITIONER_SPECIALIZATIONS.map(s => {
                          const sel = pForm.specializations.includes(s)
                          return <button key={s} type="button" onClick={() => togglePField('specializations', s)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", transition: 'all .15s', border: `2px solid ${sel ? '#6d28d9' : '#ddd6fe'}`, background: sel ? '#6d28d9' : 'white', color: sel ? 'white' : '#6d28d9' }}>{s}</button>
                        })}
                      </div>
                    </div>

                    {/* עיר + מחוז */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div>
                        <label style={pLbl}>עיר *</label>
                        <input type="text" placeholder="תל אביב" value={pForm.city}
                          onChange={e => setPForm(f => ({ ...f, city: e.target.value }))} style={pInp} />
                      </div>
                      <div>
                        <label style={pLbl}>מחוז</label>
                        <select value={pForm.district} onChange={e => setPForm(f => ({ ...f, district: e.target.value }))} style={pInp}>
                          <option value="">בחרו מחוז</option>
                          {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* אונליין */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: PRACTITIONER_DARK }}>
                        <input type="checkbox" checked={pForm.is_online} onChange={e => setPForm(f => ({ ...f, is_online: e.target.checked }))}
                          style={{ width: 18, height: 18, accentColor: PRACTITIONER_COLOR }} />
                        מטפל/ת אונליין 🌐
                      </label>
                    </div>

                    {/* קופות חולים */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={pLbl}>קופות חולים <span style={{ fontWeight: 400, color: '#9ca3af' }}>(אופציונלי)</span></label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {HEALTH_FUNDS.map(hf => {
                          const sel = pForm.health_funds.includes(hf)
                          return <button key={hf} type="button" onClick={() => togglePField('health_funds', hf)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", transition: 'all .15s', border: `2px solid ${sel ? '#059669' : '#d1fae5'}`, background: sel ? '#059669' : 'white', color: sel ? 'white' : '#059669' }}>{hf}</button>
                        })}
                      </div>
                    </div>

                    {/* משרד הביטחון */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: '#374151' }}>
                        <input type="checkbox" checked={pForm.is_defense_ministry} onChange={e => setPForm(f => ({ ...f, is_defense_ministry: e.target.checked }))}
                          style={{ width: 18, height: 18 }} />
                        ספק מאושר של משרד הביטחון 🎗️
                      </label>
                    </div>

                    {/* שפות */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={pLbl}>שפות טיפול <span style={{ fontWeight: 400, color: '#9ca3af' }}>(אופציונלי)</span></label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {PRACTITIONER_LANGUAGES.map(lang => {
                          const sel = pForm.languages.includes(lang)
                          return <button key={lang} type="button" onClick={() => togglePField('languages', lang)} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito',sans-serif", transition: 'all .15s', border: `2px solid ${sel ? '#7C3AED' : '#ede9fe'}`, background: sel ? '#7C3AED' : 'white', color: sel ? 'white' : '#7C3AED' }}>{lang}</button>
                        })}
                      </div>
                    </div>

                    {/* טלפון + מחיר */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div>
                        <label style={pLbl}>טלפון</label>
                        <input type="tel" placeholder="050-XXXXXXX" value={pForm.phone}
                          onChange={e => setPForm(f => ({ ...f, phone: e.target.value }))} style={pInp} />
                      </div>
                      <div>
                        <label style={pLbl}>מחיר לשעה (₪)</label>
                        <input type="text" placeholder="300-400" value={pForm.price_range}
                          onChange={e => setPForm(f => ({ ...f, price_range: e.target.value }))} style={pInp} />
                      </div>
                    </div>

                    {/* אתר */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={pLbl}>אתר אינטרנט</label>
                      <input type="url" placeholder="https://..." value={pForm.website}
                        onChange={e => setPForm(f => ({ ...f, website: e.target.value }))} style={pInp} />
                    </div>

                    {/* תמונה */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={pLbl}>קישור לתמונת פרופיל <span style={{ fontWeight: 400, color: '#9ca3af' }}>(אופציונלי)</span></label>
                      <input type="url" placeholder="https://..." value={pForm.photo_url}
                        onChange={e => setPForm(f => ({ ...f, photo_url: e.target.value }))} style={pInp} />
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>ניתן להעלות תמונה ל-Google Drive ולהדביק קישור ישיר</div>
                    </div>

                    {/* ביו */}
                    <div style={{ marginBottom: 24 }}>
                      <label style={pLbl}>קצת עליי <span style={{ fontWeight: 400, color: '#9ca3af' }}>(אופציונלי)</span></label>
                      <textarea placeholder="ספרו על הגישה הטיפולית שלכם, התמחויות, ניסיון..."
                        value={pForm.bio} onChange={e => setPForm(f => ({ ...f, bio: e.target.value }))}
                        rows={4} style={{ ...pInp, resize: 'vertical', fontFamily: 'inherit', borderRadius: 12 }} />
                    </div>

                    {pError && <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 12, padding: '10px 16px', fontSize: 14, color: '#C62828', marginBottom: 16 }}>⚠️ {pError}</div>}

                    {/* הצהרת אמת */}
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, cursor: 'pointer', background: pTruth ? '#e0f0ff' : '#fff', borderRadius: 12, padding: '12px 14px', border: `1.5px solid ${pTruth ? PRACTITIONER_COLOR : '#c0d8e8'}` }}>
                      <input type="checkbox" checked={pTruth} onChange={e => setPTruth(e.target.checked)}
                        style={{ width: 16, height: 16, marginTop: 2, accentColor: PRACTITIONER_COLOR, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>אני מצהיר/ה שהמידע שמסרתי הוא מלא, נכון ומדויק, שאני בעל/ת הרישיון או התעודה המצוינים, ושיש לי הסמכה מקצועית לעסוק בטיפול.</span>
                    </label>

                    <button onClick={handlePractitionerSubmit} disabled={pLoading} style={{ width: '100%', background: pLoading ? '#ccc' : `linear-gradient(160deg,${PRACTITIONER_COLOR},${PRACTITIONER_DARK})`, color: 'white', border: 'none', borderRadius: 999, padding: '14px 0', fontWeight: 800, fontSize: 15, cursor: pLoading ? 'not-allowed' : 'pointer', fontFamily: "'Nunito',sans-serif", boxShadow: pLoading ? 'none' : `0 4px 0 ${PRACTITIONER_DARK},0 8px 20px ${PRACTITIONER_COLOR}44` }}>
                      {pLoading ? 'שולח...' : 'שליחת בקשה לאישור ←'}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>

        <footer style={{ background: `linear-gradient(135deg,${darkColor || '#1A3A5C'},${color || '#2563EB'})`, color: 'rgba(255,255,255,.75)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48, fontWeight: 500 }}>
          <div style={{ marginBottom: 8 }}>
            <a href="/contact" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>צור קשר</a>
            <span style={{ margin: '0 8px', opacity: .4 }}>·</span>
            <a href="/legal" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>תנאי שימוש</a>
            <span style={{ margin: '0 8px', opacity: .4 }}>·</span>
            <a href="/accessibility" style={{ color: 'rgba(255,255,255,.7)', textDecoration: 'none' }}>הצהרת נגישות</a>
          </div>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}
