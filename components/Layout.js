// components/Layout.js
import { useState } from 'react'

export const NAV = [
  ['/', 'ראשי'],
  ['/rehab', 'שיקום'],
  ['/treatment', 'טיפול'],
  ['/practitioners', 'מטפלים פרטיים'],
  ['/map', 'מפה'],
  ['/calculator', 'מחשבון'],
  ['/guide', 'מדריך'],
  ['/register', 'הוספת שירות'],
  ['/about', 'אודות'],
  ['/contact', 'צור קשר'],
]

const SITE_URL = 'https://rehabdirectoryil.vercel.app'

export function SiteHeader({ currentPath = '', title = '', subtitle = '', headerBg = '#1A3A5C' }) {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <>
      <a href="#main-content" style={{
        position: 'absolute', top: '-40px', right: 0,
        background: headerBg, color: 'white', padding: '8px 16px',
        borderRadius: '0 0 8px 8px', fontWeight: 700, fontSize: 14,
        textDecoration: 'none', zIndex: 9999, transition: 'top 0.2s',
      }}
        onFocus={e => e.currentTarget.style.top = '0'}
        onBlur={e => e.currentTarget.style.top = '-40px'}
      >דלג לתוכן הראשי</a>

      <header style={{
        background: headerBg, color: 'white',
        padding: '10px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        flexWrap: 'wrap', gap: 8, flexShrink: 0,
        position: 'relative', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="/" aria-label="דף הבית">
            <img src="/logo.png" alt="בריאות נפש בישראל"
              style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          </a>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{title || 'בריאות נפש בישראל'}</div>
            {subtitle && <div style={{ fontSize: 11, opacity: 0.75 }}>{subtitle}</div>}
          </div>
        </div>

        {/* Desktop nav */}
        <nav aria-label="ניווט ראשי" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', '@media(max-width:768px)': { display: 'none' } }}>
          <style>{`
            @media(max-width:768px){ .desktop-nav{display:none!important} .mobile-menu-btn{display:flex!important} }
            @media(min-width:769px){ .mobile-menu-btn{display:none!important} }
          `}</style>
          <span className="desktop-nav" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'white',
                background: currentPath === href ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
                borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12,
                border: currentPath === href ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.25)',
                textDecoration: 'none',
              }}>{label}</a>
            ))}
          </span>

          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setNavOpen(v => !v)}
            aria-label={navOpen ? 'סגור תפריט' : 'פתח תפריט'}
            aria-expanded={navOpen}
            style={{
              display: 'none', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', borderRadius: 8, padding: '6px 12px',
              fontSize: 18, cursor: 'pointer', lineHeight: 1,
            }}>
            {navOpen ? '✕' : '☰'}
          </button>
        </nav>
      </header>

      {/* Mobile nav dropdown */}
      {navOpen && (
        <div style={{
          background: headerBg, borderBottom: '1px solid rgba(255,255,255,0.15)',
          padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2,
          zIndex: 99,
        }}>
          {NAV.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setNavOpen(false)}
              style={{
                color: currentPath === href ? '#FFE066' : 'rgba(255,255,255,0.85)',
                padding: '10px 12px', borderRadius: 8,
                fontWeight: currentPath === href ? 800 : 600, fontSize: 14,
                textDecoration: 'none',
                background: currentPath === href ? 'rgba(255,255,255,0.1)' : 'transparent',
                display: 'block',
              }}>{label}</a>
          ))}
        </div>
      )}
    </>
  )
}

export function SiteFooter({ color = '#1A3A5C' }) {
  return (
    <footer style={{
      background: color, color: 'rgba(255,255,255,0.7)',
      textAlign: 'center', padding: '24px 20px', fontSize: 13, marginTop: 48,
    }}>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        {[
          ['/about', 'אודות'],
          ['/contact', 'צור קשר'],
          ['/guide', 'מדריך'],
          ['/register', 'הוספת שירות'],
          ['/legal', 'תנאי שימוש'],
          ['/accessibility', 'הצהרת נגישות'],
        ].map(([href, label]) => (
          <a key={href} href={href} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{label}</a>
        ))}
      </div>
      <div>בריאות נפש בישראל © {new Date().getFullYear()}</div>
    </footer>
  )
}

export function EmptyState({ onClear, message = 'לא נמצאו שירותים', color = '#8B00D4' }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px', color: '#aaa' }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>🔍</div>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8, color: '#555' }}>{message}</div>
      <div style={{ fontSize: 14, color: '#aaa', marginBottom: 24 }}>נסו לשנות את הפילטרים או לחפש מחדש</div>
      {onClear && (
        <button onClick={onClear} style={{
          background: color, color: 'white', border: 'none',
          borderRadius: '999px', padding: '12px 28px',
          fontWeight: 700, fontSize: 14, cursor: 'pointer',
          fontFamily: "'Nunito', sans-serif",
        }}>נקה פילטרים</button>
      )}
    </div>
  )
}

export function CallToAction({ phone, whatsapp, email, website, color = '#0F4C75', name = '' }) {
  if (!phone && !whatsapp && !email && !website) return null

  const wa = whatsapp && phone
    ? `https://wa.me/972${phone.replace(/^0/, '').replace(/[-\s]/g, '')}`
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {phone && (
        <a href={`tel:${phone}`}
          aria-label={`התקשרו ל-${name}: ${phone}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: '#22c55e', color: 'white', textDecoration: 'none',
            fontWeight: 800, fontSize: 16, padding: '14px 24px',
            borderRadius: '999px', boxShadow: '0 4px 0 #16a34a',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 0 #16a34a' }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 0 #16a34a' }}>
          📞 התקשרו עכשיו — {phone}
        </a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer"
          aria-label={`שלחו WhatsApp ל-${name}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: '#25D366', color: 'white', textDecoration: 'none',
            fontWeight: 700, fontSize: 15, padding: '12px 24px',
            borderRadius: '999px', boxShadow: '0 3px 0 #1da851',
            transition: 'all 0.15s',
          }}>
          💬 שלחו הודעה בוואטסאפ
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`}
          aria-label={`שלחו מייל ל-${name}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'white', color, textDecoration: 'none',
            fontWeight: 600, fontSize: 14, padding: '11px 20px',
            borderRadius: '999px', border: `1.5px solid ${color}`,
          }}>
          ✉️ {email}
        </a>
      )}
      {website && (
        <a href={website} target="_blank" rel="noopener noreferrer"
          aria-label={`אתר האינטרנט של ${name}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            color, textDecoration: 'none', fontWeight: 600, fontSize: 14,
            padding: '8px 0',
          }}>
          🌐 לאתר האינטרנט
        </a>
      )}
    </div>
  )
}
