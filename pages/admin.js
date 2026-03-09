import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { CATEGORIES, CATEGORY_NAMES, getCategoryColor } from '../lib/categories'

const DISTRICTS = ['צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']

const CATEGORY_COLORS_HEX = {
  'דיור': 'F3E5F5',
  'תעסוקה': 'FFF3E0',
  'השכלה': 'E3F2FD',
  'חברה ופנאי': 'E8F5E9',
  'ליווי ותמיכה': 'E1F5FE',
  'טיפולי שיניים': 'FCE4EC',
  'שירותים נוספים': 'ECEFF1',
}

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
  const [locationService, setLocationService] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [exportFilters, setExportFilters] = useState({ status: 'approved', district: '', category: '', subcategory: '' })
  const [exporting, setExporting] = useState(false)

  useEffect(() => { setMounted(true) }, [])

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
          body: JSON.stringify({ serviceName: service.name, serviceEmail: service.email }),
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

  const saveLocation = async (lat, lng) => {
    await fetch('/api/admin/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', adminkey: adminKey },
      body: JSON.stringify({ id: locationService.id, lat, lng }),
    })
    setLocationService(null)
    fetchAll(adminKey)
  }

  const exportToExcel = async () => {
  setExporting(true)
  try {
    const params = new URLSearchParams()
    if (exportFilters.status) params.set('status', exportFilters.status)
    if (exportFilters.district) params.set('district', exportFilters.district)
    if (exportFilters.category) params.set('category', exportFilters.category)
    if (exportFilters.subcategory) params.set('subcategory', exportFilters.subcategory)

    const res = await fetch(`/api/admin/export?${params}`, { headers: { adminkey: adminKey } })
    const data = await res.json()

    const ExcelJS = (await import('exceljs')).default
    const wb = new ExcelJS.Workbook()
    wb.views = [{ rightToLeft: true }]
    const ws = wb.addWorksheet('שירותים', { views: [{ rightToLeft: true }] })

    const columns = [
      { header: 'שם השירות', key: 'name', width: 28 },
      { header: 'קטגוריה', key: 'category', width: 16 },
      { header: 'תת קטגוריה', key: 'subcategory', width: 18 },
      { header: 'מחוז', key: 'district', width: 12 },
      { header: 'עיר', key: 'city', width: 14 },
      { header: 'כתובת', key: 'address', width: 24 },
      { header: 'טלפון', key: 'phone', width: 16 },
      { header: 'מייל', key: 'email', width: 26 },
      { header: 'אתר', key: 'website', width: 28 },
      { header: 'תיאור', key: 'description', width: 40 },
      { header: 'סטטוס', key: 'status', width: 12 },
      { header: 'תאריך הוספה', key: 'created_at', width: 16 },
    ]
    ws.columns = columns

    // עיצוב שורת כותרות
    const headerRow = ws.getRow(1)
    headerRow.height = 28
    headerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A5C' } }
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12, name: 'Arial' }
      cell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rightToLeft' }
      cell.border = { bottom: { style: 'medium', color: { argb: 'FFF47B20' } } }
    })

    // הוספת נתונים ועיצוב לפי קטגוריה
    const categoryBgColors = {
      'דיור':           'FFF3E5F5',
      'תעסוקה':         'FFFFF3E0',
      'השכלה':          'FFE3F2FD',
      'חברה ופנאי':     'FFE8F5E9',
      'ליווי ותמיכה':   'FFE1F5FE',
      'טיפולי שיניים':  'FFFCE4EC',
      'שירותים נוספים': 'FFECEFF1',
    }

    const categoryTextColors = {
      'דיור':           'FF7B2D8B',
      'תעסוקה':         'FFF47B20',
      'השכלה':          'FF1A3A5C',
      'חברה ופנאי':     'FF2E7D32',
      'ליווי ותמיכה':   'FF0277BD',
      'טיפולי שיניים':  'FFC2185B',
      'שירותים נוספים': 'FF546E7A',
    }

    data.forEach(s => {
      const row = ws.addRow({
        name: s.name,
        category: s.category,
        subcategory: s.subcategory || '',
        district: s.district,
        city: s.city,
        address: s.address || '',
        phone: s.phone || '',
        email: s.email || '',
        website: s.website || '',
        description: s.description || '',
        status: s.status === 'approved' ? 'פעיל' : s.status === 'pending' ? 'ממתין' : 'נדחה',
        created_at: new Date(s.created_at).toLocaleDateString('he-IL'),
      })

      const bg = categoryBgColors[s.category] || 'FFFFFFFF'
      const textColor = categoryTextColors[s.category] || 'FF333333'

      row.height = 22
      row.eachCell((cell, colNumber) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
        cell.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'rightToLeft', wrapText: false }
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
          right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        }
        // צבע טקסט לעמודת קטגוריה
        if (colNumber === 2) {
          cell.font = { bold: true, color: { argb: textColor }, name: 'Arial' }
        } else {
          cell.font = { color: { argb: 'FF333333' }, name: 'Arial' }
        }
      })
    })

    // פילטר אוטומטי
    ws.autoFilter = { from: 'A1', to: `L${data.length + 1}` }

    // הורדה
    const buffer = await wb.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `סל-שיקום-${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    setShowExport(false)
  } finally { setExporting(false) }
  }

  const inp = { width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #FFD4B0', fontSize: 14, background: '#FFF8F3', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
  const lbl = { display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 5 }
  const editSubcategories = editForm.category ? CATEGORIES[editForm.category]?.subcategories || [] : []
  const exportSubcategories = exportFilters.category ? CATEGORIES[exportFilters.category]?.subcategories || [] : []

  if (!mounted) return null

  return (
    <>
      <Head>
        <title>ניהול | סל שיקום</title>
      </Head>
      <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#FFF8F3' }}>
        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F47B20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>♿</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 19 }}>סל שיקום</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>מאגר שירותי שיקום בקהילה</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['/', 'שירותים'], ['/map', '🗺️ מפה'], ['/register', 'הרשמת שירות'], ['/about', 'אודות'], ['/admin', 'ניהול']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 12px', fontWeight: 600, fontSize: 12, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔐</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>פאנל ניהול</h1>
          <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>אישור, עריכה ומחיקת שירותים</p>
        </div>

        <main style={{ maxWidth: 820, margin: '0 auto', padding: '24px 16px' }}>
          {!authed ? (
            <div style={{ maxWidth: 380, margin: '0 auto', background: 'white', borderRadius: 20, padding: '40px 24px', boxShadow: '0 4px 20px rgba(244,123,32,0.12)', border: '1.5px solid #FFE8D6', textAlign: 'center' }}>
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
                  <div key={label} style={{ background: 'white', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, borderRight: `5px solid ${color}`, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', flex: 1, minWidth: 140 }}>
                    <span style={{ fontSize: 28 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 800, color }}>{val}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[['pending', `⏳ ממתינים (${pending.length})`], ['approved', `✅ פעילים (${approved.length})`]].map(([id, label]) => (
                    <button key={id} onClick={() => setTab(id)} style={{ padding: '9px 18px', borderRadius: 20, fontWeight: 700, fontSize: 13, background: tab === id ? '#F47B20' : 'white', color: tab === id ? 'white' : '#1A3A5C', border: tab === id ? 'none' : '1.5px solid #FFD4B0', cursor: 'pointer' }}>
                      {label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowExport(true)} style={{ background: '#2E7D32', color: 'white', border: 'none', borderRadius: 20, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  📊 ייצוא לאקסל
                </button>
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
                    {pending.map(s => {
                      const color = getCategoryColor(s.category, s.subcategory)
                      return (
                        <div key={s.id} style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', borderRight: `5px solid ${color}` }}>
                          <div style={{ fontWeight: 700, fontSize: 16, color: '#1A3A5C', marginBottom: 4 }}>{s.name}</div>
                          <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                            <span style={{ background: color, color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{s.category}</span>
                            {s.subcategory && <span style={{ background: `${color}22`, color, borderRadius: 20, padding: '2px 8px', fontSize: 11 }}>{s.subcategory}</span>}
                          </div>
                          <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>📍 {s.city}, {s.district}</div>
                          <div style={{ fontSize: 13, color: '#445', marginBottom: 10, lineHeight: 1.55 }}>{s.description}</div>
                          <div style={{ fontSize: 13, color, marginBottom: 12 }}>
                            {s.phone && <span style={{ marginLeft: 12 }}>📞 {s.phone}</span>}
                            {s.email && <span>✉️ {s.email}</span>}
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button onClick={() => updateStatus(s.id, 'approved')} style={{ background: '#F47B20', color: 'white', border: 'none', borderRadius: 20, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✓ אשר</button>
                            <button onClick={() => openEdit(s)} style={{ background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✏️ ערוך</button>
                            <button onClick={() => updateStatus(s.id, 'rejected')} style={{ background: '#FFF0F0', color: '#C62828', border: '1.5px solid #FFCDD2', borderRadius: 20, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✕ דחה</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              ) : (
                approved.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}>אין שירותים פעילים</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {approved.map(s => {
                      const color = getCategoryColor(s.category, s.subcategory)
                      return (
                        <div key={s.id} style={{ background: 'white', borderRadius: 14, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRight: `4px solid ${color}` }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: '#1A3A5C', marginBottom: 2 }}>{s.name}</div>
                          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>📍 {s.city} · {s.category}{s.subcategory ? ` › ${s.subcategory}` : ''}</div>
                          {!s.lat && <div style={{ fontSize: 11, color: '#F47B20', marginBottom: 6 }}>⚠️ אין מיקום במפה</div>}
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button onClick={() => setLocationService(s)} style={{ background: s.lat ? '#E8F5E9' : '#FFF3E0', color: s.lat ? '#2E7D32' : '#E65100', border: `1.5px solid ${s.lat ? '#A5D6A7' : '#FFCC80'}`, borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>📍 {s.lat ? 'עדכן מיקום' : 'הוסף מיקום'}</button>
                            <button onClick={() => openEdit(s)} style={{ background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>✏️ ערוך</button>
                            <button onClick={() => deleteService(s.id)} style={{ background: 'none', border: '1.5px solid #FFCDD2', color: '#C62828', borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>🗑️ מחק</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              )}
            </>
          )}
        </main>

        {showExport && (
          <div onClick={() => setShowExport(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 480, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ height: 7, background: '#2E7D32', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1A3A5C' }}>📊 ייצוא לאקסל</h2>
                  <button onClick={() => setShowExport(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>סטטוס</label>
                  <select value={exportFilters.status} onChange={e => setExportFilters(f => ({ ...f, status: e.target.value }))} style={inp}>
                    <option value="">הכל</option>
                    <option value="approved">פעילים בלבד</option>
                    <option value="pending">ממתינים בלבד</option>
                    <option value="rejected">נדחו בלבד</option>
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>מחוז</label>
                  <select value={exportFilters.district} onChange={e => setExportFilters(f => ({ ...f, district: e.target.value }))} style={inp}>
                    <option value="">כל המחוזות</option>
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>קטגוריה</label>
                  <select value={exportFilters.category} onChange={e => setExportFilters(f => ({ ...f, category: e.target.value, subcategory: '' }))} style={inp}>
                    <option value="">כל הקטגוריות</option>
                    {CATEGORY_NAMES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {exportSubcategories.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>תת קטגוריה</label>
                    <select value={exportFilters.subcategory} onChange={e => setExportFilters(f => ({ ...f, subcategory: e.target.value }))} style={inp}>
                      <option value="">כל תתי הקטגוריות</option>
                      {exportSubcategories.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <div style={{ background: '#F0FFF4', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#2E7D32' }}>
                  הקובץ יכלול עיצוב צבעוני לפי קטגוריה, כותרות מודגשות ואפשרות סינון בכל עמודה
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={exportToExcel} disabled={exporting} style={{ flex: 1, background: '#2E7D32', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: exporting ? 'not-allowed' : 'pointer' }}>
                    {exporting ? 'מייצא...' : '📥 הורד אקסל'}
                  </button>
                  <button onClick={() => setShowExport(false)} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {editingService && (
          <div onClick={() => setEditingService(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ height: 7, background: '#F47B20', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1A3A5C' }}>✏️ עריכת שירות</h2>
                  <button onClick={() => setEditingService(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
                </div>
                {[['name','שם השירות','text'],['city','עיר','text'],['phone','טלפון','tel'],['email','מייל','email'],['address','כתובת','text'],['website','אתר אינטרנט','url']].map(([key, label, type]) => (
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
                  <label style={lbl}>קטגוריה</label>
                  <select value={editForm.category || ''} onChange={e => setEditForm(f => ({ ...f, category: e.target.value, subcategory: '' }))} style={inp}>
                    <option value="">בחרו קטגוריה</option>
                    {CATEGORY_NAMES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                {editSubcategories.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>תת קטגוריה</label>
                    <select value={editForm.subcategory || ''} onChange={e => setEditForm(f => ({ ...f, subcategory: e.target.value }))} style={inp}>
                      <option value="">בחרו תת קטגוריה</option>
                      {editSubcategories.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <div style={{ marginBottom: 22 }}>
                  <label style={lbl}>תיאור</label>
                  <textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inp, resize: 'vertical', borderRadius: 12 }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={saveEdit} disabled={saving} style={{ flex: 1, background: '#F47B20', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>
                    {saving ? 'שומר...' : '💾 שמור'}
                  </button>
                  <button onClick={() => setEditingService(null)} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {locationService && (
          <LocationPicker
            service={locationService}
            onSave={saveLocation}
            onClose={() => setLocationService(null)}
          />
        )}

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
          מאגר שירותי סל שיקום © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}

function LocationPicker({ service, onSave, onClose }) {
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [coords, setCoords] = useState(service.lat ? [service.lat, service.lng] : [31.5, 34.8])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')
    const map = L.map('location-map').setView(coords, service.lat ? 14 : 8)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    if (service.lat) {
      markerRef.current = L.marker([service.lat, service.lng], { draggable: true }).addTo(map)
      markerRef.current.on('dragend', e => {
        const pos = e.target.getLatLng()
        setCoords([pos.lat, pos.lng])
      })
    }
    map.on('click', e => {
      const { lat, lng } = e.latlng
      setCoords([lat, lng])
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map)
        markerRef.current.on('dragend', ev => {
          const pos = ev.target.getLatLng()
          setCoords([pos.lat, pos.lng])
        })
      }
    })
    mapRef.current = map
    return () => map.remove()
  }, [])

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 600, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ height: 7, background: '#F47B20', borderRadius: '20px 20px 0 0' }} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0, color: '#1A3A5C', fontSize: 16, fontWeight: 800 }}>📍 עדכון מיקום</h3>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{service.name} — לחצי על המפה</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
          </div>
          <div id="location-map" style={{ height: 320, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }} />
          {coords && (
            <div style={{ fontSize: 11, color: '#888', marginBottom: 10, textAlign: 'center' }}>
              {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => onSave(coords[0], coords[1])} style={{ flex: 1, background: '#F47B20', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              💾 שמור מיקום
            </button>
            <button onClick={onClose} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
