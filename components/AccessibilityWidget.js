import { useState, useEffect } from 'react'

const FEATURES = [
  { id: 'fontSize',    icon: 'Aa',  label: 'הגדל טקסט',        type: 'toggle' },
  { id: 'contrast',   icon: '◑',   label: 'ניגודיות גבוהה',    type: 'toggle' },
  { id: 'grayscale',  icon: '◐',   label: 'גווני אפור',         type: 'toggle' },
  { id: 'links',      icon: '⎁',   label: 'הדגש קישורים',       type: 'toggle' },
  { id: 'animations', icon: '⏸',   label: 'עצור אנימציות',      type: 'toggle' },
  { id: 'dyslexia',   icon: 'ℓ',   label: 'גופן דיסלקציה',      type: 'toggle' },
]

export default function AccessibilityWidget() {
  const [open, setOpen]       = useState(false)
  const [active, setActive]   = useState({})
  const [mounted, setMounted] = useState(false)

  // טוען העדפות שמורות
  useEffect(() => {
    setMounted(true)
    try {
      const saved = JSON.parse(localStorage.getItem('a11y_prefs') || '{}')
      setActive(saved)
      applyAll(saved)
    } catch {}
  }, [])

  function applyAll(prefs) {
    const root = document.documentElement

    // גודל טקסט
    root.style.fontSize = prefs.fontSize ? '118%' : ''

    // ניגודיות
    if (prefs.contrast) {
      root.style.filter = prefs.grayscale
        ? 'contrast(1.6) grayscale(1)'
        : 'contrast(1.6)'
    } else if (prefs.grayscale) {
      root.style.filter = 'grayscale(1)'
    } else {
      root.style.filter = ''
    }

    // אנימציות
    let styleEl = document.getElementById('a11y-style')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'a11y-style'
      document.head.appendChild(styleEl)
    }

    const rules = []
    if (prefs.animations) {
      rules.push('*, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }')
    }
    if (prefs.links) {
      rules.push('a { text-decoration: underline !important; font-weight: 700 !important; outline: 2px solid currentColor !important; outline-offset: 2px !important; }')
    }
    if (prefs.dyslexia) {
      rules.push(`
        body, button, input, select, textarea {
          font-family: 'OpenDyslexic', 'Comic Sans MS', cursive !important;
          letter-spacing: 0.05em !important;
          word-spacing: 0.1em !important;
          line-height: 1.8 !important;
        }
      `)
    }
    styleEl.textContent = rules.join('\n')
  }

  function toggle(id) {
    const next = { ...active, [id]: !active[id] }
    setActive(next)
    applyAll(next)
    try { localStorage.setItem('a11y_prefs', JSON.stringify(next)) } catch {}
  }

  function reset() {
    setActive({})
    applyAll({})
    try { localStorage.removeItem('a11y_prefs') } catch {}
  }

  const anyActive = Object.values(active).some(Boolean)

  if (!mounted) return null

  return (
    <>
      <style>{`
        @keyframes a11y-in {
          from { opacity: 0; transform: scale(0.92) translateY(8px) }
          to   { opacity: 1; transform: scale(1) translateY(0) }
        }
        .a11y-btn-feature:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        }
        .a11y-trigger:hover {
          transform: scale(1.08);
        }
      `}</style>

      {/* כפתור פתיחה */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="פתח סרגל נגישות"
        aria-expanded={open}
        className="a11y-trigger"
        style={{
          position: 'fixed',
          bottom: 84,
          right: 24,
          left: 'auto',
          zIndex: 1200,
          width: 52,
          height: 52,
          borderRadius: '50%',
          border: '3px solid #1D9E75',
          cursor: 'pointer',
          background: 'white',
          boxShadow: anyActive
            ? '0 0 0 3px #1D9E75, 0 8px 24px rgba(29,158,117,0.4)'
            : '0 4px 20px rgba(29,158,117,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <img
          src="/accessibility-widget-icon.png"
          alt=""
          aria-hidden="true"
          style={{ width: 36, height: 36, objectFit: 'contain' }}
        />
        {anyActive && (
          <span style={{
            position: 'absolute', top: -3, right: -3,
            width: 14, height: 14, borderRadius: '50%',
            background: '#22c55e', border: '2px solid white',
          }} />
        )}
      </button>

      {/* פאנל */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="סרגל נגישות"
          dir="rtl"
          style={{
            position: 'fixed',
            bottom: 148,
            right: 20,
            left: 'auto',
            zIndex: 1200,
            width: 300,
            background: 'white',
            borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            animation: 'a11y-in 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {/* כותרת */}
          <div style={{
            background: 'linear-gradient(135deg, #1D9E75, #148f64)',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/accessibility-widget-icon.png" alt="" aria-hidden="true" style={{ width: 28, height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>סרגל נגישות</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 1 }}>התאם את התצוגה לצרכיך</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="סגור"
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>

          {/* כפתורי פיצ׳רים */}
          <div style={{ padding: '14px 14px 6px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {FEATURES.map(f => {
              const on = !!active[f.id]
              return (
                <button
                  key={f.id}
                  onClick={() => toggle(f.id)}
                  aria-pressed={on}
                  className="a11y-btn-feature"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '12px 6px',
                    borderRadius: 14,
                    border: `2px solid ${on ? '#1D9E75' : '#e0f5ee'}`,
                    background: on ? 'linear-gradient(135deg, #e0f7ff, #f0faff)' : '#f8fafd',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  <span style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: on ? '#1D9E75' : '#6dbfa3',
                    lineHeight: 1,
                  }}>{f.icon}</span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: on ? '#0d7a5c' : '#5a9e85',
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}>{f.label}</span>
                  {/* אינדיקטור פעיל */}
                  <div style={{
                    width: 24, height: 4, borderRadius: 99,
                    background: on ? '#1D9E75' : '#c8ead9',
                    transition: 'background 0.2s',
                  }} />
                </button>
              )
            })}
          </div>

          {/* footer */}
          <div style={{ padding: '8px 14px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
            {anyActive && (
              <button
                onClick={reset}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '999px',
                  border: '1.5px solid #c8ead9',
                  background: 'white',
                  color: '#5a9e85',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: "'Nunito', sans-serif",
                  transition: 'all 0.15s',
                }}
              >↺ איפוס</button>
            )}
            <a
              href="/accessibility"
              style={{
                flex: 2,
                padding: '10px 0',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #1D9E75, #148f64)',
                color: 'white',
                fontWeight: 700,
                fontSize: 13,
                textDecoration: 'none',
                textAlign: 'center',
                display: 'block',
              }}
            >הצהרת נגישות</a>
          </div>
        </div>
      )}
    </>
  )
}
