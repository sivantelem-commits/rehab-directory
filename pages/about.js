import Head from 'next/head'

export default function About() {
  return (
    <>
      <Head>
        <title>אודות | מאגר שירותי סל שיקום</title>
        <meta name="description" content="מה זה סל שיקום ואיך האתר עוזר למצוא שירותים בקהילה" />
      </Head>
      <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#FFF8F3' }}>
        <header style={{ background: '#1A3A5C', color: 'white', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F47B20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>♿</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 19 }}>סל שיקום</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>מאגר שירותי שיקום בקהילה</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['/', 'שירותים'], ['/map', '🗺️ מפה'], ['/register', 'הרשמת שירות'], ['/about', 'אודות'], ['/admin', 'ניהול']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 12px', fontWeight: 600, fontSize: 12, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>♿</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 10px' }}>אודות האתר</h1>
          <p style={{ fontSize: 15, opacity: 0.85, margin: 0 }}>כל מה שצריך לדעת על סל שיקום והמאגר</p>
        </div>

        <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', borderRight: '5px solid #F47B20' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A5C', margin: '0 0 14px' }}>🧩 מה זה סל שיקום?</h2>
            <p style={{ fontSize: 15, color: '#334', lineHeight: 1.8, margin: 0 }}>
              סל שיקום הוא מסגרת תמיכה ממלכתית המיועדת לאנשים עם מוגבלות נפשית, המאפשרת להם לחיות חיים עצמאיים ומשמעותיים בקהילה.
              הסל כולל מגוון שירותים — החל מדיור מוגן וסיוע בתעסוקה, דרך תמיכה חברתית ופנאי, ועד ליווי אישי וטיפולים שונים.
              המטרה היא לתת לכל אדם את הכלים והתמיכה המתאימים לו, כדי שיוכל לממש את הפוטנציאל שלו ולהשתלב בחברה.
            </p>
          </div>

          <div style={{ background: 'white', borderRadius: 20, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', borderRight: '5px solid #1A3A5C' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A5C', margin: '0 0 14px' }}>💡 למה הכנו את האתר?</h2>
            <p style={{ fontSize: 15, color: '#334', lineHeight: 1.8, margin: 0 }}>
              עד היום, מי שרצה למצוא שירות מתאים נאלץ לעבור עבודת נמלים — לחפש בעשרות מקורות שונים, להתקשר, לשאול ולהשוות.
              לא היה מקום אחד שבו כל השירותים מאוגדים בצורה מסודרת וברורה.
              האתר הזה נוצר כדי לשנות את זה — מאגר אחד, פשוט ונגיש, שבו אפשר למצוא את כל שירותי סל השיקום בישראל במקום אחד.
            </p>
          </div>

          <div style={{ background: 'white', borderRadius: 20, padding: '24px', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.07)', borderRight: '5px solid #2E7D32' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A5C', margin: '0 0 14px' }}>🔍 איך משתמשים באתר?</h2>
            <p style={{ fontSize: 15, color: '#334', lineHeight: 1.8, marginBottom: 16 }}>
              החיפוש פשוט ומהיר — סננו לפי אזור גיאוגרפי, קטגוריית שירות, או חפשו לפי שם ועיר.
              לחיצה על כל שירות תפתח עמוד מפורט עם פרטי קשר, כתובת ומיקום על המפה.
              ניתן גם לשתף שירות ישירות בוואטסאפ או להעתיק קישור.
            </p>
            <a href="/" style={{ display: 'inline-block', background: '#F47B20', color: 'white', borderRadius: 20, padding: '10px 24px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              התחילו לחפש →
            </a>
          </div>

          <div style={{ background: 'white', borderRadius: 20, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', borderRight: '5px solid #C2185B' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A3A5C', margin: '0 0 14px' }}>🏢 אתם נותני שירות?</h2>
            <p style={{ fontSize: 15, color: '#334', lineHeight: 1.8, marginBottom: 16 }}>
              כל ארגון או גוף המספק שירותי סל שיקום מוזמן להירשם למאגר בחינם.
              הרישום פשוט ומהיר — מלאו את הפרטים ובקשתכם תועבר לאישור.
              לאחר האישור, השירות שלכם יופיע במאגר ויהיה נגיש לכל מי שמחפש.
            </p>
            <a href="/register" style={{ display: 'inline-block', background: '#1A3A5C', color: 'white', borderRadius: 20, padding: '10px 24px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              הרשמת שירות →
            </a>
          </div>
        </main>

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
          מאגר שירותי סל שיקום © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}
