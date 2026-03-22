import { useState } from 'react'
import Head from 'next/head'

const NAV = [['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/guide', 'מדריך'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']]

const PURPLE = '#4C0080'
const CYAN = '#0891B2'

export default function Guide() {
  const [openSection, setOpenSection] = useState(null)

  return (
    <>
      <Head>
        <title>מדריך למטופל | בריאות נפש בישראל</title>
        <meta name="description" content="מדריך למטופל – מה ההבדל בין שיקום לטיפול, איך מקבלים זכאות לסל שיקום, זכויות המטופל, מה לשאול לפני קבלה ומילון מושגים." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rehabdirectoryil.vercel.app/guide" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="מדריך למטופל | בריאות נפש בישראל" />
        <meta property="og:description" content="מדריך למטופל – מה ההבדל בין שיקום לטיפול, איך מקבלים זכאות לסל שיקום, זכויות המטופל ומילון מושגים." />
        <meta property="og:url" content="https://rehabdirectoryil.vercel.app/guide" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f7f3ff' }}>

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
              <div style={{ fontSize: 11, opacity: 0.8 }}>מדריך למטופל</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'white',
                background: href === '/guide' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
                borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12,
                border: href === '/guide' ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.2)',
                textDecoration: 'none',
              }}>{label}</a>
            ))}
          </nav>
        </header>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(160deg, #2E0060, #8B00D4)',
          color: 'white', padding: '48px 20px', textAlign: 'center',
        }}>
          <img src='/guide-logo.png' alt='מדריך' style={{ width: 220, height: 220, objectFit: 'contain', marginBottom: -40, filter: 'invert(1) brightness(10)' }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px' }}>מדריך למטופל</h1>
          <p style={{ fontSize: 15, opacity: 0.85, maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
            כל מה שצריך לדעת לפני שמתחילים - בשפה פשוטה וברורה
          </p>
        </div>

        {/* תפריט קפיצה מהיר */}
        <div style={{ background: 'white', borderBottom: '1px solid #e9d5ff', padding: '14px 20px' }}>
          <div style={{ maxWidth: 740, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              ['#diff', 'שיקום vs טיפול'],
              ['#sal', 'זכאות סל שיקום'],
              ['#rights', 'זכויות המטופל'],
              ['#questions', 'שאלות לשאול'],
              ['#glossary', 'מילון מושגים'],
            ].map(([href, label]) => (
              <a key={href} href={href} style={{
                padding: '6px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 700,
                background: '#f5f3ff', color: PURPLE, textDecoration: 'none',
                border: '1.5px solid #e9d5ff',
              }}>{label}</a>
            ))}
          </div>
        </div>

        <main style={{ maxWidth: 740, margin: '0 auto', padding: '32px 16px' }}>

          {/* 1 - שיקום vs טיפול */}
          <div id="diff">
            <Card color={PURPLE} icon="⚖️" title="מה ההבדל בין שיקום לטיפול?">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div style={{ background: '#f5f3ff', borderRadius: 12, padding: '16px 14px', borderTop: `3px solid ${PURPLE}` }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: PURPLE, marginBottom: 10 }}>♿ שיקום</div>
                  <ul style={ulStyle}>
                    <li>מיועד לאנשים עם <strong>זכאות לסל שיקום</strong></li>
                    <li>מטרה: חזרה לחיים עצמאיים ומלאים</li>
                    <li>כולל: דיור, תעסוקה, השכלה, חברה</li>
                    <li>ממומן על ידי משרד הבריאות</li>
                    <li>מסגרות: הוסטלים, דיור מוגן, מועדונים, סדנאות</li>
                  </ul>
                </div>
                <div style={{ background: '#ecfeff', borderRadius: 12, padding: '16px 14px', borderTop: `3px solid ${CYAN}` }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: CYAN, marginBottom: 10 }}>🏥 טיפול</div>
                  <ul style={ulStyle}>
                    <li><strong>לא מחייב</strong> זכאות מיוחדת</li>
                    <li>מטרה: טיפול בתסמינים ומצב נפשי</li>
                    <li>כולל: אשפוז, מרפאות, בתים מאזנים</li>
                    <li>ממומן דרך קופת חולים / ביטוח</li>
                    <li>מסגרות: מחלקות אשפוז, מרפאות יום, חדרי מיון</li>
                  </ul>
                </div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                💡 <strong>חשוב לדעת:</strong> שיקום וטיפול לא מתחרים - הרבה אנשים מקבלים את שניהם במקביל.
              </div>
            </Card>
          </div>

          {/* 2 - זכאות סל שיקום */}
          <div id="sal">
            <Card color="#6B21A8" icon="📋" title="איך מקבלים זכאות לסל שיקום?">
              <p style={pStyle}>סל השיקום הוא זכות חוקית שמגיעה לאנשים עם מגבלה נפשית. הדרך לקבל אותו עוברת בשני שלבים:</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {[
                  {
                    num: '1',
                    title: 'ביטוח לאומי - קביעת נכות',
                    text: 'פנה לביטוח לאומי לקביעת דרגת נכות. צריך אבחנה פסיכיאטרית ומסמכים רפואיים. ועדה רפואית קובעת את אחוז הנכות.',
                    color: '#6B21A8',
                  },
                  {
                    num: '2',
                    title: 'משרד הבריאות - פתיחת תיק שיקום',
                    text: 'לאחר קבלת קצבת נכות מהביטוח הלאומי, פנה למרכז לבריאות הנפש הקרוב לביתך לפתיחת תיק שיקום. רכז השיקום יעזור לבנות תוכנית מותאמת אישית.',
                    color: '#4C0080',
                  },
                ].map(s => (
                  <div key={s.num} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', background: s.color,
                      color: 'white', fontWeight: 800, fontSize: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>{s.num}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: s.color, marginBottom: 4 }}>{s.title}</div>
                      <div style={{ fontSize: 13.5, color: '#445', lineHeight: 1.65 }}>{s.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#f5f3ff', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#4C0080', lineHeight: 1.6 }}>
                📞 <strong>מרכז מידע ביטוח לאומי:</strong> *6050 &nbsp;|&nbsp;
                🌐 <a href="https://www.btl.gov.il" target="_blank" rel="noopener noreferrer" style={{ color: PURPLE }}>btl.gov.il</a>
              </div>
            </Card>
          </div>

          {/* 3 - זכויות המטופל */}
          <div id="rights">
            <Card color="#0E7490" icon="⚖️" title="זכויות המטופל בבריאות הנפש">
              <p style={pStyle}>חוק זכויות החולה (1996) וחוק טיפול בחולי נפש מגנים על זכויותיך. הנה העיקריות:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '📄', title: 'זכות למידע', text: 'הזכות לקבל הסבר מלא על אבחנתך, מצבך ואפשרויות הטיפול - בשפה שאתה מבין.' },
                  { icon: '✅', title: 'הסכמה מדעת', text: 'שום טיפול לא יינתן ללא הסכמתך, למעט מקרי חירום או צו בית משפט.' },
                  { icon: '🔒', title: 'סודיות רפואית', text: 'המידע הרפואי שלך חסוי ולא יועבר לגורם שלישי ללא רשותך.' },
                  { icon: '📂', title: 'עיון בתיק הרפואי', text: 'הזכות לעיין בתיק הרפואי שלך ולקבל עותק ממנו.' },
                  { icon: '🔄', title: 'דעה שנייה', text: 'הזכות לפנות לרופא אחר לקבלת חוות דעת נוספת.' },
                  { icon: '👤', title: 'כבוד וצנעת הפרט', text: 'הזכות לטיפול בכבוד ובהתחשבות בצרכייך הפיזיים, הנפשיים והתרבותיים.' },
                  { icon: '🆘', title: 'אשפוז כפוי - זכויות', text: 'גם אם אושפזת בכפייה, יש לך זכות לייצוג משפטי, לערר בפני ועדה פסיכיאטרית ולהודיע לקרוב משפחה.' },
                ].map(r => (
                  <div key={r.title} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: '#f0faff', borderRadius: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13.5, color: '#0E7490', marginBottom: 3 }}>{r.title}</div>
                      <div style={{ fontSize: 13, color: '#445', lineHeight: 1.6 }}>{r.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 4 - שאלות לשאול */}
          <div id="questions">
            <Card color="#5E35B1" icon="❓" title="מה לשאול לפני קבלה למסגרת?">
              <p style={pStyle}>פגישת ההיכרות היא הזדמנות לאסוף מידע חשוב. הנה שאלות שכדאי להכין מראש:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { cat: 'על המסגרת', color: '#5E35B1', questions: [
                    'כמה מקומות יש ומה זמן ההמתנה הממוצע?',
                    'מי הצוות המקצועי ומה הרקע שלו?',
                    'מהי שגרת היום במסגרת?',
                    'האם יש ביקורים ומה המדיניות?',
                  ]},
                  { cat: 'על הטיפול', color: '#0E7490', questions: [
                    'מה הגישה הטיפולית (CBT, DBT, פסיכודינמי...)?',
                    'כמה פגישות אישיות יש בשבוע?',
                    'איך מודדים התקדמות?',
                    'מה קורה בעת משבר?',
                  ]},
                  { cat: 'על הכספים והזכויות', color: '#2E7D32', questions: [
                    'האם המסגרת מוכרת לסל שיקום?',
                    'מה עלות ההשתתפות העצמית?',
                    'האם ניתן לפרוש מרצון ומה התנאים?',
                    'האם יש ועד דיירים / ועדת ערר?',
                  ]},
                ].map(section => (
                  <div key={section.cat} style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: section.color, marginBottom: 6, padding: '4px 0' }}>
                      {section.cat}
                    </div>
                    {section.questions.map(q => (
                      <div key={q} style={{ display: 'flex', gap: 8, padding: '7px 12px', background: '#faf5ff', borderRadius: 8, marginBottom: 4, fontSize: 13.5, color: '#334', lineHeight: 1.5 }}>
                        <span style={{ color: section.color, fontWeight: 700, flexShrink: 0 }}>•</span>
                        {q}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* CTA */}
          <div style={{ background: 'linear-gradient(160deg, #2E0060, #8B00D4)', borderRadius: 20, padding: '28px 24px', textAlign: 'center', color: 'white', marginTop: 8 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🧭</div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>מוכנים למצוא מסגרת מתאימה?</div>
            <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 20, lineHeight: 1.6 }}>
              ענו על 3 שאלות קצרות וקבלו המלצה על שירותים קיימים
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/calculator" style={{
                background: 'white', color: PURPLE, borderRadius: '999px',
                padding: '11px 24px', fontWeight: 800, fontSize: 14, textDecoration: 'none',
              }}>🧭 מחשבון איתור מסלול</a>
              <a href="/rehab" style={{
                background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '999px',
                padding: '11px 24px', fontWeight: 800, fontSize: 14, textDecoration: 'none',
                border: '1.5px solid rgba(255,255,255,0.4)',
              }}>♿ חיפוש שירותי שיקום</a>
            </div>
          </div>

        </main>

        <footer style={{
          background: 'linear-gradient(135deg, #2E0060, #4C0080)',
          color: 'rgba(255,255,255,0.75)', textAlign: 'center',
          padding: '24px', fontSize: 13, marginTop: 48, fontWeight: 500,
        }}>
          <div style={{ marginBottom: 8 }}>
            <a href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>צור קשר</a>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <a href="/legal" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>תנאי שימוש</a>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <a href="/accessibility" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>הצהרת נגישות</a>
          </div>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}

// ─── קומפוננטים ───────────────────────────────────────────
function Card({ color, icon, title, children }) {
  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: '28px 24px',
      marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
      borderTop: `5px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <h2 style={{ fontSize: 18, fontWeight: 800, color, margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

const pStyle = { fontSize: 15, color: '#334', lineHeight: 1.8, margin: '0 0 14px' }
const ulStyle = { margin: 0, padding: '0 16px 0 0', fontSize: 13, color: '#445', lineHeight: 1.8 }
