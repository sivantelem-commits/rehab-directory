import Head from 'next/head'

const NAV = [['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']]

export default function Accessibility() {
  return (
    <>
      <Head>
        <title>הצהרת נגישות | בריאות נפש בישראל</title>
        <meta name="description" content="הצהרת הנגישות של פורטל בריאות נפש בישראל – רמת עמידה, אמצעי נגישות, ופרטי יצירת קשר לפניות נגישות." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rehabdirectoryil.vercel.app/accessibility" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#F0F7FF', position: 'relative' }}>

        <a href="#main-content" style={{
          position: 'absolute', top: '-40px', right: 0,
          background: '#1A3A5C', color: 'white', padding: '8px 16px',
          borderRadius: '0 0 8px 8px', fontWeight: 700, fontSize: 14,
          textDecoration: 'none', zIndex: 9999, transition: 'top 0.2s'
        }}
          onFocus={e => e.currentTarget.style.top = '0'}
          onBlur={e => e.currentTarget.style.top = '-40px'}
        >דלג לתוכן הראשי</a>

        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="בריאות נפש בישראל" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>הצהרת נגישות</div>
            </div>
          </div>
          <nav aria-label="ניווט ראשי" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '48px 20px', textAlign: 'center' }}>
          <img src="/accessibility-icon.png" alt="" role="presentation" style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 0, filter: 'invert(1) brightness(10)' }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px' }}>הצהרת נגישות</h1>
          <p style={{ fontSize: 14, opacity: 0.8, margin: 0 }}>עודכן לאחרונה: מרץ 2026 | WCAG 2.1 AA | תקן ישראלי 5568</p>
        </div>

        <main id="main-content" style={{ maxWidth: 740, margin: '0 auto', padding: '40px 16px 64px' }}>

          <Section color="#1A3A5C" title="1. מחויבות הארגון לנגישות">
            <P>פורטל &quot;בריאות נפש בישראל&quot; מחויב להנגשת שירותיו לכלל האוכלוסייה, לרבות אנשים עם מוגבלויות. האתר פועל בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות, התשנ&quot;ח-1998, ולתקנות הנגישות לשירות שהותקנו מכוחו.</P>
            <P>האתר נועד לשרת אנשים הנמצאים במשבר נפשי, בני משפחותיהם ואנשי מקצוע בתחום בריאות הנפש. קהל יעד זה כולל, בין היתר, אנשים עם לקויות ראייה, שמיעה ומוגבלויות קוגניטיביות — ולכן הנגישות היא ערך יסוד בפיתוח האתר.</P>
          </Section>

          <Section color="#2A5298" title="2. רמת העמידה בתקנים">
            <P>האתר שואף לעמוד ברמת <strong>AA</strong> של הנחיות <strong>WCAG 2.1</strong> (Web Content Accessibility Guidelines), המהווה את הרמה הנדרשת לפי תקן ישראלי 5568 ולפי חוק שוויון זכויות לאנשים עם מוגבלות.</P>
            <P>הנחיות אלו כוללות ארבעה עקרונות יסוד:</P>
            <ul style={{ fontSize: 15, color: '#334', lineHeight: 2, paddingRight: 20 }}>
              <li><strong>תפיסתי (Perceivable)</strong> — המידע וממשק המשתמש מוצגים בדרכים שמשתמשים יכולים לתפוס אותם.</li>
              <li><strong>ניתן לתפעול (Operable)</strong> — ממשק המשתמש וניווט האתר ניתנים לתפעול.</li>
              <li><strong>מובן (Understandable)</strong> — המידע ותפעול ממשק המשתמש מובנים.</li>
              <li><strong>חסין (Robust)</strong> — התוכן יכול להתפרש בצורה אמינה על ידי מגוון מכשירי עזר.</li>
            </ul>
          </Section>

          <Section color="#1A3A5C" title="3. אמצעי הנגישות הקיימים באתר">
            <SubTitle>3.1 ניווט ומבנה</SubTitle>
            <ul style={{ fontSize: 15, color: '#334', lineHeight: 2, paddingRight: 20 }}>
              <li>מבנה כותרות היררכי (H1, H2, H3) לניווט קל בקורא מסך</li>
              <li>כותרת עמוד (title) ייחודית לכל עמוד בפורמט &quot;שם עמוד | שם האתר&quot;</li>
              <li>קישורי ניווט ברורים עם טקסט תיאורי</li>
              <li>פוטר עקבי בכל עמודי האתר עם קישורים לעמודים מרכזיים</li>
            </ul>

            <SubTitle>3.2 תוכן ומדיה</SubTitle>
            <ul style={{ fontSize: 15, color: '#334', lineHeight: 2, paddingRight: 20 }}>
              <li>תמונות מלוות בטקסט חלופי (alt text) המתאר את תוכנן</li>
              <li>תמונות דקורטיביות מוגדרות עם alt ריק כדי שיידלגו על ידי קוראי מסך</li>
              <li>שפת האתר מוגדרת כעברית (lang=&quot;he&quot;) וכיוון RTL (dir=&quot;rtl&quot;)</li>
            </ul>

            <SubTitle>3.3 טפסים ואינטראקציה</SubTitle>
            <ul style={{ fontSize: 15, color: '#334', lineHeight: 2, paddingRight: 20 }}>
              <li>כל שדות הטופס מלווים בתוויות (labels) מקושרות באמצעות מאפיין for/id</li>
              <li>שדות חובה מסומנים בבירור ומלווים בהסבר טקסטואלי</li>
              <li>הודעות שגיאה ברורות ומקושרות לשדה הרלוונטי</li>
              <li>הודעות אישור לאחר שליחת טופס נגישות לקוראי מסך באמצעות aria-live</li>
              <li>מחשבון המסלול: שאלות מקובצות סמנטית (fieldset/legend), כפתורי תשובה עם מצב נבחר (aria-pressed), ועדכון התקדמות בזמן אמת</li>
              <li>עדכון תוצאות חיפוש בזמן אמת (aria-live) בעמודי שיקום וטיפול — קורא מסך מודיע על מספר השירותים שנמצאו</li>
              <li>הסכמה לעוגיות: Google Analytics נטען רק לאחר הסכמה מפורשת של המשתמש. ניתן לדחות ולא להיות מנוטר</li>
            </ul>
          </Section>

          <Section color="#2A5298" title="4. מגבלות נגישות ידועות">
            <P>למרות מאמצינו, ייתכן שחלקים מסוימים באתר אינם נגישים במלואם. להלן מגבלות ידועות שאנו עובדים לתקן:</P>
            <ul style={{ fontSize: 15, color: '#334', lineHeight: 2, paddingRight: 20 }}>
              <li><strong>מפת השירותים (/map):</strong> מפה אינטראקטיבית עשויה להציב אתגרים למשתמשי קורא מסך. אנו עובדים על חלופה מבוססת-טבלה.</li>
              <li><strong>תכני צד שלישי:</strong> תוכן המוטמע ממקורות חיצוניים (מפות, וידאו) עשוי לא לעמוד בכל דרישות הנגישות.</li>
            </ul>
          </Section>

          <Section color="#1A3A5C" title="5. פנייה בנושאי נגישות">
            <P>נתקלתם בבעיית נגישות? מצאתם תוכן שאינו נגיש? רוצים לקבל מידע בפורמט נגיש אחר? אנחנו כאן.</P>
            <SubTitle>רכז/ת הנגישות</SubTitle>
            <div style={{ fontSize: 15, color: '#334', lineHeight: 2 }}>
              <div><strong>שם:</strong> סיון כהן תלם</div>
              <div><strong>תפקיד:</strong> רכז נגישות אתר</div>
              <div><strong>דואר אלקטרוני:</strong> <a href="mailto:sivantelem@gmail.com" style={{ color: '#1A3A5C', fontWeight: 700 }}>sivantelem@gmail.com</a></div>
              <div><strong>שעות מענה:</strong> ימים א׳–ה׳, 09:00–17:00</div>
            </div>
            <P style={{ marginTop: 16 }}>ניתן לפנות גם דרך <a href="/contact" style={{ color: '#1A3A5C', fontWeight: 700 }}>טופס יצירת הקשר באתר</a> — בחרו בקטגוריה &quot;פנייה כללית / שאלה&quot; וציינו שהפנייה עוסקת בנגישות.</P>
            <div style={{ background: '#FFF8E1', border: '1.5px solid #FFD54F', borderRadius: 12, padding: '14px 16px', marginTop: 8 }}>
              <P style={{ margin: 0, fontWeight: 600, color: '#795548' }}>אנו מתחייבים לטפל בפניות נגישות תוך 21 ימי עבודה ולספק מענה מלא.</P>
            </div>
          </Section>

          <Section color="#2A5298" title="6. אכיפה ופיקוח">
            <P>אם לא קיבלתם מענה מספק לפנייתכם תוך זמן סביר, ניתן לפנות לגורמים הבאים:</P>
            <ul style={{ fontSize: 15, color: '#334', lineHeight: 2, paddingRight: 20 }}>
              <li><strong>נציב שוויון זכויות לאנשים עם מוגבלות:</strong> משרד המשפטים — ניתן להגיש תלונה בגין הפרת חובת הנגישות.</li>
              <li><strong>בית המשפט המוסמך:</strong> ניתן להגיש תביעה אזרחית בגין הפרת חוק שוויון זכויות לאנשים עם מוגבלות.</li>
            </ul>
          </Section>

          <Section color="#1A3A5C" title="7. בדיקות ועדכון">
            <P>הנגישות של האתר נבדקת בשיטות הבאות:</P>
            <ul style={{ fontSize: 15, color: '#334', lineHeight: 2, paddingRight: 20 }}>
              <li>בדיקה אוטומטית באמצעות כלי Axe ו-Lighthouse</li>
              <li>בדיקה ידנית עם קורא המסך NVDA (Windows) ו-VoiceOver (Mac/iOS)</li>
              <li>בדיקת ניווט מקלדת ללא עכבר</li>
              <li>בדיקת ניגודיות צבעים בהתאם לדרישות WCAG AA</li>
            </ul>
            <div style={{ fontSize: 14, color: '#666', marginTop: 16, lineHeight: 2 }}>
              <div><strong>הצהרה זו עודכנה לאחרונה:</strong> מרץ 2026</div>
              <div><strong>תדירות בדיקה:</strong> אחת לשנה ובכל עדכון מהותי של האתר</div>
              <div><strong>גרסת הנחיות:</strong> WCAG 2.1, רמת AA | תקן ישראלי 5568</div>
            </div>
          </Section>

        </main>

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13 }}>
          <div style={{ marginBottom: 8 }}>
            {[['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/legal', 'תנאי שימוש'], ['/accessibility', 'הצהרת נגישות']].map(([href, label], i, arr) => (
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

function Section({ color, title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '28px 24px', marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', borderTop: `5px solid ${color}` }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color, margin: '0 0 20px' }}>{title}</h2>
      {children}
    </div>
  )
}

function SubTitle({ children }) {
  return <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1A3A5C', margin: '16px 0 6px' }}>{children}</h3>
}

function P({ children, style }) {
  return <p style={{ fontSize: 15, color: '#334', lineHeight: 1.8, margin: '0 0 10px', ...style }}>{children}</p>
}
