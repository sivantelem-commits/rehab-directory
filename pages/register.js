import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { CATEGORIES, CATEGORY_NAMES } from '../lib/categories'

const DISTRICTS = ['צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']
const TREATMENT_CATEGORIES = ['בתים מאזנים', 'מחלקות אשפוז', 'מרפאות יום', 'חדרי מיון', 'שירותים נוספים']
const AGE_GROUPS = ['צעירים', 'מבוגרים', 'קשישים']
const DIAGNOSES = ['הפרעות אכילה', 'OCD', 'פוסט טראומה', 'פוסט טראומה מורכבת', 'התמכרויות']
const POPULATIONS = ['נשים', 'דתי/מסורתי', 'חרדי', 'להט"ב']

const NAV = [['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/guide', 'מדריך'], ['/register', 'הרשמת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']]

const emptyForm = {
  name: '', district: '', city: '', category: '', subcategory: '',
  categories: [], age_groups: [], diagnoses: [], populations: [], description: '', phone: '', email: '',
  website: '', address: '', is_national: false
}

export default function Register() {
  const [tab, setTab] = useState('rehab')
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const [duplicates, setDuplicates] = useState([])
  const [checkingDuplicates, setCheckingDuplicates] = useState(false)
  const [confirmedNotDuplicate, setConfirmedNotDuplicate] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setConfirmedNotDuplicate(false)
    if (!form.name || form.name.length < 2) { setDuplicates([]); return }
    debounceRef.current = setTimeout(async () => {
      setCheckingDuplicates(true)
      try {
        const params = new URLSearchParams({ name: form.name, type: tab })
        if (form.city) params.set('city', form.city)
        if (form.category) params.set('category', form.category)
        const res = await fetch(`/api/check-duplicates?${params}`)
        const data = await res.json()
        setDuplicates(Array.isArray(data) ? data : [])
      } catch { setDuplicates([]) }
      finally { setCheckingDuplicates(false) }
    }, 500)
    return () => clearTimeout(debounceRef.current)
  }, [form.name, form.city, form.category, tab])

  function handleTabChange(newTab) {
    setTab(newTab)
    setForm(emptyForm)
    setError('')
    setSuccess(false)
    setDuplicates([])
    setConfirmedNotDuplicate(false)
  }

  function toggleField(field, value) {
    setForm(f => {
      const arr = f[field] || []
      if (arr.includes(value)) return { ...f, [field]: arr.filter(c => c !== value) }
      return { ...f, [field]: [...arr, value] }
    })
  }

  function toggleCategory(cat) {
    setForm(f => {
      const cats = f.categories || []
      if (cats.includes(cat)) return { ...f, categories: cats.filter(c => c !== cat) }
      return { ...f, categories: [...cats, cat] }
    })
  }

  async function handleSubmit() {
    setError('')
    const { name, district, city, phone, email } = form
    if (!name || (!district && !form.is_national) || !city || !phone || !email) {
      setError('יש למלא את כל שדות החובה המסומנים ב-*')
      return
    }
    if (duplicates.length > 0 && !confirmedNotDuplicate) {
      setError('נמצאו שירותים דומים — אנא אשרו שזהו שירות שונה לפני השליחה')
      return
    }
    setLoading(true)
    try {
      const endpoint = tab === 'rehab' ? '/api/submit' : '/api/submit-treatment'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSuccess(true)
        setForm(emptyForm)
        setDuplicates([])
      } else {
        const d = await res.json()
        setError(d.error || 'שגיאה בשליחה')
      }
    } catch { setError('שגיאת רשת') }
    finally { setLoading(false) }
  }

  const isRehab = tab === 'rehab'
  const color = isRehab ? '#8B00D4' : '#0891B2'
  const darkColor = isRehab ? '#4C0080' : '#164E63'

  const inp = {
    width: '100%', padding: '11px 16px', borderRadius: 20,
    border: `1.5px solid ${isRehab ? '#d4b0f0' : '#a0d8e8'}`,
    fontSize: 14, background: isRehab ? '#f7f0ff' : '#f0faff',
    outline: 'none', boxSizing: 'border-box', fontFamily: "'Nunito', sans-serif",
  }
  const lbl = { display: 'block', fontSize: 13.5, fontWeight: 700, color: darkColor, marginBottom: 6 }
  const subcategories = form.category ? CATEGORIES[form.category]?.subcategories || [] : []

  if (!mounted) return null

  return (
    <>
      <Head>
        <title>הרשמת שירות | בריאות נפש בישראל</title>
        <meta name="description" content="הוסיפו שירות שיקום או טיפול פסיכיאטרי למאגר הלאומי." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rehabdirectoryil.vercel.app/register" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="הרשמת שירות | בריאות נפש בישראל" />
        <meta property="og:description" content="הוסיפו שירות שיקום או טיפול פסיכיאטרי למאגר הלאומי." />
        <meta property="og:url" content="https://rehabdirectoryil.vercel.app/register" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: isRehab ? '#f7f0ff' : '#f0faff' }}>

        <header style={{
          background: `linear-gradient(135deg, ${darkColor}, ${color})`,
          color: 'white', padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="לוגו" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>הרשמת שירות</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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

        <div style={{
          background: `linear-gradient(160deg, ${darkColor}, ${color})`,
          color: 'white', padding: '32px 20px', textAlign: 'center',
        }}>
          <img src='/register-icon.png' alt='הרשמת שירות' style={{ width: 160, height: 160, objectFit: 'contain', marginBottom: 0, filter: 'invert(1) brightness(10)' }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>הרשמת שירות חדש</h1>
          <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>לאחר אישור האדמין השירות יופיע במאגר</p>
        </div>

        <main style={{ maxWidth: 620, margin: '0 auto', padding: '28px 16px' }}>

          {/* טאב שיקום/טיפול */}
          <div style={{
            display: 'flex', borderRadius: '999px', overflow: 'hidden',
            border: `2px solid ${color}`, marginBottom: 24, background: 'white',
          }}>
            <button onClick={() => handleTabChange('rehab')} style={{
              flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15,
              background: isRehab ? 'linear-gradient(160deg, #8B00D4, #4C0080)' : 'white',
              color: isRehab ? 'white' : '#8B00D4', transition: 'all 0.2s',
            }}>♿ שיקום</button>
            <button onClick={() => handleTabChange('treatment')} style={{
              flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15,
              background: !isRehab ? 'linear-gradient(160deg, #0891B2, #164E63)' : 'white',
              color: !isRehab ? 'white' : '#0891B2', transition: 'all 0.2s',
            }}>🏥 טיפול</button>
          </div>

          {success ? (
            <div style={{
              background: 'white', borderRadius: 20, padding: 40, textAlign: 'center',
              border: `2px solid ${color}`, boxShadow: `0 4px 20px ${color}33`,
            }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: darkColor, marginBottom: 8 }}>הבקשה נשלחה בהצלחה!</div>
              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>השירות ממתין לאישור ויופיע במאגר בקרוב.</div>
              <button onClick={() => setSuccess(false)} style={{
                marginTop: 22, background: color, color: 'white', border: 'none',
                borderRadius: 20, padding: '11px 32px', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
              }}>הוספת שירות נוסף</button>
            </div>
          ) : (
            <div style={{
              background: 'white', borderRadius: 20, padding: '24px 20px',
              boxShadow: `0 4px 20px ${color}22`,
              border: `1.5px solid ${isRehab ? '#d4b0f0' : '#a0d8e8'}`,
            }}>

              {/* שם */}
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>שם השירות *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text" placeholder="שם המרכז / השירות"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{
                      ...inp,
                      border: `1.5px solid ${duplicates.length > 0 && !confirmedNotDuplicate ? '#F59E0B' : isRehab ? '#d4b0f0' : '#a0d8e8'}`,
                      paddingLeft: 40,
                    }}
                  />
                  {checkingDuplicates && <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#aaa' }}>🔍</div>}
                  {!checkingDuplicates && duplicates.length > 0 && !confirmedNotDuplicate && <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>⚠️</div>}
                  {!checkingDuplicates && form.name.length >= 2 && duplicates.length === 0 && <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>✅</div>}
                </div>
              </div>

              {/* כפילויות */}
              {duplicates.length > 0 && !confirmedNotDuplicate && (
                <div style={{ background: '#FFFBEB', border: '1.5px solid #F59E0B', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#92400E', marginBottom: 10 }}>⚠️ נמצאו {duplicates.length} שירותים דומים במאגר</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    {duplicates.map(s => (
                      <div key={s.id} style={{ background: 'white', borderRadius: 10, padding: '10px 12px', border: '1px solid #FDE68A', fontSize: 13 }}>
                        <div style={{ fontWeight: 700, color: '#1A3A5C' }}>{s.name}</div>
                        <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>📍 {s.city}{s.district ? `, ${s.district}` : ''} · {s.category}{s.phone && <span> · 📞 {s.phone}</span>}</div>
                      </div>
                    ))}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#92400E' }}>
                    <input type="checkbox" checked={confirmedNotDuplicate} onChange={e => setConfirmedNotDuplicate(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#F59E0B', cursor: 'pointer' }} />
                    אני מאשר/ת שזהו שירות שונה ולא כפילות
                  </label>
                </div>
              )}

              {/* שדות בסיסיים */}
              {[
                ['city', 'עיר *', 'text', 'עיר המרכז'],
                ['phone', 'טלפון *', 'tel', '04-XXXXXXX'],
                ['email', 'מייל *', 'email', 'info@example.co.il'],
                ['address', 'כתובת', 'text', 'רחוב, מספר'],
                ['website', 'אתר אינטרנט', 'url', 'https://...'],
              ].map(([key, label, type, placeholder]) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={lbl}>{label}</label>
                  <input type={type} placeholder={placeholder} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
                </div>
              ))}

              {/* מחוז */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: darkColor, marginBottom: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_national}
                    onChange={e => setForm(f => ({ ...f, is_national: e.target.checked, district: e.target.checked ? '' : f.district }))}
                    style={{ width: 18, height: 18, cursor: 'pointer' }} />
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

              {/* קטגוריה ראשית */}
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>קטגוריה ראשית</label>
                <select value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))}
                  style={inp}>
                  <option value="">בחרו קטגוריה</option>
                  {isRehab
                    ? CATEGORY_NAMES.map(c => <option key={c}>{c}</option>)
                    : TREATMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)
                  }
                </select>
              </div>

              {/* תת קטגוריה */}
              {isRehab && subcategories.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <label style={lbl}>תת קטגוריה</label>
                  <select value={form.subcategory}
                    onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                    style={inp}>
                    <option value="">בחרו תת קטגוריה</option>
                    {subcategories.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {/* קטגוריות נוספות — multi select */}
              {isRehab && (
                <div style={{ marginBottom: 20 }}>
                  <label style={lbl}>
                    קטגוריות נוספות
                    <span style={{ fontWeight: 400, color: '#9ca3af', marginRight: 6 }}>(אופציונלי — אם השירות עוסק בכמה תחומים)</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {CATEGORY_NAMES.filter(c => c !== form.category).map(cat => {
                      const selected = (form.categories || []).includes(cat)
                      const catColor = CATEGORIES[cat]?.color || color
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          style={{
                            padding: '6px 14px', borderRadius: '999px', fontSize: 13,
                            fontWeight: 700, cursor: 'pointer',
                            border: `2px solid ${selected ? catColor : '#e0d0f0'}`,
                            background: selected ? catColor : 'white',
                            color: selected ? 'white' : catColor,
                            fontFamily: "'Nunito', sans-serif",
                            transition: 'all 0.15s',
                          }}
                        >
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                  {(form.categories || []).length > 0 && (
                    <div style={{ fontSize: 12, color: '#9b88bb', marginTop: 8, fontWeight: 600 }}>
                      ✓ נבחרו: {form.categories.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* קבוצות גיל */}
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>
                  קבוצות גיל
                  <span style={{ fontWeight: 400, color: '#9ca3af', marginRight: 6 }}>(אופציונלי)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {AGE_GROUPS.map(ag => {
                    const selected = (form.age_groups || []).includes(ag)
                    return (
                      <button key={ag} type="button" onClick={() => toggleField('age_groups', ag)} style={{
                        padding: '6px 14px', borderRadius: '999px', fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
                        border: `2px solid ${selected ? color : '#e0d0f0'}`,
                        background: selected ? color : 'white',
                        color: selected ? 'white' : color,
                      }}>{ag}</button>
                    )
                  })}
                </div>
              </div>

              {/* אבחנות */}
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>
                  אבחנות / התמחויות
                  <span style={{ fontWeight: 400, color: '#9ca3af', marginRight: 6 }}>(אופציונלי)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DIAGNOSES.map(d => {
                    const selected = (form.diagnoses || []).includes(d)
                    return (
                      <button key={d} type="button" onClick={() => toggleField('diagnoses', d)} style={{
                        padding: '6px 14px', borderRadius: '999px', fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
                        border: `2px solid ${selected ? '#0E7490' : '#e0d0f0'}`,
                        background: selected ? '#0E7490' : 'white',
                        color: selected ? 'white' : '#0E7490',
                      }}>{d}</button>
                    )
                  })}
                </div>
              </div>

              {/* אוכלוסייה */}
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>
                  אוכלוסייה ייעודית
                  <span style={{ fontWeight: 400, color: '#9ca3af', marginRight: 6 }}>(אופציונלי)</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {POPULATIONS.map(p => {
                    const selected = (form.populations || []).includes(p)
                    return (
                      <button key={p} type="button" onClick={() => toggleField('populations', p)} style={{
                        padding: '6px 14px', borderRadius: '999px', fontSize: 13, fontWeight: 700,
                        cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.15s',
                        border: `2px solid ${selected ? '#5E35B1' : '#e0d0f0'}`,
                        background: selected ? '#5E35B1' : 'white',
                        color: selected ? 'white' : '#5E35B1',
                      }}>{p}</button>
                    )
                  })}
                </div>
              </div>

              {/* תיאור */}
              <div style={{ marginBottom: 24 }}>
                <label style={lbl}>תיאור השירות</label>
                <textarea
                  placeholder={`תארו את שירותי ה${isRehab ? 'שיקום' : 'טיפול'} שאתם מציעים...`}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={4}
                  style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', borderRadius: 12 }}
                />
              </div>

              {error && (
                <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 12, padding: '10px 16px', fontSize: 14, color: '#C62828', marginBottom: 16 }}>
                  ⚠️ {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading} style={{
                width: '100%',
                background: loading ? '#ccc' : `linear-gradient(160deg, ${isRehab ? '#8B00D4, #4C0080' : '#0891B2, #164E63'})`,
                color: 'white', border: 'none', borderRadius: '999px',
                padding: '14px 0', fontWeight: 800, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'Nunito', sans-serif",
                boxShadow: loading ? 'none' : `0 4px 0 ${darkColor}, 0 8px 20px ${color}44`,
              }}>
                {loading ? 'שולח...' : 'שליחת בקשה לאישור ←'}
              </button>
            </div>
          )}
        </main>

        <footer style={{
          background: `linear-gradient(135deg, ${darkColor}, ${color})`,
          color: 'rgba(255,255,255,0.75)', textAlign: 'center',
          padding: '24px', fontSize: 13, marginTop: 48, fontWeight: 500,
        }}>
          <div style={{ marginBottom: 8 }}>
            <a href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>צור קשר</a>
          </div>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}
