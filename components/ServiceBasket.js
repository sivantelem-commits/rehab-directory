import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'service_basket'

// ─── ניהול עגלה (localStorage) ─────────────────────────────────────────────
export function useBasket() {
  const [basket, setBasket] = useState([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setBasket(JSON.parse(saved))
    } catch {}
    const onStorage = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        setBasket(saved ? JSON.parse(saved) : [])
      } catch {}
    }
    window.addEventListener('basket-updated', onStorage)
    return () => window.removeEventListener('basket-updated', onStorage)
  }, [])

  const toggle = useCallback((service) => {
    setBasket(prev => {
      const key = `${service.type || 'rehab'}_${service.id}`
      const exists = prev.find(s => `${s.type || 'rehab'}_${s.id}` === key)
      const next = exists ? prev.filter(s => `${s.type || 'rehab'}_${s.id}` !== key) : [...prev, service]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event('basket-updated'))
      return next
    })
  }, [])

  const isInBasket = useCallback((service) => {
    const key = `${service.type || 'rehab'}_${service.id}`
    return basket.some(s => `${s.type || 'rehab'}_${s.id}` === key)
  }, [basket])

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setBasket([])
    window.dispatchEvent(new Event('basket-updated'))
  }, [])

  return { basket, toggle, isInBasket, clear }
}

// ─── כפתור הוסף/הסר לרשימה ────────────────────────────────────────────────
export function BasketButton({ service, style = {} }) {
  const { toggle, isInBasket } = useBasket()
  const inBasket = isInBasket(service)

  return (
    <button
      onClick={e => { e.stopPropagation(); toggle(service) }}
      title={inBasket ? 'הסר מהרשימה' : 'הוסף לרשימה'}
      style={{
        width: 30, height: 30, borderRadius: '50%',
        border: `2px solid ${inBasket ? '#8B00D4' : '#ddd'}`,
        background: inBasket ? '#8B00D4' : 'white',
        color: inBasket ? 'white' : '#aaa',
        fontSize: 15, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, transition: 'all 0.15s',
        fontFamily: 'sans-serif',
        ...style,
      }}
    >
      {inBasket ? '✓' : '+'}
    </button>
  )
}

// ─── פאנל הרשימה הצפה ─────────────────────────────────────────────────────
export function BasketPanel() {
  const { basket, clear } = useBasket()
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const count = basket.length

  async function exportToExcel() {
    setExporting(true)
    try {
      const ExcelJS = (await import('exceljs')).default

      const wb = new ExcelJS.Workbook()
      wb.views = [{ rightToLeft: true }]
      const ws = wb.addWorksheet('שירותים נבחרים', { views: [{ rightToLeft: true }] })

      // הגדרת עמודות
      ws.columns = [
        { header: 'סוג', key: 'type', width: 8 },
        { header: 'שם השירות', key: 'name', width: 30 },
        { header: 'קטגוריה', key: 'category', width: 16 },
        { header: 'תת-קטגוריה', key: 'subcategory', width: 16 },
        { header: 'עיר', key: 'city', width: 14 },
        { header: 'מחוז', key: 'district', width: 14 },
        { header: 'פריסה ארצית', key: 'national', width: 10 },
        { header: 'שירות איזורי', key: 'regional', width: 10 },
        { header: 'טלפון', key: 'phone', width: 14 },
        { header: 'מייל', key: 'email', width: 26 },
        { header: 'אתר אינטרנט', key: 'website', width: 28 },
        { header: 'תיאור', key: 'description', width: 40 },
        { header: 'קבוצות גיל', key: 'age_groups', width: 18 },
        { header: 'אבחנות', key: 'diagnoses', width: 28 },
        { header: 'אוכלוסיות', key: 'populations', width: 20 },
      ]

      // עיצוב כותרות
      ws.getRow(1).eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial' }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4C0080' } }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FF8B00D4' } }
        }
      })
      ws.getRow(1).height = 22

      // הוספת שורות
      basket.forEach((s, i) => {
        const row = ws.addRow({
          type: s.type === 'treatment' ? 'טיפול' : 'שיקום',
          name: s.name || '',
          category: s.category || '',
          subcategory: s.subcategory || '',
          city: s.city || '',
          district: s.district || '',
          national: s.is_national ? 'כן' : '',
          regional: s.is_regional ? 'כן' : '',
          phone: s.phone || '',
          email: s.email || '',
          website: s.website || '',
          description: s.description || '',
          age_groups: (s.age_groups || []).join(', '),
          diagnoses: (s.diagnoses || []).join(', '),
          populations: (s.populations || []).join(', '),
        })
        row.eachCell(cell => {
          cell.font = { name: 'Arial', size: 11 }
          cell.alignment = { wrapText: true, vertical: 'top' }
          cell.fill = {
            type: 'pattern', pattern: 'solid',
            fgColor: { argb: i % 2 === 0 ? 'FFFFFFFF' : 'FFF9F0FF' }
          }
        })
      })

      // ייצוא
      const buffer = await wb.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toLocaleDateString('he-IL').replace(/\//g, '-')
      a.href = url
      a.download = `שירותי-בריאות-נפש-${date}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
      alert('שגיאה בייצוא. נסו שוב.')
    } finally {
      setExporting(false)
    }
  }

  if (count === 0 && !open) return null

  return (
    <>
      {/* כפתור צף */}
      <button onClick={() => setOpen(v => !v)} style={{
        position: 'fixed',
        bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? 'calc(50vh + 16px)' : 24,
        left: 24, zIndex: 9001,
        background: count > 0 ? 'linear-gradient(135deg, #4C0080, #8B00D4)' : '#888',
        color: 'white', border: 'none', borderRadius: '999px',
        padding: '10px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
        fontFamily: "'Nunito', sans-serif",
        boxShadow: count > 0 ? '0 4px 0 #2E0060, 0 8px 24px rgba(76,0,128,0.35)' : '0 4px 12px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', gap: 8,
        transition: 'all 0.15s',
      }}>
        📋
        {count > 0 && (
          <span style={{
            background: 'rgba(255,255,255,0.25)', borderRadius: '999px',
            padding: '2px 9px', fontSize: 13,
          }}>{count}</span>
        )}
        {open ? 'סגור' : 'הרשימה שלי'}
      </button>

      {/* פאנל */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 80, left: 24, zIndex: 9000,
          width: 340, maxHeight: '60vh',
          background: 'white', borderRadius: 18,
          boxShadow: '0 12px 48px rgba(0,0,0,0.22)',
          borderTop: '4px solid #8B00D4',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Nunito', sans-serif",
        }}>
          {/* כותרת */}
          <div style={{
            padding: '14px 16px 10px',
            borderBottom: '1px solid #f0e8ff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#1A3A5C' }}>
              📋 שירותים נבחרים
              <span style={{ fontWeight: 600, fontSize: 13, color: '#9B00CC', marginRight: 6 }}>({count})</span>
            </div>
            {count > 0 && (
              <button onClick={clear} style={{
                background: 'none', border: 'none', color: '#bbb', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: "'Nunito', sans-serif",
              }}>נקה הכל</button>
            )}
          </div>

          {/* רשימה */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {count === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 16px', color: '#bbb', fontSize: 13 }}>
                לחצו + על שירות כדי להוסיף לרשימה
              </div>
            ) : (
              basket.map(s => {
                const key = `${s.type || 'rehab'}_${s.id}`
                const isTreatment = s.type === 'treatment'
                const color = isTreatment ? '#0891B2' : '#8B00D4'
                return (
                  <div key={key} style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #f5f5f5',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#1A3A5C', marginBottom: 2 }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>
                        <span style={{
                          background: color + '22', color, borderRadius: 999,
                          padding: '1px 7px', fontWeight: 600, marginLeft: 4,
                        }}>{s.category}</span>
                        {s.city && `📍 ${s.city}`}
                        {s.is_national && <span style={{ marginRight: 4 }}>🌍</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
                        const next = saved.filter(x => `${x.type || 'rehab'}_${x.id}` !== key)
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
                        window.dispatchEvent(new Event('basket-updated'))
                      }}
                      style={{
                        background: 'none', border: 'none', color: '#ccc',
                        cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >✕</button>
                  </div>
                )
              })
            )}
          </div>

          {/* כפתורי שיתוף */}
          {count > 0 && (
            <div style={{ padding: '12px 14px', borderTop: '1px solid #f0e8ff', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* ייצוא לאקסל */}
              <button onClick={exportToExcel} disabled={exporting} style={{
                width: '100%', padding: '11px 0',
                background: exporting ? '#ccc' : 'linear-gradient(135deg, #4C0080, #8B00D4)',
                color: 'white', border: 'none', borderRadius: '999px',
                fontWeight: 800, fontSize: 14, cursor: exporting ? 'default' : 'pointer',
                fontFamily: "'Nunito', sans-serif",
                boxShadow: exporting ? 'none' : '0 4px 0 #2E0060',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {exporting ? '⏳ מייצא...' : '⬇️ ייצוא לאקסל'}
              </button>

              {/* שיתוף בוואטסאפ */}
              <button onClick={() => {
                const lines = basket.map((s, i) => {
                  const type = s.type === 'treatment' ? '🏥' : '♿'
                  const url = `${window.location.origin}/${s.type === 'treatment' ? 'treatment' : 'service'}/${s.id}`
                  return `${i + 1}. ${type} *${s.name}*\n📍 ${s.city || ''}${s.district ? `, ${s.district}` : ''}${s.phone ? `\n📞 ${s.phone}` : ''}\n🔗 ${url}`
                }).join('\n\n')
                const text = `שירותי בריאות נפש שמצאתי באתר:\n\n${lines}\n\n_בריאות נפש בישראל: ${window.location.origin}_`
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
              }} style={{
                width: '100%', padding: '11px 0',
                background: '#25D366',
                color: 'white', border: 'none', borderRadius: '999px',
                fontWeight: 800, fontSize: 14, cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
                boxShadow: '0 4px 0 #1da851',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                💬 שתפו ברשימה בוואטסאפ
              </button>

              {/* שליחה במייל */}
              <button onClick={() => {
                const subject = encodeURIComponent(`שירותי בריאות נפש - ${count} שירותים נבחרים`)
                const lines = basket.map((s, i) => {
                  const type = s.type === 'treatment' ? 'טיפול' : 'שיקום'
                  const url = `${window.location.origin}/${s.type === 'treatment' ? 'treatment' : 'service'}/${s.id}`
                  return `${i + 1}. ${s.name} (${type})\nמיקום: ${s.city || ''}${s.district ? `, ${s.district}` : ''}${s.phone ? `\nטלפון: ${s.phone}` : ''}${s.email ? `\nמייל: ${s.email}` : ''}\nקישור: ${url}`
                }).join('\n\n')
                const body = encodeURIComponent(`שלום,\n\nריכזתי עבורך את השירותים הבאים מאתר בריאות נפש בישראל:\n\n${lines}\n\nלאתר: ${window.location.origin}`)
                window.open(`mailto:?subject=${subject}&body=${body}`)
              }} style={{
                width: '100%', padding: '11px 0',
                background: 'white',
                color: '#4C0080', border: '2px solid #d4b0f0', borderRadius: '999px',
                fontWeight: 800, fontSize: 14, cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                ✉️ שלחו במייל
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
