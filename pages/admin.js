import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { CATEGORIES, CATEGORY_NAMES, getCategoryColor } from '../lib/categories'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const DISTRICTS = ['צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']
const TREATMENT_CATEGORIES = ['בתים מאזנים', 'מחלקות אשפוז', 'מרפאות יום', 'מרפאות בריאות נפש', 'חדרי מיון', 'אשפוז בית', 'שירותים נוספים']
const TREATMENT_COLORS = { 'בתים מאזנים': '#0A3040', 'מחלקות אשפוז': '#0A6080', 'מרפאות יום': '#0891B2', 'מרפאות בריאות נפש': '#0284C7', 'חדרי מיון': '#06B6D4', 'אשפוז בית': '#0E7490', 'שירותים נוספים': '#0A6080' }

const CATEGORY_BG_COLORS = {
  'דיור': 'FFF3E5F5', 'תעסוקה': 'FFFFF3E0', 'השכלה': 'FFE3F2FD',
  'חברה ופנאי': 'FFE8F5E9', 'ליווי ותמיכה': 'FFE1F5FE',
  'טיפולי שיניים': 'FFFCE4EC', 'שירותים נוספים': 'FFECEFF1',
}
const CATEGORY_TEXT_COLORS = {
  'דיור': 'FF4C0080', 'תעסוקה': 'FF9B00CC', 'השכלה': 'FF1A3A5C',
  'חברה ופנאי': 'FF5E35B1', 'ליווי ותמיכה': 'FF0891B2',
  'טיפולי שיניים': 'FFC2185B', 'שירותים נוספים': 'FF546E7A',
}

const NAV = [['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', '✉️ צור קשר'], ['/admin', 'ניהול']]

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [pendingTreatment, setPendingTreatment] = useState([])
  const [approvedTreatment, setApprovedTreatment] = useState([])
  const [loading, setLoading] = useState(false)
  const [section, setSection] = useState('rehab')
  const [rehabTab, setRehabTab] = useState('pending')
  const [treatmentTab, setTreatmentTab] = useState('pending')
  const [adminKey, setAdminKey] = useState('')
  const [editingService, setEditingService] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [rehabSearch, setRehabSearch] = useState('')
  const [rehabSort, setRehabSort] = useState('date')
  const [treatmentSearch, setTreatmentSearch] = useState('')
  const [treatmentSort, setTreatmentSort] = useState('date')
  const [locationService, setLocationService] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [showExportRehab, setShowExportRehab] = useState(false)
  const [showExportTreatment, setShowExportTreatment] = useState(false)
  const [exportFilters, setExportFilters] = useState({ status: 'approved', district: '', category: '', subcategory: '' })
  const [exportTreatmentFilters, setExportTreatmentFilters] = useState({ status: 'approved', district: '', category: '' })
  const [exporting, setExporting] = useState(false)
  const [stats, setStats] = useState(null)
  const [duplicates, setDuplicates] = useState([])
  const [loadingDuplicates, setLoadingDuplicates] = useState(false)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [rejectEmailModal, setRejectEmailModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [sendingRejectEmail, setSendingRejectEmail] = useState(false)

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
      const [p, a, pt, at] = await Promise.all([
        fetch('/api/admin/services', { headers: { adminkey: key } }),
        fetch('/api/services'),
        fetch('/api/admin/treatment-services?status=pending', { headers: { adminkey: key } }),
        fetch('/api/admin/treatment-services?status=approved', { headers: { adminkey: key } }),
      ])
      setPending(await p.json())
      setApproved(await a.json())
      setPendingTreatment(await pt.json())
      setApprovedTreatment(await at.json())
    } finally { setLoading(false) }
  }

  const fetchStats = async (key) => {
    const res = await fetch('/api/admin/stats', { headers: { adminkey: key } })
    setStats(await res.json())
  }

  const fetchDuplicates = async (key) => {
    setLoadingDuplicates(true)
    try {
      const [rehabRes, treatmentRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/admin/treatment-services?status=approved', { headers: { adminkey: key } }),
      ])
      const rehab = await rehabRes.json()
      const treatment = await treatmentRes.json()
      const findDups = (list, type) => {
        const pairs = []
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i], b = list[j]
            const nameSim = a.name && b.name && (a.name.trim() === b.name.trim() || a.name.includes(b.name) || b.name.includes(a.name))
            const citySim = !a.city || !b.city || a.city.trim() === b.city.trim()
            const catSim = !a.category || !b.category || a.category === b.category
            if (nameSim && citySim && catSim) pairs.push({ a: { ...a, _type: type }, b: { ...b, _type: type }, dismissed: false })
          }
        }
        return pairs
      }
      setDuplicates([...findDups(Array.isArray(rehab) ? rehab : [], 'rehab'), ...findDups(Array.isArray(treatment) ? treatment : [], 'treatment')])
    } finally { setLoadingDuplicates(false) }
  }

  const fetchHistory = async (key) => {
    setLoadingHistory(true)
    try {
      const res = await fetch('/api/admin/history', { headers: { adminkey: key } })
      setHistory(await res.json())
    } finally { setLoadingHistory(false) }
  }

  useEffect(() => {
    if (authed) { fetchAll(adminKey); fetchStats(adminKey) }
  }, [authed])

  const updateStatus = async (id, status) => {
    await fetch('/api/admin/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', adminkey: adminKey },
      body: JSON.stringify({ id, status }),
    })
    if (status === 'approved') {
      const service = pending.find(s => s.id === id)
      if (service?.email) {
        await fetch('/api/admin/approve-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', adminkey: adminKey },
          body: JSON.stringify({ serviceName: service.name, serviceEmail: service.email, contactEmail: service.contact_email }),
        })
      }
    }
    fetchAll(adminKey); fetchStats(adminKey)
  }

  const updateTreatmentStatus = async (id, status) => {
    await fetch('/api/admin/treatment-services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', adminkey: adminKey },
      body: JSON.stringify({ id, status }),
    })
    fetchAll(adminKey)
  }

  const deleteTreatmentService = async (id) => {
    if (!confirm('למחוק שירות זה לצמיתות?')) return
    await fetch(`/api/admin/treatment-services?id=${id}`, { method: 'DELETE', headers: { adminkey: adminKey } })
    fetchAll(adminKey)
  }

  const deleteService = async (id) => {
    if (!confirm('למחוק שירות זה לצמיתות?')) return
    await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE', headers: { adminkey: adminKey } })
    fetchAll(adminKey)
  }

  const openEdit = (service, table = 'services') => {
    setEditingService(service)
    setEditForm({
      ...service,
      _table: table,
      age_groups: service.age_groups || [],
      diagnoses: service.diagnoses || [],
      populations: service.populations || [],
      categories: service.categories || [],
      districts: service.districts || [],
      is_regional: service.is_regional || false,
    })
  }

  const toggleEditArray = (field, value) => {
    setEditForm(f => {
      const arr = f[field] || []
      return arr.includes(value) ? { ...f, [field]: arr.filter(x => x !== value) } : { ...f, [field]: [...arr, value] }
    })
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      const { _table, ...fields } = editForm
      await fetch('/api/admin/edit', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', adminkey: adminKey },
        body: JSON.stringify({ ...fields, table: _table }),
      })
      setEditingService(null); fetchAll(adminKey)
    } finally { setSaving(false) }
  }

  const sendRejectEmail = async () => {
    if (!rejectEmailModal?.email) return
    setSendingRejectEmail(true)
    try {
      await fetch('/api/admin/reject-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', adminkey: adminKey },
        body: JSON.stringify({ serviceEmail: rejectEmailModal.email, contactEmail: rejectEmailModal.contactEmail, serviceName: rejectEmailModal.name, reason: rejectReason }),
      })
      setRejectEmailModal(null); setRejectReason('')
    } finally { setSendingRejectEmail(false) }
  }

  const saveLocation = async (lat, lng) => {
    const isTreatment = locationService._table === 'treatment'
    const endpoint = isTreatment ? '/api/admin/treatment-services' : '/api/admin/services'
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', adminkey: adminKey },
      body: JSON.stringify({ id: locationService.id, lat, lng }),
    })
    setLocationService(null); fetchAll(adminKey)
  }

  const clearLocation = async (id, table) => {
    if (!confirm('להסיר את המיקום מהמפה?')) return
    const isTreatment = table === 'treatment'
    const endpoint = isTreatment ? '/api/admin/treatment-services' : '/api/admin/services'
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', adminkey: adminKey },
      body: JSON.stringify({ id, lat: null, lng: null }),
    })
    fetchAll(adminKey)
  }

  const exportRehabToExcel = async () => {
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
      const ws = wb.addWorksheet('שירותי שיקום', { views: [{ rightToLeft: true }] })
      ws.columns = [
        { header: 'שם השירות', key: 'name', width: 28 }, { header: 'קטגוריה', key: 'category', width: 16 },
        { header: 'תת קטגוריה', key: 'subcategory', width: 18 }, { header: 'מחוז', key: 'district', width: 12 },
        { header: 'עיר', key: 'city', width: 14 }, { header: 'כתובת', key: 'address', width: 24 },
        { header: 'טלפון', key: 'phone', width: 16 }, { header: 'מייל', key: 'email', width: 26 },
        { header: 'אתר', key: 'website', width: 28 }, { header: 'תיאור', key: 'description', width: 40 },
        { header: 'ארצי', key: 'is_national', width: 10 }, { header: 'סטטוס', key: 'status', width: 12 },
        { header: 'תאריך הוספה', key: 'created_at', width: 16 },
      ]
      const headerRow = ws.getRow(1)
      headerRow.height = 28
      headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A3A5C' } }
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12, name: 'Arial' }
        cell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rightToLeft' }
        cell.border = { bottom: { style: 'medium', color: { argb: 'FFF47B20' } } }
      })
      data.forEach(s => {
        const row = ws.addRow({
          name: s.name, category: s.category, subcategory: s.subcategory || '',
          district: s.district, city: s.city, address: s.address || '',
          phone: s.phone || '', email: s.email || '', website: s.website || '',
          description: s.description || '', is_national: s.is_national ? '✓' : '',
          status: s.status === 'approved' ? 'פעיל' : s.status === 'pending' ? 'ממתין' : 'נדחה',
          created_at: new Date(s.created_at).toLocaleDateString('he-IL'),
        })
        const bg = CATEGORY_BG_COLORS[s.category] || 'FFFFFFFF'
        const textColor = CATEGORY_TEXT_COLORS[s.category] || 'FF333333'
        row.height = 22
        row.eachCell((cell, colNumber) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
          cell.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'rightToLeft' }
          cell.border = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } }, right: { style: 'thin', color: { argb: 'FFDDDDDD' } } }
          cell.font = colNumber === 2 ? { bold: true, color: { argb: textColor }, name: 'Arial' } : { color: { argb: 'FF333333' }, name: 'Arial' }
        })
      })
      ws.autoFilter = { from: 'A1', to: `M${data.length + 1}` }
      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `שירותי-שיקום-${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.xlsx`
      a.click(); URL.revokeObjectURL(url)
      setShowExportRehab(false)
    } finally { setExporting(false) }
  }

  const exportTreatmentToExcel = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (exportTreatmentFilters.status) params.set('status', exportTreatmentFilters.status)
      if (exportTreatmentFilters.district) params.set('district', exportTreatmentFilters.district)
      if (exportTreatmentFilters.category) params.set('category', exportTreatmentFilters.category)
      const res = await fetch(`/api/admin/export-treatment?${params}`, { headers: { adminkey: adminKey } })
      const data = await res.json()
      const ExcelJS = (await import('exceljs')).default
      const wb = new ExcelJS.Workbook()
      wb.views = [{ rightToLeft: true }]
      const ws = wb.addWorksheet('שירותי טיפול', { views: [{ rightToLeft: true }] })
      ws.columns = [
        { header: 'שם השירות', key: 'name', width: 28 }, { header: 'קטגוריה', key: 'category', width: 18 },
        { header: 'מחוז', key: 'district', width: 12 }, { header: 'עיר', key: 'city', width: 14 },
        { header: 'כתובת', key: 'address', width: 24 }, { header: 'טלפון', key: 'phone', width: 16 },
        { header: 'מייל', key: 'email', width: 26 }, { header: 'אתר', key: 'website', width: 28 },
        { header: 'תיאור', key: 'description', width: 40 }, { header: 'סטטוס', key: 'status', width: 12 },
        { header: 'תאריך הוספה', key: 'created_at', width: 16 },
      ]
      const CAT_COLORS = {
        'בתים מאזנים': { bg: 'FFE3F2FD', text: 'FF0891B2' }, 'מחלקות אשפוז': { bg: 'FFF3E5F5', text: 'FF7B2D8B' },
        'מרפאות יום': { bg: 'FFE8F5E9', text: 'FF164E63' }, 'מרפאות בריאות נפש': { bg: 'FFE0F2FE', text: 'FF0284C7' }, 'חדרי מיון': { bg: 'FFFFEBEE', text: 'FFC62828' },
      }
      const headerRow = ws.getRow(1)
      headerRow.height = 28
      headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0277BD' } }
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12, name: 'Arial' }
        cell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rightToLeft' }
        cell.border = { bottom: { style: 'medium', color: { argb: 'FF0288D1' } } }
      })
      data.forEach(s => {
        const row = ws.addRow({
          name: s.name, category: s.category, district: s.district, city: s.city,
          address: s.address || '', phone: s.phone || '', email: s.email || '',
          website: s.website || '', description: s.description || '',
          status: s.status === 'approved' ? 'פעיל' : s.status === 'pending' ? 'ממתין' : 'נדחה',
          created_at: new Date(s.created_at).toLocaleDateString('he-IL'),
        })
        const colors = CAT_COLORS[s.category] || { bg: 'FFFFFFFF', text: 'FF333333' }
        row.height = 22
        row.eachCell((cell, colNumber) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.bg } }
          cell.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'rightToLeft' }
          cell.border = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } }, right: { style: 'thin', color: { argb: 'FFDDDDDD' } } }
          cell.font = colNumber === 2 ? { bold: true, color: { argb: colors.text }, name: 'Arial' } : { color: { argb: 'FF333333' }, name: 'Arial' }
        })
      })
      ws.autoFilter = { from: 'A1', to: `K${data.length + 1}` }
      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `שירותי-טיפול-${new Date().toLocaleDateString('he-IL').replace(/\//g, '-')}.xlsx`
      a.click(); URL.revokeObjectURL(url)
      setShowExportTreatment(false)
    } finally { setExporting(false) }
  }

  const inp = { width: '100%', padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${editForm._table === 'treatment' ? '#a0d8e8' : '#d4b0f0'}`, fontSize: 14, background: editForm._table === 'treatment' ? '#f0faff' : '#f7f0ff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
  const lbl = { display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 5 }
  const isTreatmentEdit = editForm._table === 'treatment'
  const editSubcategories = (!isTreatmentEdit && editForm.category) ? CATEGORIES[editForm.category]?.subcategories || [] : []
  const exportSubcategories = exportFilters.category ? CATEGORIES[exportFilters.category]?.subcategories || [] : []

  if (!mounted) return null

  return (
    <>
      <Head>
        <title>ניהול | בריאות נפש בישראל</title>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f5f5f5' }}>
        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="לוגו" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>פאנל ניהול</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12, border: '1.5px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '32px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔐</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>פאנל ניהול</h1>
          <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>אישור, עריכה ומחיקת שירותים</p>
        </div>

        <main style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
          {!authed ? (
            <div style={{ maxWidth: 380, margin: '0 auto', background: 'white', borderRadius: 20, padding: '40px 24px', boxShadow: '0 4px 20px rgba(244,123,32,0.12)', border: '1.5px solid #FFE8D6', textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🔐</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18, color: '#1A3A5C' }}>כניסת מנהל</div>
              <input type="password" placeholder="סיסמת אדמין" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 20, border: '1.5px solid #C5D0F0', fontSize: 15, textAlign: 'center', letterSpacing: 4, marginBottom: 10, background: '#F0F7FF', outline: 'none', boxSizing: 'border-box' }} />
              {loginError && <div style={{ color: '#C62828', fontSize: 13, marginBottom: 8 }}>{loginError}</div>}
              <button onClick={login} style={{ width: '100%', background: '#1A3A5C', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>כניסה</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
                {[['♿', 'שיקום פעילים', approved.length, '#8B00D4'], ['⏳', 'שיקום ממתינים', pending.length, '#6B21A8'], ['🏥', 'טיפול פעילים', approvedTreatment.length, '#0891B2'], ['⏳', 'טיפול ממתינים', pendingTreatment.length, '#164E63']].map(([icon, label, val, color]) => (
                  <div key={label} style={{ background: 'white', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderRight: `5px solid ${color}`, boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
                    <span style={{ fontSize: 22 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 26, fontWeight: 800, color }}>{val}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                {[['rehab', '♿ שיקום', '#8B00D4'], ['treatment', '🏥 טיפול', '#0891B2'], ['duplicates', '🔁 כפילויות', '#5E35B1'], ['stats', '📊 סטטיסטיקות', '#2A5298'], ['history', '📝 היסטוריה', '#5E35B1']].map(([id, label, color]) => (
                  <button key={id} onClick={() => { setSection(id); if (id === 'duplicates') fetchDuplicates(adminKey); if (id === 'history') fetchHistory(adminKey) }}
                    style={{ flex: 1, minWidth: 120, padding: '14px 0', borderRadius: 16, fontWeight: 800, fontSize: 15, background: section === id ? color : 'white', color: section === id ? 'white' : color, border: `2px solid ${color}`, cursor: 'pointer', boxShadow: section === id ? `0 4px 16px ${color}44` : 'none' }}>
                    {label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 48, color: '#8B00D4' }}>טוען...</div>
              ) : section === 'stats' ? (
                <StatsTab stats={stats} />
              ) : section === 'history' ? (
                <HistoryTab history={history} loading={loadingHistory} />
              ) : section === 'duplicates' ? (
                <DuplicatesTab
                  duplicates={duplicates} loading={loadingDuplicates}
                  onDismiss={(i) => setDuplicates(d => d.map((p, idx) => idx === i ? { ...p, dismissed: true } : p))}
                  onDelete={async (id, type) => {
                    if (!confirm('למחוק שירות זה לצמיתות?')) return
                    if (type === 'treatment') await fetch(`/api/admin/treatment-services?id=${id}`, { method: 'DELETE', headers: { adminkey: adminKey } })
                    else await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE', headers: { adminkey: adminKey } })
                    fetchDuplicates(adminKey); fetchAll(adminKey)
                  }}
                />
              ) : section === 'rehab' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[['pending', `⏳ ממתינים (${pending.length})`], ['approved', `✅ פעילים (${approved.length})`]].map(([id, label]) => (
                        <button key={id} onClick={() => setRehabTab(id)} style={{ padding: '9px 18px', borderRadius: 20, fontWeight: 700, fontSize: 13, background: rehabTab === id ? '#8B00D4' : 'white', color: rehabTab === id ? 'white' : '#8B00D4', border: rehabTab === id ? 'none' : '1.5px solid #d4b0f0', cursor: 'pointer' }}>{label}</button>
                      ))}
                    </div>
                    <button onClick={() => setShowExportRehab(true)} style={{ background: '#164E63', color: 'white', border: 'none', borderRadius: 20, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>📥 ייצוא לאקסל</button>
                  </div>

                  {rehabTab === 'pending' ? (
                    pending.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}><div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div><div style={{ fontWeight: 600 }}>אין בקשות ממתינות</div></div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {pending.map(s => {
                          const color = getCategoryColor(s.category, s.subcategory)
                          return (
                            <div key={s.id} style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', borderRight: `5px solid ${color}` }}>
                              <div style={{ fontWeight: 700, fontSize: 16, color: '#1A3A5C', marginBottom: 4 }}>{s.name} {s.is_national && <span title="פריסה ארצית">🌍</span>}</div>
                              <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                                <span style={{ background: color, color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{s.category}</span>
                                {s.subcategory && <span style={{ background: `${color}22`, color, borderRadius: 20, padding: '2px 8px', fontSize: 11 }}>{s.subcategory}</span>}
                              </div>
                              <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>📍 {s.city}, {s.district}{s.districts?.length > 0 && <span style={{ marginRight: 6, fontSize: 11, color: '#9B00CC' }}>+ {s.districts.join(', ')}</span>}</div>
                              <div style={{ fontSize: 13, color: '#445', marginBottom: 10, lineHeight: 1.55 }}>{s.description}</div>
                              <div style={{ fontSize: 13, color, marginBottom: 12 }}>
                                {s.phone && <span style={{ marginLeft: 12 }}>📞 {s.phone}</span>}
                                {s.email && <span>✉️ {s.email}</span>}
                              </div>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button onClick={() => updateStatus(s.id, 'approved')} style={{ background: '#8B00D4', color: 'white', border: 'none', borderRadius: 20, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✓ אשר</button>
                                <button onClick={() => openEdit(s, 'services')} style={{ background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✏️ ערוך</button>
                                <button onClick={() => setLocationService({ ...s, _table: 'services' })} style={{ background: s.lat ? '#E8F5E9' : '#FFF3E0', color: s.lat ? '#2E7D32' : '#6B21A8', border: `1.5px solid ${s.lat ? '#A5D6A7' : '#d4b0f0'}`, borderRadius: 20, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>📍 {s.lat ? 'עדכן מיקום' : 'הוסף מיקום'}</button>
                                {s.lat && <button onClick={() => clearLocation(s.id, 'services')} style={{ background: '#FFF3E0', color: '#C62828', border: '1.5px solid #FFCCBC', borderRadius: 20, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>🗑️ הסר מיקום</button>}
                                <button onClick={() => updateStatus(s.id, 'rejected')} style={{ background: '#FFF0F0', color: '#C62828', border: '1.5px solid #FFCDD2', borderRadius: 20, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✕ דחה</button>
                                {s.email && <button onClick={() => { updateStatus(s.id, 'rejected'); setRejectEmailModal({ name: s.name, email: s.email, contactEmail: s.contact_email }) }} style={{ background: '#FFF0F0', color: '#C62828', border: '1.5px solid #FFCDD2', borderRadius: 20, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✕ דחה + מייל</button>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                        <input placeholder="חיפוש..." value={rehabSearch} onChange={e => setRehabSearch(e.target.value)} style={{ flex: 1, minWidth: 180, padding: '8px 14px', borderRadius: 20, border: '1.5px solid #d4b0f0', fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#f7f0ff' }} />
                        <select value={rehabSort} onChange={e => setRehabSort(e.target.value)} style={{ padding: '8px 14px', borderRadius: 20, border: '1.5px solid #d4b0f0', fontSize: 13, background: '#f7f0ff', fontFamily: 'inherit', cursor: 'pointer' }}>
                          <option value="date">מיון: תאריך</option>
                          <option value="name">מיון: שם</option>
                          <option value="district">מיון: מחוז</option>
                        </select>
                      </div>
                      {(() => {
                        const filtered = approved
                          .filter(s => !rehabSearch || s.name?.includes(rehabSearch) || s.city?.includes(rehabSearch) || s.district?.includes(rehabSearch))
                          .sort((a, b) => rehabSort === 'name' ? (a.name || '').localeCompare(b.name || '') : rehabSort === 'district' ? (a.district || '').localeCompare(b.district || '') : new Date(b.created_at) - new Date(a.created_at))
                        return filtered.length === 0 ? <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}>אין תוצאות</div> : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {filtered.map(s => {
                              const color = getCategoryColor(s.category, s.subcategory)
                              return (
                                <div key={s.id} style={{ background: 'white', borderRadius: 14, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRight: `4px solid ${color}` }}>
                                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1A3A5C', marginBottom: 2 }}>{s.name} {s.is_national && <span title="פריסה ארצית">🌍</span>}</div>
                                  <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>📍 {s.city} · {s.category}{s.subcategory ? ` › ${s.subcategory}` : ''}{s.districts?.length > 0 && <span style={{ marginRight: 6, color: '#9B00CC' }}>· {s.districts.join(', ')}</span>}</div>
                                  {!s.lat && <div style={{ fontSize: 11, color: '#8B00D4', marginBottom: 6 }}>⚠️ אין מיקום במפה</div>}
                                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <button onClick={() => openEdit(s, 'services')} style={{ background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>✏️ ערוך</button>
                                    <button onClick={() => setLocationService({ ...s, _table: 'services' })} style={{ background: s.lat ? '#f0fff4' : '#f7f0ff', color: s.lat ? '#2E7D32' : '#6B21A8', border: `1.5px solid ${s.lat ? '#A5D6A7' : '#d4b0f0'}`, borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>📍 {s.lat ? 'עדכן מיקום' : 'הוסף מיקום'}</button>
                                    {s.lat && <button onClick={() => clearLocation(s.id, 'services')} style={{ background: '#FFF3E0', color: '#C62828', border: '1.5px solid #FFCCBC', borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>🗑️ הסר מיקום</button>}
                                    <button onClick={() => deleteService(s.id)} style={{ background: 'none', border: '1.5px solid #FFCDD2', color: '#C62828', borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>🗑️ מחק</button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[['pending', `⏳ ממתינים (${pendingTreatment.length})`], ['approved', `✅ פעילים (${approvedTreatment.length})`]].map(([id, label]) => (
                        <button key={id} onClick={() => setTreatmentTab(id)} style={{ padding: '9px 18px', borderRadius: 20, fontWeight: 700, fontSize: 13, background: treatmentTab === id ? '#0891B2' : 'white', color: treatmentTab === id ? 'white' : '#0891B2', border: treatmentTab === id ? 'none' : '1.5px solid #a0d8e8', cursor: 'pointer' }}>{label}</button>
                      ))}
                    </div>
                    <button onClick={() => setShowExportTreatment(true)} style={{ background: '#164E63', color: 'white', border: 'none', borderRadius: 20, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>📥 ייצוא לאקסל</button>
                  </div>

                  {treatmentTab === 'approved' && (
                    <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                      <input placeholder="חיפוש..." value={treatmentSearch} onChange={e => setTreatmentSearch(e.target.value)} style={{ flex: 1, minWidth: 180, padding: '8px 14px', borderRadius: 20, border: '1.5px solid #B3D4E8', fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#f0faff' }} />
                      <select value={treatmentSort} onChange={e => setTreatmentSort(e.target.value)} style={{ padding: '8px 14px', borderRadius: 20, border: '1.5px solid #B3D4E8', fontSize: 13, background: '#f0faff', fontFamily: 'inherit', cursor: 'pointer' }}>
                        <option value="date">מיון: תאריך</option>
                        <option value="name">מיון: שם</option>
                        <option value="district">מיון: מחוז</option>
                      </select>
                    </div>
                  )}
                  {(() => {
                    const base = treatmentTab === 'pending' ? pendingTreatment : approvedTreatment
                    const filtered = treatmentTab === 'approved'
                      ? base.filter(s => !treatmentSearch || s.name?.includes(treatmentSearch) || s.city?.includes(treatmentSearch) || s.district?.includes(treatmentSearch))
                        .sort((a, b) => treatmentSort === 'name' ? (a.name || '').localeCompare(b.name || '') : treatmentSort === 'district' ? (a.district || '').localeCompare(b.district || '') : new Date(b.created_at) - new Date(a.created_at))
                      : base
                    return filtered.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}><div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div><div style={{ fontWeight: 600 }}>אין שירותים</div></div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filtered.map(s => {
                          const color = TREATMENT_COLORS[s.category] || '#0891B2'
                          return (
                            <div key={s.id} style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRight: `4px solid ${color}` }}>
                              <div style={{ fontWeight: 700, fontSize: 15, color: '#1A3A5C', marginBottom: 4 }}>{s.name} {s.is_national && <span title="פריסה ארצית">🌍</span>}</div>
                              <span style={{ background: color, color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{s.category}</span>
                              <div style={{ fontSize: 13, color: '#888', margin: '6px 0' }}>📍 {s.city}, {s.district}{s.districts?.length > 0 && <span style={{ marginRight: 6, fontSize: 11, color: '#0891B2' }}>+ {s.districts.join(', ')}</span>}</div>
                              {s.description && <div style={{ fontSize: 13, color: '#445', marginBottom: 8, lineHeight: 1.55 }}>{s.description}</div>}
                              <div style={{ fontSize: 13, color, marginBottom: 10 }}>
                                {s.phone && <span style={{ marginLeft: 12 }}>📞 {s.phone}</span>}
                                {s.email && <span>✉️ {s.email}</span>}
                              </div>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {treatmentTab === 'pending' ? (
                                  <>
                                    <button onClick={() => updateTreatmentStatus(s.id, 'approved')} style={{ background: '#0891B2', color: 'white', border: 'none', borderRadius: 20, padding: '7px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✓ אשר</button>
                                    <button onClick={() => openEdit(s, 'treatment')} style={{ background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '7px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✏️ ערוך</button>
                                    <button onClick={() => updateTreatmentStatus(s.id, 'rejected')} style={{ background: '#FFF0F0', color: '#C62828', border: '1.5px solid #FFCDD2', borderRadius: 20, padding: '7px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✕ דחה</button>
                                    {s.email && <button onClick={() => { updateTreatmentStatus(s.id, 'rejected'); setRejectEmailModal({ name: s.name, email: s.email, contactEmail: s.contact_email }) }} style={{ background: '#FFF0F0', color: '#C62828', border: '1.5px solid #FFCDD2', borderRadius: 20, padding: '7px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>✕ דחה + מייל</button>}
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => openEdit(s, 'treatment')} style={{ background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>✏️ ערוך</button>
                                    <button onClick={() => setLocationService({ ...s, _table: 'treatment' })} style={{ background: s.lat ? '#E8F5E9' : '#FFF3E0', color: s.lat ? '#2E7D32' : '#6B21A8', border: `1.5px solid ${s.lat ? '#A5D6A7' : '#d4b0f0'}`, borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>📍 {s.lat ? 'עדכן מיקום' : 'הוסף מיקום'}</button>
                                    {s.lat && <button onClick={() => clearLocation(s.id, 'treatment')} style={{ background: '#FFF3E0', color: '#C62828', border: '1.5px solid #FFCCBC', borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>🗑️ הסר מיקום</button>}
                                    <button onClick={() => deleteTreatmentService(s.id)} style={{ background: 'none', border: '1.5px solid #FFCDD2', color: '#C62828', borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>🗑️ מחק</button>
                                  </>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              )}
            </>
          )}
        </main>

        {rejectEmailModal && (
          <div onClick={() => setRejectEmailModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 480, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ height: 7, background: '#C62828', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1A3A5C' }}>✉️ שלח מייל דחייה</h2>
                  <button onClick={() => setRejectEmailModal(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
                </div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>שליחת מייל אל <strong>{rejectEmailModal.contactEmail || rejectEmailModal.email}</strong> בנוגע לבקשת <strong>{rejectEmailModal.name}</strong></div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 6 }}>סיבת הדחייה <span style={{ fontWeight: 400, color: '#aaa' }}>(אופציונלי)</span></label>
                  <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} placeholder="למשל: השירות אינו תואם את קריטריוני האתר, פרטים חסרים..." style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #FFCDD2', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={sendRejectEmail} disabled={sendingRejectEmail} style={{ flex: 1, background: '#C62828', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: sendingRejectEmail ? 'not-allowed' : 'pointer' }}>{sendingRejectEmail ? 'שולח...' : '✉️ שלח מייל'}</button>
                  <button onClick={() => setRejectEmailModal(null)} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showExportRehab && (
          <div onClick={() => setShowExportRehab(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 480, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ height: 7, background: '#4C0080', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#4C0080' }}>📥 ייצוא שיקום לאקסל</h2>
                  <button onClick={() => setShowExportRehab(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
                </div>
                {[['status', 'סטטוס', [['', 'הכל'], ['approved', 'פעילים'], ['pending', 'ממתינים'], ['rejected', 'נדחו']]], ['district', 'מחוז', [['', 'כל המחוזות'], ...DISTRICTS.map(d => [d, d])]], ['category', 'קטגוריה', [['', 'כל הקטגוריות'], ...CATEGORY_NAMES.map(c => [c, c])]]].map(([key, label, opts]) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label style={lbl}>{label}</label>
                    <select value={exportFilters[key]} onChange={e => setExportFilters(f => ({ ...f, [key]: e.target.value, ...(key === 'category' ? { subcategory: '' } : {}) }))} style={inp}>
                      {opts.map(([val, txt]) => <option key={val} value={val}>{txt}</option>)}
                    </select>
                  </div>
                ))}
                {exportSubcategories.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>תת קטגוריה</label>
                    <select value={exportFilters.subcategory} onChange={e => setExportFilters(f => ({ ...f, subcategory: e.target.value }))} style={inp}>
                      <option value="">כל תתי הקטגוריות</option>
                      {exportSubcategories.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button onClick={exportRehabToExcel} disabled={exporting} style={{ flex: 1, background: '#4C0080', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: exporting ? 'not-allowed' : 'pointer' }}>{exporting ? 'מייצא...' : '📥 הורד אקסל'}</button>
                  <button onClick={() => setShowExportRehab(false)} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showExportTreatment && (
          <div onClick={() => setShowExportTreatment(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 480, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ height: 7, background: '#0891B2', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0891B2' }}>📥 ייצוא טיפול לאקסל</h2>
                  <button onClick={() => setShowExportTreatment(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
                </div>
                {[['status', 'סטטוס', [['', 'הכל'], ['approved', 'פעילים'], ['pending', 'ממתינים'], ['rejected', 'נדחו']]], ['district', 'מחוז', [['', 'כל המחוזות'], ...DISTRICTS.map(d => [d, d])]], ['category', 'קטגוריה', [['', 'כל הקטגוריות'], ...TREATMENT_CATEGORIES.map(c => [c, c])]]].map(([key, label, opts]) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label style={lbl}>{label}</label>
                    <select value={exportTreatmentFilters[key]} onChange={e => setExportTreatmentFilters(f => ({ ...f, [key]: e.target.value }))} style={inp}>
                      {opts.map(([val, txt]) => <option key={val} value={val}>{txt}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button onClick={exportTreatmentToExcel} disabled={exporting} style={{ flex: 1, background: '#0891B2', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: exporting ? 'not-allowed' : 'pointer' }}>{exporting ? 'מייצא...' : '📥 הורד אקסל'}</button>
                  <button onClick={() => setShowExportTreatment(false)} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* מודל עריכה */}
        {editingService && (
          <div onClick={() => setEditingService(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ height: 7, background: isTreatmentEdit ? '#0891B2' : '#8B00D4', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1A3A5C' }}>✏️ עריכת שירות {isTreatmentEdit ? 'טיפול' : 'שיקום'}</h2>
                  <button onClick={() => setEditingService(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
                </div>

                {[['name', 'שם השירות', 'text'], ['city', 'עיר', 'text'], ['phone', 'טלפון', 'tel'], ['email', 'מייל', 'email'], ['address', 'כתובת', 'text'], ['website', 'אתר אינטרנט', 'url']].map(([key, label, type]) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label style={lbl}>{label}</label>
                    <input type={type} value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
                  </div>
                ))}

                {/* מחוז ראשי */}
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>מחוז ראשי</label>
                  <select value={editForm.district || ''} onChange={e => setEditForm(f => ({ ...f, district: e.target.value }))} style={inp}>
                    <option value="">בחרו מחוז</option>
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                {/* מחוזות נוספים */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 6 }}>
                    מחוזות נוספים
                    <span style={{ fontWeight: 400, color: '#9ca3af', marginRight: 6 }}>(לשירות איזורי המשרת כמה מחוזות)</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {DISTRICTS.map(d => {
                      const sel = (editForm.districts || []).includes(d)
                      return (
                        <button key={d} type="button" onClick={() => toggleEditArray('districts', d)} style={{
                          padding: '5px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 700,
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                          border: `1.5px solid ${sel ? '#1A3A5C' : '#d4b0f0'}`,
                          background: sel ? '#1A3A5C' : 'white',
                          color: sel ? 'white' : '#555',
                        }}>{d}</button>
                      )
                    })}
                  </div>
                  {(editForm.districts || []).length > 0 && (
                    <div style={{ fontSize: 12, color: '#9b88bb', marginTop: 6, fontWeight: 600 }}>
                      ✓ נבחרו: {editForm.districts.join(', ')}
                    </div>
                  )}
                </div>

                {/* קטגוריה */}
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>קטגוריה</label>
                  <select value={editForm.category || ''} onChange={e => setEditForm(f => ({ ...f, category: e.target.value, subcategory: '' }))} style={inp}>
                    <option value="">בחרו קטגוריה</option>
                    {isTreatmentEdit ? TREATMENT_CATEGORIES.map(c => <option key={c}>{c}</option>) : CATEGORY_NAMES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {!isTreatmentEdit && editSubcategories.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl}>תת קטגוריה</label>
                    <select value={editForm.subcategory || ''} onChange={e => setEditForm(f => ({ ...f, subcategory: e.target.value }))} style={inp}>
                      <option value="">בחרו תת קטגוריה</option>
                      {editSubcategories.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>תיאור</label>
                  <textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inp, resize: 'vertical', borderRadius: 12 }} />
                </div>

                {/* קבוצות גיל */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 6 }}>קבוצות גיל</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(isTreatmentEdit
                      ? ['ילדים', 'נוער', 'צעירים', 'מבוגרים', 'קשישים']
                      : ['צעירים', 'מבוגרים', 'קשישים']
                    ).map(ag => {
                      const sel = (editForm.age_groups || []).includes(ag)
                      return <button key={ag} type="button" onClick={() => toggleEditArray('age_groups', ag)} style={{ padding: '5px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${sel ? '#8B00D4' : '#d4b0f0'}`, background: sel ? '#8B00D4' : 'white', color: sel ? 'white' : '#555', fontFamily: 'inherit' }}>{ag}</button>
                    })}
                  </div>
                </div>

                {/* אבחנות */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 6 }}>אבחנות / התמחויות</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['הפרעות אכילה', 'OCD', 'פוסט טראומה', 'פוסט טראומה מורכבת', 'התמכרויות'].map(d => {
                      const sel = (editForm.diagnoses || []).includes(d)
                      return <button key={d} type="button" onClick={() => toggleEditArray('diagnoses', d)} style={{ padding: '5px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${sel ? '#0E7490' : '#c8eaf2'}`, background: sel ? '#0E7490' : 'white', color: sel ? 'white' : '#0E7490', fontFamily: 'inherit' }}>{d}</button>
                    })}
                  </div>
                </div>

                {/* אוכלוסייה */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 6 }}>אוכלוסייה ייעודית</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['נשים', 'דתי/מסורתי', 'חרדי', 'להט"ב'].map(p => {
                      const sel = (editForm.populations || []).includes(p)
                      return <button key={p} type="button" onClick={() => toggleEditArray('populations', p)} style={{ padding: '5px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${sel ? '#5E35B1' : '#e0d0f0'}`, background: sel ? '#5E35B1' : 'white', color: sel ? 'white' : '#5E35B1', fontFamily: 'inherit' }}>{p}</button>
                    })}
                  </div>
                </div>

                {/* קטגוריות נוספות */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 6 }}>קטגוריות נוספות</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(isTreatmentEdit
                      ? TREATMENT_CATEGORIES.filter(c => c !== editForm.category)
                      : CATEGORY_NAMES.filter(c => c !== editForm.category)
                    ).map(cat => {
                      const sel = (editForm.categories || []).includes(cat)
                      const catColor = isTreatmentEdit ? '#0891B2' : getCategoryColor(cat)
                      return <button key={cat} type="button" onClick={() => toggleEditArray('categories', cat)} style={{ padding: '5px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${sel ? catColor : (isTreatmentEdit ? '#a0d8e8' : '#e0d0f0')}`, background: sel ? catColor : 'white', color: sel ? 'white' : catColor, fontFamily: 'inherit' }}>{cat}</button>
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 14, background: '#f0f7ff', borderRadius: 12, padding: '12px 14px', border: '1.5px solid #c5d0f0' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={editForm.is_regional || false} onChange={e => setEditForm(f => ({ ...f, is_regional: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#1A3A5C', cursor: 'pointer' }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1A3A5C' }}>🗺️ שירות איזורי</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>יוצג במפה בנקודות מרכז המחוזות הנבחרים, בנוסף למיקומו הספציפי</div>
                    </div>
                  </label>
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={editForm.is_national || false} onChange={e => setEditForm(f => ({ ...f, is_national: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#8B00D4', cursor: 'pointer' }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1A3A5C' }}>🌍 פריסה ארצית</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={saveEdit} disabled={saving} style={{ flex: 1, background: isTreatmentEdit ? '#0891B2' : '#8B00D4', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'שומר...' : '💾 שמור'}</button>
                  <button onClick={() => setEditingService(null)} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {locationService && <LocationPicker service={locationService} onSave={saveLocation} onClose={() => setLocationService(null)} />}

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
          <div style={{ marginBottom: 8 }}><a href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>✉️ צור קשר</a></div>
          בריאות נפש בישראל © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}

function DuplicatesTab({ duplicates, loading, onDismiss, onDelete }) {
  const active = duplicates.filter(p => !p.dismissed)
  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: '#7B2D8B' }}>מחפש כפילויות...</div>
  if (active.length === 0) return <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}><div style={{ fontSize: 40, marginBottom: 10 }}>✅</div><div style={{ fontWeight: 600 }}>לא נמצאו כפילויות</div></div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 13, color: '#7B2D8B', fontWeight: 700, background: '#F3E5F5', borderRadius: 10, padding: '8px 14px' }}>נמצאו {active.length} זוגות חשודים - בדקו ומחקו כפילויות לפי הצורך</div>
      {duplicates.map((pair, i) => {
        if (pair.dismissed) return null
        const typeLabel = pair.a._type === 'rehab' ? '♿ שיקום' : '🏥 טיפול'
        const typeColor = pair.a._type === 'rehab' ? '#8B00D4' : '#0891B2'
        return (
          <div key={i} style={{ background: 'white', borderRadius: 16, padding: '18px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', borderRight: '5px solid #7B2D8B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ background: typeColor, color: 'white', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{typeLabel}</span>
              <button onClick={() => onDismiss(i)} style={{ background: 'none', border: '1.5px solid #ddd', color: '#aaa', borderRadius: 20, padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>התעלם</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'start' }}>
              {[pair.a, pair.b].map((s, si) => (
                <div key={si} style={{ background: '#F8F9FF', borderRadius: 12, padding: '12px 14px', border: '1.5px solid #E0E4F0' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1A3A5C', marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 6, lineHeight: 1.6 }}>📍 {s.city}{s.district ? `, ${s.district}` : ''}<br />🏷️ {s.category}<br />{s.phone && <span>📞 {s.phone}</span>}</div>
                  <button onClick={() => onDelete(s.id, s._type)} style={{ background: '#FFF0F0', border: '1.5px solid #FFCDD2', color: '#C62828', borderRadius: 20, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>🗑️ מחק זה</button>
                </div>
              ))}
              <div style={{ textAlign: 'center', fontSize: 20, color: '#7B2D8B', paddingTop: 20 }}>🔁</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HistoryTab({ history, loading }) {
  const FIELD_NAMES = {
    name: 'שם', district: 'מחוז', districts: 'מחוזות נוספים', city: 'עיר', category: 'קטגוריה',
    subcategory: 'תת-קטגוריה', description: 'תיאור', phone: 'טלפון', email: 'מייל',
    website: 'אתר', address: 'כתובת', is_national: 'פריסה ארצית', age_groups: 'קבוצות גיל',
    diagnoses: 'אבחנות', populations: 'אוכלוסייה', categories: 'קטגוריות נוספות'
  }
  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: '#5E35B1' }}>טוען היסטוריה...</div>
  if (!history.length) return <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}><div style={{ fontSize: 40, marginBottom: 10 }}>📝</div><div style={{ fontWeight: 600 }}>אין היסטוריית שינויים עדיין</div></div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {history.map((entry, i) => {
        const changes = entry.changes || {}
        const keys = Object.keys(changes)
        const isRehab = entry.table_name === 'services'
        const color = isRehab ? '#8B00D4' : '#0891B2'
        return (
          <div key={i} style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRight: `4px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1A3A5C' }}>{entry.service_name}</span>
                <span style={{ marginRight: 8, fontSize: 11, background: `${color}22`, color, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{isRehab ? 'שיקום' : 'טיפול'}</span>
              </div>
              <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(entry.changed_at).toLocaleString('he-IL')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {keys.map(key => (
                <div key={key} style={{ fontSize: 12, background: '#f9f9f9', borderRadius: 8, padding: '8px 10px' }}>
                  <span style={{ fontWeight: 700, color: '#555' }}>{FIELD_NAMES[key] || key}: </span>
                  <span style={{ color: '#C62828', textDecoration: 'line-through', marginLeft: 6 }}>{Array.isArray(changes[key].before) ? (changes[key].before.join(', ') || '-') : String(changes[key].before ?? '-')}</span>
                  <span style={{ margin: '0 6px', color: '#aaa' }}>→</span>
                  <span style={{ color: '#2E7D32', fontWeight: 600 }}>{Array.isArray(changes[key].after) ? (changes[key].after.join(', ') || '-') : String(changes[key].after ?? '-')}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StatsTab({ stats }) {
  const [activeTab, setActiveTab] = useState('rehab')
  if (!stats) return <div style={{ textAlign: 'center', padding: 48, color: '#8B00D4' }}>טוען סטטיסטיקות...</div>
  const COLORS = ['#8B00D4', '#4C0080', '#6B21A8', '#0891B2', '#164E63', '#5E35B1', '#CE66F0']
  const districts = ['צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']
  const isRehab = activeTab === 'rehab'
  const byCategory = isRehab ? stats.byCategory : stats.byCategoryTreatment
  const byDistrict = isRehab ? stats.byDistrict : stats.byDistrictTreatment
  const crossTable = isRehab ? stats.crossTable : stats.crossTableTreatment
  const cats = Object.keys(crossTable || {})
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ fontWeight: 800, fontSize: 16, color: '#1A3A5C' }}>♿ סטטיסטיקות שיקום</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {[['סה"כ שירותים', stats.total, '#1A3A5C', '📋'], ['פעילים', stats.approved, '#8B00D4', '✅'], ['ממתינים', stats.pending, '#6B21A8', '⏳'], ['נדחו', stats.rejected, '#C62828', '❌']].map(([label, val, color, icon]) => (
          <div key={label} style={{ background: 'white', borderRadius: 16, padding: '18px 16px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', borderTop: `4px solid ${color}` }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ fontWeight: 800, fontSize: 16, color: '#0891B2' }}>🏥 סטטיסטיקות טיפול</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {[['סה"כ שירותים', stats.totalTreatment, '#1A3A5C', '📋'], ['פעילים', stats.approvedTreatment, '#0891B2', '✅'], ['ממתינים', stats.pendingTreatment, '#164E63', '⏳'], ['נדחו', stats.rejectedTreatment, '#C62828', '❌']].map(([label, val, color, icon]) => (
          <div key={label} style={{ background: 'white', borderRadius: 16, padding: '18px 16px', textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', borderTop: `4px solid ${color}` }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setActiveTab('rehab')} style={{ padding: '8px 20px', borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: isRehab ? '#1A3A5C' : 'white', color: isRehab ? 'white' : '#1A3A5C', border: '2px solid #1A3A5C', fontFamily: "'Nunito', sans-serif" }}>♿ שיקום</button>
        <button onClick={() => setActiveTab('treatment')} style={{ padding: '8px 20px', borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: !isRehab ? '#0891B2' : 'white', color: !isRehab ? 'white' : '#0891B2', border: '2px solid #0891B2', fontFamily: "'Nunito', sans-serif" }}>🏥 טיפול</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#1A3A5C' }}>🥧 לפי קטגוריה</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                {(byCategory || []).map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#1A3A5C' }}>📊 לפי מחוז</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byDistrict} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="שירותים" radius={[6, 6, 0, 0]}>
                {(byDistrict || []).map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: 16, padding: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', overflowX: 'auto' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: '#1A3A5C' }}>📋 פירוט לפי קטגוריה ומחוז</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#1A3A5C', color: 'white' }}>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>קטגוריה</th>
              {districts.map(d => <th key={d} style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>{d}</th>)}
              <th style={{ padding: '10px 14px', textAlign: 'center', background: '#4C0080' }}>סה"כ</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((cat, i) => {
              const color = getCategoryColor(cat)
              const total = districts.reduce((sum, d) => sum + ((crossTable[cat] || {})[d] || 0), 0)
              return (
                <tr key={cat} style={{ background: i % 2 === 0 ? '#FFF8F3' : 'white' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color, borderRight: `3px solid ${color}` }}>{cat}</td>
                  {districts.map(d => (
                    <td key={d} style={{ padding: '10px', textAlign: 'center', color: (crossTable[cat] || {})[d] ? '#1A3A5C' : '#ddd', fontWeight: (crossTable[cat] || {})[d] ? 700 : 400 }}>
                      {(crossTable[cat] || {})[d] || '–'}
                    </td>
                  ))}
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#4C0080' }}>{total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LocationPicker({ service, onSave, onClose }) {
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [coords, setCoords] = useState(service.lat ? [service.lat, service.lng] : [31.5, 34.8])
  const [searchQuery, setSearchQuery] = useState(service.address ? `${service.address}, ${service.city}` : service.city || '')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')
    const map = L.map('location-map').setView(coords, service.lat ? 14 : 8)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    if (service.lat) {
      markerRef.current = L.marker([service.lat, service.lng], { draggable: true }).addTo(map)
      markerRef.current.on('dragend', e => { const pos = e.target.getLatLng(); setCoords([pos.lat, pos.lng]) })
    }
    map.on('click', e => {
      const { lat, lng } = e.latlng
      setCoords([lat, lng])
      if (markerRef.current) { markerRef.current.setLatLng([lat, lng]) }
      else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map)
        markerRef.current.on('dragend', ev => { const pos = ev.target.getLatLng(); setCoords([pos.lat, pos.lng]) })
      }
    })
    mapRef.current = map
    return () => map.remove()
  }, [])

  const searchAddress = async () => {
    if (!searchQuery.trim()) return
    setSearching(true); setSearchError('')
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&countrycodes=il`)
      const data = await res.json()
      if (data.length === 0) { setSearchError('הכתובת לא נמצאה, נסו לחפש בצורה שונה'); return }
      const { lat, lon } = data[0]
      const newCoords = [parseFloat(lat), parseFloat(lon)]
      setCoords(newCoords)
      const L = require('leaflet')
      mapRef.current.setView(newCoords, 16)
      if (markerRef.current) { markerRef.current.setLatLng(newCoords) }
      else {
        markerRef.current = L.marker(newCoords, { draggable: true }).addTo(mapRef.current)
        markerRef.current.on('dragend', e => { const pos = e.target.getLatLng(); setCoords([pos.lat, pos.lng]) })
      }
    } catch (e) { setSearchError('שגיאה בחיפוש, נסו שוב') }
    finally { setSearching(false) }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 600, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ height: 7, background: '#1A3A5C', borderRadius: '20px 20px 0 0' }} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0, color: '#1A3A5C', fontSize: 16, fontWeight: 800 }}>📍 עדכון מיקום</h3>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{service.name}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchAddress()} placeholder="הכניסו כתובת מלאה, למשל: רחוב הרצל 5, רמת ישי" style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '1.5px solid #FFD4B0', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={searchAddress} disabled={searching} style={{ background: '#1A3A5C', color: 'white', border: 'none', borderRadius: 20, padding: '10px 18px', fontWeight: 700, fontSize: 13, cursor: searching ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>{searching ? 'מחפש...' : '🔍 חפש'}</button>
          </div>
          {searchError && <div style={{ fontSize: 12, color: '#C62828', marginBottom: 8, padding: '6px 12px', background: '#FFF0F0', borderRadius: 10 }}>⚠️ {searchError}</div>}
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>או לחצו ישירות על המפה לסימון מדויק</div>
          <div id="location-map" style={{ height: 300, borderRadius: 12, overflow: 'hidden', marginBottom: 12 }} />
          {coords && <div style={{ fontSize: 11, color: '#888', marginBottom: 10, textAlign: 'center' }}>{coords[0].toFixed(5)}, {coords[1].toFixed(5)}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => onSave(coords[0], coords[1])} style={{ flex: 1, background: '#1A3A5C', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>💾 שמור מיקום</button>
            <button onClick={onClose} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
          </div>
        </div>
      </div>
    </div>
  )
}
