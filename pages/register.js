import { useState, useEffect } from 'react'
import { CATEGORIES, CATEGORY_NAMES } from '../lib/categories'

const DISTRICTS = ['צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']

export default function Register() {
  const [form, setForm] = useState({ name: '', district: '', city: '', category: '', subcategory: '', description: '', phone: '', email: '', website: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async () => {
    setError('')
    const { name, district, city, category, phone, email } = form
    if (!name || !district || !city || !category || !phone || !email) {
      setError('יש למלא את כל שדות החובה המסומנים ב-*')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSuccess(true)
        setForm({ name: '', district: '', city: '', category: '', subcategory: '', description: '', phone: '', email: '', website: '', address: '' })
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

  const inp = { width: '100%', padding: '11px 16px', borderRadius: 20, border: '1.5px solid #FFD4B0', fontSize: 14, background: '#FFF8F3', outline: 'none', boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 13.5, fontWeight: 700, color: '#1A3A5C', marginBottom: 6 }

  const subcategories = form.category ? CATEGORIES[form.category]?.subcategories || [] : []

  if (!mounted) return null

  return (
    <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#FFF8F3' }}>
      <header style={{ background: '#1A3A5C', color: 'white', padding: '0 32px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F47B20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>♿</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 19 }}>סל שיקום</div>
            <div style={{ fontSize: 11, opacity: 0.75 }}>מאגר שירותי שיקום בקהילה</div>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: 8 }}>
          {[['/', 'שירותים'], ['/map', '🗺️ מפה'], ['/register', 'הרשמת שירות'], ['/admin', 'ניהול']].map(([href, label]) => (
            <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '7px 18px', fontWeight: 600, fontSize: 13, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
          ))}
        </nav>
      </header>

      <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '36px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>➕</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>הרשמת שירות חדש</h1>
        <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>לאחר אישור האדמין השירות יופיע במאגר</p>
      </div>

      <main style={{ maxWidth: 620, margin: '0 auto', padding: '36px 24px' }}>
        {success ? (
          <div style={{ background: 'white', borderRadius: 20, padding: 40, textAlign: 'center', border: '2px solid #F47B20', boxShadow: '0 4px 20px rgba(244,123,32,0.15)' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1A3A5C', marginBottom: 8 }}>הבקשה נשלחה בהצלחה!</div>
            <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>השירות ממתין לאישור ויופיע במאגר בקרוב.</div>
            <button onClick={() => setSuccess(false)} style={{ marginTop: 22, background: '#F47B20', color: 'white', border: 'none', borderRadius: 20, padding: '11px 32px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              הוספת שירות נוסף
            </button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 20, padding: '28px 32px', boxShadow: '0 4px 20px rgba(244,123,32,0.1)', border: '1.5px solid #FFE8D6' }}>
            {[
              ['name', 'שם השירות *', 'text', 'שם המרכז / השירות'],
              ['city', 'עיר *', 'text', 'עיר המרכז'],
              ['phone', 'טלפון *', 'tel', '04-XXXXXXX'],
              ['email', 'מייל *', 'email', 'info@example.co.il'],
              ['address', 'כתובת', 'text', 'רחוב, מספר'],
              ['website', 'אתר אינטרנט', 'url', 'https://...'],
            ].map(([key, label, type, placeholder]) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={lbl}>{label}</label>
                <input type={type} placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
              </div>
            ))}

            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>מחוז *</label>
              <select value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} style={inp}>
                <option value="">בחרו מחוז</option>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>קטגוריה *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))} style={inp}>
                <option value="">בחרו קטגוריה</option>
                {CATEGORY_NAMES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {subcategories.length > 0 && (
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
              <textarea placeholder="תארו את שירותי השיקום שאתם מציעים..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', borderRadius: 12 }} />
            </div>

            {error && <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 12, padding: '10px 16px', fontSize: 14, color: '#C62828', marginBottom: 16 }}>⚠️ {error}</div>}

            <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', background: loading ? '#ccc' : '#F47B20', color: 'white', border: 'none', borderRadius: 20, padding: '14px 0', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'שולח...' : 'שליחת בקשה לאישור ←'}
            </button>
          </div>
        )}
      </main>

      <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
        מאגר שירותי סל שיקום © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
