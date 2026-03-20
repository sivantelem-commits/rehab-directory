import Head from 'next/head'

const NAV = [['/', 'ראשי'], ['/rehab', 'שיקום'], ['/treatment', 'טיפול'], ['/map', 'מפה'], ['/guide', 'מדריך'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', 'צור קשר'], ['/admin', 'ניהול']]

export default function About() {
  return (
    <>
      <Head>
        <title>אודות | בריאות נפש בישראל</title>
        <meta name="description" content="אודות פורטל בריאות נפש בישראל – מנגישים מידע על שירותי שיקום וטיפול פסיכיאטרי לאנשים, משפחות ואנשי מקצוע." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rehabdirectoryil.vercel.app/about" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="אודות | בריאות נפש בישראל" />
        <meta property="og:description" content="אודות פורטל בריאות נפש בישראל – מנגישים מידע על שירותי שיקום וטיפול פסיכיאטרי לאנשים, משפחות ואנשי מקצוע." />
        <meta property="og:url" content="https://rehabdirectoryil.vercel.app/about" />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#F0F7FF' }}>
        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="לוגו" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>אודות הפורטל</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'white',
                background: href === '/about' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
                borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12,
                border: href === '/about' ? '1.5px solid rgba(255,255,255,0.6)' : '1.5px solid rgba(255,255,255,0.25)',
                textDecoration: 'none',
              }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '48px 20px', textAlign: 'center' }}>
          <img src='/about-icon.png' alt='אודות' style={{ width: 120, height: 120, objectFit: 'contain', marginBottom: 0, filter: 'invert(1) brightness(10)' }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 12px' }}>בריאות נפש בישראל</h1>
          <p style={{ fontSize: 16, opacity: 0.85, maxWidth: 580, margin: '0 auto', lineHeight: 1.8 }}>
            מנגישים את בריאות הנפש
          </p>
        </div>

        <main style={{ maxWidth: 740, margin: '0 auto', padding: '36px 16px' }}>

          <Card color="#1A3A5C" icon="💙" title="למה נוצר הפורטל הזה?">
            <p style={p}>משבר נפשי של עצמנו או של מישהו שאנחנו אוהבים מגיע לרוב בלי הכנה. ברגעים האלה, כשהכי צריכים עזרה, המידע על השירותים הקיימים מפוזר וקשה למצוא.</p>
            <p style={p}>מי שנמצא במשבר נפשי לא תמיד יודע מה קורה לו, מה מגיע לו ולאן לפנות. בני משפחה וחברים רוצים לעזור אבל גם הם לא יודעים איפה להתחיל.</p>
            <p style={p}>הפורטל הזה נוצר כדי לשנות את זה. מקום אחד, ברור ופשוט, שמרכז את כל המידע על שירותי הטיפול והשיקום בישראל - כדי שתוכלו להתמקד בהחלמה, לא בחיפוש.</p>
          </Card>

          <Card color="#0277BD" icon="🏥" title="מידע לאנשים במשבר ולמי שמלווה אותם">
            <p style={p}>הרבה שירותים קיימים - בתים מאזנים, מחלקות אשפוז, מרפאות יום וחדרי מיון פסיכיאטריים - אבל רוב האנשים פשוט לא יודעים שהם קיימים. לפעמים גם אנשי מקצוע לא מכירים את כל האפשרויות.</p>
            <p style={p}>נשמח לעזור למצוא את המידע למטופלים, למשפחות, לעובדים סוציאליים ולכל מי שצריך לדעת מה קיים ואיפה.</p>
          </Card>

          <Card color="#4C0080" icon="♿" title="שירותי שיקום - דעו מה מגיע לכם">
            <p style={p}>סל השיקום הוא זכות חוקית של אנשים עם מגבלה נפשית בישראל, אבל הרבה אנשים פשוט לא יודעים שהזכות קיימת ועוד פחות יודעים איך לממש אותה.</p>
            <p style={p}>הסל כולל שירותים בתחומים שונים: דיור, תעסוקה, השכלה, חברה ופנאי ועוד. כל אחד מהם יכול להיות צעד חשוב בדרך חזרה לחיים עצמאיים ומלאים.</p>
            <p style={p}>כל השירותים האלה מרוכזים כאן במקום אחד לפי אזור וקטגוריה כדי שתוכלו לראות מה קיים בקרבתכם ולמצוא את מה שמתאים לכם.</p>
          </Card>

          <Card color="#2E7D32" icon="🤝" title="איך אפשר לעזור?">
            <p style={p}>הפורטל נבנה בעזרת אנשים כמוכם. אם אתם מנהלים שירות בריאות נפש ותרצו שיופיע כאן, תוכלו להירשם דרך טופס ההרשמה. כל שירות עובר בדיקה לפני שמתפרסם.</p>
            <p style={p}>אם אתם מזהים מידע שגוי או חסר - נשמח לשמוע. ביחד נוכל לבנות מאגר מידע מהימן ועדכני לכל מי שצריך.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <a href="/register" style={btn('#4C0080')}>הוספת שירות</a>
              <a href="/contact" style={btn('#1A3A5C')}>צור קשר</a>
            </div>
          </Card>

        </main>

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <a href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>צור קשר</a>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <a href="/legal" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>תנאי שימוש</a>
          </div>
          בריאות נפש בישראל © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}

const p = { fontSize: 15, color: '#334', lineHeight: 1.8, margin: '0 0 12px' }

const btn = (color) => ({
  display: 'inline-block', background: color, color: 'white', borderRadius: 20,
  padding: '10px 20px', fontWeight: 700, fontSize: 13, textDecoration: 'none'
})

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
