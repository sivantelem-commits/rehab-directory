import { useState, useEffect } from 'react'

const TYPE_COLORS = { 'שיקום תעסוקתי': '#F47B20', 'בית מאזן': '#1A3A5C', 'דיור מוגן': '#E85D9A' }
const DISTRICTS = ['צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']
const SERVICE_TYPES = ['שיקום תעסוקתי', 'בית מאזן', 'דיור מוגן']

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('pending')
  const [adminKey, setAdminKey] = useState('')
  const [editingService, setEditingService] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

  const login = async () => {
    setLoginError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) { setAuthed(true); setAdminKey(password) }
    else setLoginError('סיסמה שגויה')
  }

  const fetchAll = async (key) => {
    setLoading(true)
    try {
      const [p, a] = await Promise.all([
        fetch('/api/admin/services', { headers: { adminkey: key } }),
        fetch('/api/services'),
      ])
      setPending(await p.json())
      setApproved(await a.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { if (authed) fetchAll(adminKey) }, [authed])

  const updateStatus = async (id, status) => {
    await fetch('/api/admin/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', adminkey: adminKey },
      body: JSON.stringify({ id, status }),
    })

    if (status === 'approved') {
      const service = pending.find(s => s.id === id)
      if (service && service.email) {
        await fetch('/api/admin/approve-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', adminkey: adminKey },
          body: JSON.stringify({
            serviceName: service.name,
            serviceEmail: service.email,
          }),
        })
      }
    }

    fetchAll(adminKey)
  }

  const deleteService = async (id) => {
    if (!confirm('למחוק שירות זה לצמיתות?')) return
    await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE', headers: { adminkey: adminKey } })
    fetchAll(adminKey)
  }

  const openEdit = (service) => {
    setEditingService(service)
    setEditForm({ ...service })
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      await fetch('/api/admin/edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', adminkey: adminKey },
        body: JSON.stringify(editForm),
      })
      setEditingService(null)
      fetchAll(adminKey)
    } finally { setSaving(false) }
  }

  const inp = { width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #FFD4B0', fontSize: 14, background: '#FFF8F3', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
  const lbl = { display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 5 }

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
          {[['/', 'שירותים'], ['/register', 'הרשמת שירות'], ['/admin', 'ניהול']].map(([href, label]) => (
            <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '7px 18px', fontWeight: 600, fontSize: 13, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
          ))}
        </nav>
      </header>

      <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '36px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🔐</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>פאנל ניהול</h1>
        <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>אישור, עריכה ומחיקת שירותים</p>
      </div>

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '36px 24px' }}>
        {!authed ? (
          <div style={{ maxWidth: 380, margin: '0 auto', background: 'white', borderRadius: 20, padding: '40px 36px', boxShadow: '0 4px 20px rgba(244,123,32,0.12)', border: '1.5px solid #FFE8D6', textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🔐</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18, color: '#1A3A5C' }}>כניסת מנהל</div>
            <input type="password" placeholder="סיסמת אדמין" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 20, border: '1.5px solid #FFD4B0', fontSize: 15, textAlign: 'center', letterSpacing: 4, marginBottom: 10, background: '#FFF8F3', outline: 'none', boxSizing: 'border-box' }} />
            {loginError && <div style={{ color: '#C62828', fontSize: 13, marginBottom: 8 }}>{loginError}</div>}
            <button onClick={login} style={{ width: '100%', background: '#F47B20', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              כניסה
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              {[['⏳', 'ממתינים לאישור', pending.length, '#F47B20'], ['✅', 'שירותים פעילים', approved.length, '#1A3A5C']].map(([icon, label, val, color]) => (
                <div key={label} style={{ background: 'white', borderRadius: 16, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14, borderRight: `5px solid ${color}`, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', flex: 1 }}>
                  <span style={{ fontSize: 28 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color }}>{val}</div>
                    <div style={{ fontSize: 13, color: '#888' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {[['pending', `⏳ ממתינים (${pending.length})`], ['approved', `✅ פעילים (${approved.length})`]].map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)} style={{ padding: '9px 22px', borderRadius: 20, fontWeight: 700, fontSize: 14, background: tab === id ? '#F47B20' : 'white', color: tab === id ? 'white' : '#1A3A5C', border: tab === id ? 'none' : '1.5px solid #FFD4B0', cursor: 'pointer' }}>
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 48, color: '#F47B20' }}>טוען...</div>
            ) : tab === 'pending' ? (
              pending.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
                  <div style={{ fontWeight: 600 }}>אין בקשות ממתינות</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {pending.map(s => (
                    <div key={s.id} style={{ background: 'white', borderRadius: 16, padding: '22px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', borderRight: '5px solid #F47B20' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 17, color: '#1A3A5C', marginBottom: 4 }}>{s.name}</div>
                          <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>📍 {s.city}, {s.district} · {s.type}</div>
                          <div style={{ fontSize: 13.5, color: '#445', marginBottom: 8, lineHeight: 1.55 }}>{s.description}</div>
                          <div style={{ display: 'flex', gap: 14, fontSize: 13, color: '#F47B20' }}>
                            {s.phone && <span>📞 {s.phone}</span>}
                            {s.email && <span>✉️ {s.email}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <button onClick={() => updateStatus(s.id, 'approved')} style={{ background: '#F47B20', color: 'white', border: 'none', borderRadius: 20, padding: '9px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>✓ אשר</button>
                          <button onClick={() => openEdit(s)} style={{ background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '9px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>✏️ ערוך</button>
                          <button onClick={() => updateStatus(s.id, 'rejected')} style={{ background: '#FFF0F0', color: '#C62828', border: '1.5px solid #FFCDD2', borderRadius: 20, padding: '9px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>✕ דחה</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              approved.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}>אין שירותים פעילים</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {approved.map(s => (
                    <div key={s.id} style={{ background: 'white', borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRight: `4px solid ${TYPE_COLORS[s.type] || '#F47B20'}` }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15, color: '#1A3A5C' }}>{s.name}</div>
                        <div style={{ fontSize: 12.5, color: '#aaa' }}>📍 {s.city} · {s.type}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => openEdit(s)} style={{ background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>✏️ ערוך</button>
                        <button onClick={() => deleteService(s.id)} style={{ background: 'none', border: '1.5px solid #FFCDD2', color: '#C62828', borderRadius: 20, padding: '6px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>🗑️ מחק</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </main>

      {editingService && (
        <div onClick={() => setEditingService(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div style={{ height: 7, background: '#F47B20', borderRadius: '20px 20px 0 0' }} />
            <div style={{ padding: '28px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1A3A5C' }}>✏️ עריכת שירות</h2>
                <button onClick={() => setEditingService(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
              </div>

              {[
                ['name', 'שם השירות', 'text'],
                ['city', 'עיר', 'text'],
                ['phone', 'טלפון', 'tel'],
                ['email', 'מייל', 'email'],
                ['address', 'כתובת', 'text'],
                ['website', 'אתר אינטרנט', 'url'],
              ].map(([key, label, type]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label style={lbl}>{label}</label>
                  <input type={type} value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
                </div>
              ))}

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>מחוז</label>
                <select value={editForm.district || ''} onChange={e => setEditForm(f => ({ ...f, district: e.target.value }))} style={inp}>
                  {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>סוג שירות</label>
                <select value={editForm.type || ''} onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))} style={inp}>
                  {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={lbl}>תיאור</label>
                <textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inp, resize: 'vertical', borderRadius: 12 }} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={saveEdit} disabled={saving} style={{ flex: 1, background: '#F47B20', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer' }}>
                  {saving ? 'שומר...' : '💾 שמור שינויים'}
                </button>
                <button onClick={() => setEditingService(null)} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  ביטול
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
        מאגר שירותי סל שיקום © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
