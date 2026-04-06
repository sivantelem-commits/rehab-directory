import { useEffect } from 'react'

/**
 * FilterBottomSheet
 * Props:
 *   open        - bool
 *   onClose     - fn
 *   title       - string
 *   color       - primary color string
 *   activeCount - number of active filters
 *   onClear     - fn
 *   children    - filter content
 */
export default function FilterBottomSheet({ open, onClose, title, color, activeCount, onClear, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      {/* רקע מאפיל */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 800,
        }}
      />

      {/* ה-sheet עצמו */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        dir="rtl"
        style={{
          position: 'fixed', bottom: 0, right: 0, left: 0,
          zIndex: 900,
          background: 'white',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
          maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Nunito', sans-serif",
          animation: 'slideUp 0.25s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%) }
            to   { transform: translateY(0) }
          }
        `}</style>

        {/* ידית גרירה */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: '#ddd' }} />
        </div>

        {/* כותרת */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 20px 12px', borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontWeight: 800, fontSize: 17, color: '#1A3A5C' }}>{title}</span>
            {activeCount > 0 && (
              <span style={{
                background: color, color: 'white',
                borderRadius: '999px', padding: '2px 9px', fontSize: 12, fontWeight: 700,
              }}>{activeCount}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {activeCount > 0 && (
              <button onClick={onClear} style={{
                fontSize: 13, fontWeight: 700, color,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif",
              }}>נקה הכל</button>
            )}
            <button onClick={onClose} style={{
              background: '#f5f5f5', border: 'none', borderRadius: '50%',
              width: 32, height: 32, fontSize: 16, cursor: 'pointer', color: '#666',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
        </div>

        {/* תוכן הפילטרים */}
        <div style={{ overflowY: 'auto', padding: '16px 20px 32px', flex: 1 }}>
          {children}
        </div>

        {/* כפתור החלת פילטרים */}
        <div style={{ padding: '12px 20px 20px', borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={onClose}
            style={{
              width: '100%', padding: '14px 0',
              background: `linear-gradient(160deg, ${color}, ${color}cc)`,
              color: 'white', border: 'none', borderRadius: '999px',
              fontWeight: 800, fontSize: 16, cursor: 'pointer',
              fontFamily: "'Nunito', sans-serif",
              boxShadow: `0 4px 0 ${color}88`,
            }}
          >
            הצג תוצאות {activeCount > 0 ? `(${activeCount} פילטרים)` : ''}
          </button>
        </div>
      </div>
    </>
  )
}
