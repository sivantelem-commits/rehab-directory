import { useState } from 'react'
import Head from 'next/head'

const NAV = [['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/guide', 'מדריך'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']]

const PURPLE = '#4C0080'
const CYAN = '#0891B2'

export default function Guide() {
  const [openTrack, setOpenTrack] = useState(null)

  return (
    <>
      <Head>
        <title>מדריך למטופל | בריאות נפש בישראל</title>
        <meta name="description" content="מדריך למטופל – מה ההבדל בין שיקום לטיפול, איך מקבלים זכאות לסל שיקום, שני מסלולי הגשה, זכויות המטופל ומילון מושגים." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rehabdirectoryil.vercel.app/guide" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="מדריך למטופל | בריאות נפש בישראל" />
        <meta property="og:description" content="מדריך למטופל – איך מקבלים זכאות לסל שיקום, שני מסלולי הגשה, זכויות המטופל ומילון מושגים." />
        <meta property="og:url" content="https://rehabdirectoryil.vercel.app/guide" />
        <meta property="og:image" content="https://rehabdirectoryil.vercel.app/icon-512.png" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f7f3ff', position: 'relative' }}>

        <a href="#main-content" style={{
            position: 'absolute', top: '-40px', right: 0,
            background: '#2E0060', color: 'white', padding: '8px 16px',
            borderRadius: '0 0 8px 8px', fontWeight: 700, fontSize: 14,
            textDecoration: 'none', zIndex: 9999, transition: 'top 0.2s'
          }}
          onFocus={e => e.currentTarget.style.top = '0'}
          onBlur={e => e.currentTarget.style.top = '-40px'}
        >דלג לתוכן הראשי</a>

        <header style={{
          background: 'linear-gradient(135deg, #2E0060, #8B00D4)', color: 'white',
          padding: '10px 20px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(76,0,128,0.2)',
          flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="בריאות נפש בישראל" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>מדריך למטופל</div>
            </div>
          </div>
          <nav aria-label="ניווט ראשי" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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

        <div style={{ background: 'linear-gradient(160deg, #2E0060, #8B00D4)', color: 'white', padding: '48px 20px', textAlign: 'center' }}>
          <img src='/guide-logo.png' alt='' role='presentation' style={{ width: 220, height: 220, objectFit: 'contain', marginBottom: -40, filter: 'invert(1) brightness(10)' }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px' }}>מדריך למטופל</h1>
          <p style={{ fontSize: 15, opacity: 0.85, maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>כל מה שצריך לדעת לפני שמתחילים — בשפה פשוטה וברורה</p>
        </div>

        <div style={{ background: 'white', borderBottom: '1px solid #e9d5ff', padding: '14px 20px' }}>
          <div style={{ maxWidth: 740, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['#diff','שיקום vs טיפול'],['#eligibility','מי זכאי?'],['#tracks','שני המסלולים'],['#process','התהליך'],['#rights','זכויות'],['#questions','שאלות לשאול']].map(([href, label]) => (
              <a key={href} href={href} style={{ padding: '6px 14px', borderRadius: '999px', fontSize: 12, fontWeight: 700, background: '#f5f3ff', color: PURPLE, textDecoration: 'none', border: '1.5px solid #e9d5ff' }}>{label}</a>
            ))}
          </div>
        </div>

        <main id="main-content" style={{ maxWidth: 740, margin: '0 auto', padding: '32px 16px' }}>

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
                  </ul>
                </div>
                <div style={{ background: '#ecfeff', borderRadius: 12, padding: '16px 14px', borderTop: `3px solid ${CYAN}` }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: CYAN, marginBottom: 10 }}>🏥 טיפול</div>
                  <ul style={ulStyle}>
                    <li><strong>לא מחייב</strong> זכאות מיוחדת</li>
                    <li>מטרה: טיפול בתסמינים ומצב נפשי</li>
                    <li>כולל: אשפוז, מרפאות, בתים מאזנים</li>
                    <li>ממומן דרך קופת חולים / ביטוח</li>
                  </ul>
                </div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                💡 <strong>חשוב לדעת:</strong> שיקום וטיפול לא מתחרים — הרבה אנשים מקבלים את שניהם במקביל.
              </div>
            </Card>
          </div>

          <div id="eligibility">
            <Card color="#6B21A8" icon="✅" title="מי זכאי לסל שיקום?">
              <p style={pStyle}>כדי להגיש בקשה לסל שיקום צריך לעמוד בשלושת התנאים הבאים:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {[
                  { icon: '🇮🇱', text: 'תושב ישראל' },
                  { icon: '🎂', text: 'בן 18 ומעלה' },
                  { icon: '📋', text: 'נקבעה נכות רפואית על רקע נפשי של 40% ומעלה — על ידי הביטוח הלאומי או פסיכיאטר מורשה מטעם משרד הבריאות' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: '#f5f3ff', borderRadius: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ fontSize: 14, color: '#334', lineHeight: 1.6, fontWeight: 600 }}>{item.text}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: '#991b1b', marginBottom: 10 }}>⛔ מי לא יכול להגיש?</div>
                <ul style={{ ...ulStyle, color: '#7f1d1d' }}>
                  <li>מי שלא נמצא במעקב פסיכיאטרי סדיר</li>
                  <li>מי שמתנגד לתהליך — רק בני משפחה לא יכולים להגיש בשמו</li>
                  <li>מכורים פעילים לסמים או לאלכוהול</li>
                  <li>מי שהביטוח הלאומי דחה אותם — לא יכולים לקבל אישור לבדיקת רופא מוסמך</li>
                </ul>
              </div>
            </Card>
          </div>

          <div id="tracks">
            <Card color="#0E7490" icon="🔀" title="שני המסלולים לקבלת זכאות">
              <p style={pStyle}>יש שתי דרכים להגיע לקביעת אחוזי הנכות הנדרשים לסל שיקום:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div onClick={() => setOpenTrack(openTrack === 'btl' ? null : 'btl')} style={{ background: '#f5f3ff', borderRadius: 14, padding: '18px 16px', borderTop: `4px solid ${PURPLE}`, cursor: 'pointer' }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: PURPLE, marginBottom: 8 }}>🏛️ מסלול ביטוח לאומי</div>
                  <div style={{ fontSize: 13, color: '#445', lineHeight: 1.6, marginBottom: 10 }}>פנייה לוועדה רפואית של הביטוח הלאומי לקביעת דרגת נכות.</div>
                  <div style={{ fontSize: 12, color: '#1D9E75', fontWeight: 700 }}>✓ כולל קצבת נכות חודשית</div>
                  <div style={{ fontSize: 12, color: PURPLE, fontWeight: 600, marginTop: 8 }}>{openTrack === 'btl' ? '▲ פחות' : '▼ פרטים נוספים'}</div>
                  {openTrack === 'btl' && (
                    <div style={{ marginTop: 12, fontSize: 13, color: '#334', lineHeight: 1.7, borderTop: '1px solid #e9d5ff', paddingTop: 12 }}>
                      <strong>מה צריך להביא:</strong>
                      <ul style={ulStyle}>
                        <li>אבחנה פסיכיאטרית מגורם מוסמך</li>
                        <li>מסמכים רפואיים ותיקים</li>
                        <li>מכתב מהפסיכיאטר המטפל</li>
                      </ul>
                      <div style={{ marginTop: 10 }}>📞 מוקד ביטוח לאומי: <strong>*6050</strong><br />🌐 <a href="https://www.btl.gov.il" target="_blank" rel="noopener noreferrer" style={{ color: PURPLE }}>btl.gov.il</a></div>
                    </div>
                  )}
                </div>

                <div onClick={() => setOpenTrack(openTrack === 'moh' ? null : 'moh')} style={{ background: '#ecfeff', borderRadius: 14, padding: '18px 16px', borderTop: `4px solid ${CYAN}`, cursor: 'pointer' }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: CYAN, marginBottom: 8 }}>🏥 מסלול פסיכיאטר מורשה</div>
                  <div style={{ fontSize: 13, color: '#445', lineHeight: 1.6, marginBottom: 10 }}>פנייה לפסיכיאטר מורשה מטעם משרד הבריאות לקביעת אחוזי נכות עקרוניים.</div>
                  <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>⚠ ללא קצבת נכות חודשית</div>
                  <div style={{ fontSize: 12, color: CYAN, fontWeight: 600, marginTop: 8 }}>{openTrack === 'moh' ? '▲ פחות' : '▼ פרטים נוספים'}</div>
                  {openTrack === 'moh' && (
                    <div style={{ marginTop: 12, fontSize: 13, color: '#334', lineHeight: 1.7, borderTop: '1px solid #a5f3fc', paddingTop: 12 }}>
                      <ul style={ulStyle}>
                        <li>מי שהביטוח הלאומי דחה אותם — <strong>לא</strong> יכולים להשתמש במסלול זה</li>
                        <li>מתאים למי שרוצה להתחיל בתהליך השיקום מהר יותר</li>
                        <li>פונים למרכז לבריאות הנפש האזורי לקבלת הפנייה לפסיכיאטר מורשה</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                💡 <strong>ההבדל המרכזי:</strong> מסלול ביטוח לאומי נותן גם קצבת נכות חודשית. מסלול הפסיכיאטר המורשה פותח את הדלת לסל שיקום בלבד.
              </div>
            </Card>
          </div>

          <div id="process">
            <Card color="#5E35B1" icon="🗺️" title="התהליך שלב אחר שלב">
              <p style={pStyle}>אחרי קבלת אחוזי הנכות, הדרך לסל שיקום:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { num: '1', title: 'קביעת אחוזי נכות', text: 'דרך ביטוח לאומי או פסיכיאטר מורשה מטעם משרד הבריאות — לפחות 40% על רקע נפשי.', color: '#5E35B1', time: 'משתנה' },
                  { num: '2', title: 'הגשת בקשה לסל שיקום', text: 'ניתן להגיש עצמאית או בליווי גורם מטפל — רצוי עובד סוציאלי. הבקשה מוגשת למרכז לבריאות הנפש האזורי.', color: '#4C0080', time: 'ימים–שבועות' },
                  { num: '3', title: 'זימון לוועדת שיקום', text: 'הוועדה בוחנת את הצרכים, הרצונות והיכולות שלך. חשוב להגיע מוכן עם מסמכים ורשימת שירותים שמעניינים אותך.', color: '#3730A3', time: 'שבועות–חודשים' },
                  { num: '4', title: 'אישור השירותים', text: 'הוועדה מאשרת את השירותים הרלוונטיים לפי רצון, יכולת וצורך. מקבלים תוכנית שיקום אישית.', color: '#1D9E75', time: 'לאחר הוועדה' },
                ].map((s, i, arr) => (
                  <div key={s.num} style={{ display: 'flex', gap: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 16 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.color, color: 'white', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.num}</div>
                      {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: '#e9d5ff', margin: '4px 0', minHeight: 24 }} />}
                    </div>
                    <div style={{ paddingBottom: i < arr.length - 1 ? 20 : 0, paddingTop: 4, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: s.color }}>{s.title}</div>
                        <span style={{ fontSize: 11, background: '#f5f3ff', color: '#9b88bb', borderRadius: '999px', padding: '2px 8px', fontWeight: 600 }}>{s.time}</span>
                      </div>
                      <div style={{ fontSize: 13.5, color: '#445', lineHeight: 1.65 }}>{s.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px 14px', marginTop: 16, fontSize: 13, color: '#166534', lineHeight: 1.6 }}>
                👥 <strong>טיפ:</strong> ליווי של עובד סוציאלי בתהליך ההגשה יכול לקצר משמעותית את הזמנים ולהגדיל את הסיכוי לאישור השירותים הנכונים עבורך.
              </div>
            </Card>
          </div>

          <div id="rights">
            <Card color="#0E7490" icon="⚖️" title="זכויות המטופל בבריאות הנפש">
              <p style={pStyle}>חוק זכויות החולה (1996) וחוק טיפול בחולי נפש מגנים על זכויותיך:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '📄', title: 'זכות למידע', text: 'הזכות לקבל הסבר מלא על אבחנתך, מצבך ואפשרויות הטיפול — בשפה שאתה מבין.' },
                  { icon: '✅', title: 'הסכמה מדעת', text: 'שום טיפול לא יינתן ללא הסכמתך, למעט מקרי חירום או צו בית משפט.' },
                  { icon: '🔒', title: 'סודיות רפואית', text: 'המידע הרפואי שלך חסוי ולא יועבר לגורם שלישי ללא רשותך.' },
                  { icon: '📂', title: 'עיון בתיק הרפואי', text: 'הזכות לעיין בתיק הרפואי שלך ולקבל עותק ממנו.' },
                  { icon: '🔄', title: 'דעה שנייה', text: 'הזכות לפנות לרופא אחר לקבלת חוות דעת נוספת.' },
                  { icon: '👤', title: 'כבוד וצנעת הפרט', text: 'הזכות לטיפול בכבוד ובהתחשבות בצרכייך הפיזיים, הנפשיים והתרבותיים.' },
                  { icon: '🆘', title: 'אשפוז כפוי — זכויות', text: 'גם אם אושפזת בכפייה, יש לך זכות לייצוג משפטי, לערר בפני ועדה פסיכיאטרית ולהודיע לקרוב משפחה.' },
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

          <div id="questions">
            <Card color="#5E35B1" icon="❓" title="מה לשאול לפני קבלה למסגרת?">
              <p style={pStyle}>פגישת ההיכרות היא הזדמנות לאסוף מידע חשוב:</p>
              {[
                { cat: 'על המסגרת', color: '#5E35B1', questions: ['כמה מקומות יש ומה זמן ההמתנה הממוצע?','מי הצוות המקצועי ומה הרקע שלו?','מהי שגרת היום במסגרת?','האם יש ביקורים ומה המדיניות?'] },
                { cat: 'על הטיפול', color: '#0E7490', questions: ['מה הגישה הטיפולית (CBT, DBT, פסיכודינמי...)?','כמה פגישות אישיות יש בשבוע?','איך מודדים התקדמות?','מה קורה בעת משבר?'] },
                { cat: 'על הכספים והזכויות', color: '#2E7D32', questions: ['האם המסגרת מוכרת לסל שיקום?','מה עלות ההשתתפות העצמית?','האם ניתן לפרוש מרצון ומה התנאים?','האם יש ועד דיירים / ועדת ערר?'] },
              ].map(section => (
                <div key={section.cat} style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: section.color, marginBottom: 6 }}>{section.cat}</div>
                  {section.questions.map(q => (
                    <div key={q} style={{ display: 'flex', gap: 8, padding: '7px 12px', background: '#faf5ff', borderRadius: 8, marginBottom: 4, fontSize: 13.5, color: '#334', lineHeight: 1.5 }}>
                      <span style={{ color: section.color, fontWeight: 700, flexShrink: 0 }}>•</span>{q}
                    </div>
                  ))}
                </div>
              ))}
            </Card>
          </div>

          <div style={{ background: 'linear-gradient(160deg, #2E0060, #8B00D4)', borderRadius: 20, padding: '28px 24px', textAlign: 'center', color: 'white', marginTop: 8 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🧭</div>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>מוכנים למצוא מסגרת מתאימה?</div>
            <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 20, lineHeight: 1.6 }}>ענו על כמה שאלות קצרות וקבלו המלצה על שירותים קיימים</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/calculator" style={{ background: 'white', color: PURPLE, borderRadius: '999px', padding: '11px 24px', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>🧭 מחשבון איתור מסלול</a>
              <a href="/rehab" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '999px', padding: '11px 24px', fontWeight: 800, fontSize: 14, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.4)' }}>♿ חיפוש שירותי שיקום</a>
            </div>
          </div>

        </main>

        <footer style={{ background: 'linear-gradient(135deg, #2E0060, #4C0080)', color: 'rgba(255,255,255,0.75)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48, fontWeight: 500 }}>
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

function Card({ color, icon, title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '28px 24px', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', borderTop: `5px solid ${color}` }}>
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
