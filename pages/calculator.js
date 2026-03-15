import { useState } from 'react'

// ─── נתונים ───────────────────────────────────────────────
const STEPS = [
  {
    id: 'who',
    question: 'מי מחפש מסגרת?',
    multi: false,
    options: [
      { icon: '🙋', label: 'עבור עצמי', value: 'self' },
      { icon: '👨‍👩‍👧', label: 'עבור בן/בת משפחה', value: 'family' },
      { icon: '🩺', label: 'איש מקצוע', value: 'pro' },
    ],
  },
  {
    id: 'age',
    question: 'מה קבוצת הגיל?',
    multi: false,
    options: [
      { icon: '🧒', label: 'ילד/ה', sub: 'עד 18', value: 'child' },
      { icon: '🧑', label: 'מבוגר/ת', sub: '18–65', value: 'adult' },
      { icon: '👴', label: 'קשיש/ה', sub: '65+', value: 'elder' },
    ],
  },
  {
    id: 'issues',
    question: 'מה הקשיים העיקריים?',
    hint: 'ניתן לבחור יותר מאחד',
    multi: true,
    options: [
      { icon: '🌧️', label: 'מצב רוח / דיכאון', value: 'depression' },
      { icon: '😰', label: 'חרדה / PTSD', value: 'anxiety' },
      { icon: '🌀', label: 'פסיכוזה / סכיזופרניה', value: 'psychosis' },
      { icon: '🍽️', label: 'הפרעות אכילה', value: 'eating' },
      { icon: '💊', label: 'התמכרות', value: 'addiction' },
      { icon: '🧩', label: 'קשיים תפקודיים', value: 'functional' },
      { icon: '🤔', label: 'לא בטוח/ה', value: 'unsure' },
    ],
  },
  {
    id: 'functioning',
    question: 'מהי רמת התפקוד כיום?',
    multi: false,
    scale: true,
    options: [
      { num: '1', label: 'מתפקד/ת באופן מלא', value: 5 },
      { num: '2', label: 'מתקשה אבל מתפקד/ת', value: 4 },
      { num: '3', label: 'קשה לצאת מהבית', value: 3 },
      { num: '4', label: 'זקוק/ה לתמיכה יומית', value: 2 },
      { num: '5', label: 'זקוק/ה לתמיכה 24/7', value: 1 },
    ],
  },
  {
    id: 'prefs',
    question: 'העדפות נוספות',
    hint: 'אופציונלי — ניתן לבחור כמה',
    multi: true,
    options: [
      { icon: '🗣️', label: 'טיפול בערבית', value: 'arabic' },
      { icon: '🗣️', label: 'טיפול ברוסית', value: 'russian' },
      { icon: '🌈', label: 'LGBTQ+ friendly', value: 'lgbtq' },
      { icon: '✡️', label: 'מגזר חרדי', value: 'haredi' },
      { icon: '🏠', label: 'קרוב לבית', value: 'local' },
      { icon: '➡️', label: 'ללא העדפה', value: 'none' },
    ],
  },
]

// ─── לוגיקת המלצה ────────────────────────────────────────
function getRecommendation(answers) {
  const { age, issues = [], functioning } = answers
  const func = functioning || 3
  const hasAddiction = issues.includes('addiction')
  const hasPsychosis = issues.includes('psychosis')
  const hasEating = issues.includes('eating')

  // אשפוז מלא
  if (func <= 1 || hasPsychosis) {
    return {
      type: 'rehab',
      title: 'אשפוז פסיכיאטרי',
      why: 'רמת התפקוד הנוכחית מצביעה על צורך בתמיכה מלאה ומעקב רפואי צמוד מסביב לשעון. אשפוז מספק סביבה בטוחה, תרופות ומעקב יומיומי.',
      second: 'אחרי שיציב — אשפוז יום כצעד הבא לקראת שיקום בקהילה.',
      questions: ['האם יש מיטות פנויות?', 'מה משך האשפוז הממוצע?', 'האם ניתן לקבל ביקורים?'],
      searchUrl: 'https://rehabdirectoryil.vercel.app/?category=rehab',
    }
  }

  // דיור תומך / שיקום מגורים
  if (func <= 2) {
    return {
      type: 'rehab',
      title: 'דיור תומך / בית מאזן',
      why: 'כאשר קשה לתפקד באופן עצמאי, מגורים בסביבה תומכת עם צוות מקצועי זמין מאפשרים שיקום הדרגתי תוך שמירה על איכות חיים.',
      second: 'אשפוז יום — אם ניתן לשהות בבית אך נדרשת תמיכה אינטנסיבית במשך היום.',
      questions: ['האם יש מקום פנוי?', 'מה כולל הצוות התומך?', 'האם ניתן לצאת חופשי?'],
      searchUrl: 'https://rehabdirectoryil.vercel.app/?category=rehab',
    }
  }

  // התמכרות
  if (hasAddiction) {
    return {
      type: 'rehab',
      title: 'מסגרת שיקום להתמכרויות',
      why: 'התמכרות דורשת מסגרת ייעודית המשלבת טיפול רפואי בגמילה עם תמיכה נפשית וכלים לשינוי אורח חיים לטווח ארוך.',
      second: 'קבוצות תמיכה (כמו NA/AA) — תוספת חשובה לכל מסלול שיקום.',
      questions: ['האם יש תמיכה רפואית לגמילה?', 'מה אורך התכנית?', 'האם יש תמיכה למשפחה?'],
      searchUrl: 'https://rehabdirectoryil.vercel.app/?category=rehab',
    }
  }

  // הפרעות אכילה
  if (hasEating) {
    return {
      type: 'treatment',
      title: 'מרפאה ייעודית להפרעות אכילה',
      why: 'הפרעות אכילה דורשות צוות רב-מקצועי — פסיכיאטר, תזונאי ופסיכולוג — העובדים יחד. מרפאה ייעודית מספקת את כל זה במקום אחד.',
      second: 'אשפוז יום להפרעות אכילה — אם הטיפול האמבולטורי לא מספיק.',
      questions: ['האם יש תזונאי בצוות?', 'מה תדירות הטיפול?', 'האם יש תמיכה למשפחה?'],
      searchUrl: 'https://rehabdirectoryil.vercel.app/?category=treatment',
    }
  }

  // ילדים ונוער
  if (age === 'child') {
    return {
      type: 'treatment',
      title: 'מרפאה לבריאות הנפש לילדים ונוער',
      why: 'ילדים ובני נוער זקוקים לטיפול המותאם לגיל — פסיכולוג ילדים, פסיכיאטר ילדים, ולעיתים גם עבודה עם המשפחה כולה.',
      second: 'מסגרת שיקום ייעודית לנוער — אם הקשיים משפיעים על בית הספר או התפקוד היומיומי.',
      questions: ['האם הצוות מתמחה בילדים?', 'האם מעורבים ההורים בטיפול?', 'מה הגיל המינימלי?'],
      searchUrl: 'https://rehabdirectoryil.vercel.app/?category=treatment',
    }
  }

  // קשישים
  if (age === 'elder') {
    return {
      type: 'treatment',
      title: 'טיפול אמבולטורי לגיל השלישי',
      why: 'קשישים זקוקים לטיפול המתחשב במצב הגופני, בתרופות ובמציאות החברתית שלהם. מרפאה גריאטרית-נפשית מתאימה ביותר.',
      second: 'מרכז יום גריאטרי — אם יש גם קשיים תפקודיים יומיומיים.',
      questions: ['האם הצוות מתמחה בגריאטריה?', 'האם יש הסעות?', 'מה שעות הפתיחה?'],
      searchUrl: 'https://rehabdirectoryil.vercel.app/?category=treatment',
    }
  }

  // ברירת מחדל — טיפול אמבולטורי
  if (func >= 4) {
    return {
      type: 'treatment',
      title: 'טיפול אמבולטורי (מרפאת חוץ)',
      why: 'כשהתפקוד היומיומי שמור יחסית, טיפול פרטני או קבוצתי במרפאת חוץ הוא הצעד הנכון — ממוקד, גמיש, ומאפשר המשך שגרת חיים.',
      second: 'אשפוז יום — אם לאחר תקופה הטיפול האמבולטורי אינו מספיק.',
      questions: ['מה תדירות הפגישות?', 'האם יש רשימת המתנה?', 'האם הטיפול ממומן בקופת חולים?'],
      searchUrl: 'https://rehabdirectoryil.vercel.app/?category=treatment',
    }
  }

  // אשפוז יום
  return {
    type: 'treatment',
    title: 'אשפוז יום',
    why: 'כשהקשיים משמעותיים אבל ניתן לשהות בבית בלילה — אשפוז יום מספק תמיכה אינטנסיבית במשך היום (טיפולים, קבוצות, ארוחות) ומאפשר חזרה הביתה בערב.',
    second: 'דיור תומך — אם הסביבה הביתית אינה תומכת בהחלמה.',
    questions: ['מה שעות אשפוז היום?', 'איך מגיעים?', 'כמה זמן נמשך בממוצע?'],
    searchUrl: 'https://rehabdirectoryil.vercel.app/?category=treatment',
  }
}

// ─── עיצוב משותף ─────────────────────────────────────────
const PURPLE = '#6B21A8'
const CYAN = '#0E7490'

function Card({ children, style }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16,
      border: '1px solid #e5e7eb', padding: '24px 20px',
      ...style,
    }}>
      {children}
    </div>
  )
}

function ProgressBar({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i < current - 1 ? PURPLE : i === current - 1 ? '#A855F7' : '#e5e7eb',
          transition: 'background 0.3s',
        }} />
      ))}
    </div>
  )
}

function OptionBtn({ icon, num, label, sub, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
      border: selected ? `1.5px solid ${PURPLE}` : '1px solid #e5e7eb',
      background: selected ? '#f5f3ff' : '#fff',
      transition: 'all 0.15s', width: '100%',
    }}>
      {icon && <span style={{ fontSize: 22, marginBottom: 6 }}>{icon}</span>}
      {num  && <span style={{ fontSize: 20, fontWeight: 600, color: PURPLE, marginBottom: 6 }}>{num}</span>}
      <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937', lineHeight: 1.3 }}>{label}</span>
      {sub && <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</span>}
    </button>
  )
}

// ─── קומפוננט ראשי ────────────────────────────────────────
export default function Calculator() {
  const [step, setStep] = useState(0)           // 0 = מסך פתיחה
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  const current = STEPS[step - 1]
  const sel = current
    ? (current.multi ? (answers[current.id] || []) : answers[current.id])
    : null
  const isReady = current
    ? (current.multi ? sel.length > 0 : sel !== undefined)
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
    setResult(getRecommendation(answers))
  }

  function back() {
    if (result) { setResult(null); return }
    if (step > 1) setStep(s => s - 1)
    else setStep(0)
  }

  function reset() {
    setStep(0); setAnswers({}); setResult(null)
  }

  // ── מסך פתיחה ──
  if (step === 0) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', direction: 'rtl', padding: '0 16px' }}>
        <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧭</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
            מחשבון איתור מסלול
          </h1>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 28 }}>
            5 שאלות קצרות — וקבל המלצה מותאמת אישית על סוג המסגרת המתאימה לך.
          </p>
          <button type="button" onClick={next} style={{
            background: PURPLE, color: '#fff', border: 'none',
            borderRadius: 10, padding: '12px 32px', fontSize: 15,
            fontWeight: 500, cursor: 'pointer',
          }}>
            בואו נתחיל ←
          </button>
        </Card>
      </div>
    )
  }

  // ── מסך תוצאה ──
  if (result) {
    const color = result.type === 'rehab' ? PURPLE : CYAN
    const light = result.type === 'rehab' ? '#f5f3ff' : '#ecfeff'
    const border = result.type === 'rehab' ? PURPLE : '#06B6D4'
    const label = result.type === 'rehab' ? 'שיקום' : 'טיפול'

    return (
      <div style={{ maxWidth: 560, margin: '0 auto', direction: 'rtl', padding: '0 16px' }}>
        {/* כרטיס תוצאה */}
        <div style={{
          borderRadius: 16, border: `1.5px solid ${border}`,
          background: light, padding: '22px 20px', marginBottom: 14,
        }}>
          <span style={{
            display: 'inline-block', fontSize: 11, fontWeight: 500,
            padding: '3px 12px', borderRadius: 20,
            background: color, color: '#fff', marginBottom: 14,
          }}>{label}</span>

          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
            {result.title}
          </h2>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 16 }}>
            {result.why}
          </p>

          <div style={{
            background: 'rgba(255,255,255,0.7)', borderRadius: 10,
            padding: '12px 14px', marginBottom: 14,
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>
              אם זה לא מספיק:
            </p>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
              {result.second}
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.7)', borderRadius: 10,
            padding: '12px 14px', border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 8 }}>
              שאל/י את הצוות בפגישת ההיכרות:
            </p>
            {result.questions.map((q, i) => (
              <p key={i} style={{ fontSize: 13, color: '#374151', margin: '4px 0', display: 'flex', gap: 6 }}>
                <span style={{ color: color }}>•</span> {q}
              </p>
            ))}
          </div>
        </div>

        {/* כפתורי פעולה */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <a href={result.searchUrl} style={{
            padding: '10px 18px', background: color, color: '#fff',
            borderRadius: 8, fontSize: 13, fontWeight: 500, textDecoration: 'none',
          }}>
            חפש מסגרות מתאימות ←
          </a>
          <button onClick={reset} style={{
            padding: '10px 16px', border: '1px solid #e5e7eb',
            borderRadius: 8, background: '#fff', fontSize: 13,
            color: '#6b7280', cursor: 'pointer',
          }}>
            ← חזור להתחלה
          </button>
        </div>
      </div>
    )
  }

  // ── שלבי הוויזארד ──
  const cols = current.scale ? 5 : 3
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', direction: 'rtl', padding: '0 16px' }}>
      <ProgressBar current={step} total={STEPS.length} />
      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 18 }}>
        שלב {step} מתוך {STEPS.length}
      </p>

      <Card>
        <h2 style={{ fontSize: 17, fontWeight: 500, color: '#111827', marginBottom: current.hint ? 4 : 18 }}>
          {current.question}
        </h2>
        {current.hint && (
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14 }}>{current.hint}</p>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 10,
        }}>
          {current.options.map(o => (
            <OptionBtn
              key={o.value}
              icon={o.icon}
              num={o.num}
              label={o.label}
              sub={o.sub}
              selected={current.multi ? sel.includes(o.value) : sel === o.value}
              onClick={() => toggle(o.value)}
            />
          ))}
        </div>

        {/* ניווט */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <button type="button" onClick={back} style={{
            padding: '8px 16px', fontSize: 13, color: '#6b7280', cursor: 'pointer',
            border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent',
          }}>
            ← חזרה
          </button>
          <button type="button" onClick={next} disabled={!isReady} style={{
            padding: '8px 20px', fontSize: 13, fontWeight: 500,
            borderRadius: 8, border: 'none', cursor: isReady ? 'pointer' : 'not-allowed',
            background: isReady ? PURPLE : '#d8b4fe', color: '#fff',
            transition: 'background 0.15s',
          }}>
            {step === STEPS.length ? 'מצא לי מסלול ✦' : 'המשך →'}
          </button>
        </div>
      </Card>
    </div>
  )
}
