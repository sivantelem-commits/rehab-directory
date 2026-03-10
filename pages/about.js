import Head from 'next/head'

const NAV = [['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register-treatment', 'הרשמת שירות'], ['/about', 'אודות'], ['/admin', 'ניהול']]
export default function About() {
  return (
    <>
      <Head>
        <title>אודות | בריאות נפש בישראל</title>
        <meta name="description" content="אודות פורטל בריאות נפש בישראל – מי אנחנו ולמה נוצר האתר" />
      </Head>
      <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F0F7FF' }}>
        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F47B20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>♿</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 19 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>אודות הפורטל</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 12px', fontWeight: 600, fontSize: 12, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🧠</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 12px' }}>בריאות נפש בישראל</h1>
          <p style={{ fontSize: 16, opacity: 0.85, maxWidth: 580, margin: '0 auto', lineHeight: 1.8 }}>
            כי כשהכי קשה — לא צריך לבזבז כוח על חיפוש
          </p>
        </div>

        <main style={{ maxWidth: 740, margin: '0 auto', padding: '36px 16px' }}>

          <Card color="#1A3A5C" icon="💙" title="למה נוצר הפורטל הזה?">
            <p style={p}>משבר נפשי של עצמנו או של מישהו שאנחנו אוהבים מגיע לרוב בלי הכנה. בשניות האלה, כשהכי זקוקים לכיוון ולתמיכה, מתגלה מציאות קשה: המידע על השירותים הקיימים מפוזר, קשה להבנה, ולעיתים בלתי נגיש לחלוטין.</p>
            <p style={p}>מי שנקלע למשבר נפשי חווה לעיתים קרובות חוסר וודאות עמוק לגבי מה קורה לו, מה מגיע לו, ולאן לפנות. הסובבים אותו — בני משפחה, חברים, אנשי מקצוע - חווים גם הם חוסר אונים: הם רוצים לעזור, אבל לא יודעים מאיפה להתחיל.</p>
            <p style={p}>הפורטל הזה נוצר כדי לשנות את זה. מקום אחד, ברור ונגיש, שמרכז את כל המידע על שירותי הטיפול והשיקום בישראל כדי שהאנרגיה תופנה לריפוי, לא לחיפוש.</p>
          </Card>

          <Card color="#0277BD" icon="🏥" title="הנגשת מידע לאנשים במשבר ולמטפלים בהם">
            <p style={p}>אחד האתגרים הגדולים ביותר בבריאות הנפש בישראל הוא הפער בין השירותים הקיימים לבין היכולת למצוא אותם. מסגרות טיפוליות רבות - בתים מאזנים, מחלקות אשפוז, מרפאות יום וחדרי מיון פסיכיאטריים אינם מוכרים לציבור הרחב, ואפילו לא תמיד לאנשי מקצוע בתחום.</p>
            <p style={p}>הפורטל שואף להנגיש את המידע הזה לכולם: למטופלים, למשפחות, לעובדים סוציאליים, לפסיכיאטרים ולכל מי שצריך לדעת מה קיים ואיפה.</p>
          </Card>

          <Card color="#F47B20" icon="♿" title="מציאת מסגרות שיקום — חשיפה למה שמגיע לכם">
            <p style={p}>סל השיקום הוא זכות חוקית של אנשים עם מגבלה נפשית בישראל (החל מרף מסויים) אך רבים אינם יודעים שזכות זו קיימת, ועוד יותר אינם יודעים כיצד לממש אותה.</p>
            <p style={p}>הסל מגוון וכולל שירותים בתחומי הדיור, תעסוקה, השכלה, חברה ופנאי ועוד. כל אחד מהם יכול לשמש נדבך בדרך חזרה לחיים מלאים ועצמאיים.</p>
            <p style={p}>הפורטל מרכז את כל המסגרות הללו במקום אחד - מסודרות לפי אזור גיאוגרפי וקטגוריה - כדי שתוכלו לגלות מה קיים בקרבתכם, להשוות ולמצוא את המסגרת שמתאימה לצרכים שלכם. לא צריך לדעת מראש מה לחפש - הפורטל כאן כדי לחשוף את האפשרויות.</p>
          </Card>

          <Card color="#2E7D32" icon="🤝" title="איך אפשר לתרום?">
            <p style={p}>הפורטל נבנה על בסיס שיתוף פעולה. אם אתם מנהלים שירות בריאות נפש טיפולי או שיקומי, ותרצו שהוא יופיע כאן, תוכלו להירשם דרך טופס ההרשמה. כל שירות עובר אישור לפני פרסום.</p>
            <p style={p}>אם אתם אנשי מקצוע ומזהים מידע חסר או שגוי נשמח לשמוע. יחד נוכל לבנות מאגר מידע מהימן, עדכני ומועיל לכל מי שזקוק לו.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <a href="/register" style={btn('#F47B20')}>♿ הרשמת שירות שיקום</a>
              <a href="/register-treatment" style={btn('#0277BD')}>🏥 הרשמת שירות טיפולי</a>
            </div>
          </Card>

        </main>

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 16 }}>
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
