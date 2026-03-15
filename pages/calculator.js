import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const PURPLE = '#6B21A8'
const DEEP = '#4C0080'

// ─── שאלות הוויזארד ───────────────────────────────────────
const STEPS = [
  {
    id: 'who',
    question: 'מי מחפש מסגרת?',
    multi: false,
    options: [
      { icon: '🙋', label: 'אני מחפש/ת עבור עצמי', value: 'self' },
      { icon: '👨‍👩‍👧', label: 'אני מחפש/ת עבור בן/בת משפחה', value: 'family' },
      { icon: '🩺', label: 'איש/ת מקצוע', value: 'pro' },
    ],
  },
  {
    id: 'sal',
    question: 'האם יש זכאות לסל שיקום?',
    hint: 'זכאות ניתנת ממשרד הבריאות לאחר אישור ביטוח לאומי',
    multi: false,
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
      { icon: '🏠', label: 'מגורים תומכים', value: 'housing' },
      { icon: '💼', label: 'תעסוקה', value: 'employment' },
      { icon: '📚', label: 'השכלה', value: 'education' },
      { icon: '👥', label: 'חיי חברה ופנאי', value: 'social' },
      { icon: '🤝', label: 'ליווי ותמיכה', value: 'support' },
      { icon: '🏥', label: 'טיפול נפשי / פסיכיאטרי', value: 'treatment' },
    ],
  },
  {
    id: 'district',
    question: 'באיזה אזור?',
    multi: false,
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

// ─── לוגיקת המלצה ────────────────────────────────────────
const GOAL_TO_REHAB_CATEGORY = {
  housing: 'דיור',
  employment: 'תעסוקה',
  education: 'השכלה',
  social: 'חברה ופנאי',
  support: 'ליווי ותמיכה',
}

function buildResult(answers) {
  const { sal, goal = [], district } = answers
  const hasSal = sal === 'yes' || sal === 'unknown'
  const wantsTreatment = goal.includes('treatment')
  const rehabGoals = goal.filter(g => g !== 'treatment')

  // אם רוצה טיפול בלבד
  if (wantsTreatment && rehabGoals.length === 0) {
    return {
      type: 'treatment',
      title: 'טיפול נפשי / פסיכיאטרי',
      description: 'מצאנו עבורך שירותי טיפול — מרפאות, אשפוז יום ובתים מאזנים.',
      salNote: null,
      searchUrl: buildSearchUrl('treatment', null, district),
      secondUrl: null,
      secondLabel: null,
    }
  }

  // יש זכאות סל שיקום (או לא בטוח) + יש מטרת שיקום
  if (hasSal && rehabGoals.length > 0) {
    const firstGoal = rehabGoals[0]
    const category = GOAL_TO_REHAB_CATEGORY[firstGoal]
    const salNote = sal === 'unknown'
      ? 'אם עדיין אין זכאות — כדאי לפנות לביטוח לאומי ואז למשרד הבריאות לקבלת סל שיקום.'
      : null

    return {
      type: 'rehab',
      title: getCategoryTitle(firstGoal),
      description: buildRehabDescription(rehabGoals, district),
      salNote,
      searchUrl: buildSearchUrl('rehab', category, district),
      secondUrl: wantsTreatment ? buildSearchUrl('treatment', null, district) : null,
      secondLabel: wantsTreatment ? 'חפש גם שירותי טיפול ←' : null,
    }
  }

  // אין זכאות ורוצה שיקום
  if (!hasSal && rehabGoals.length > 0) {
    return {
      type: 'info',
      title: 'כדאי להתחיל בהגשת זכאות לסל שיקום',
      description: 'שירותי שיקום בקהילה מחייבים זכאות. כדי לקבל זכאות: פנה לביטוח לאומי לקביעת נכות, ואז למשרד הבריאות לפתיחת תיק שיקום.',
      salNote: null,
      searchUrl: buildSearchUrl('rehab', null, district),
      secondUrl: wantsTreatment ? buildSearchUrl('treatment', null, district) : null,
      secondLabel: wantsTreatment ? 'חפש שירותי טיפול בינתיים ←' : 'עיין בשירותי השיקום הקיימים ←',
    }
  }

  // ברירת מחדל
  return {
    type: 'treatment',
    title: 'שירותי טיפול ושיקום',
    description: 'מצאנו עבורך שירותים רלוונטיים לפי האזור שבחרת.',
    salNote: null,
    searchUrl: buildSearchUrl('rehab', null, district),
    secondUrl: buildSearchUrl('treatment', null, district),
    secondLabel: 'חפש גם שירותי טיפול ←',
  }
}

function getCategoryTitle(goal) {
  const map = {
    housing: 'שירותי דיור תומך',
    employment: 'שירותי תעסוקה נתמכת',
    education: 'שירותי השכלה',
    social: 'מועדונים חברתיים ופנאי',
    support: 'שירותי ליווי ותמיכה',
  }
  return map[goal] || 'שירותי שיקום'
}

function buildRehabDescription(goals, district) {
  const names = goals.map(g => getCategoryTitle(g)).join(', ')
  const where = district === 'national' ? 'ברחבי הארץ' : `באזור ${district}`
  return `מצאנו עבורך שירותי שיקום ${where}: ${names}.`
}

function buildSearchUrl(page, category, district) {
  const base = `/${page}`
  const params = new URLSearchParams()
  if (district && district !== 'national') params.set('district', district)
  if (category) params.set('category', category)
  const q = params.toString()
  return q ? `${base}?${q}` : base
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

function OptionBtn({ icon, label, sub, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'right',
      border: selected ? `1.5px solid ${PURPLE}` : '1px solid #e5e7eb',
      background: selected ? '#f5f3ff' : '#fff',
      transition: 'all 0.15s', width: '100%',
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{label}</span>
      {sub && <span style={{ fontSize: 12, color: '#9ca3af', marginRight: 'auto' }}>{sub}</span>}
    </button>
  )
}

// ─── דף ראשי ─────────────────────────────────────────────
export default function Calculator() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

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

  function next() {
    if (step === 0) { setStep(1); return }
    if (step < STEPS.length) { setStep(s => s + 1); return }
    setResult(buildResult(answers))
  }

  function back() {
    if (result) { setResult(null); return }
    if (step > 1) setStep(s => s - 1)
    else setStep(0)
  }

  function reset() {
    setStep(0); setAnswers({}); setResult(null)
  }

  // ── צבעים לפי סוג תוצאה ──
  const typeColors = {
    rehab: { color: DEEP, light: '#f5f3ff', border: PURPLE, label: 'שיקום' },
    treatment: { color: '#0E7490', light: '#ecfeff', border: '#06B6D4', label: 'טיפול' },
    info: { color: '#92400E', light: '#fffbeb', border: '#F59E0B', label: 'מידע' },
  }

  // ── מסך פתיחה ──
  if (step === 0) {
    return (
      <>
        <Head>
          <title>מחשבון איתור מסלול | בריאות נפש בישראל</title>
          <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
        </Head>
        <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f7f3ff' }}>
          <Header />
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
                4 שאלות קצרות — ותקבל המלצה על שירותים קיימים באתר שמתאימים לך.
              </p>
              <button type="button" onClick={next} style={{
                background: `linear-gradient(160deg, #8B00D4, ${DEEP})`,
                color: '#fff', border: 'none', borderRadius: '999px',
                padding: '13px 36px', fontSize: 16, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Nunito', sans-serif",
                boxShadow: `0 6px 0 #2E0060, 0 10px 24px rgba(76,0,128,0.3)`,
              }}>
                בואו נתחיל ←
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── מסך תוצאה ──
  if (result) {
    const tc = typeColors[result.type] || typeColors.rehab
    return (
      <>
        <Head>
          <title>המלצה מותאמת אישית | בריאות נפש בישראל</title>
          <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
        </Head>
        <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f7f3ff' }}>
          <Header />
          <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }}>

            {/* כרטיס תוצאה */}
            <div style={{
              borderRadius: 20, border: `1.5px solid ${tc.border}`,
              background: tc.light, padding: '24px 22px', marginBottom: 14,
            }}>
              <span style={{
                display: 'inline-block', fontSize: 11, fontWeight: 700,
                padding: '3px 14px', borderRadius: 20,
                background: tc.color, color: '#fff', marginBottom: 14,
              }}>{tc.label}</span>

              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: 10 }}>
                {result.title}
              </h2>
              <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: result.salNote ? 14 : 0 }}>
                {result.description}
              </p>

              {result.salNote && (
                <div style={{
                  background: 'rgba(255,255,255,0.7)', borderRadius: 10,
                  padding: '12px 14px', border: '1px solid rgba(0,0,0,0.06)',
                  fontSize: 13, color: '#374151', lineHeight: 1.6,
                }}>
                  💡 {result.salNote}
                </div>
              )}
            </div>

            {/* כפתורי פעולה */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <a href={result.searchUrl} style={{
                display: 'block', textAlign: 'center',
                padding: '14px 20px',
                background: `linear-gradient(160deg, #8B00D4, ${DEEP})`,
                color: '#fff', borderRadius: '999px', fontSize: 15,
                fontWeight: 700, textDecoration: 'none',
                boxShadow: `0 4px 0 #2E0060, 0 8px 20px rgba(76,0,128,0.25)`,
                fontFamily: "'Nunito', sans-serif",
              }}>
                🔍 חפש שירותים מתאימים
              </a>

              {result.secondUrl && (
                <a href={result.secondUrl} style={{
                  display: 'block', textAlign: 'center',
                  padding: '12px 20px',
                  background: '#fff',
                  color: DEEP, borderRadius: '999px', fontSize: 14,
                  fontWeight: 700, textDecoration: 'none',
                  border: `2px solid #e9d5ff`,
                  fontFamily: "'Nunito', sans-serif",
                }}>
                  {result.secondLabel}
                </a>
              )}

              <button onClick={reset} style={{
                padding: '10px 16px', border: '1px solid #e5e7eb',
                borderRadius: '999px', background: 'transparent',
                fontSize: 13, color: '#9ca3af', cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif", fontWeight: 600,
              }}>
                ← חזור להתחלה
              </button>
            </div>

          </div>
        </div>
      </>
    )
  }

  // ── שלבי הוויזארד ──
  return (
    <>
      <Head>
        <title>מחשבון איתור מסלול | בריאות נפש בישראל</title>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f7f3ff' }}>
        <Header />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }}>
          <ProgressBar current={step} total={STEPS.length} />
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
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
              <button type="button" onClick={next} disabled={!isReady} style={{
                padding: '9px 22px', fontSize: 13, fontWeight: 700,
                borderRadius: '999px', border: 'none',
                cursor: isReady ? 'pointer' : 'not-allowed',
                background: isReady
                  ? `linear-gradient(160deg, #8B00D4, ${DEEP})`
                  : '#d8b4fe',
                color: '#fff', fontFamily: "'Nunito', sans-serif",
                boxShadow: isReady ? `0 3px 0 #2E0060` : 'none',
                transition: 'all 0.15s',
              }}>
                {step === STEPS.length ? 'מצא לי מסלול ✦' : 'המשך →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Header (זהה לשאר הדפים) ──────────────────────────────
function Header() {
  return (
    <header style={{
      background: 'linear-gradient(135deg, #2E0060, #8B00D4)', color: 'white',
      padding: '10px 20px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(76,0,128,0.2)',
      flexWrap: 'wrap', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="/logo.png" alt="לוגו" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>מחשבון איתור מסלול</div>
        </div>
      </div>
      <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          ['/', '🏠 ראשי'],
          ['/rehab', '♿ שיקום'],
          ['/treatment', '🏥 טיפול'],
          ['/map', '🗺️ מפה'],
          ['/register', 'הרשמת שירות'],
          ['/about', 'אודות'],
          ['/contact', '✉️ צור קשר'],
        ].map(([href, label]) => (
          <a key={href} href={href} style={{
            color: 'white',
            background: href === '/calculator' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
            borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12,
            border: href === '/calculator' ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.2)',
            textDecoration: 'none',
          }}>{label}</a>
        ))}
      </nav>
    </header>
  )
}
