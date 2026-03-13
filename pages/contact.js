import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const NAV = [['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register', 'הרשמת שירות'], ['/about', 'אודות'], ['/contact', '✉️ צור קשר'], ['/admin', 'ניהול']]

const TYPES = [
  { value: 'improvement', label: '💡 הצעה לשיפור הפורטל' },
  { value: 'fix', label: '🔧 תיקון/עדכון פרטי שירות קיים' },
  { value: 'inactive', label: '⚠️ דיווח על שירות לא פעיל' },
  { value: 'new_service', label: '➕ הצעה לשירות חדש שחסר' },
  { value: 'general', label: '💬 פנייה כללית / שאלה' },
]

export default function Contact() {
  const router = useRouter()
  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')


  // מילוי אוטומטי מ-query params
  useEffect(() => {
    if (!router.isReady) return
    const { type: qType, serviceName: qService } = router.query
    if (qType) setType(qType)
    if (qService) setServiceName(qService)
  }, [router.isReady, router.query])

  const needsServiceName = type === 'fix' || type === 'inactive'

  const handleSubmit = async () => {
    setError('')
    if (!type) return setError('נא לבחור סוג פנייה')
    if (!message.trim()) return setError('נא לכתוב הודעה')

    setSending(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name, email, message, serviceName }),
      })
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      setError('שגיאה בשליחה, נסי שוב')
    } finally {
      setSending(false)
    }
  }

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: 14,
    border: '1.5px solid #C5D0F0', fontSize: 14, background: '#F8F9FF',
    outline: 'none', boxSizing: 'border-box', fontFamily: "'Nunito', sans-serif",
    color: '#1A3A5C',
  }

  return (
    <>
            <Head>
        <title>צור קשר | בריאות נפש בישראל</title>
        <meta name="description" content="יש לכם הערה, תיקון או רעיון לשיפור הפורטל? צרו קשר – נשמח לשמוע." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rehabdirectoryil.vercel.app/contact" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="צור קשר | בריאות נפש בישראל" />
        <meta property="og:description" content="יש לכם הערה, תיקון או רעיון לשיפור הפורטל? צרו קשר – נשמח לשמוע." />
        <meta property="og:url" content="https://rehabdirectoryil.vercel.app/contact" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#F8F9FF' }}>

        <header style={{
          background: '#1A3A5C', color: 'white', padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="לוגו" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>צור קשר</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'white', background: 'rgba(255,255,255,0.1)', borderRadius: '999px',
                padding: '6px 14px', fontWeight: 600, fontSize: 12,
                border: '1.5px solid rgba(255,255,255,0.2)', textDecoration: 'none',
              }}>{label}</a>
            ))}
          </nav>
        </header>

        {/* HERO */}
        <div style={{
          background: 'linear-gradient(135deg, #1A3A5C, #2A5298)',
          color: 'white', padding: '48px 20px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>✉️</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px' }}>צור קשר</h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: 0, maxWidth: 480, marginInline: 'auto' }}>
            יש לכם הערה, תיקון או רעיון? נשמח לשמוע!
          </p>
        </div>

        <main style={{ maxWidth: 620, margin: '0 auto', padding: '40px 16px 64px' }}>

          {sent ? (
            <div style={{
              background: 'white', borderRadius: 20, padding: '52px 32px',
              textAlign: 'center', boxShadow: '0 4px 24px rgba(26,58,92,0.1)',
              border: '1.5px solid #C5D0F0',
            }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#1A3A5C', marginBottom: 10 }}>ההודעה נשלחה!</div>
              <div style={{ fontSize: 15, color: '#666', marginBottom: 28, lineHeight: 1.6 }}>
                תודה על הפנייה. נעשה כמיטב יכולתנו להגיב בהקדם.
              </div>
              <a href="/" style={{
                display: 'inline-block', background: '#1A3A5C', color: 'white',
                borderRadius: '999px', padding: '12px 28px', fontWeight: 700,
                fontSize: 14, textDecoration: 'none',
              }}>חזרה לדף הבית</a>
            </div>
          ) : (
            <div style={{
              background: 'white', borderRadius: 20, padding: '32px 28px',
              boxShadow: '0 4px 24px rgba(26,58,92,0.1)', border: '1.5px solid #C5D0F0',
            }}>

              {/* סוג פנייה */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 10 }}>
                  סוג הפנייה *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {TYPES.map(t => (
                    <label key={t.value} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                      border: `1.5px solid ${type === t.value ? '#1A3A5C' : '#C5D0F0'}`,
                      background: type === t.value ? '#EEF2FF' : '#F8F9FF',
                      transition: 'all 0.15s',
                    }}>
                      <input
                        type="radio" name="type" value={t.value}
                        checked={type === t.value}
                        onChange={() => setType(t.value)}
                        style={{ accentColor: '#1A3A5C', width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 14, fontWeight: type === t.value ? 700 : 500, color: type === t.value ? '#1A3A5C' : '#555' }}>
                        {t.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* שם שירות — רק לתיקון/דיווח */}
              {needsServiceName && (
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 6 }}>
                    שם השירות
                  </label>
                  <input
                    type="text" placeholder="לדוגמה: מרכז שיקום ירושלים"
                    value={serviceName} onChange={e => setServiceName(e.target.value)}
                    style={inp}
                  />
                </div>
              )}

              {/* שם */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 6 }}>
                  שם (אופציונלי)
                </label>
                <input
                  type="text" placeholder="השם שלכם"
                  value={name} onChange={e => setName(e.target.value)}
                  style={inp}
                />
              </div>

              {/* מייל */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 6 }}>
                  מייל לחזרה (אופציונלי)
                </label>
                <input
                  type="email" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={inp}
                />
              </div>

              {/* הודעה */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1A3A5C', marginBottom: 6 }}>
                  הודעה *
                </label>
                <textarea
                  placeholder="כתבו כאן את ההודעה שלכם..."
                  value={message} onChange={e => setMessage(e.target.value)}
                  rows={5}
                  style={{ ...inp, resize: 'vertical', borderRadius: 14, lineHeight: 1.6 }}
                />
              </div>

              {error && (
                <div style={{ background: '#FFF0F0', border: '1px solid #FFCDD2', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#C62828', marginBottom: 16 }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={sending}
                style={{
                  width: '100%', background: sending ? '#aaa' : '#1A3A5C',
                  color: 'white', border: 'none', borderRadius: 20,
                  padding: '14px 0', fontWeight: 800, fontSize: 15,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  fontFamily: "'Nunito', sans-serif",
                  boxShadow: sending ? 'none' : '0 4px 16px rgba(26,58,92,0.25)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!sending) e.currentTarget.style.background = '#2A5298' }}
                onMouseLeave={e => { if (!sending) e.currentTarget.style.background = '#1A3A5C' }}
              >
                {sending ? 'שולח...' : '📨 שלח פנייה'}
              </button>
            </div>
          )}
        </main>

        <footer style={{
          background: '#1A3A5C', color: 'rgba(255,255,255,0.7)',
          textAlign: 'center', padding: '24px', fontSize: 13,
        }}>
          <div style={{ marginBottom: 8 }}>
            {[['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/contact', 'צור קשר'], ['/about', 'אודות']].map(([href, label], i, arr) => (
              <span key={href}>
                <a href={href} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>{label}</a>
                {i < arr.length - 1 && <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>}
              </span>
            ))}
          </div>
          בריאות נפש בישראל © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}
