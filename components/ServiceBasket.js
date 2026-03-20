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
      const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs')

      const rows = basket.map(s => ({
        'סוג': s.type === 'treatment' ? 'טיפול' : 'שיקום',
        'שם השירות': s.name || '',
        'קטגוריה': s.category || '',
        'תת-קטגוריה': s.subcategory || '',
        'עיר': s.city || '',
        'מחוז': s.district || '',
        'פריסה ארצית': s.is_national ? 'כן' : '',
        'שירות איזורי': s.is_regional ? 'כן' : '',
        'טלפון': s.phone || '',
        'מייל': s.email || '',
        'אתר אינטרנט': s.website || '',
        'תיאור': s.description || '',
        'קבוצות גיל': (s.age_groups || []).join(', '),
        'אבחנות': (s.diagnoses || []).join(', '),
        'אוכלוסיות': (s.populations || []).join(', '),
      }))

      const ws = XLSX.utils.json_to_sheet(rows)

      // רוחב עמודות
      ws['!cols'] = [
        { wch: 8 }, { wch: 30 }, { wch: 16 }, { wch: 16 },
        { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 10 },
        { wch: 14 }, { wch: 24 }, { wch: 28 }, { wch: 40 },
        { wch: 18 }, { wch: 28 }, { wch: 20 },
      ]

      // כיוון RTL לגיליון
      ws['!sheetView'] = [{ rightToLeft: true }]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'שירותים נבחרים')

      const date = new Date().toLocaleDateString('he-IL').replace(/\//g, '-')
      XLSX.writeFile(wb, `שירותי-בריאות-נפש-${date}.xlsx`)
    } catch (err) {
      console.error(err)
      alert('שגיאה בייצוא. נסו שוב.')
    } finally {
      setExporting(false)
    }
  }

  if (count === 0 && !open) return (
    <div style={{
      position: 'fixed', bottom: 24, left: 24, zIndex: 9000,
      background: 'white', border: '2px dashed #ddd', borderRadius: '999px',
      padding: '10px 18px', fontSize: 13, color: '#bbb', fontWeight: 600,
      fontFamily: "'Nunito', sans-serif", boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      📋 רשימת שירותים ריקה
    </div>
  )

  return (
    <>
      {/* כפתור צף */}
      <button onClick={() => setOpen(v => !v)} style={{
        position: 'fixed', bottom: 24, left: 24, zIndex: 9001,
        background: count > 0 ? 'linear-gradient(135deg, #4C0080, #8B00D4)' : '#888',
        color: 'white', border: 'none', borderRadius: '999px',
        padding: '12px 20px', fontSize: 14, fontWeight: 800, cursor: 'pointer',
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

          {/* כפתור ייצוא */}
          {count > 0 && (
            <div style={{ padding: '12px 14px', borderTop: '1px solid #f0e8ff' }}>
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
            </div>
          )}
        </div>
      )}
    </>
  )
}
