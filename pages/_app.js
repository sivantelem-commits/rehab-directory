import { useState, useEffect } from 'react'
import AccessibilityWidget from '../components/AccessibilityWidget'

function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
    if (typeof window.__loadGA === 'function') window.__loadGA()
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="הסכמה לשימוש בעוגיות"
      dir="rtl"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        left: 0,
        zIndex: 9999,
        background: '#1A3A5C',
        color: 'white',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        fontFamily: "'Nunito', sans-serif",
        fontSize: 14,
        boxShadow: '0 -2px 16px rgba(0,0,0,0.2)',
      }}
    >
      <p style={{ margin: 0, flex: 1, minWidth: 200, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
        אנו משתמשים ב-Google Analytics לניתוח תנועה אנונימי בלבד.{' '}
        <a href="/legal" style={{ color: '#9FE1CB', textDecoration: 'underline' }}>מדיניות פרטיות</a>
      </p>
      <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
        <button
          onClick={decline}
          style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.7)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            borderRadius: '999px',
            padding: '8px 18px',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          דחייה
        </button>
        <button
          onClick={accept}
          style={{
            background: '#1D9E75',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            padding: '8px 18px',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          אני מסכים/ה
        </button>
      </div>
    </div>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <CookieBanner />
      <AccessibilityWidget />
    </>
  )
}
