import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { CATEGORIES, CATEGORY_NAMES } from '../lib/categories'

const DISTRICTS = ['צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']
const TREATMENT_CATEGORIES = ['בתי"מ', 'מחלקות אשפוז', 'מרפאות יום', 'חדרי מיון']
const NAV = [['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register', 'הרשמת שירות'], ['/about', 'אודות'], ['/contact', '✉️ צור קשר'], ['/admin', 'ניהול']]

const emptyForm = { name: '', district: '', city: '', category: '', subcategory: '', description: '', phone: '', email: '', website: '', address: '', is_national: false }

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

    if (!form.name || form.name.length < 2) {
      setDuplicates([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setCheckingDuplicates(true)
      try {
        const params = new URLSearchParams({ name: form.name, type: tab })
        if (form.city) params.set('city', form.city)
        if (form.category) params.set('category', form.category)
        const res = await fetch(`/api/check-duplicates?${params}`)
        const data = await res.json()
        setDuplicates(Array.isArray(data) ? data : [])
      } catch {
        setDuplicates([])
      } finally {
        setCheckingDuplicates(false)
      }
    }, 500)

    return () => clearTimeout(debounceRef.current)
  }, [form.name, form.city, form.category, tab])

  const handleTabChange = (newTab) => {
    setTab(newTab)
    setForm(emptyForm)
    setError('')
    setSuccess(false)
    setDuplicates([])
    setConfirmedNotDuplicate(false)
  }

  const handleSubmit = async () => {
    setError('')
    const { name, district, city, category, phone, email } = form
    if (!name || (!district && !form.is_national) || !city || !category || !phone || !email) {
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
    } catch (e) {
      setError('שגיאת רשת')
    } finally {
      setLoading(false)
    }
  }

  const isRehab = tab === 'rehab'
  const color = isRehab ? '#4aab78' : '#ee7a50'
  const darkColor = isRehab ? '#2d6a4f' : '#c85e32'

  const inp = {
    width: '100%', padding: '11px 16px', borderRadius: 20,
    border: `1.5px solid ${isRehab ? '#a8d8b0' : '#FFD4B0'}`,
    fontSize: 14,
    background: isRehab ? '#f2faf4' : '#FFF8F3',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Nunito', sans-serif",
  }
  const lbl = { display: 'block', fontSize: 13.5, fontWeight: 700, color: darkColor, marginBottom: 6 }
  const subcategories = form.category ? CATEGORIES[form.category]?.subcategories || [] : []

  if (!mounted) return null

  return (
    <>
      <Head>
        <title>הרשמת שירות | בריאות נפש בישראל</title>
        <meta name="description" content="הרשמת שירות שיקום או טיפול למאגר בריאות הנפש" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: isRehab ? '#f2faf4' : '#FFF8F3' }}>

        <header style={{
          background: `linear-gradient(135deg, ${darkColor}, ${color})`,
          color: 'white', padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="לוגו" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)'}} />
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
          <div style={{ fontSize: 36, marginBottom: 10 }}>➕</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>הרשמת שירות חדש</h1>
          <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>לאחר אישור האדמין השירות יופיע במאגר</p>
        </div>

        <main style={{ maxWidth: 620, margin: '0 auto', padding: '28px 16px' }}>

          <div style={{
            display: 'flex', borderRadius: '999px', overflow: 'hidden',
            border: `2px solid ${color}`, marginBottom: 24, background: 'white',
          }}>
            <button onClick={() => handleTabChange('rehab')} style={{
              flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15,
              background: isRehab ? 'linear-gradient(160deg, #7ec8a0, #4aab78)' : 'white',
              color: isRehab ? 'white' : '#4aab78', transition: 'all 0.2s',
            }}>♿ שיקום</button>
            <button onClick={() => handleTabChange('treatment')} style={{
              flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15,
              background: !isRehab ? 'linear-gradient(160deg, #f4a27a, #ee7a50)' : 'white',
              color: !isRehab ? 'white' : '#ee7a50', transition: 'all 0.2s',
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
                borderRadius: 20, padding: '11px 32px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
              }}>הוספת שירות נוסף</button>
            </div>
          ) : (
            <div style={{
              background: 'white', borderRadius: 20, padding: '24px 20px',
              boxShadow: `0 4px 20px ${color}22`,
              border: `1.5px solid ${isRehab ? '#a8d8b0' : '#FFE8D6'}`,
            }}>

              {/* שם השירות */}
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>שם השירות *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text" placeholder="שם המרכז / השירות"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{
                      ...inp,
                      border: `1.5px solid ${duplicates.length > 0 && !confirmedNotDuplicate ? '#F59E0B' : isRehab ? '#a8d8b0' : '#FFD4B0'}`,
                      paddingLeft: 40,
                    }}
                  />
                  {checkingDuplicates && (
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#aaa' }}>🔍</div>
                  )}
                  {!checkingDuplicates && duplicates.length > 0 && !confirmedNotDuplicate && (
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>⚠️</div>
                  )}
                  {!checkingDuplicates && form.name.length >= 2 && duplicates.length === 0 && (
                    <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>✅</div>
                  )}
                </div>
              </div>

              {/* התראת כפילויות */}
              {duplicates.length > 0 && !confirmedNotDuplicate && (
                <div style={{
                  background: '#FFFBEB', border: '1.5px solid #F59E0B',
                  borderRadius: 14, padding: '14px 16px', marginBottom: 16,
                }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#92400E', marginBottom: 10 }}>
                    ⚠️ נמצאו {duplicates.length} שירותים דומים במאגר
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    {duplicates.map(s => (
                      <div key={s.id} style={{
                        background: 'white', borderRadius: 10, padding: '10px 12px',
                        border: '1px solid #FDE68A', fontSize: 13,
                      }}>
                        <div style={{ fontWeight: 700, color: '#1A3A5C' }}>{s.name}</div>
                        <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                          📍 {s.city}{s.district ? `, ${s.district}` : ''} · {s.category}
                          {s.phone && <span> · 📞 {s.phone}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#92400E' }}>
                    <input
                      type="checkbox"
                      checked={confirmedNotDuplicate}
                      onChange={e => setConfirmedNotDuplicate(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: '#F59E0B', cursor: 'pointer' }}
                    />
                    אני מאשר/ת שזהו שירות שונה ולא כפילות
                  </label>
                </div>
              )}

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

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: darkColor, marginBottom: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.is_national} onChange={e => setForm(f => ({ ...f, is_national: e.target.checked, district: e.target.checked ? '' : f.district }))} style={{ width: 18, height: 18, cursor: 'pointer' }} />
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

              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>קטגוריה *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))} style={inp}>
                  <option value="">בחרו קטגוריה</option>
                  {isRehab
                    ? CATEGORY_NAMES.map(c => <option key={c}>{c}</option>)
                    : TREATMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)
                  }
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

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? '#ccc' : `linear-gradient(160deg, ${isRehab ? '#7ec8a0, #4aab78' : '#f4a27a, #ee7a50'})`,
                  color: 'white', border: 'none', borderRadius: '999px',
                  padding: '14px 0', fontWeight: 800, fontSize: 15,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Nunito', sans-serif",
                  boxShadow: loading ? 'none' : `0 4px 0 ${darkColor}, 0 8px 20px ${color}44`,
                }}
              >
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
            <a href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>✉️ צור קשר</a>
          </div>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}
