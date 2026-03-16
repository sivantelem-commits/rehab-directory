import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import ServiceCard from '../components/ServiceCard'

const PURPLE = '#6B21A8'
const DEEP = '#4C0080'

// ─── שאלות ───────────────────────────────────────────────
const STEPS = [
  {
    id: 'sal',
    question: 'האם יש זכאות לסל שיקום?',
    hint: 'זכאות ניתנת ממשרד הבריאות לאחר אישור ביטוח לאומי',
    options: [
      { icon: '✅', label: 'כן, יש זכאות לסל שיקום', value: 'yes' },
      { icon: '❌', label: 'לא', value: 'no' },
      { icon: '🤔', label: 'לא בטוח/ה', value: 'unknown' },
    ],
  },
  {
    id: 'goal',
    question: 'מה המטרה העיקרית?',
    hint: 'ניתן לבחור יותר מאחד',
    multi: true,
    options: [
      { icon: '🏠', label: 'מגורים תומכים', value: 'דיור' },
      { icon: '💼', label: 'תעסוקה', value: 'תעסוקה' },
      { icon: '📚', label: 'השכלה', value: 'השכלה' },
      { icon: '👥', label: 'חיי חברה ופנאי', value: 'חברה ופנאי' },
      { icon: '🤝', label: 'ליווי ותמיכה', value: 'ליווי ותמיכה' },
      { icon: '🏥', label: 'טיפול נפשי / פסיכיאטרי', value: 'treatment' },
    ],
  },
  {
    id: 'district',
    question: 'באיזה אזור?',
    options: [
      { icon: '🌍', label: 'ארצי (לא משנה)', value: 'national' },
      { icon: '🔵', label: 'צפון', value: 'צפון' },
      { icon: '🔵', label: 'חיפה', value: 'חיפה' },
      { icon: '🔵', label: 'מרכז', value: 'מרכז' },
      { icon: '🔵', label: 'תל אביב', value: 'תל אביב' },
      { icon: '🔵', label: 'ירושלים', value: 'ירושלים' },
      { icon: '🔵', label: 'דרום', value: 'דרום' },
    ],
  },
]

// ─── בניית פרמטרי חיפוש ───────────────────────────────────
function buildApiParams(answers) {
  const { sal, goal = [], district } = answers
  const rehabGoals = goal.filter(g => g !== 'treatment')
  const wantsTreatment = goal.includes('treatment')

  const params = []

  function districtParams(district) {
    const p = new URLSearchParams()
    // national = הצג הכל ללא סינון אזור
    if (district && district !== 'national') p.set('district', district)
    return p
  }

  // תמיד הצג שיקום לפי קטגוריות שנבחרו
  if (rehabGoals.length > 0) {
    rehabGoals.forEach(cat => {
      const p = districtParams(district)
      p.set('category', cat)
      params.push({ label: cat, url: `/api/services?${p}`, page: 'rehab' })
    })
  }

  // טיפול רק אם ביקשו במפורש
  if (wantsTreatment) {
    const p = districtParams(district)
    params.push({ label: 'טיפול נפשי', url: `/api/services?${p}`, page: 'treatment' })
  }

  // fallback — אם לא נבחרה שום מטרה
  if (params.length === 0) {
    const p = districtParams(district)
    params.push({ label: 'שירותי שיקום', url: `/api/services?${p}`, page: 'rehab' })
  }

  return params
}

// ─── קומפוננטים ───────────────────────────────────────────
function ProgressBar({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i < current - 1 ? DEEP : i === current - 1 ? '#A855F7' : '#e5e7eb',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  )
}

function OptionBtn({ icon, label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'right',
      border: selected ? `1.5px solid ${PURPLE}` : '1px solid #e5e7eb',
      background: selected ? '#f5f3ff' : '#fff',
      transition: 'all 0.15s', width: '100%',
      fontFamily: "'Nunito', sans-serif",
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{label}</span>
    </button>
  )
}

function NoResults({ onReset }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#555', marginBottom: 8 }}>
        לא נמצאו שירותים תואמים
      </div>
      <p style={{ fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
        נסה לשנות את האזור או הקטגוריה
      </p>
      <button onClick={onReset} style={{
        background: `linear-gradient(160deg, #8B00D4, ${DEEP})`,
        color: '#fff', border: 'none', borderRadius: '999px',
        padding: '10px 24px', fontWeight: 700, fontSize: 13,
        cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
      }}>חזור להתחלה</button>
    </div>
  )
}

// ─── דף ראשי ─────────────────────────────────────────────
export default function Calculator() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [salNote, setSalNote] = useState(null)

  const current = STEPS[step - 1]
  const sel = current
    ? (current.multi ? (answers[current.id] || []) : answers[current.id])
    : null
  const isReady = current
    ? (current.multi ? sel.length > 0 : sel !== undefined && sel !== null)
    : false

  function toggle(value) {
    const id = current.id
    if (!current.multi) {
      setAnswers(prev => ({ ...prev, [id]: value }))
      return
    }
    const arr = answers[id] || []
    if (arr.includes(value)) setAnswers(prev => ({ ...prev, [id]: arr.filter(x => x !== value) }))
    else setAnswers(prev => ({ ...prev, [id]: [...arr, value] }))
  }

  async function finish(finalAnswers) {
    setLoading(true)
    const queries = buildApiParams(finalAnswers)

    // הצג הערה אם לא בטוח לגבי זכאות
    if (finalAnswers.sal === 'unknown') {
      setSalNote('אם עדיין אין זכאות — פנה לביטוח לאומי ואז למשרד הבריאות לקבלת סל שיקום.')
    } else if (finalAnswers.sal === 'no') {
      setSalNote('שירותי שיקום בקהילה מחייבים זכאות סל שיקום. לקבלת זכאות פנה לביטוח לאומי ולאחר מכן למשרד הבריאות.')
    }

    try {
      // שלח את כל הבקשות במקביל
      const fetches = await Promise.all(
        queries.map(q => fetch(q.url).then(r => r.json()).then(data => ({
          label: q.label,
          page: q.page,
          services: Array.isArray(data) ? data : [],
        })))
      )
      const withResults = fetches.filter(f => f.services.length > 0)

      // אם אין תוצאות לאזור שנבחר — נסה בלי סינון אזור אבל שמור על קטגוריה
      if (withResults.length === 0 && finalAnswers.district && finalAnswers.district !== 'national') {
        const fallbackQueries = buildApiParams({ ...finalAnswers, district: null })
        const fallbackFetches = await Promise.all(
          fallbackQueries.map(q => fetch(q.url).then(r => r.json()).then(data => ({
            label: q.label,
            page: q.page,
            services: Array.isArray(data) ? data : [],
          })))
        )
        const fallbackResults = fallbackFetches.filter(f => f.services.length > 0)
        if (fallbackResults.length > 0) {
          setSalNote(prev =>
            (prev ? prev + ' ' : '') +
            `טרם נוספו שירותים באזור ${finalAnswers.district} — מוצגים שירותים מכל הארץ.`
          )
          setResults(fallbackResults)
          return
        }
      }

      setResults(withResults.length > 0 ? withResults : [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function next() {
    if (step === 0) { setStep(1); return }
    if (step < STEPS.length) {
      setStep(s => s + 1)
      return
    }
    // שלב אחרון — שלוף תוצאות
    finish(answers)
  }

  function back() {
    if (results) { setResults(null); setSalNote(null); return }
    if (step > 1) setStep(s => s - 1)
    else setStep(0)
  }

  function reset() {
    setStep(0); setAnswers({}); setResults(null); setSalNote(null)
  }

  // ── מסך פתיחה ──
  if (step === 0) {
    return (
      <Page title="מחשבון איתור מסלול">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 16px' }}>
          <div style={{
            background: '#fff', borderRadius: 20, border: '1px solid #e9d5ff',
            padding: '40px 28px', textAlign: 'center',
            boxShadow: '0 4px 24px rgba(76,0,128,0.08)',
          }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🧭</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#3d2a6e', marginBottom: 10 }}>
              מחשבון איתור מסלול
            </h1>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 28 }}>
              3 שאלות קצרות — ותראה שירותים אמיתיים מהמאגר שלנו שמתאימים לך.
            </p>
            <button type="button" onClick={next} style={btnStyle()}>
              בואו נתחיל ←
            </button>
          </div>
        </div>
      </Page>
    )
  }

  // ── מסך טעינה ──
  if (loading) {
    return (
      <Page title="מחפש שירותים...">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: `3px solid #e9d5ff`, borderTopColor: PURPLE,
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 20px',
          }} />
          <p style={{ color: '#9b88bb', fontWeight: 600 }}>מחפש שירותים מתאימים...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </Page>
    )
  }

  // ── מסך תוצאות ──
  if (results !== null) {
    const total = results.reduce((sum, g) => sum + g.services.length, 0)

    return (
      <Page title="שירותים מתאימים">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>

          {/* כותרת */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#3d2a6e', marginBottom: 6 }}>
              {total > 0 ? `נמצאו ${total} שירותים מתאימים` : 'לא נמצאו שירותים'}
            </h2>

            {salNote && (
              <div style={{
                background: '#fffbeb', border: '1px solid #fcd34d',
                borderRadius: 10, padding: '10px 14px',
                fontSize: 13, color: '#92400e', marginBottom: 12,
              }}>
                💡 {salNote}
              </div>
            )}

            <button onClick={reset} style={{
              fontSize: 13, color: '#9ca3af', background: 'none',
              border: 'none', cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
              fontWeight: 600, padding: 0,
            }}>
              ← חזור להתחלה
            </button>
          </div>

          {total === 0 ? (
            <NoResults onReset={reset} />
          ) : (
            results.map((group, gi) => (
              <div key={gi} style={{ marginBottom: 36 }}>
                {/* כותרת קטגוריה */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 14,
                }}>
                  <span style={{
                    background: group.page === 'treatment'
                      ? 'linear-gradient(160deg, #0891B2, #164E63)'
                      : `linear-gradient(160deg, #8B00D4, ${DEEP})`,
                    color: '#fff', fontSize: 12, fontWeight: 700,
                    padding: '4px 14px', borderRadius: 999,
                  }}>
                    {group.label}
                  </span>
                  <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>
                    {group.services.length} שירותים
                  </span>
                  <a
                    href={group.page === 'rehab' ? '/rehab' : '/treatment'}
                    style={{
                      marginRight: 'auto', fontSize: 13, color: PURPLE,
                      fontWeight: 700, textDecoration: 'none',
                    }}
                  >
                    ראה הכל ←
                  </a>
                </div>

                {/* כרטיסי שירות */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 16,
                }}>
                  {group.services.slice(0, 6).map(s => (
                    <div
                      key={s.id}
                      onClick={() => router.push(`/service/${s.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <ServiceCard service={s} />
                    </div>
                  ))}
                </div>

                {group.services.length > 6 && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <a
                      href={group.page === 'rehab' ? '/rehab' : '/treatment'}
                      style={{
                        fontSize: 14, fontWeight: 700, color: PURPLE,
                        textDecoration: 'none',
                      }}
                    >
                      + {group.services.length - 6} שירותים נוספים ←
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Page>
    )
  }

  // ── שלבי הוויזארד ──
  return (
    <Page title="מחשבון איתור מסלול">
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }}>
        <ProgressBar current={step} total={STEPS.length} />
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20, fontWeight: 600 }}>
          שלב {step} מתוך {STEPS.length}
        </p>

        <div style={{
          background: '#fff', borderRadius: 20,
          border: '1px solid #e9d5ff', padding: '24px 20px',
          boxShadow: '0 4px 16px rgba(76,0,128,0.06)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#3d2a6e', marginBottom: current.hint ? 4 : 18 }}>
            {current.question}
          </h2>
          {current.hint && (
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14, fontWeight: 600 }}>
              {current.hint}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {current.options.map(o => (
              <OptionBtn
                key={o.value}
                icon={o.icon}
                label={o.label}
                selected={current.multi ? sel.includes(o.value) : sel === o.value}
                onClick={() => toggle(o.value)}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
            <button type="button" onClick={back} style={{
              padding: '9px 18px', fontSize: 13, fontWeight: 700, color: '#6b7280',
              cursor: 'pointer', border: '1px solid #e5e7eb', borderRadius: '999px',
              background: 'transparent', fontFamily: "'Nunito', sans-serif",
            }}>
              ← חזרה
            </button>
            <button type="button" onClick={next} disabled={!isReady} style={btnStyle(!isReady)}>
              {step === STEPS.length ? 'הצג שירותים מתאימים ✦' : 'המשך →'}
            </button>
          </div>
        </div>
      </div>
    </Page>
  )
}

// ─── עזרים ───────────────────────────────────────────────
function btnStyle(disabled = false) {
  return {
    background: disabled ? '#d8b4fe' : `linear-gradient(160deg, #8B00D4, ${DEEP})`,
    color: '#fff', border: 'none', borderRadius: '999px',
    padding: '10px 22px', fontSize: 13, fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: "'Nunito', sans-serif",
    boxShadow: disabled ? 'none' : `0 3px 0 #2E0060`,
    transition: 'all 0.15s',
  }
}

function Page({ title, children }) {
  return (
    <>
      <Head>
        <title>{title} | בריאות נפש בישראל</title>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f7f3ff' }}>
        <header style={{
          background: 'linear-gradient(135deg, #2E0060, #8B00D4)', color: 'white',
          padding: '10px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
          boxShadow: '0 2px 12px rgba(76,0,128,0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="לוגו" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>מחשבון איתור מסלול</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/about', 'אודות'], ['/contact', '✉️ צור קשר']].map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'white',
                background: href === '/calculator' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12,
                border: '1.5px solid rgba(255,255,255,0.2)', textDecoration: 'none',
              }}>{label}</a>
            ))}
          </nav>
        </header>
        {children}
        <footer style={{
          background: 'linear-gradient(135deg, #2E0060, #4C0080)', color: 'rgba(255,255,255,0.75)',
          textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48, fontWeight: 500,
        }}>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}
