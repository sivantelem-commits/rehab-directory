import { useState, useEffect } from 'react'
import Head from 'next/head'

const DISTRICTS = ['צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']
const CATEGORIES = ['בתי"מ', 'מחלקות אשפוז', 'מרפאות יום', 'חדרי מיון']
const NAV = [['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register-treatment', 'הרשמת שירות'], ['/about', 'אודות'], ['/admin', 'ניהול']]

export default function RegisterTreatment() {
  const [form, setForm] = useState({ name: '', district: '', city: '', category: '', description: '', phone: '', email: '', website: '', address: '' })
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
      const res = await fetch('/api/submit-treatment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSuccess(true)
        setForm({ name: '', district: '', city: '', category: '', description: '', phone: '', email: '', website: '', address: '' })
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

  const inp = { width: '100%', padding: '11px 16px', borderRadius: 20, border: '1.5px solid #B3D4E8', fontSize: 14, background: '#F0F7FF', outline: 'none', boxSizing: 'border-box' }
  const lbl = { display: 'block', fontSize: 13.5, fontWeight: 700, color: '#0277BD', marginBottom: 6 }

  if (!mounted) return null

  return (
    <>
      <Head>
        <title>הרשמת שירות טיפולי | בריאות נפש בישראל</title>
        <meta name="description" content="הרשמת שירות טיפולי חדש למאגר בריאות הנפש" />
      </Head>
      <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F0F7FF' }}>
        <header style={{ background: '#0277BD', color: 'white', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🧠</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 19 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>שירותי טיפול</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 12px', fontWeight: 600, fontSize: 12, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(135deg, #0277BD, #0288D1)', color: 'white', padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>➕</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>הרשמת שירות טיפולי</h1>
          <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>לאחר אישור האדמין השירות יופיע במאגר</p>
        </div>

        <main style={{ maxWidth: 620, margin: '0 auto', padding: '28px 16px' }}>
          {success ? (
            <div style={{ background: 'white', borderRadius: 20, padding: 40, textAlign: 'center', border: '2px solid #0277BD', boxShadow: '0 4px 20px rgba(2,119,189,0.15)' }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0277BD', marginBottom: 8 }}>הבקשה נשלחה בהצלחה!</div>
              <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>השירות ממתין לאישור ויופיע במאגר בקרוב.</div>
              <button onClick={() => setSuccess(false)} style={{ marginTop: 22, background: '#0277BD', color: 'white', border: 'none', borderRadius: 20, padding: '11px 32px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                הוספת שירות נוסף
              </button>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 20, padding: '24px 20px', boxShadow: '0 4px 20px rgba(2,119,189,0.1)', border: '1.5px solid #B3D4E8' }}>
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
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inp}>
                  <option value="">בחרו קטגוריה</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={lbl}>תיאור השירות</label>
                <textarea placeholder="תארו את שירותי הטיפול שאתם מציעים..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', borderRadius: 12 }} />
              </div>

              {error && <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 12, padding: '10px 16px', fontSize: 14, color: '#C62828', marginBottom: 16 }}>⚠️ {error}</div>}

              <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', background: loading ? '#ccc' : '#0277BD', color: 'white', border: 'none', borderRadius: 20, padding: '14px 0', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'שולח...' : 'שליחת בקשה לאישור ←'}
              </button>
            </div>
          )}
        </main>

        <footer style={{ background: '#0277BD', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
          בריאות נפש בישראל © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}
