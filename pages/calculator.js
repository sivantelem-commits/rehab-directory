import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import ServiceCard from '../components/ServiceCard'

const PURPLE = '#6B21A8'
const DEEP = '#4C0080'

const STEPS = [
  {
    id: 'distress',
    question: 'איך הקושי הנפשי משפיע על חיי היומיום שלך כרגע?',
    multi: false,
    scale: true,
    options: [
      { label: 'כמעט לא', value: 1, scores: {} },
      { label: 'מעט', value: 2, scores: { treatment: 1 } },
      { label: 'בינוני', value: 3, scores: { treatment: 1, combined: 1 } },
      { label: 'הרבה', value: 4, scores: { treatment: 2 } },
      { label: 'מאוד', value: 5, scores: { treatment: 3 } },
    ],
  },
  {
    id: 'functioning',
    question: 'האם יש כרגע קושי משמעותי בתפקוד היום-יומי?',
    hint: 'לדוגמה: קימה בבוקר, היגיינה, סדר יום, קניות, יציאה מהבית',
    multi: false,
    options: [
      { label: 'לא', value: 'none', scores: {} },
      { label: 'קושי קל', value: 'mild', scores: { rehab: 1 } },
      { label: 'קושי בינוני', value: 'moderate', scores: { rehab: 2, combined: 1 } },
      { label: 'קושי משמעותי', value: 'severe', scores: { rehab: 3 } },
    ],
  },
  {
    id: 'needs',
    question: 'באילו תחומים את/ה הכי צריך/ה תמיכה?',
    hint: 'ניתן לבחור יותר מאחד',
    multi: true,
    options: [
      { label: 'טיפול רגשי / שיחות', value: 'therapy', scores: { treatment: 2 } },
      { label: 'פסיכיאטר / תרופות', value: 'psychiatry', scores: { treatment: 2 } },
      { label: 'עבודה / תעסוקה', value: 'work', scores: { rehab: 2 } },
      { label: 'לימודים', value: 'education', scores: { rehab: 2 } },
      { label: 'חברה / פנאי', value: 'social', scores: { rehab: 1 } },
      { label: 'מגורים עצמאיים', value: 'housing', scores: { rehab: 2 } },
      { label: 'התנהלות יום-יומית', value: 'daily', scores: { rehab: 2 } },
    ],
  },
  {
    id: 'age_group',
    question: 'מה קבוצת הגיל שלך?',
    multi: false,
    options: [
      { label: 'צעירים (18–30)', value: 'צעירים', scores: {} },
      { label: 'מבוגרים (31–65)', value: 'מבוגרים', scores: {} },
      { label: 'קשישים (65+)', value: 'קשישים', scores: {} },
    ],
  },
  {
    id: 'population',
    question: 'האם שייך/ת לאוכלוסייה ייעודית?',
    hint: 'אופציונלי — יעזור למצוא שירותים מותאמים',
    multi: false,
    options: [
      { label: 'נשים', value: 'נשים', scores: {} },
      { label: 'דתי/מסורתי', value: 'דתי/מסורתי', scores: {} },
      { label: 'חרדי', value: 'חרדי', scores: {} },
      { label: 'להט"ב', value: 'להט"ב', scores: {} },
      { label: 'לא רלוונטי', value: 'none', scores: {} },
    ],
  },
  {
    id: 'type',
    question: 'הקושי העיקרי הוא יותר רגשי, יותר תפקודי, או גם וגם?',
    multi: false,
    options: [
      { label: 'בעיקר רגשי', value: 'emotional', scores: { treatment: 2 } },
      { label: 'בעיקר תפקודי', value: 'functional', scores: { rehab: 2 } },
      { label: 'גם רגשי וגם תפקודי', value: 'both', scores: { combined: 3 } },
      { label: 'לא יודע/ת', value: 'unsure', scores: {} },
    ],
  },
  {
    id: 'sal',
    question: 'האם יש הכרה בסל שיקום / נכות נפשית?',
    hint: 'סל שיקום ניתן בדרך כלל מגיל 18 עם 40% נכות נפשית ומעלה',
    multi: false,
    options: [
      { label: 'כן, יש זכאות', value: 'yes', scores: { rehab: 2 } },
      { label: 'בתהליך', value: 'process', scores: { rehab: 1 } },
      { label: 'לא יודע/ת', value: 'unknown', scores: {} },
      { label: 'אין', value: 'no', scores: { treatment: 1 } },
    ],
  },
]

function calcResult(answers) {
  const scores = { treatment: 0, rehab: 0, combined: 0 }
  STEPS.forEach(step => {
    const ans = answers[step.id]
    if (!ans) return
    const values = Array.isArray(ans) ? ans : [ans]
    values.forEach(val => {
      const opt = step.options.find(o => String(o.value) === String(val))
      if (!opt) return
      Object.entries(opt.scores || {}).forEach(([k, v]) => { scores[k] = (scores[k] || 0) + v })
    })
  })
  const { treatment, rehab, combined } = scores
  const bothHigh = treatment >= 3 && rehab >= 3
  let recommendation = combined >= 3 || bothHigh ? 'combined' : treatment > rehab ? 'treatment' : rehab > treatment ? 'rehab' : 'combined'
  const needsMap = { therapy: 'טיפול רגשי', psychiatry: 'הערכה פסיכיאטרית', work: 'תעסוקה נתמכת', education: 'שיקום השכלתי', social: 'מועדון חברתי', housing: 'דיור מוגן', daily: 'ליווי יום-יומי' }
  const selectedNeeds = (answers.needs || []).map(n => needsMap[n]).filter(Boolean)
  return { recommendation, scores, selectedNeeds }
}

function buildSearchQueries(recommendation, answers) {
  const district = answers.district || null
  const needs = answers.needs || []
  const queries = []
  function p(cat, page) {
    const params = new URLSearchParams()
    if (district) params.set('district', district)
    if (cat) params.set('category', cat)
    return { label: cat || (page === 'treatment' ? 'טיפול נפשי' : 'שירותי שיקום'), url: `/api/${page === 'treatment' ? 'treatment' : 'services'}?${params}`, page }
  }
  if (recommendation === 'treatment' || recommendation === 'combined') queries.push(p(null, 'treatment'))
  if (recommendation === 'rehab' || recommendation === 'combined') {
    const rehabCats = { work: 'תעסוקה', education: 'השכלה', social: 'חברה ופנאי', housing: 'דיור', daily: 'ליווי ותמיכה' }
    const added = new Set()
    needs.forEach(n => { const cat = rehabCats[n]; if (cat && !added.has(cat)) { queries.push(p(cat, 'rehab')); added.add(cat) } })
    if (added.size === 0) queries.push(p(null, 'rehab'))
  }
  return queries.length > 0 ? queries : [p(null, 'rehab')]
}

function ProgressBar({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < current - 1 ? '#1A3A5C' : i === current - 1 ? '#2A5298' : '#e5e7eb', transition: 'background 0.3s' }} />
      ))}
    </div>
  )
}

function OptionBtn({ label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: 12,
      cursor: 'pointer', textAlign: 'right', width: '100%',
      border: selected ? `1.5px solid #1A3A5C` : '1px solid #e5e7eb',
      background: selected ? '#EFF6FF' : '#fff', transition: 'all 0.15s',
      fontFamily: "'Nunito', sans-serif",
    }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{label}</span>
    </button>
  )
}

function ScaleBtn({ label, index, selected, onClick }) {
  const colors = ['#e5e7eb', '#d1d5db', '#a78bfa', '#8b5cf6', '#6B21A8']
  return (
    <button type="button" onClick={onClick} style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '10px 4px', borderRadius: 12, cursor: 'pointer',
      border: selected ? `1.5px solid #1A3A5C` : '1px solid #e5e7eb',
      background: selected ? '#EFF6FF' : '#fff', transition: 'all 0.15s',
      fontFamily: "'Nunito', sans-serif",
    }}>
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: colors[index], marginBottom: 6 }} />
      <span style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
    </button>
  )
}

export default function Calculator() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [services, setServices] = useState(null)
  const [loading, setLoading] = useState(false)
  const [salNote, setSalNote] = useState(null)

  const current = STEPS[step - 1]
  const sel = current ? (current.multi ? (answers[current.id] || []) : answers[current.id]) : null
  const isReady = current ? (current.multi ? sel.length > 0 : sel !== undefined && sel !== null) : false

  function toggle(value) {
    const id = current.id
    if (!current.multi) { setAnswers(prev => ({ ...prev, [id]: value })); return }
    const arr = answers[id] || []
    if (arr.includes(value)) setAnswers(prev => ({ ...prev, [id]: arr.filter(x => x !== value) }))
    else setAnswers(prev => ({ ...prev, [id]: [...arr, value] }))
  }

  async function finish(finalAnswers) {
    setLoading(true)
    const res = calcResult(finalAnswers)
    setResult(res)
    if (finalAnswers.sal === 'unknown') setSalNote({
      text: 'אם עדיין אין זכאות לסל שיקום, יש לפנות לביטוח הלאומי להגשת תביעת נכות ולאחר מכן להגיש בקשה לסל שיקום.',
      links: [
        { href: 'https://www.btl.gov.il/benefits/Disability/Pages/%D7%94%D7%96%D7%9B%D7%90%D7%99%D7%9D%20%D7%9C%D7%A7%D7%A6%D7%91%D7%AA%20%D7%A0%D7%9B%D7%95%D7%AA%20%D7%97%D7%95%D7%93%D7%A9%D7%99%D7%AA.aspx', label: 'להגשת תביעה בביטוח הלאומי ←' },
        { href: 'https://www.gov.il/he/service/rehabilitation-support-package', label: 'לתהליך הוצאת סל שיקום ←' },
      ]
    })
    if (finalAnswers.sal === 'no') setSalNote({
      text: 'שירותי סל שיקום מיועדים למי שקיבל 40% ומעלה על רקע נפשי בביטוח הלאומי.',
      links: [
        { href: 'https://www.btl.gov.il/benefits/Disability/Pages/%D7%94%D7%96%D7%9B%D7%90%D7%99%D7%9D%20%D7%9C%D7%A7%D7%A6%D7%91%D7%AA%20%D7%A0%D7%9B%D7%95%D7%AA%20%D7%97%D7%95%D7%93%D7%A9%D7%99%D7%AA.aspx', label: 'להגשת תביעה בביטוח הלאומי ←' },
        { href: 'https://www.gov.il/he/service/rehabilitation-support-package', label: 'לתהליך הוצאת סל שיקום ←' },
      ]
    })
    const queries = buildSearchQueries(res.recommendation, finalAnswers)
    try {
      const fetches = await Promise.all(queries.map(q => fetch(q.url).then(r => r.json()).then(data => ({ label: q.label, page: q.page, services: Array.isArray(data) ? data : [] }))))
      const withResults = fetches.filter(f => f.services.length > 0)
      if (withResults.length === 0 && finalAnswers.district) {
        const fb = await Promise.all(buildSearchQueries(res.recommendation, { ...finalAnswers, district: null }).map(q => fetch(q.url).then(r => r.json()).then(data => ({ label: q.label, page: q.page, services: Array.isArray(data) ? data : [] }))))
        const fbR = fb.filter(f => f.services.length > 0)
        if (fbR.length > 0) { setSalNote(p => p ? { ...p, text: p.text + ' טרם נוספו שירותים באזור זה — מוצגים שירותים מכל הארץ.' } : { text: 'טרם נוספו שירותים באזור זה — מוצגים שירותים מכל הארץ.' }); setServices(fbR); return }
      }
      setServices(withResults.length > 0 ? withResults : [])
    } catch { setServices([]) }
    finally { setLoading(false) }
  }

  function next() {
    if (step === 0) { setStep(1); return }
    if (step < STEPS.length) { setStep(s => s + 1); return }
    finish(answers)
  }
  function back() {
    if (result) { setResult(null); setServices(null); setSalNote(null); return }
    if (step > 1) setStep(s => s - 1); else setStep(0)
  }
  function reset() { setStep(0); setAnswers({}); setResult(null); setServices(null); setSalNote(null) }

  const recConfig = {
    treatment: { title: 'טיפול נפשי', color: '#0E7490', light: '#ecfeff', border: '#06B6D4', desc: 'נראה שהצורך המרכזי כרגע הוא טיפולי-נפשי. כדאי לבדוק טיפול רגשי, מרפאת בריאות הנפש ו/או הערכה פסיכיאטרית.' },
    rehab: { title: 'שיקום בקהילה', color: DEEP, light: '#f5f3ff', border: PURPLE, desc: 'נראה שהצורך המרכזי כרגע הוא שיקומי. כדאי לבדוק שירותי סל שיקום כמו דיור מוגן, תעסוקה נתמכת, מועדון חברתי או ליווי לימודי.' },
    combined: { title: 'שילוב טיפול ושיקום', color: '#5E35B1', light: '#f5f0ff', border: '#7C3AED', desc: 'נראה שמתאים שילוב של טיפול נפשי לצד שירותי שיקום בקהילה.' },
  }

  if (step === 0) return (
    <Page title="מחשבון איתור מסלול">
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '48px 16px' }}>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #BFDBFE', padding: '40px 28px', textAlign: 'center', boxShadow: '0 4px 24px rgba(76,0,128,0.08)' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🧭</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#3d2a6e', marginBottom: 10 }}>מחשבון איתור מסלול</h1>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 12 }}>7 שאלות קצרות — וקבל המלצה מותאמת אישית.</p>
          <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: 28, padding: '10px 14px', background: '#f9fafb', borderRadius: 10 }}>
            הכלי אינו אבחון ואינו מחליף איש מקצוע. הוא מסייע בכיוון ראשוני בלבד.<br />
            אם יש מצוקה חריפה או סיכון מיידי — יש לפנות בדחיפות לגורם רפואי.
          </p>
          <button type="button" onClick={next} style={btnStyle()}>בואו נתחיל ←</button>
        </div>
      </div>
    </Page>
  )

  if (loading) return (
    <Page title="מחפש שירותים...">
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid #BFDBFE`, borderTopColor: '#2A5298', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
        <p style={{ color: '#9b88bb', fontWeight: 600 }}>מחפש שירותים מתאימים...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </Page>
  )

  if (result && services !== null) {
    const rc = recConfig[result.recommendation]
    const total = (services || []).reduce((sum, g) => sum + g.services.length, 0)
    return (
      <Page title="המלצה מותאמת אישית">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>
          <div style={{ borderRadius: 16, border: `1.5px solid ${rc.border}`, background: rc.light, padding: '22px 20px', marginBottom: 20 }}>
            <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: 20, background: rc.color, color: '#fff', marginBottom: 12 }}>{rc.title}</span>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>{rc.desc}</div>
            {result.selectedNeeds.length > 0 && (
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>
                <strong>מה כדאי לבדוק: </strong>{result.selectedNeeds.join(', ')}
              </div>
            )}
            {salNote && (
              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400e', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                <span>💡 {salNote.text}</span>
                {salNote.links && salNote.links.map(l => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" style={{
                    display: 'inline-block', padding: '5px 14px', borderRadius: '999px',
                    background: '#f59e0b', color: 'white', fontWeight: 700,
                    fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap',
                  }}>{l.label}</a>
                ))}
                {salNote.link && (
                  <a href={salNote.link} target="_blank" rel="noreferrer" style={{
                    display: 'inline-block', padding: '5px 14px', borderRadius: '999px',
                    background: '#f59e0b', color: 'white', fontWeight: 700,
                    fontSize: 12, textDecoration: 'none', whiteSpace: 'nowrap',
                  }}>{salNote.linkText}</a>
                )}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#3d2a6e', margin: 0 }}>{total > 0 ? `נמצאו ${total} שירותים מתאימים` : 'לא נמצאו שירותים כרגע'}</h2>
            <button onClick={reset} style={{ fontSize: 13, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>← חזור להתחלה</button>
          </div>
          {total === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#555', marginBottom: 8 }}>לא נמצאו שירותים תואמים כרגע</div>
              <p style={{ fontSize: 13, marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>המאגר גדל בהתמדה. נסי לחפש ישירות בדפי השיקום והטיפול.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/rehab" style={{ padding: '10px 20px', background: `linear-gradient(160deg, #8B00D4, ${DEEP})`, color: '#fff', borderRadius: '999px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>חפש שיקום</a>
                <a href="/treatment" style={{ padding: '10px 20px', background: 'linear-gradient(160deg, #0891B2, #164E63)', color: '#fff', borderRadius: '999px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>חפש טיפול</a>
                <button onClick={reset} style={{ padding: '10px 18px', border: '1px solid #e5e7eb', borderRadius: '999px', background: '#fff', fontSize: 13, color: '#6b7280', cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>חזור להתחלה</button>
              </div>
            </div>
          ) : (
            services.map((group, gi) => (
              <div key={gi} style={{ marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ background: group.page === 'treatment' ? 'linear-gradient(160deg, #0891B2, #164E63)' : `linear-gradient(160deg, #8B00D4, ${DEEP})`, color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 999 }}>{group.label}</span>
                  <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>{group.services.length} שירותים</span>
                  <a href={(() => {
                    if (group.page !== 'rehab') return '/treatment';
                    const p = new URLSearchParams();
                    if (answers.age_group && answers.age_group !== 'none') p.set('age_group', answers.age_group);
                    if (answers.population && answers.population !== 'none') p.set('population', answers.population);
                    const qs = p.toString();
                    return qs ? '/rehab?' + qs : '/rehab';
                  })()} style={{ marginRight: 'auto', fontSize: 13, color: PURPLE, fontWeight: 700, textDecoration: 'none' }}>ראה הכל ←</a>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {group.services.slice(0, 6).map(s => (
                    <div key={s.id} onClick={() => router.push(`/service/${s.id}`)} style={{ cursor: 'pointer' }}>
                      <ServiceCard service={s} />
                    </div>
                  ))}
                </div>
                {group.services.length > 6 && (
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <a href={group.page === 'rehab' ? '/rehab' : '/treatment'} style={{ fontSize: 14, fontWeight: 700, color: PURPLE, textDecoration: 'none' }}>+ {group.services.length - 6} שירותים נוספים ←</a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Page>
    )
  }

  return (
    <Page title="מחשבון איתור מסלול">
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 16px' }}>
        <ProgressBar current={step} total={STEPS.length} />
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20, fontWeight: 600 }}>שלב {step} מתוך {STEPS.length}</p>
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e9d5ff', padding: '24px 20px', boxShadow: '0 4px 16px rgba(76,0,128,0.06)' }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#3d2a6e', marginBottom: current.hint ? 4 : 18, lineHeight: 1.4 }}>{current.question}</h2>
          {current.hint && <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14, fontWeight: 600 }}>{current.hint}</p>}
          {current.scale ? (
            <div style={{ display: 'flex', gap: 8 }}>
              {current.options.map((o, i) => <ScaleBtn key={o.value} label={o.label} index={i} selected={sel === o.value} onClick={() => toggle(o.value)} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {current.options.map(o => <OptionBtn key={o.value} label={o.label} selected={current.multi ? sel.includes(o.value) : sel === o.value} onClick={() => toggle(o.value)} />)}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
            <button type="button" onClick={back} style={{ padding: '9px 18px', fontSize: 13, fontWeight: 700, color: '#6b7280', cursor: 'pointer', border: '1px solid #e5e7eb', borderRadius: '999px', background: 'transparent', fontFamily: "'Nunito', sans-serif" }}>← חזרה</button>
            <button type="button" onClick={next} disabled={!isReady} style={btnStyle(!isReady)}>{step === STEPS.length ? 'הצג שירותים מתאימים ✦' : 'המשך →'}</button>
          </div>
        </div>
      </div>
    </Page>
  )
}

function btnStyle(disabled = false) {
  return { background: disabled ? '#d8b4fe' : `linear-gradient(160deg, #8B00D4, ${DEEP})`, color: '#fff', border: 'none', borderRadius: '999px', padding: '10px 22px', fontSize: 13, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'Nunito', sans-serif", boxShadow: disabled ? 'none' : `0 3px 0 #2E0060`, transition: 'all 0.15s' }
}

function Page({ title, children }) {
  return (
    <>
      <Head>
        <title>{title} | בריאות נפש בישראל</title>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#F0F7FF' }}>
        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="לוגו" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>מחשבון איתור מסלול</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/about', 'אודות'], ['/contact', 'צור קשר']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: href === '/calculator' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12, border: '1.5px solid rgba(255,255,255,0.2)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>
        {children}
        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.75)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48, fontWeight: 500 }}>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}
