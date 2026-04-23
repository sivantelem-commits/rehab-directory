import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { CATEGORIES, CATEGORY_NAMES, getCategoryColor } from '../lib/categories'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

// ─── קבועים ────────────────────────────────────────────────────────────────
const DISTRICTS = ['צפון', 'חיפה', 'מרכז', 'תל אביב', 'ירושלים', 'דרום', 'יהודה ושומרון']
const PRACT_TREATMENT_TYPES = ['טיפול רגשי','טיפול זוגי','טיפול רגשי לילדים','טיפול במתבגרים','CBT','EMDR','הדרכת הורים','טיפול מוזל','ריפוי בעיסוק','קלינאית תקשורת','טיפולים בהבעה ויצירה','מטפלים לקהילה הגאה']
const PRACT_SPECIALIZATIONS = ['טיפול בדיכאון','טיפול בחרדה','פוסט טראומה','פוסט טראומה מורכבת','הפרעות אכילה','טיפול בנערות ונשים צעירות','לקויות למידה והפרעות קשב','נכויות ומחלות כרוניות','אבחונים','התמכרויות','מיינדפולנס','פסיכולוגיה תעסוקתית','פסיכודרמה','התפתחות הילד','גיל ההתבגרות','בעיות משפחתיות וזוגיות','אבל ואובדן','טיפול רגשי בילדים','הגיל השלישי']
const PRACT_PROFESSIONS = ['פסיכולוג/ית קלינית','פסיכיאטר/ית','עובד/ת סוציאלי/ת','מטפל/ת CBT מוסמך/ת','מטפל/ת EMDR מוסמך/ת','פסיכותרפיסט/ית','קלינאי/ת תקשורת','מרפא/ה בעיסוק','מטפל/ת בהבעה ויצירה','פסיכולוג/ית חינוכי/ת','אחר']
const HEALTH_FUNDS = ['כללית','מכבי','מאוחדת','לאומית']
const PRACT_LANGUAGES = ['עברית','ערבית','אנגלית','רוסית','אמהרית','צרפתית']
const TREATMENT_CATEGORIES = ['בתים מאזנים','מחלקות אשפוז','טיפול יום','מרפאות בריאות נפש','חדרי מיון','אשפוז בית','שירותים נוספים']
const TREATMENT_COLORS = { 'בתים מאזנים':'#0A3040','מחלקות אשפוז':'#1565A8','טיפול יום':'#0891B2','מרפאות בריאות נפש':'#0284C7','חדרי מיון':'#06B6D4','אשפוז בית':'#0E7490','שירותים נוספים':'#0A6080' }
const CATEGORY_BG_COLORS = { 'דיור':'FFF3E5F5','תעסוקה':'FFFFF3E0','השכלה':'FFE3F2FD','חברה ופנאי':'FFE8F5E9','ליווי ותמיכה':'FFE1F5FE','טיפולי שיניים':'FFFCE4EC','שירותים נוספים':'FFECEFF1' }
const CATEGORY_TEXT_COLORS = { 'דיור':'FF4C0080','תעסוקה':'FF9B00CC','השכלה':'FF1A3A5C','חברה ופנאי':'FF5E35B1','ליווי ותמיכה':'FF0891B2','טיפולי שיניים':'FFC2185B','שירותים נוספים':'FF546E7A' }
const NAV = [['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', '✉️ צור קשר'], ['/admin', 'ניהול']]

// ─── עיצוב כפתורים ────────────────────────────────────────────────────────
const btn = (color, outline = false) => ({
  padding: '7px 14px', borderRadius: 20, fontWeight: 700, fontSize: 12, cursor: 'pointer',
  fontFamily: 'inherit', border: `1.5px solid ${color}`,
  background: outline ? 'white' : color,
  color: outline ? color : 'white',
  display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
  transition: 'all 0.12s',
})
const btnSm = (color, outline = false) => ({ ...btn(color, outline), padding: '5px 11px', fontSize: 11 })

export default function Admin() {
  const [authed, setAuthed]       = useState(false)
  const [password, setPassword]   = useState('')
  const [loginError, setLoginError] = useState('')
  const [adminKey, setAdminKey]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [mounted, setMounted]     = useState(false)

  // ── נתונים ──
  const [pending, setPending]           = useState([])
  const [approved, setApproved]         = useState([])
  const [pendingTreatment, setPendingTreatment]   = useState([])
  const [approvedTreatment, setApprovedTreatment] = useState([])
  const [pendingPractitioners, setPendingPractitioners]   = useState([])
  const [approvedPractitioners, setApprovedPractitioners] = useState([])
  const [stats, setStats]         = useState(null)
  const [duplicates, setDuplicates] = useState([])
  const [loadingDuplicates, setLoadingDuplicates] = useState(false)
  const [history, setHistory]     = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // ── UI ──
  const [section, setSection]     = useState('inbox')
  const [rehabTab, setRehabTab]   = useState('pending')
  const [treatmentTab, setTreatmentTab] = useState('pending')
  const [practitionersTab, setPractitionersTab] = useState('pending')
  const [rehabSearch, setRehabSearch]   = useState('')
  const [rehabSort, setRehabSort]       = useState('date')
  const [treatmentSearch, setTreatmentSearch] = useState('')
  const [treatmentSort, setTreatmentSort]     = useState('date')
  const [practitionerSearch, setPractitionerSearch] = useState('')
  const [inboxSearch, setInboxSearch]   = useState('')

  // ── מודלים ──
  const [editingService, setEditingService] = useState(null)
  const [editForm, setEditForm]             = useState({})
  const [editTab, setEditTab]               = useState('basic')
  const [saving, setSaving]                 = useState(false)
  const [editingPractitioner, setEditingPractitioner] = useState(null)
  const [editPForm, setEditPForm]           = useState({})
  const [editPTab, setEditPTab]             = useState('basic')
  const [savingPractitioner, setSavingPractitioner] = useState(false)
  const [locationService, setLocationService] = useState(null)
  const [pendingApproval, setPendingApproval] = useState(null) // שירות שממתין לאישור + מיקום
  const [rejectEmailModal, setRejectEmailModal] = useState(null)
  const [rejectReason, setRejectReason]     = useState('')
  const [sendingRejectEmail, setSendingRejectEmail] = useState(false)

  // ── ייצוא ──
  const [showExportRehab, setShowExportRehab]         = useState(false)
  const [showExportTreatment, setShowExportTreatment] = useState(false)
  const [showExportPract, setShowExportPract]         = useState(false)
  const [exportFilters, setExportFilters]             = useState({ status: 'approved', district: '', category: '', subcategory: '' })
  const [exportTreatmentFilters, setExportTreatmentFilters] = useState({ status: 'approved', district: '', category: '' })
  const [exporting, setExporting]                     = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // ── כניסה ──
  const login = async () => {
    setLoginError('')
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
    if (res.ok) { setAuthed(true); setAdminKey(password) }
    else setLoginError('סיסמה שגויה')
  }

  const fetchAll = async (key) => {
    setLoading(true)
    try {
      const [p, a, pt, at, pp, ap] = await Promise.all([
        fetch('/api/admin/services', { headers: { adminkey: key } }),
        fetch('/api/services'),
        fetch('/api/admin/treatment-services?status=pending', { headers: { adminkey: key } }),
        fetch('/api/admin/treatment-services?status=approved', { headers: { adminkey: key } }),
        fetch('/api/admin/practitioners?status=pending', { headers: { adminkey: key } }),
        fetch('/api/admin/practitioners?status=approved', { headers: { adminkey: key } }),
      ])
      setPending(await p.json())
      setApproved(await a.json())
      setPendingTreatment(await pt.json())
      setApprovedTreatment(await at.json())
      setPendingPractitioners(pp.ok ? await pp.json() : [])
      setApprovedPractitioners(ap.ok ? await ap.json() : [])
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

      // נרמול שם לצורך השוואה
      const normalize = (name = '') => name
        .replace(/בע"מ|בע''מ|ישראל|שירותי|מרכז|בית|קהילת/g, '')
        .replace(/\s+/g, ' ').trim().toLowerCase()

      const findDups = (list, type) => {
        const pairs = []
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i], b = list[j]
            const na = normalize(a.name), nb = normalize(b.name)
            // דמיון שם: כולל, שווה, או מרחק Levenshtein קטן
            const nameSim = na === nb || na.includes(nb) || nb.includes(na) ||
              (na.length > 4 && nb.length > 4 && levenshtein(na, nb) <= 2)
            const citySim = !a.city || !b.city || a.city.trim() === b.city.trim()
            if (nameSim && citySim) pairs.push({ a: { ...a, _type: type }, b: { ...b, _type: type }, dismissed: false })
          }
        }
        return pairs
      }
      setDuplicates([...findDups(Array.isArray(rehab) ? rehab : [], 'rehab'), ...findDups(Array.isArray(treatment) ? treatment : [], 'treatment')])
    } finally { setLoadingDuplicates(false) }
  }

  const levenshtein = (a, b) => {
    const m = a.length, n = b.length
    const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0))
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    return dp[m][n]
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

  // ── פעולות שיקום ──
  const updateStatus = async (id, status, service) => {
    await fetch('/api/admin/services', { method: 'PATCH', headers: { 'Content-Type': 'application/json', adminkey: adminKey }, body: JSON.stringify({ id, status }) })
    if (status === 'approved' && service?.email) {
      await fetch('/api/admin/approve-email', { method: 'POST', headers: { 'Content-Type': 'application/json', adminkey: adminKey }, body: JSON.stringify({ serviceName: service.name, serviceEmail: service.email, contactEmail: service.contact_email }) })
    }
    fetchAll(adminKey); fetchStats(adminKey)
  }

  const approveWithLocation = (service, type) => {
    // פותח LocationPicker, ולאחר שמירה — מאשר
    setPendingApproval({ service, type })
    setLocationService({ ...service, _table: type === 'treatment' ? 'treatment' : 'services', _pendingApproval: true })
  }

  const deleteService = async (id) => {
    if (!confirm('למחוק שירות זה לצמיתות?')) return
    await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE', headers: { adminkey: adminKey } })
    fetchAll(adminKey)
  }

  // ── פעולות טיפול ──
  const updateTreatmentStatus = async (id, status) => {
    await fetch('/api/admin/treatment-services', { method: 'PATCH', headers: { 'Content-Type': 'application/json', adminkey: adminKey }, body: JSON.stringify({ id, status }) })
    fetchAll(adminKey)
  }

  const deleteTreatmentService = async (id) => {
    if (!confirm('למחוק שירות זה לצמיתות?')) return
    await fetch(`/api/admin/treatment-services?id=${id}`, { method: 'DELETE', headers: { adminkey: adminKey } })
    fetchAll(adminKey)
  }

  // ── עריכה ──
  const openEdit = (service, table = 'services') => {
    setEditingService(service)
    setEditTab('basic')
    setEditForm({ ...service, _table: table, age_groups: service.age_groups || [], diagnoses: service.diagnoses || [], populations: service.populations || [], categories: service.categories || [], districts: service.districts || [], is_regional: service.is_regional || false })
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
      await fetch('/api/admin/edit', { method: 'PATCH', headers: { 'Content-Type': 'application/json', adminkey: adminKey }, body: JSON.stringify({ ...fields, table: _table }) })
      setEditingService(null); fetchAll(adminKey)
    } finally { setSaving(false) }
  }

  const savePractitionerEdit = async () => {
    setSavingPractitioner(true)
    try {
      await fetch('/api/admin/practitioners', { method: 'PATCH', headers: { 'Content-Type': 'application/json', adminkey: adminKey }, body: JSON.stringify(editPForm) })
      setEditingPractitioner(null); fetchAll(adminKey)
    } finally { setSavingPractitioner(false) }
  }

  const togglePEditArray = (field, value) => {
    setEditPForm(f => {
      const arr = f[field] || []
      return arr.includes(value) ? { ...f, [field]: arr.filter(x => x !== value) } : { ...f, [field]: [...arr, value] }
    })
  }

  // ── מיקום ──
  const saveLocation = async (lat, lng) => {
    const isTreatment = locationService._table === 'treatment'
    const endpoint = isTreatment ? '/api/admin/treatment-services' : '/api/admin/services'
    await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', adminkey: adminKey }, body: JSON.stringify({ id: locationService.id, lat, lng }) })

    // אם זה אישור עם מיקום — גם מאשר
    if (locationService._pendingApproval && pendingApproval) {
      const { service, type } = pendingApproval
      if (type === 'treatment') await updateTreatmentStatus(service.id, 'approved')
      else await updateStatus(service.id, 'approved', service)
      setPendingApproval(null)
    }

    setLocationService(null); fetchAll(adminKey)
  }

  const clearLocation = async (id, table) => {
    if (!confirm('להסיר את המיקום מהמפה?')) return
    const isTreatment = table === 'treatment'
    const endpoint = isTreatment ? '/api/admin/treatment-services' : '/api/admin/services'
    await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', adminkey: adminKey }, body: JSON.stringify({ id, lat: null, lng: null }) })
    fetchAll(adminKey)
  }

  // ── דחייה עם מייל ──
  const sendRejectEmail = async () => {
    if (!rejectEmailModal?.email) return
    setSendingRejectEmail(true)
    try {
      await fetch('/api/admin/reject-email', { method: 'POST', headers: { 'Content-Type': 'application/json', adminkey: adminKey }, body: JSON.stringify({ serviceEmail: rejectEmailModal.email, contactEmail: rejectEmailModal.contactEmail, serviceName: rejectEmailModal.name, reason: rejectReason }) })
      setRejectEmailModal(null); setRejectReason('')
    } finally { setSendingRejectEmail(false) }
  }

  // ── ייצוא ──
  const exportToExcel = async (type) => {
    setExporting(true)
    try {
      let data, filename, sheetName, headerColor
      if (type === 'rehab') {
        const params = new URLSearchParams()
        if (exportFilters.status) params.set('status', exportFilters.status)
        if (exportFilters.district) params.set('district', exportFilters.district)
        if (exportFilters.category) params.set('category', exportFilters.category)
        if (exportFilters.subcategory) params.set('subcategory', exportFilters.subcategory)
        data = await fetch(`/api/admin/export?${params}`, { headers: { adminkey: adminKey } }).then(r => r.json())
        filename = `שיקום-${new Date().toLocaleDateString('he-IL').replace(/\//g,'-')}.xlsx`
        sheetName = 'שירותי שיקום'; headerColor = 'FF1A3A5C'
      } else if (type === 'treatment') {
        const params = new URLSearchParams()
        if (exportTreatmentFilters.status) params.set('status', exportTreatmentFilters.status)
        if (exportTreatmentFilters.district) params.set('district', exportTreatmentFilters.district)
        if (exportTreatmentFilters.category) params.set('category', exportTreatmentFilters.category)
        data = await fetch(`/api/admin/export-treatment?${params}`, { headers: { adminkey: adminKey } }).then(r => r.json())
        filename = `טיפול-${new Date().toLocaleDateString('he-IL').replace(/\//g,'-')}.xlsx`
        sheetName = 'שירותי טיפול'; headerColor = 'FF0277BD'
      } else {
        // מטפלים פרטיים
        data = [...approvedPractitioners]
        filename = `מטפלים-${new Date().toLocaleDateString('he-IL').replace(/\//g,'-')}.xlsx`
        sheetName = 'מטפלים פרטיים'; headerColor = 'FF0F4C75'
      }

      const ExcelJS = (await import('exceljs')).default
      const wb = new ExcelJS.Workbook()
      wb.views = [{ rightToLeft: true }]
      const ws = wb.addWorksheet(sheetName, { views: [{ rightToLeft: true }] })

      if (type === 'practitioners') {
        ws.columns = [
          { header: 'שם', key: 'name', width: 22 }, { header: 'מקצוע', key: 'profession', width: 20 },
          { header: 'עיר', key: 'city', width: 14 }, { header: 'מחוז', key: 'district', width: 12 },
          { header: 'טלפון', key: 'phone', width: 16 }, { header: 'מייל', key: 'email', width: 26 },
          { header: 'אתר', key: 'website', width: 26 }, { header: 'מחיר/שעה', key: 'price_range', width: 12 },
          { header: 'סוגי טיפול', key: 'treatment_types', width: 30 }, { header: 'התמחויות', key: 'specializations', width: 30 },
          { header: 'שפות', key: 'languages', width: 18 }, { header: 'אונליין', key: 'is_online', width: 10 },
        ]
        data.forEach(p => {
          ws.addRow({ name: p.name, profession: p.profession, city: p.city, district: p.district || '', phone: p.phone || '', email: p.email || '', website: p.website || '', price_range: p.price_range || '', treatment_types: (p.treatment_types || []).join(', '), specializations: (p.specializations || []).join(', '), languages: (p.languages || []).join(', '), is_online: p.is_online ? '✓' : '' })
        })
      } else {
        ws.columns = type === 'rehab'
          ? [{ header: 'שם השירות', key: 'name', width: 28 }, { header: 'קטגוריה', key: 'category', width: 16 }, { header: 'תת קטגוריה', key: 'subcategory', width: 18 }, { header: 'מחוז', key: 'district', width: 12 }, { header: 'עיר', key: 'city', width: 14 }, { header: 'כתובת', key: 'address', width: 24 }, { header: 'טלפון', key: 'phone', width: 16 }, { header: 'מייל', key: 'email', width: 26 }, { header: 'אתר', key: 'website', width: 28 }, { header: 'תיאור', key: 'description', width: 40 }, { header: 'ארצי', key: 'is_national', width: 10 }, { header: 'סטטוס', key: 'status', width: 12 }, { header: 'תאריך הוספה', key: 'created_at', width: 16 }]
          : [{ header: 'שם השירות', key: 'name', width: 28 }, { header: 'קטגוריה', key: 'category', width: 18 }, { header: 'מחוז', key: 'district', width: 12 }, { header: 'עיר', key: 'city', width: 14 }, { header: 'כתובת', key: 'address', width: 24 }, { header: 'טלפון', key: 'phone', width: 16 }, { header: 'מייל', key: 'email', width: 26 }, { header: 'אתר', key: 'website', width: 28 }, { header: 'תיאור', key: 'description', width: 40 }, { header: 'סטטוס', key: 'status', width: 12 }, { header: 'תאריך הוספה', key: 'created_at', width: 16 }]
        data.forEach(s => {
          const row = { name: s.name, category: s.category, district: s.district, city: s.city, address: s.address || '', phone: s.phone || '', email: s.email || '', website: s.website || '', description: s.description || '', status: s.status === 'approved' ? 'פעיל' : s.status === 'pending' ? 'ממתין' : 'נדחה', created_at: new Date(s.created_at).toLocaleDateString('he-IL') }
          if (type === 'rehab') { row.subcategory = s.subcategory || ''; row.is_national = s.is_national ? '✓' : '' }
          ws.addRow(row)
        })
      }

      // עיצוב כותרות
      const headerRow = ws.getRow(1)
      headerRow.height = 26
      headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerColor } }
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12, name: 'Arial' }
        cell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rightToLeft' }
      })
      ws.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + ws.columns.length)}${data.length + 1}` }

      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url)
      setShowExportRehab(false); setShowExportTreatment(false); setShowExportPract(false)
    } finally { setExporting(false) }
  }

  // ── computed ──
  const isTreatmentEdit = editForm._table === 'treatment'
  const editSubcategories = (!isTreatmentEdit && editForm.category) ? CATEGORIES[editForm.category]?.subcategories || [] : []
  const exportSubcategories = exportFilters.category ? CATEGORIES[exportFilters.category]?.subcategories || [] : []

  // Inbox: כל הממתינים ביחד
  const allPending = [
    ...pending.map(s => ({ ...s, _itype: 'rehab' })),
    ...pendingTreatment.map(s => ({ ...s, _itype: 'treatment' })),
    ...pendingPractitioners.map(s => ({ ...s, _itype: 'practitioner' })),
  ].filter(s => !inboxSearch || [s.name, s.city, s.category, s.profession].some(f => f?.includes(inboxSearch)))
   .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const noLocationCount = approved.filter(s => !s.lat).length + approvedTreatment.filter(s => !s.lat).length

  const inp = { width: '100%', padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${isTreatmentEdit ? '#a0d8e8' : '#d4b0f0'}`, fontSize: 14, background: isTreatmentEdit ? '#f0faff' : '#f7f0ff', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }
  const lbl = { display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 5 }

  if (!mounted) return null

  // ─── סקשן: ממתינים פנויות ──────────────────────────────────────────────
  const renderInbox = () => (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <input placeholder="חיפוש בממתינים..." value={inboxSearch} onChange={e => setInboxSearch(e.target.value)}
          style={{ flex: 1, padding: '8px 14px', borderRadius: 20, border: '1.5px solid #ddd', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
        <div style={{ fontSize: 13, color: '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>{allPending.length} ממתינים</div>
      </div>
      {allPending.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
          <div style={{ fontWeight: 600 }}>אין בקשות ממתינות</div>
        </div>
      ) : allPending.map(s => {
        const isRehab = s._itype === 'rehab'
        const isTreatment = s._itype === 'treatment'
        const isPract = s._itype === 'practitioner'
        const color = isRehab ? getCategoryColor(s.category, s.subcategory) : isTreatment ? (TREATMENT_COLORS[s.category] || '#0891B2') : '#0F4C75'
        const typeLabel = isRehab ? '♿ שיקום' : isTreatment ? '🏥 טיפול' : '🧠 מטפל/ת'
        return (
          <div key={s.id + s._itype} style={{ background: 'white', borderRadius: 14, padding: '16px', marginBottom: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderRight: `5px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <span style={{ background: color + '22', color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700, marginBottom: 5, display: 'inline-block' }}>{typeLabel}</span>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1A3A5C' }}>{s.name}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {s.city && `📍 ${s.city}`}{s.district ? `, ${s.district}` : ''}
                  {s.category && <span style={{ marginRight: 8 }}>{s.category}{s.subcategory ? ` › ${s.subcategory}` : ''}</span>}
                  {s.profession && <span> · {s.profession}</span>}
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#bbb' }}>{new Date(s.created_at).toLocaleDateString('he-IL')}</div>
            </div>
            {s.description && <div style={{ fontSize: 12, color: '#666', marginBottom: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.description}</div>}
            {s.bio && <div style={{ fontSize: 12, color: '#666', marginBottom: 8, fontStyle: 'italic' }}>"{s.bio.substring(0, 100)}{s.bio.length > 100 ? '...' : ''}"</div>}

            {/* מספר רישיון — בולט במיוחד למטפלים */}
            {isPract && (
              <div style={{ background: s.license_number ? '#f0f9ff' : '#fffbeb', border: `1.5px solid ${s.license_number ? '#7dd3fc' : '#fcd34d'}`, borderRadius: 8, padding: '6px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: s.license_number ? '#0369a1' : '#92400e' }}>📋 מספר רישיון:</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: s.license_number ? '#0F4C75' : '#b45309', letterSpacing: '0.05em' }}>
                  {s.license_number || '⚠️ לא צוין'}
                </span>
              </div>
            )}

            <div style={{ fontSize: 12, color, marginBottom: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {s.phone && <span>📞 {s.phone}</span>}
              {s.email && <span>✉️ {s.email}</span>}
              {isPract && s.price_range && <span>💰 ₪{s.price_range}/שעה</span>}
              {isPract && s.website && <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0891B2' }}>🌐 אתר</a>}
            </div>

            {isPract && s.treatment_types?.length > 0 && (
              <div style={{ fontSize: 11, color: '#0F4C75', marginBottom: 3 }}>💊 {s.treatment_types.join(', ')}</div>
            )}
            {isPract && s.specializations?.length > 0 && (
              <div style={{ fontSize: 11, color: '#6d28d9', marginBottom: 3 }}>🎯 {s.specializations.join(', ')}</div>
            )}
            {isPract && s.languages?.length > 0 && (
              <div style={{ fontSize: 11, color: '#555', marginBottom: 6 }}>🗣️ {s.languages.join(', ')}</div>
            )}
            {/* כפתורי פעולה */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* אישור */}
              <button onClick={() => {
                if (isPract) fetch('/api/admin/practitioners', { method: 'PATCH', headers: { 'Content-Type': 'application/json', adminkey: adminKey }, body: JSON.stringify({ id: s.id, status: 'approved' }) }).then(() => fetchAll(adminKey))
                else if (isTreatment) updateTreatmentStatus(s.id, 'approved')
                else updateStatus(s.id, 'approved', s)
              }} style={btn('#22c55e')}>✓ אשר</button>

              {/* אישור + מיקום (לא למטפלים) */}
              {!isPract && (
                <button onClick={() => approveWithLocation(s, s._itype)} style={btn('#1A3A5C')}>✓ אשר + הוסף מיקום</button>
              )}

              {/* עריכה */}
              <button onClick={() => {
                if (isPract) { setEditingPractitioner(s); setEditPForm({ ...s, treatment_types: s.treatment_types || [], specializations: s.specializations || [], health_funds: s.health_funds || [], languages: s.languages || [] }); setEditPTab('basic') }
                else openEdit(s, s._itype === 'treatment' ? 'treatment' : 'services')
              }} style={btn('#1A3A5C', true)}>✏️ ערוך</button>

              {/* דחייה */}
              <button onClick={() => {
                if (isPract) fetch('/api/admin/practitioners', { method: 'PATCH', headers: { 'Content-Type': 'application/json', adminkey: adminKey }, body: JSON.stringify({ id: s.id, status: 'rejected' }) }).then(() => fetchAll(adminKey))
                else if (isTreatment) updateTreatmentStatus(s.id, 'rejected')
                else { updateStatus(s.id, 'rejected', s); if (s.email) setRejectEmailModal({ name: s.name, email: s.email, contactEmail: s.contact_email }) }
              }} style={btn('#ef4444', true)}>✕ דחה</button>
            </div>
          </div>
        )
      })}
    </div>
  )

  // ─── סקשן: שיקום ───────────────────────────────────────────────────────
  const renderRehab = () => {
    const filtered = approved
      .filter(s => !rehabSearch || s.name?.includes(rehabSearch) || s.city?.includes(rehabSearch) || s.district?.includes(rehabSearch))
      .sort((a, b) => rehabSort === 'name' ? (a.name||'').localeCompare(b.name||'') : rehabSort === 'district' ? (a.district||'').localeCompare(b.district||'') : new Date(b.created_at) - new Date(a.created_at))
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['approved', `✅ פעילים (${approved.length})`], ['no-location', `⚠️ ללא מיקום (${approved.filter(s=>!s.lat).length})`]].map(([id, label]) => (
              <button key={id} onClick={() => setRehabTab(id)} style={{ padding: '8px 16px', borderRadius: 20, fontWeight: 700, fontSize: 13, background: rehabTab === id ? '#8B00D4' : 'white', color: rehabTab === id ? 'white' : '#8B00D4', border: `1.5px solid ${rehabTab===id?'#8B00D4':'#d4b0f0'}`, cursor: 'pointer' }}>{label}</button>
            ))}
          </div>
          <button onClick={() => setShowExportRehab(true)} style={btn('#164E63')}>📥 ייצוא</button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <input placeholder="חיפוש..." value={rehabSearch} onChange={e => setRehabSearch(e.target.value)} style={{ flex: 1, minWidth: 180, padding: '8px 14px', borderRadius: 20, border: '1.5px solid #d4b0f0', fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#f7f0ff' }} />
          <select value={rehabSort} onChange={e => setRehabSort(e.target.value)} style={{ padding: '8px 14px', borderRadius: 20, border: '1.5px solid #d4b0f0', fontSize: 13, background: '#f7f0ff', fontFamily: 'inherit', cursor: 'pointer' }}>
            <option value="date">מיון: תאריך</option><option value="name">מיון: שם</option><option value="district">מיון: מחוז</option>
          </select>
        </div>
        {(() => {
          const list = rehabTab === 'no-location' ? approved.filter(s => !s.lat) : filtered
          return list.length === 0 ? <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}>אין תוצאות</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {list.map(s => {
                const color = getCategoryColor(s.category, s.subcategory)
                return (
                  <div key={s.id} style={{ background: 'white', borderRadius: 12, padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRight: `4px solid ${color}` }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1A3A5C', marginBottom: 2 }}>{s.name} {s.is_national && '🌍'}</div>
                    <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>📍 {s.city} · {s.category}{s.subcategory ? ` › ${s.subcategory}` : ''}</div>
                    {!s.lat && (
                      <div style={{ background: '#FFF3E0', border: '1.5px solid #FFB74D', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#E65100', fontWeight: 700, marginBottom: 8, display: 'inline-block' }}>
                        ⚠️ לא מופיע במפה — חסר מיקום
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button onClick={() => openEdit(s, 'services')} style={btnSm('#1A3A5C', true)}>✏️ ערוך</button>
                      <button onClick={() => setLocationService({ ...s, _table: 'services' })} style={btnSm(s.lat ? '#2E7D32' : '#8B00D4', !s.lat)}>📍 {s.lat ? 'עדכן מיקום' : 'הוסף מיקום'}</button>
                      {s.lat && <button onClick={() => clearLocation(s.id, 'services')} style={btnSm('#ef4444', true)}>🗑 הסר מיקום</button>}
                      <button onClick={() => deleteService(s.id)} style={btnSm('#ef4444', true)}>🗑 מחק</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </div>
    )
  }

  // ─── סקשן: טיפול ───────────────────────────────────────────────────────
  const renderTreatment = () => {
    const base = treatmentTab === 'pending' ? pendingTreatment : treatmentTab === 'no-location' ? approvedTreatment.filter(s => !s.lat) : approvedTreatment
    const filtered = treatmentTab !== 'pending'
      ? base.filter(s => !treatmentSearch || s.name?.includes(treatmentSearch) || s.city?.includes(treatmentSearch)).sort((a, b) => treatmentSort === 'name' ? (a.name||'').localeCompare(b.name||'') : new Date(b.created_at) - new Date(a.created_at))
      : base.filter(s => !treatmentSearch || s.name?.includes(treatmentSearch))
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['pending', `⏳ ממתינים (${pendingTreatment.length})`], ['approved', `✅ פעילים (${approvedTreatment.length})`], ['no-location', `⚠️ ללא מיקום (${approvedTreatment.filter(s=>!s.lat).length})`]].map(([id, label]) => (
              <button key={id} onClick={() => setTreatmentTab(id)} style={{ padding: '8px 14px', borderRadius: 20, fontWeight: 700, fontSize: 12, background: treatmentTab === id ? '#0891B2' : 'white', color: treatmentTab === id ? 'white' : '#0891B2', border: `1.5px solid ${treatmentTab===id?'#0891B2':'#a0d8e8'}`, cursor: 'pointer' }}>{label}</button>
            ))}
          </div>
          <button onClick={() => setShowExportTreatment(true)} style={btn('#164E63')}>📥 ייצוא</button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input placeholder="חיפוש..." value={treatmentSearch} onChange={e => setTreatmentSearch(e.target.value)} style={{ flex: 1, padding: '8px 14px', borderRadius: 20, border: '1.5px solid #a0d8e8', fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#f0faff' }} />
          {treatmentTab !== 'pending' && (
            <select value={treatmentSort} onChange={e => setTreatmentSort(e.target.value)} style={{ padding: '8px 14px', borderRadius: 20, border: '1.5px solid #a0d8e8', fontSize: 13, background: '#f0faff', fontFamily: 'inherit', cursor: 'pointer' }}>
              <option value="date">תאריך</option><option value="name">שם</option>
            </select>
          )}
        </div>
        {filtered.length === 0 ? <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}><div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div><div>אין שירותים</div></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(s => {
              const color = TREATMENT_COLORS[s.category] || '#0891B2'
              return (
                <div key={s.id} style={{ background: 'white', borderRadius: 12, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRight: `4px solid ${color}` }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1A3A5C', marginBottom: 4 }}>{s.name} {s.is_national && '🌍'}</div>
                  <div style={{ fontSize: 12, color: '#aaa', marginBottom: 6 }}>📍 {s.city}, {s.district} · <span style={{ background: color + '22', color, borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{s.category}</span></div>
                  {!s.lat && treatmentTab !== 'pending' && (
                    <div style={{ background: '#FFF3E0', border: '1.5px solid #FFB74D', borderRadius: 8, padding: '5px 10px', fontSize: 11, color: '#E65100', fontWeight: 700, marginBottom: 8, display: 'inline-block' }}>
                      ⚠️ לא מופיע במפה — חסר מיקום
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {treatmentTab === 'pending' && (
                      <>
                        <button onClick={() => updateTreatmentStatus(s.id, 'approved')} style={btnSm('#0891B2')}>✓ אשר</button>
                        <button onClick={() => approveWithLocation(s, 'treatment')} style={btnSm('#1A3A5C')}>✓ אשר + מיקום</button>
                        <button onClick={() => { updateTreatmentStatus(s.id, 'rejected'); if (s.email) setRejectEmailModal({ name: s.name, email: s.email, contactEmail: s.contact_email }) }} style={btnSm('#ef4444', true)}>✕ דחה</button>
                      </>
                    )}
                    <button onClick={() => openEdit(s, 'treatment')} style={btnSm('#1A3A5C', true)}>✏️ ערוך</button>
                    <button onClick={() => setLocationService({ ...s, _table: 'treatment' })} style={btnSm(s.lat ? '#2E7D32' : '#8B00D4', !s.lat)}>📍 {s.lat ? 'עדכן' : 'הוסף מיקום'}</button>
                    {s.lat && <button onClick={() => clearLocation(s.id, 'treatment')} style={btnSm('#ef4444', true)}>🗑 הסר</button>}
                    {treatmentTab !== 'pending' && <button onClick={() => deleteTreatmentService(s.id)} style={btnSm('#ef4444', true)}>🗑 מחק</button>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ─── סקשן: מטפלים ──────────────────────────────────────────────────────
  const renderPractitioners = () => {
    const list = (practitionersTab === 'pending' ? pendingPractitioners : approvedPractitioners)
      .filter(p => !practitionerSearch || p.name?.includes(practitionerSearch) || p.city?.includes(practitionerSearch) || p.profession?.includes(practitionerSearch))
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['pending', `⏳ ממתינים (${pendingPractitioners.length})`], ['approved', `✅ פעילים (${approvedPractitioners.length})`]].map(([id, label]) => (
              <button key={id} onClick={() => setPractitionersTab(id)} style={{ padding: '8px 14px', borderRadius: 20, fontWeight: 700, fontSize: 12, background: practitionersTab === id ? '#0F4C75' : 'white', color: practitionersTab === id ? 'white' : '#0F4C75', border: `1.5px solid #0F4C75`, cursor: 'pointer' }}>{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input placeholder="חיפוש..." value={practitionerSearch} onChange={e => setPractitionerSearch(e.target.value)} style={{ padding: '8px 14px', borderRadius: 20, border: '1.5px solid #c0d8e8', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={() => setShowExportPract(true)} style={btn('#0F4C75')}>📥 ייצוא</button>
          </div>
        </div>
        {list.length === 0 ? <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}>אין מטפלים</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {list.map(p => (
              <div key={p.id} style={{ background: 'white', borderRadius: 14, padding: '14px 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderRight: '4px solid #0F4C75' }}>

                {/* שורה ראשונה: תמונה + שם + תגיות */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  {p.photo_url && <img src={p.photo_url} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#1A3A5C' }}>{p.name}</span>
                      {p.is_verified && <span style={{ background: '#dbeafe', color: '#1d4ed8', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>✓ מאומת</span>}
                      {p.is_defense_ministry && <span style={{ background: '#ede9fe', color: '#6d28d9', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>🎗️ מה"ב</span>}
                      {p.is_online && <span style={{ background: '#e0f2fe', color: '#0284c7', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>🌐 אונליין</span>}
                      {p.whatsapp_available && <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>💬 WhatsApp</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#666', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {p.profession && <span>🏷️ {p.profession}</span>}
                      {p.city && <span>📍 {p.city}{p.district ? `, ${p.district}` : ''}</span>}
                      {p.phone && <span>📞 {p.phone}</span>}
                      {p.email && <span>✉️ {p.email}</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#bbb', flexShrink: 0 }}>{new Date(p.created_at).toLocaleDateString('he-IL')}</div>
                </div>

                {/* מספר רישיון — בולט לצורך אימות */}
                <div style={{ background: p.license_number ? '#f0f9ff' : '#fffbeb', border: `1.5px solid ${p.license_number ? '#7dd3fc' : '#fcd34d'}`, borderRadius: 8, padding: '6px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: p.license_number ? '#0369a1' : '#92400e' }}>📋 מספר רישיון:</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: p.license_number ? '#0F4C75' : '#b45309', letterSpacing: '0.05em' }}>
                    {p.license_number || '⚠️ לא צוין'}
                  </span>
                </div>

                {/* פרטים נוספים */}
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#666', marginBottom: 6 }}>
                  {p.price_range && <span>💰 ₪{p.price_range}/שעה</span>}
                  {p.has_health_fund_agreement && p.health_funds?.length > 0 && <span>🏥 {p.health_funds.join(', ')}</span>}
                  {p.languages?.length > 0 && <span>🗣️ {p.languages.join(', ')}</span>}
                  {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0891B2' }}>🌐 אתר</a>}
                </div>

                {p.treatment_types?.length > 0 && <div style={{ fontSize: 11, color: '#0F4C75', marginBottom: 3 }}>💊 {p.treatment_types.join(', ')}</div>}
                {p.specializations?.length > 0 && <div style={{ fontSize: 11, color: '#6d28d9', marginBottom: 5 }}>🎯 {p.specializations.join(', ')}</div>}
                {p.bio && <div style={{ fontSize: 12, color: '#777', fontStyle: 'italic', marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{p.bio}"</div>}
                {/* כפתורי פעולה אופקיים */}
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8, paddingTop: 8, borderTop: '1px solid #f0f0f0' }}>
                  {practitionersTab === 'pending' && (
                    <button onClick={() => fetch('/api/admin/practitioners', { method: 'PATCH', headers: { 'Content-Type': 'application/json', adminkey: adminKey }, body: JSON.stringify({ id: p.id, status: 'approved' }) }).then(() => fetchAll(adminKey))} style={btnSm('#22c55e')}>✓ אשר</button>
                  )}
                  <button onClick={() => { setEditingPractitioner(p); setEditPForm({ ...p, treatment_types: p.treatment_types || [], specializations: p.specializations || [], health_funds: p.health_funds || [], languages: p.languages || [] }); setEditPTab('basic') }} style={btnSm('#1A3A5C', true)}>✏️ ערוך</button>
                  <button onClick={() => fetch('/api/admin/practitioners', { method: 'PATCH', headers: { 'Content-Type': 'application/json', adminkey: adminKey }, body: JSON.stringify({ id: p.id, is_verified: !p.is_verified }) }).then(() => fetchAll(adminKey))} style={btnSm(p.is_verified ? '#1d4ed8' : '#6b7280', !p.is_verified)}>{p.is_verified ? '✓ מאומת' : 'סמן כמאומת'}</button>
                  {practitionersTab === 'pending' && (
                    <button onClick={() => fetch('/api/admin/practitioners', { method: 'PATCH', headers: { 'Content-Type': 'application/json', adminkey: adminKey }, body: JSON.stringify({ id: p.id, status: 'rejected' }) }).then(() => fetchAll(adminKey))} style={btnSm('#ef4444', true)}>✕ דחה</button>
                  )}
                  <button onClick={async () => { if (!confirm(`למחוק את ${p.name}?`)) return; await fetch(`/api/admin/practitioners?id=${p.id}`, { method: 'DELETE', headers: { adminkey: adminKey } }); fetchAll(adminKey) }} style={btnSm('#ef4444', true)}>🗑 מחק</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── JSX ראשי ────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>ניהול | בריאות נפש בישראל</title>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f5f5f5' }}>
        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
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

        <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
          {!authed ? (
            <div style={{ maxWidth: 380, margin: '60px auto', background: 'white', borderRadius: 20, padding: '40px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>🔐</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 18, color: '#1A3A5C' }}>כניסת מנהל</div>
              <input type="password" placeholder="סיסמת אדמין" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} style={{ width: '100%', padding: '12px 16px', borderRadius: 20, border: '1.5px solid #C5D0F0', fontSize: 15, textAlign: 'center', letterSpacing: 4, marginBottom: 10, background: '#F0F7FF', outline: 'none', boxSizing: 'border-box' }} />
              {loginError && <div style={{ color: '#C62828', fontSize: 13, marginBottom: 8 }}>{loginError}</div>}
              <button onClick={login} style={{ width: '100%', background: '#1A3A5C', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>כניסה</button>
            </div>
          ) : (
            <>
              {/* ── כרטיסי סטטיסטיקות ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 24 }}>
                {[
                  ['♿', 'שיקום פעילים', approved.length, '#8B00D4'],
                  ['⏳', 'שיקום ממתינים', pending.length, '#6B21A8'],
                  ['🏥', 'טיפול פעילים', approvedTreatment.length, '#0891B2'],
                  ['⏳', 'טיפול ממתינים', pendingTreatment.length, '#164E63'],
                  ['🧠', 'מטפלים פעילים', approvedPractitioners.length, '#0F4C75'],
                  ['⏳', 'מטפלים ממתינים', pendingPractitioners.length, '#082840'],
                ].map(([icon, label, val, color]) => (
                  <div key={label} style={{ background: 'white', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, borderRight: `5px solid ${color}`, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 800, color }}>{val}</div>
                      <div style={{ fontSize: 10, color: '#888' }}>{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── באנר ללא מיקום ── */}
              {noLocationCount > 0 && (
                <div style={{ background: '#FFF3E0', border: '2px solid #FFB74D', borderRadius: 12, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>⚠️</span>
                    <div>
                      <div style={{ fontWeight: 800, color: '#E65100', fontSize: 14 }}>{noLocationCount} שירותים מאושרים ללא מיקום במפה</div>
                      <div style={{ fontSize: 12, color: '#bf360c' }}>שירותים אלו לא יופיעו בחיפוש המפה</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setSection('rehab'); setRehabTab('no-location') }} style={btnSm('#E65100')}>♿ שיקום ({approved.filter(s=>!s.lat).length})</button>
                    <button onClick={() => { setSection('treatment'); setTreatmentTab('no-location') }} style={btnSm('#E65100')}>🏥 טיפול ({approvedTreatment.filter(s=>!s.lat).length})</button>
                  </div>
                </div>
              )}

              {/* ── ניווט ראשי — 4 טאבים ── */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  ['inbox',     `📥 ממתינים`,    '#1A3A5C'],
                  ['content',   '📂 ניהול תוכן', '#8B00D4'],
                  ['dashboard', '📊 סקירה כללית','#2A5298'],
                  ['tools',     '🔧 כלים',        '#5E35B1'],
                ].map(([id, label, color]) => (
                  <button key={id}
                    onClick={() => { setSection(id); if (id === 'tools') fetchDuplicates(adminKey); if (id === 'dashboard') fetchHistory(adminKey) }}
                    style={{ flex: 1, minWidth: 120, padding: '12px 8px', borderRadius: 14, fontWeight: 800, fontSize: 14, background: section === id ? color : 'white', color: section === id ? 'white' : color, border: `2px solid ${color}`, cursor: 'pointer', position: 'relative', fontFamily: 'inherit' }}>
                    {label}
                    {id === 'inbox' && allPending.length > 0 && section !== 'inbox' && (
                      <span style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{allPending.length}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── sub-tabs לניהול תוכן ── */}
              {section === 'content' && (
                <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '2px solid #f0f0f0', paddingBottom: 12 }}>
                  {[
                    ['rehab',        '♿ שיקום',          '#8B00D4', approved.length],
                    ['treatment',    '🏥 טיפול',           '#0891B2', approvedTreatment.length],
                    ['practitioners','🧠 מטפלים פרטיים',  '#0F4C75', approvedPractitioners.length],
                  ].map(([id, label, color, count]) => (
                    <button key={id} onClick={() => setSection(id)}
                      style={{ padding: '8px 18px', borderRadius: 20, fontWeight: 700, fontSize: 13, background: section === id ? color : 'white', color: section === id ? 'white' : color, border: `1.5px solid ${color}`, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {label}
                      <span style={{ background: section === id ? 'rgba(255,255,255,0.25)' : color + '22', color: section === id ? 'white' : color, borderRadius: 999, padding: '1px 7px', fontSize: 11 }}>{count}</span>
                    </button>
                  ))}
                </div>
              )}

              {loading ? (
                <div style={{ textAlign: 'center', padding: 48, color: '#8B00D4' }}>טוען...</div>
              ) : section === 'inbox' ? renderInbox()
                : section === 'rehab' ? renderRehab()
                : section === 'treatment' ? renderTreatment()
                : section === 'practitioners' ? renderPractitioners()
                : section === 'dashboard' ? <DashboardTab stats={stats} history={history} loadingHistory={loadingHistory} noLocationCount={noLocationCount} onGoToNoLoc={(type) => { setSection(type === 'rehab' ? 'rehab' : 'treatment'); if (type === 'rehab') setRehabTab('no-location'); else setTreatmentTab('no-location') }} />
                : section === 'tools' ? (
                  <ToolsTab
                    duplicates={duplicates} loadingDuplicates={loadingDuplicates}
                    onDismiss={(i) => setDuplicates(d => d.map((p, idx) => idx === i ? { ...p, dismissed: true } : p))}
                    onDelete={async (id, type) => {
                      if (!confirm('למחוק שירות זה לצמיתות?')) return
                      if (type === 'treatment') await fetch(`/api/admin/treatment-services?id=${id}`, { method: 'DELETE', headers: { adminkey: adminKey } })
                      else await fetch(`/api/admin/services?id=${id}`, { method: 'DELETE', headers: { adminkey: adminKey } })
                      fetchDuplicates(adminKey); fetchAll(adminKey)
                    }}
                    onExportRehab={() => setShowExportRehab(true)}
                    onExportTreatment={() => setShowExportTreatment(true)}
                    onExportPract={() => setShowExportPract(true)}
                  />
                ) : null}
            </>
          )}
        </main>

        {/* ══ מודל עריכת שירות ══ */}
        {editingService && (
          <div onClick={() => setEditingService(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ height: 6, background: isTreatmentEdit ? '#0891B2' : '#8B00D4', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1A3A5C' }}>✏️ עריכת שירות — {editingService.name}</h2>
                  <button onClick={() => setEditingService(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
                </div>

                {/* טאבים */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {[['basic', 'מידע בסיסי'], ['advanced', 'פרטים מתקדמים']].map(([id, label]) => (
                    <button key={id} onClick={() => setEditTab(id)} style={{ flex: 1, padding: '8px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: `2px solid ${isTreatmentEdit ? '#0891B2' : '#8B00D4'}`, background: editTab === id ? (isTreatmentEdit ? '#0891B2' : '#8B00D4') : 'white', color: editTab === id ? 'white' : (isTreatmentEdit ? '#0891B2' : '#8B00D4') }}>{label}</button>
                  ))}
                </div>

                {editTab === 'basic' ? (
                  <>
                    {[['name','שם השירות','text'],['city','עיר','text'],['phone','טלפון','tel'],['email','מייל','email'],['address','כתובת','text'],['website','אתר','url']].map(([key, label, type]) => (
                      <div key={key} style={{ marginBottom: 12 }}>
                        <label style={lbl}>{label}</label>
                        <input type={type} value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))} style={inp} />
                      </div>
                    ))}
                    <div style={{ marginBottom: 12 }}>
                      <label style={lbl}>מחוז ראשי</label>
                      <select value={editForm.district || ''} onChange={e => setEditForm(f => ({ ...f, district: e.target.value }))} style={inp}>
                        <option value="">בחרו מחוז</option>
                        {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={lbl}>קטגוריה</label>
                      <select value={editForm.category || ''} onChange={e => setEditForm(f => ({ ...f, category: e.target.value, subcategory: '' }))} style={inp}>
                        <option value="">בחרו קטגוריה</option>
                        {isTreatmentEdit ? TREATMENT_CATEGORIES.map(c => <option key={c}>{c}</option>) : CATEGORY_NAMES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    {!isTreatmentEdit && editSubcategories.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <label style={lbl}>תת קטגוריה</label>
                        <select value={editForm.subcategory || ''} onChange={e => setEditForm(f => ({ ...f, subcategory: e.target.value }))} style={inp}>
                          <option value="">בחרו</option>
                          {editSubcategories.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    )}
                    <div style={{ marginBottom: 12 }}>
                      <label style={lbl}>תיאור</label>
                      <textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={4} style={{ ...inp, resize: 'vertical', borderRadius: 10 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {[['is_regional','🗺️ שירות איזורי'],['is_national','🌍 פריסה ארצית']].map(([field, label]) => (
                        <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#555' }}>
                          <input type="checkbox" checked={!!editForm[field]} onChange={e => setEditForm(f => ({ ...f, [field]: e.target.checked }))} style={{ width: 16, height: 16 }} />{label}
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* מחוזות נוספים */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={lbl}>מחוזות נוספים</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {DISTRICTS.map(d => { const sel = (editForm.districts||[]).includes(d); return <button key={d} type="button" onClick={() => toggleEditArray('districts', d)} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${sel?'#1A3A5C':'#ddd'}`, background: sel?'#1A3A5C':'white', color: sel?'white':'#555', fontFamily: 'inherit' }}>{d}</button> })}
                      </div>
                    </div>
                    {/* קבוצות גיל */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={lbl}>קבוצות גיל</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['ילדים','נוער','צעירים','מבוגרים','קשישים'].map(ag => { const sel = (editForm.age_groups||[]).includes(ag); return <button key={ag} type="button" onClick={() => toggleEditArray('age_groups', ag)} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${sel?'#8B00D4':'#d4b0f0'}`, background: sel?'#8B00D4':'white', color: sel?'white':'#555', fontFamily: 'inherit' }}>{ag}</button> })}
                      </div>
                    </div>
                    {/* אבחנות */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={lbl}>אבחנות / התמחויות</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['הפרעות אכילה','OCD','פוסט טראומה','פוסט טראומה מורכבת','התמכרויות'].map(d => { const sel = (editForm.diagnoses||[]).includes(d); return <button key={d} type="button" onClick={() => toggleEditArray('diagnoses', d)} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${sel?'#0E7490':'#c8eaf2'}`, background: sel?'#0E7490':'white', color: sel?'white':'#0E7490', fontFamily: 'inherit' }}>{d}</button> })}
                      </div>
                    </div>
                    {/* אוכלוסייה */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={lbl}>אוכלוסייה ייעודית</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['נשים','דתי/מסורתי','חרדי','להט"ב'].map(p => { const sel = (editForm.populations||[]).includes(p); return <button key={p} type="button" onClick={() => toggleEditArray('populations', p)} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${sel?'#5E35B1':'#e0d0f0'}`, background: sel?'#5E35B1':'white', color: sel?'white':'#5E35B1', fontFamily: 'inherit' }}>{p}</button> })}
                      </div>
                    </div>
                    {/* קטגוריות נוספות */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={lbl}>קטגוריות נוספות</label>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(isTreatmentEdit ? TREATMENT_CATEGORIES : CATEGORY_NAMES).filter(c => c !== editForm.category).map(cat => { const sel = (editForm.categories||[]).includes(cat); const catColor = isTreatmentEdit ? '#0891B2' : getCategoryColor(cat); return <button key={cat} type="button" onClick={() => toggleEditArray('categories', cat)} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${sel?catColor:'#ddd'}`, background: sel?catColor:'white', color: sel?'white':catColor, fontFamily: 'inherit' }}>{cat}</button> })}
                      </div>
                    </div>
                  </>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={saveEdit} disabled={saving} style={{ flex: 1, background: saving ? '#ccc' : isTreatmentEdit ? '#0891B2' : '#8B00D4', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'שומר...' : '💾 שמור'}</button>
                  <button onClick={() => setEditingService(null)} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ מודל עריכת מטפל/ת ══ */}
        {editingPractitioner && (
          <div onClick={() => setEditingPractitioner(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,76,117,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 560, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ height: 6, background: '#0F4C75', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F4C75' }}>✏️ עריכת מטפל/ת — {editingPractitioner.name}</h2>
                  <button onClick={() => setEditingPractitioner(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
                </div>

                {/* טאבים */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {[['basic','פרטים בסיסיים'],['expertise','התמחויות']].map(([id, label]) => (
                    <button key={id} onClick={() => setEditPTab(id)} style={{ flex: 1, padding: '8px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', border: '2px solid #0F4C75', background: editPTab === id ? '#0F4C75' : 'white', color: editPTab === id ? 'white' : '#0F4C75' }}>{label}</button>
                  ))}
                </div>

                {editPTab === 'basic' ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      {[['name','שם מלא'],['city','עיר'],['phone','טלפון'],['price_range','מחיר/שעה (₪)']].map(([key, label]) => (
                        <div key={key}>
                          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F4C75', marginBottom: 4 }}>{label}</label>
                          <input value={editPForm[key] || ''} onChange={e => setEditPForm(f => ({ ...f, [key]: e.target.value }))} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #a0d8e8', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F4C75', marginBottom: 4 }}>מקצוע</label>
                        <select value={editPForm.profession || ''} onChange={e => setEditPForm(f => ({ ...f, profession: e.target.value }))} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #a0d8e8', fontSize: 14, outline: 'none', background: 'white', fontFamily: 'inherit' }}>
                          <option value="">בחרו</option>
                          {PRACT_PROFESSIONS.map(p => <option key={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F4C75', marginBottom: 4 }}>מחוז</label>
                        <select value={editPForm.district || ''} onChange={e => setEditPForm(f => ({ ...f, district: e.target.value }))} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #a0d8e8', fontSize: 14, outline: 'none', background: 'white', fontFamily: 'inherit' }}>
                          <option value="">בחרו</option>
                          {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F4C75', marginBottom: 4 }}>אתר</label>
                      <input value={editPForm.website || ''} onChange={e => setEditPForm(f => ({ ...f, website: e.target.value }))} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #a0d8e8', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F4C75', marginBottom: 4 }}>קישור לתמונת פרופיל</label>
                      <input value={editPForm.photo_url || ''} onChange={e => setEditPForm(f => ({ ...f, photo_url: e.target.value }))} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #a0d8e8', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                      {[['is_online','🌐 אונליין'],['is_defense_ministry','🎗️ ספק משרד הביטחון']].map(([field, label]) => (
                        <label key={field} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#555' }}>
                          <input type="checkbox" checked={!!editPForm[field]} onChange={e => setEditPForm(f => ({ ...f, [field]: e.target.checked }))} style={{ width: 16, height: 16 }} />{label}
                        </label>
                      ))}
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#0F4C75', marginBottom: 4 }}>קצת עליי</label>
                      <textarea value={editPForm.bio || ''} onChange={e => setEditPForm(f => ({ ...f, bio: e.target.value }))} rows={3} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #a0d8e8', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                  </>
                ) : (
                  <>
                    {[
                      ['treatment_types', 'סוגי טיפול', PRACT_TREATMENT_TYPES, '#0F4C75'],
                      ['specializations', 'תחומי התמחות', PRACT_SPECIALIZATIONS, '#6d28d9'],
                      ['health_funds', 'קופות חולים', HEALTH_FUNDS, '#059669'],
                      ['languages', 'שפות טיפול', PRACT_LANGUAGES, '#7C3AED'],
                    ].map(([field, label, options, color]) => (
                      <div key={field} style={{ marginBottom: 14 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color, marginBottom: 6 }}>{label}</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {options.map(t => { const s = (editPForm[field]||[]).includes(t); return <button key={t} onClick={() => togglePEditArray(field, t)} style={{ padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${s?color:'#ddd'}`, background: s?color:'white', color: s?'white':color }}>{t}</button> })}
                        </div>
                      </div>
                    ))}
                  </>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={savePractitionerEdit} disabled={savingPractitioner} style={{ flex: 1, background: savingPractitioner ? '#ccc' : '#0F4C75', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: savingPractitioner ? 'not-allowed' : 'pointer' }}>{savingPractitioner ? 'שומר...' : '💾 שמור שינויים'}</button>
                  <button onClick={() => setEditingPractitioner(null)} style={{ flex: 1, background: '#f0f9ff', color: '#0F4C75', border: '1.5px solid #a0d8e8', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ מודל דחייה עם מייל ══ */}
        {rejectEmailModal && (
          <div onClick={() => setRejectEmailModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 480, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ height: 7, background: '#C62828', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1A3A5C' }}>✉️ מייל דחייה</h2>
                  <button onClick={() => setRejectEmailModal(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
                </div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 14 }}>שליחה אל <strong>{rejectEmailModal.contactEmail || rejectEmailModal.email}</strong> בנוגע ל<strong>{rejectEmailModal.name}</strong></div>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={4} placeholder="סיבת הדחייה (אופציונלי)..." style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid #FFCDD2', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 14 }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={sendRejectEmail} disabled={sendingRejectEmail} style={{ flex: 1, background: '#C62828', color: 'white', border: 'none', borderRadius: 20, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: sendingRejectEmail ? 'not-allowed' : 'pointer' }}>{sendingRejectEmail ? 'שולח...' : '✉️ שלח'}</button>
                  <button onClick={() => setRejectEmailModal(null)} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ ייצוא שיקום ══ */}
        {showExportRehab && (
          <div onClick={() => setShowExportRehab(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ height: 7, background: '#4C0080', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#4C0080' }}>📥 ייצוא שיקום</h2>
                  <button onClick={() => setShowExportRehab(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
                </div>
                {[['status','סטטוס',[['','הכל'],['approved','פעילים'],['pending','ממתינים'],['rejected','נדחו']]],['district','מחוז',[['','כל המחוזות'],...DISTRICTS.map(d=>[d,d])]],['category','קטגוריה',[['','כל הקטגוריות'],...CATEGORY_NAMES.map(c=>[c,c])]]].map(([key,label,opts]) => (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label style={lbl}>{label}</label>
                    <select value={exportFilters[key]} onChange={e => setExportFilters(f => ({ ...f, [key]: e.target.value, ...(key==='category'?{subcategory:''}:{}) }))} style={inp}>{opts.map(([val,txt]) => <option key={val} value={val}>{txt}</option>)}</select>
                  </div>
                ))}
                {exportSubcategories.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={lbl}>תת קטגוריה</label>
                    <select value={exportFilters.subcategory} onChange={e => setExportFilters(f => ({ ...f, subcategory: e.target.value }))} style={inp}><option value="">הכל</option>{exportSubcategories.map(s => <option key={s}>{s}</option>)}</select>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => exportToExcel('rehab')} disabled={exporting} style={{ flex: 1, background: '#4C0080', color: 'white', border: 'none', borderRadius: 20, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: exporting ? 'not-allowed' : 'pointer' }}>{exporting ? 'מייצא...' : '📥 הורד'}</button>
                  <button onClick={() => setShowExportRehab(false)} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ ייצוא טיפול ══ */}
        {showExportTreatment && (
          <div onClick={() => setShowExportTreatment(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 440, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ height: 7, background: '#0891B2', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0891B2' }}>📥 ייצוא טיפול</h2>
                  <button onClick={() => setShowExportTreatment(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
                </div>
                {[['status','סטטוס',[['','הכל'],['approved','פעילים'],['pending','ממתינים'],['rejected','נדחו']]],['district','מחוז',[['','כל המחוזות'],...DISTRICTS.map(d=>[d,d])]],['category','קטגוריה',[['','כל הקטגוריות'],...TREATMENT_CATEGORIES.map(c=>[c,c])]]].map(([key,label,opts]) => (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label style={lbl}>{label}</label>
                    <select value={exportTreatmentFilters[key]} onChange={e => setExportTreatmentFilters(f => ({ ...f, [key]: e.target.value }))} style={inp}>{opts.map(([val,txt]) => <option key={val} value={val}>{txt}</option>)}</select>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => exportToExcel('treatment')} disabled={exporting} style={{ flex: 1, background: '#0891B2', color: 'white', border: 'none', borderRadius: 20, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: exporting ? 'not-allowed' : 'pointer' }}>{exporting ? 'מייצא...' : '📥 הורד'}</button>
                  <button onClick={() => setShowExportTreatment(false)} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ ייצוא מטפלים ══ */}
        {showExportPract && (
          <div onClick={() => setShowExportPract(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 400, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
              <div style={{ height: 7, background: '#0F4C75', borderRadius: '20px 20px 0 0' }} />
              <div style={{ padding: '24px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#0F4C75' }}>📥 ייצוא מטפלים פרטיים</h2>
                  <button onClick={() => setShowExportPract(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
                </div>
                <div style={{ background: '#e0f2fe', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#0F4C75' }}>
                  ייצוא {approvedPractitioners.length} מטפלים פעילים עם כל הפרטים
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => exportToExcel('practitioners')} disabled={exporting} style={{ flex: 1, background: '#0F4C75', color: 'white', border: 'none', borderRadius: 20, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: exporting ? 'not-allowed' : 'pointer' }}>{exporting ? 'מייצא...' : '📥 הורד אקסל'}</button>
                  <button onClick={() => setShowExportPract(false)} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {locationService && <LocationPicker service={locationService} onSave={saveLocation} onClose={() => { setLocationService(null); setPendingApproval(null) }} pendingApproval={!!locationService._pendingApproval} />}

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '20px', fontSize: 13, marginTop: 48 }}>
          בריאות נפש בישראל © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
function DashboardTab({ stats, history, loadingHistory, noLocationCount, onGoToNoLoc }) {
  const [showAllHistory, setShowAllHistory] = useState(false)
  const [statsTab, setStatsTab] = useState('rehab')
  if (!stats) return <div style={{ textAlign: 'center', padding: 48, color: '#8B00D4' }}>טוען...</div>

  const COLORS = ['#8B00D4','#4C0080','#6B21A8','#0891B2','#164E63','#5E35B1','#CE66F0','#0F4C75','#22c55e']
  const DISTRICTS = ['צפון','חיפה','מרכז','תל אביב','ירושלים','דרום','יהודה ושומרון']
  const { getCategoryColor } = require('../lib/categories')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── מדדי מפתח ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
        {[
          ['סה"כ פעילים', stats.grandTotal, '#1A3A5C', '📋'],
          ['ממתינים לאישור', stats.totalPending, '#6d28d9', '⏳'],
          ['חדשים השבוע', stats.totalNewWeek, '#15803d', '📈'],
          ['ללא מיקום', stats.totalNoLoc, '#E65100', '⚠️'],
          ['שיקום פעיל', stats.rehabApproved, '#8B00D4', '♿'],
          ['טיפול פעיל', stats.treatApproved, '#0891B2', '🏥'],
          ['מטפלים פרטיים', stats.practApproved, '#0F4C75', '🧠'],
        ].map(([label, val, color, icon]) => (
          <div key={label} style={{ background: 'white', borderRadius: 14, padding: '14px 16px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderTop: `4px solid ${color}`, cursor: label === 'ללא מיקום' && val > 0 ? 'pointer' : 'default' }}
            onClick={() => label === 'ללא מיקום' && val > 0 && onGoToNoLoc('rehab')}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── גרפים לפי סוג ── */}
      <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[['rehab','♿ שיקום','#8B00D4'],['treatment','🏥 טיפול','#0891B2'],['practitioners','🧠 מטפלים','#0F4C75']].map(([id,label,color]) => (
            <button key={id} onClick={() => setStatsTab(id)} style={{ padding: '6px 16px', borderRadius: 20, fontWeight: 700, fontSize: 12, cursor: 'pointer', background: statsTab === id ? color : 'white', color: statsTab === id ? 'white' : color, border: `1.5px solid ${color}`, fontFamily: 'inherit' }}>{label}</button>
          ))}
        </div>

        {statsTab === 'rehab' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 10 }}>לפי קטגוריה</div>
              {(stats.rehabByCategory || []).map(({ name, value }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: getCategoryColor(name), flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 12, color: '#555' }}>{name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C' }}>{value}</div>
                  <div style={{ width: 80, height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(value / stats.rehabApproved * 100)}%`, background: getCategoryColor(name), borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 10 }}>לפי מחוז</div>
              {(stats.rehabByDistrict || []).sort((a,b) => b.value - a.value).map(({ name, value }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1, fontSize: 12, color: '#555' }}>{name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#8B00D4' }}>{value}</div>
                  <div style={{ width: 80, height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(value / stats.rehabApproved * 100)}%`, background: '#8B00D4', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {statsTab === 'treatment' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 10 }}>לפי קטגוריה</div>
              {(stats.treatByCategory || []).map(({ name, value }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#0891B2', flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 12, color: '#555' }}>{name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C' }}>{value}</div>
                  <div style={{ width: 80, height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(value / stats.treatApproved * 100)}%`, background: '#0891B2', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 10 }}>לפי מחוז</div>
              {(stats.treatByDistrict || []).sort((a,b) => b.value - a.value).map(({ name, value }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1, fontSize: 12, color: '#555' }}>{name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0891B2' }}>{value}</div>
                  <div style={{ width: 80, height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(value / stats.treatApproved * 100)}%`, background: '#0891B2', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {statsTab === 'practitioners' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 10 }}>לפי מקצוע</div>
              {(stats.practByProfession || []).map(({ name, value }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{ flex: 1, fontSize: 11, color: '#555' }}>{name}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F4C75' }}>{value}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 10 }}>לפי מחוז</div>
              {(stats.practByDistrict || []).sort((a,b) => b.value - a.value).map(({ name, value }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{ flex: 1, fontSize: 11, color: '#555' }}>{name}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F4C75' }}>{value}</div>
                  <div style={{ width: 60, height: 5, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.round(value / stats.practApproved * 100)}%`, background: '#0F4C75', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 10 }}>top 10 התמחויות</div>
              {(stats.practBySpecialization || []).map(({ name, value }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <div style={{ flex: 1, fontSize: 11, color: '#555' }}>{name}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#6d28d9' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── טבלת חתך שיקום ── */}
      {statsTab === 'rehab' && Object.keys(stats.rehabCross || {}).length > 0 && (
        <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 12 }}>קטגוריה × מחוז — שיקום</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ background: '#1A3A5C', color: 'white' }}>
              <th style={{ padding: '8px 12px', textAlign: 'right' }}>קטגוריה</th>
              {DISTRICTS.map(d => <th key={d} style={{ padding: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}>{d}</th>)}
              <th style={{ padding: '8px 12px', textAlign: 'center', background: '#4C0080' }}>סה"כ</th>
            </tr></thead>
            <tbody>{Object.entries(stats.rehabCross).map(([cat, byDist], i) => {
              const color = getCategoryColor(cat)
              const total = DISTRICTS.reduce((s, d) => s + (byDist[d] || 0), 0)
              return (<tr key={cat} style={{ background: i % 2 === 0 ? '#FFF8F3' : 'white' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700, color, borderRight: `3px solid ${color}` }}>{cat}</td>
                {DISTRICTS.map(d => <td key={d} style={{ padding: '8px', textAlign: 'center', color: byDist[d] ? '#1A3A5C' : '#ddd', fontWeight: byDist[d] ? 700 : 400 }}>{byDist[d] || '–'}</td>)}
                <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800, color: '#4C0080' }}>{total}</td>
              </tr>)
            })}</tbody>
          </table>
        </div>
      )}

      {/* ── היסטוריית שינויים אחרונים ── */}
      <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C' }}>📝 שינויים אחרונים</div>
          {history.length > 5 && (
            <button onClick={() => setShowAllHistory(v => !v)} style={{ background: 'none', border: 'none', fontSize: 12, color: '#8B00D4', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
              {showAllHistory ? 'הצג פחות ▲' : `הצג הכל (${history.length}) ▼`}
            </button>
          )}
        </div>
        {loadingHistory ? <div style={{ textAlign: 'center', padding: 24, color: '#aaa' }}>טוען...</div> : !history.length ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#ccc', fontSize: 13 }}>אין היסטוריית שינויים עדיין</div>
        ) : (showAllHistory ? history : history.slice(0, 5)).map((entry, i) => {
          const changes = entry.changes || {}
          const keys = Object.keys(changes)
          const isRehab = entry.table_name === 'services'
          const color = isRehab ? '#8B00D4' : '#0891B2'
          return (
            <div key={i} style={{ borderBottom: i < (showAllHistory ? history : history.slice(0,5)).length - 1 ? '1px solid #f5f5f5' : 'none', paddingBottom: 10, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#1A3A5C' }}>{entry.service_name}</span>
                  <span style={{ marginRight: 6, fontSize: 10, background: `${color}22`, color, padding: '1px 7px', borderRadius: 20, fontWeight: 600 }}>{isRehab ? 'שיקום' : 'טיפול'}</span>
                </div>
                <span style={{ fontSize: 11, color: '#bbb' }}>{new Date(entry.changed_at).toLocaleString('he-IL')}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {keys.map(key => (
                  <span key={key} style={{ fontSize: 11, background: '#f5f5f5', borderRadius: 6, padding: '2px 8px', color: '#555' }}>
                    {key}: <span style={{ color: '#C62828', textDecoration: 'line-through' }}>{String(changes[key].before ?? '–').substring(0,20)}</span>
                    {' → '}
                    <span style={{ color: '#2E7D32', fontWeight: 600 }}>{String(changes[key].after ?? '–').substring(0,20)}</span>
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ToolsTab({ duplicates, loadingDuplicates, onDismiss, onDelete, onExportRehab, onExportTreatment, onExportPract }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── ייצוא ── */}
      <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 14 }}>📥 ייצוא Excel</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={onExportRehab} style={{ flex: 1, minWidth: 160, padding: '14px', borderRadius: 12, border: '2px solid #8B00D4', background: '#f7f0ff', color: '#4C0080', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            📥 שיקום
          </button>
          <button onClick={onExportTreatment} style={{ flex: 1, minWidth: 160, padding: '14px', borderRadius: 12, border: '2px solid #0891B2', background: '#f0faff', color: '#0A6080', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            📥 טיפול
          </button>
          <button onClick={onExportPract} style={{ flex: 1, minWidth: 160, padding: '14px', borderRadius: 12, border: '2px solid #0F4C75', background: '#e8f2f8', color: '#0F4C75', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            📥 מטפלים פרטיים
          </button>
        </div>
      </div>

      {/* ── כפילויות ── */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 14 }}>🔁 זיהוי כפילויות</div>
        <DuplicatesTab duplicates={duplicates} loading={loadingDuplicates} onDismiss={onDismiss} onDelete={onDelete} />
      </div>
    </div>
  )
}

({ duplicates, loading, onDismiss, onDelete }) {
  const active = duplicates.filter(p => !p.dismissed)
  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: '#7B2D8B' }}>מחפש כפילויות...</div>
  if (active.length === 0) return <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}><div style={{ fontSize: 40, marginBottom: 10 }}>✅</div><div style={{ fontWeight: 600 }}>לא נמצאו כפילויות</div></div>
  return (
    <div>
      <div style={{ fontSize: 13, color: '#7B2D8B', fontWeight: 700, background: '#F3E5F5', borderRadius: 10, padding: '8px 14px', marginBottom: 14 }}>נמצאו {active.length} זוגות חשודים</div>
      {duplicates.map((pair, i) => {
        if (pair.dismissed) return null
        const color = pair.a._type === 'rehab' ? '#8B00D4' : '#0891B2'
        return (
          <div key={i} style={{ background: 'white', borderRadius: 14, padding: '16px', marginBottom: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderRight: '5px solid #7B2D8B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ background: color + '22', color, borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{pair.a._type === 'rehab' ? '♿ שיקום' : '🏥 טיפול'}</span>
              <button onClick={() => onDismiss(i)} style={{ background: 'none', border: '1.5px solid #ddd', color: '#aaa', borderRadius: 20, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>התעלם</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'start' }}>
              {[pair.a, pair.b].map((s, si) => (
                <div key={si} style={{ background: '#f9f9f9', borderRadius: 10, padding: '10px 12px', border: '1.5px solid #eee' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1A3A5C', marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>📍 {s.city}{s.district ? `, ${s.district}` : ''}<br />🏷️ {s.category}</div>
                  <button onClick={() => onDelete(s.id, s._type)} style={{ background: '#FFF0F0', border: '1.5px solid #FFCDD2', color: '#C62828', borderRadius: 20, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>🗑️ מחק</button>
                </div>
              ))}
              <div style={{ textAlign: 'center', fontSize: 20, paddingTop: 16 }}>🔁</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HistoryTab({ history, loading }) {
  const FIELD_NAMES = { name:'שם', district:'מחוז', districts:'מחוזות נוספים', city:'עיר', category:'קטגוריה', subcategory:'תת-קטגוריה', description:'תיאור', phone:'טלפון', email:'מייל', website:'אתר', address:'כתובת', is_national:'פריסה ארצית', age_groups:'קבוצות גיל', diagnoses:'אבחנות', populations:'אוכלוסייה', categories:'קטגוריות נוספות' }
  if (loading) return <div style={{ textAlign: 'center', padding: 48, color: '#5E35B1' }}>טוען...</div>
  if (!history.length) return <div style={{ textAlign: 'center', padding: 52, color: '#aaa' }}><div style={{ fontSize: 40, marginBottom: 10 }}>📝</div><div>אין היסטוריית שינויים</div></div>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {history.map((entry, i) => {
        const changes = entry.changes || {}
        const keys = Object.keys(changes)
        const isRehab = entry.table_name === 'services'
        const color = isRehab ? '#8B00D4' : '#0891B2'
        return (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRight: `4px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1A3A5C' }}>{entry.service_name}</span>
                <span style={{ marginRight: 8, fontSize: 11, background: `${color}22`, color, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{isRehab ? 'שיקום' : 'טיפול'}</span>
              </div>
              <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(entry.changed_at).toLocaleString('he-IL')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {keys.map(key => (
                <div key={key} style={{ fontSize: 12, background: '#f9f9f9', borderRadius: 8, padding: '6px 10px' }}>
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
  const COLORS = ['#8B00D4','#4C0080','#6B21A8','#0891B2','#164E63','#5E35B1','#CE66F0']
  const districts = ['צפון','חיפה','מרכז','תל אביב','ירושלים','דרום','יהודה ושומרון']
  const isRehab = activeTab === 'rehab'
  const byCategory = isRehab ? stats.byCategory : stats.byCategoryTreatment
  const byDistrict = isRehab ? stats.byDistrict : stats.byDistrictTreatment
  const crossTable = isRehab ? stats.crossTable : stats.crossTableTreatment
  const cats = Object.keys(crossTable || {})
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
        {[['📋','סה"כ שיקום', stats.total,'#1A3A5C'],['✅','שיקום פעיל', stats.approved,'#8B00D4'],['📋','סה"כ טיפול', stats.totalTreatment,'#164E63'],['✅','טיפול פעיל', stats.approvedTreatment,'#0891B2']].map(([icon,label,val,color]) => (
          <div key={label} style={{ background: 'white', borderRadius: 14, padding: '16px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', borderTop: `4px solid ${color}` }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setActiveTab('rehab')} style={{ padding: '8px 20px', borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: isRehab ? '#1A3A5C' : 'white', color: isRehab ? 'white' : '#1A3A5C', border: '2px solid #1A3A5C', fontFamily: "'Nunito', sans-serif" }}>♿ שיקום</button>
        <button onClick={() => setActiveTab('treatment')} style={{ padding: '8px 20px', borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: 'pointer', background: !isRehab ? '#0891B2' : 'white', color: !isRehab ? 'white' : '#0891B2', border: '2px solid #0891B2', fontFamily: "'Nunito', sans-serif" }}>🏥 טיפול</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 14, padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 800, color: '#1A3A5C' }}>🥧 לפי קטגוריה</h3>
          <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name} (${value})`} labelLine={false}>{(byCategory||[]).map((entry,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </div>
        <div style={{ background: 'white', borderRadius: 14, padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 800, color: '#1A3A5C' }}>📊 לפי מחוז</h3>
          <ResponsiveContainer width="100%" height={220}><BarChart data={byDistrict} margin={{ top:5, right:10, left:-20, bottom:5 }}><XAxis dataKey="name" tick={{ fontSize:10 }} /><YAxis tick={{ fontSize:10 }} allowDecimals={false} /><Tooltip /><Bar dataKey="value" radius={[4,4,0,0]}>{(byDistrict||[]).map((entry,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer>
        </div>
      </div>
      <div style={{ background: 'white', borderRadius: 14, padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflowX: 'auto' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 800, color: '#1A3A5C' }}>📋 קטגוריה × מחוז</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr style={{ background: '#1A3A5C', color: 'white' }}><th style={{ padding: '8px 12px', textAlign: 'right' }}>קטגוריה</th>{districts.map(d => <th key={d} style={{ padding: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}>{d}</th>)}<th style={{ padding: '8px 12px', textAlign: 'center', background: '#4C0080' }}>סה"כ</th></tr></thead>
          <tbody>{cats.map((cat, i) => {
            const color = getCategoryColor(cat)
            const total = districts.reduce((sum, d) => sum + ((crossTable[cat]||{})[d]||0), 0)
            return (<tr key={cat} style={{ background: i%2===0 ? '#FFF8F3' : 'white' }}>
              <td style={{ padding: '8px 12px', fontWeight: 700, color, borderRight: `3px solid ${color}` }}>{cat}</td>
              {districts.map(d => <td key={d} style={{ padding: '8px', textAlign: 'center', color: (crossTable[cat]||{})[d] ? '#1A3A5C' : '#ddd', fontWeight: (crossTable[cat]||{})[d] ? 700 : 400 }}>{(crossTable[cat]||{})[d] || '–'}</td>)}
              <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 800, color: '#4C0080' }}>{total}</td>
            </tr>)
          })}</tbody>
        </table>
      </div>
    </div>
  )
}

function LocationPicker({ service, onSave, onClose, pendingApproval }) {
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
      if (markerRef.current) markerRef.current.setLatLng([lat, lng])
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
      if (!data.length) { setSearchError('הכתובת לא נמצאה'); return }
      const { lat, lon } = data[0]
      const newCoords = [parseFloat(lat), parseFloat(lon)]
      setCoords(newCoords)
      const L = require('leaflet')
      mapRef.current.setView(newCoords, 16)
      if (markerRef.current) markerRef.current.setLatLng(newCoords)
      else {
        markerRef.current = L.marker(newCoords, { draggable: true }).addTo(mapRef.current)
        markerRef.current.on('dragend', e => { const pos = e.target.getLatLng(); setCoords([pos.lat, pos.lng]) })
      }
    } catch { setSearchError('שגיאה בחיפוש') }
    finally { setSearching(false) }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 600, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ height: 7, background: pendingApproval ? '#22c55e' : '#1A3A5C', borderRadius: '20px 20px 0 0' }} />
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0, color: '#1A3A5C', fontSize: 16, fontWeight: 800 }}>📍 {pendingApproval ? 'אשר + הוסף מיקום' : 'עדכון מיקום'}</h3>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{service.name}</div>
              {pendingApproval && <div style={{ fontSize: 11, color: '#22c55e', marginTop: 2, fontWeight: 700 }}>השירות יאושר לאחר שמירת המיקום</div>}
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchAddress()} placeholder="חיפוש כתובת..." style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '1.5px solid #ddd', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
            <button onClick={searchAddress} disabled={searching} style={{ background: '#1A3A5C', color: 'white', border: 'none', borderRadius: 20, padding: '10px 16px', fontWeight: 700, fontSize: 13, cursor: searching ? 'not-allowed' : 'pointer' }}>{searching ? '...' : '🔍 חפש'}</button>
          </div>
          {searchError && <div style={{ fontSize: 12, color: '#C62828', marginBottom: 8, padding: '5px 10px', background: '#FFF0F0', borderRadius: 8 }}>⚠️ {searchError}</div>}
          <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>או לחצו ישירות על המפה</div>
          <div id="location-map" style={{ height: 280, borderRadius: 12, overflow: 'hidden', marginBottom: 10 }} />
          {coords && <div style={{ fontSize: 11, color: '#888', marginBottom: 10, textAlign: 'center' }}>{coords[0].toFixed(5)}, {coords[1].toFixed(5)}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => onSave(coords[0], coords[1])} style={{ flex: 1, background: pendingApproval ? '#22c55e' : '#1A3A5C', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>{pendingApproval ? '✓ אשר ושמור מיקום' : '💾 שמור מיקום'}</button>
            <button onClick={onClose} style={{ flex: 1, background: '#EEF2FF', color: '#1A3A5C', border: '1.5px solid #C5D0F0', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>ביטול</button>
          </div>
        </div>
      </div>
    </div>
  )
}
