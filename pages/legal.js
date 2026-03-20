import Head from 'next/head'

const NAV = [['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/guide', 'מדריך'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']]

export default function Legal() {
  return (
    <>
      <Head>
        <title>תנאי שימוש ומדיניות פרטיות | בריאות נפש בישראל</title>
        <meta name="description" content="תנאי שימוש ומדיניות פרטיות של פורטל בריאות נפש בישראל." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rehabdirectoryil.vercel.app/legal" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#F0F7FF' }}>

        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="לוגו" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>תנאי שימוש ופרטיות</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px' }}>תנאי שימוש ומדיניות פרטיות</h1>
          <p style={{ fontSize: 14, opacity: 0.8, margin: 0 }}>עודכן לאחרונה: מרץ 2026</p>
        </div>

        <main style={{ maxWidth: 740, margin: '0 auto', padding: '40px 16px 64px' }}>

          {/* תנאי שימוש */}
          <Section color="#1A3A5C" title="תנאי שימוש">

            <SubTitle>מהות השירות</SubTitle>
            <P>פורטל "בריאות נפש בישראל" הוא מאגר מידע ציבורי שנועד לסייע למטופלים, משפחות ואנשי מקצוע למצוא שירותי שיקום וטיפול נפשי בישראל. המידע המוצג באתר אינו מהווה המלצה רפואית, אבחון או ייעוץ מקצועי מכל סוג. יש לפנות לגורם מקצועי מוסמך לקבלת ייעוץ אישי.</P>

            <SubTitle>דיוק המידע</SubTitle>
            <P>המאגר נבנה על סמך הרשמה עצמית של שירותים. האתר אינו אחראי לנכונות, שלמות או עדכניות המידע שמספקים השירותים הרשומים. מידע שגוי או חסר ניתן לדיווח דרך עמוד <a href="/contact" style={{ color: '#1A3A5C', fontWeight: 700 }}>צור קשר</a>.</P>

            <SubTitle>מצבי חירום</SubTitle>
            <div style={{ background: '#FFF3E0', border: '1.5px solid #FFB74D', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
              <P style={{ margin: 0, fontWeight: 600, color: '#E65100' }}>
                ⚠️ אם אתם במצב חירום נפשי או בסכנה מיידית - אל תסתמכו על האתר. פנו מיד לחדר מיון, לקו לבריאות הנפש <strong>1201</strong>, או לחירום <strong>101</strong>.
              </P>
            </div>

            <SubTitle>קניין רוחני</SubTitle>
            <P>כל תכני האתר, העיצוב והלוגו שמורים. אין להעתיק או להשתמש בהם ללא אישור מפורש.</P>

            <SubTitle>שינויים בתנאים</SubTitle>
            <P>הפורטל רשאי לשנות את תנאי השימוש בכל עת. המשך השימוש באתר מהווה הסכמה לתנאים המעודכנים.</P>
          </Section>

          {/* מדיניות פרטיות */}
          <Section color="#2A5298" title="מדיניות פרטיות">

            <SubTitle>איזה מידע נאסף?</SubTitle>
            <P>האתר משתמש ב-Google Analytics לצורך ניתוח תנועת גולשים בלבד. המידע שנאסף כולל: דפים שנצפו, זמן שהייה, מדינת הגישה, סוג המכשיר ושפת הדפדפן. מידע זה אנונימי ואינו מזהה משתמשים ספציפיים.</P>

            <SubTitle>Cookies</SubTitle>
            <P>Google Analytics משתמש ב-cookies לצורך מעקב אנונימי. ניתן להשבית זאת דרך הגדרות הדפדפן או דרך <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: '#2A5298', fontWeight: 700 }}>Google Analytics Opt-out</a>.</P>

            <SubTitle>טפסי יצירת קשר והרשמת שירותים</SubTitle>
            <P>מידע שמוזן בטפסי האתר (פניות, הרשמת שירותים) מועבר ישירות לצוות האתר ומשמש אך ורק למטרות הטופס. המידע אינו נמכר ואינו מועבר לצד שלישי כלשהו.</P>

            <SubTitle>יצירת קשר בנושאי פרטיות</SubTitle>
            <P>לכל שאלה בנוגע לפרטיות ניתן לפנות דרך עמוד <a href="/contact" style={{ color: '#2A5298', fontWeight: 700 }}>צור קשר</a> באתר.</P>
          </Section>

        </main>

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13 }}>
          <div style={{ marginBottom: 8 }}>
            {[['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/legal', 'תנאי שימוש']].map(([href, label], i, arr) => (
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
