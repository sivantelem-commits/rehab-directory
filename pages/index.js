import { useState } from "react";

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .page {
    min-height: 100vh;
    background: #f7f3ff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    font-family: 'Nunito', sans-serif;
    direction: rtl;
  }

  .header {
    text-align: center;
    margin-bottom: 48px;
  }

  .header-emoji { font-size: 48px; margin-bottom: 12px; }

  .header h1 {
    font-size: 30px;
    font-weight: 800;
    color: #3d2a6e;
    margin-bottom: 8px;
    letter-spacing: -0.3px;
  }

  .header p {
    font-size: 15px;
    color: #9b88bb;
    font-weight: 500;
  }

  .buttons-row {
    display: flex;
    gap: 28px;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 20px;
  }

  .pill {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 200px;
    height: 90px;
    border-radius: 999px;
    border: none;
    cursor: pointer;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: 18px;
    transition: transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .pill::before {
    content: '';
    position: absolute;
    top: 8px; left: 20%; right: 20%;
    height: 30%;
    background: rgba(255,255,255,0.35);
    border-radius: 999px;
    pointer-events: none;
  }

  .pill:hover {
    transform: translateY(-5px);
  }

  .pill:active {
    transform: translateY(0px) scale(0.97);
  }

  .pill .pill-sub {
    font-size: 11px;
    font-weight: 500;
    opacity: 0.75;
  }

  /* Sage green */
  .pill-green {
    background: linear-gradient(160deg, #7ec8a0, #4aab78);
    color: white;
    box-shadow: 0 6px 0 #3a8a5e, 0 10px 24px rgba(74,171,120,0.3);
  }
  .pill-green:hover {
    box-shadow: 0 10px 0 #3a8a5e, 0 18px 36px rgba(74,171,120,0.4);
  }

  /* Warm coral */
  .pill-coral {
    background: linear-gradient(160deg, #f4a27a, #ee7a50);
    color: white;
    box-shadow: 0 6px 0 #c85e32, 0 10px 24px rgba(238,122,80,0.3);
  }
  .pill-coral:hover {
    box-shadow: 0 10px 0 #c85e32, 0 18px 36px rgba(238,122,80,0.4);
  }

  /* Soft blue */
  .pill-blue {
    background: linear-gradient(160deg, #7ab8f5, #4a90d9);
    color: white;
    box-shadow: 0 6px 0 #2e6aac, 0 10px 24px rgba(74,144,217,0.3);
  }
  .pill-blue:hover {
    box-shadow: 0 10px 0 #2e6aac, 0 18px 36px rgba(74,144,217,0.4);
  }

  /* Lavender */
  .pill-lavender {
    background: linear-gradient(160deg, #c4a8f0, #a07dd4);
    color: white;
    box-shadow: 0 6px 0 #7a52b0, 0 10px 24px rgba(160,125,212,0.3);
  }
  .pill-lavender:hover {
    box-shadow: 0 10px 0 #7a52b0, 0 18px 36px rgba(160,125,212,0.4);
  }

  /* bottom nav cards */
  .nav-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 12px;
  }

  .nav-card {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px 32px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    font-family: 'Nunito', sans-serif;
    font-size: 15px;
    font-weight: 700;
    transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s ease;
  }

  .nav-card:hover { transform: translateY(-3px); }
  .nav-card:active { transform: scale(0.97); }

  .nav-active {
    background: #4aab78;
    color: white;
    box-shadow: 0 5px 0 #3a8a5e, 0 8px 20px rgba(74,171,120,0.3);
  }
  .nav-active:hover {
    box-shadow: 0 8px 0 #3a8a5e, 0 14px 28px rgba(74,171,120,0.35);
  }

  .nav-inactive {
    background: #ede8f8;
    color: #9b88bb;
    box-shadow: 0 4px 0 #d4cce8, 0 6px 16px rgba(0,0,0,0.06);
  }
  .nav-inactive:hover {
    background: #e4dcf5;
    box-shadow: 0 6px 0 #c4bcd8, 0 10px 20px rgba(0,0,0,0.08);
  }

  .section-label {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #c0b0d8;
    margin-bottom: 14px;
    text-align: center;
  }

  .divider {
    width: 100%;
    max-width: 520px;
    border: none;
    border-top: 1px solid #e8e0f4;
    margin: 28px 0;
  }

  .footer {
    font-size: 12px;
    color: #c0b0d8;
    margin-top: 28px;
    font-weight: 500;
  }
`;

function Pill({ className, emoji, label, sub, onClick }) {
  return (
    <button className={`pill ${className}`} onClick={onClick}>
      <span>{emoji} {label}</span>
      {sub && <span className="pill-sub">{sub}</span>}
    </button>
  );
}

function NavCard({ className, emoji, label, onClick }) {
  return (
    <button className={`nav-card ${className}`} onClick={onClick}>
      {emoji} {label}
    </button>
  );
}

export default function App() {
  const [clicked, setClicked] = useState(null);
  const [activeNav, setActiveNav] = useState("שיקום");

  return (
    <>
      <style>{style}</style>
      <div className="page">

        <div className="header">
          <div className="header-emoji">🧠</div>
          <h1>בריאות נפש בישראל</h1>
          <p>בחרו את סוג השירות שאתם מחפשים</p>
        </div>

        <div className="section-label">כפתורי מסך פתיחה</div>
        <div className="buttons-row">
          <Pill className="pill-green"   emoji="♿" label="שיקום"  sub="סל שיקום בקהילה"        onClick={() => setClicked("שיקום")} />
          <Pill className="pill-coral"   emoji="🏥" label="טיפול"  sub='בתי"מ, אשפוז ומרפאות'  onClick={() => setClicked("טיפול")} />
        </div>

        <hr className="divider" />

        <div className="section-label">עוד שירותים</div>
        <div className="buttons-row">
          <Pill className="pill-blue"     emoji="💊" label="תרופות"  sub="מידע תרופתי"      onClick={() => setClicked("תרופות")} />
          <Pill className="pill-lavender" emoji="🤝" label="תמיכה"   sub="קהילה ומשפחה"    onClick={() => setClicked("תמיכה")} />
        </div>

        <hr className="divider" />

        <div className="section-label">ניווט תחתון</div>
        <div className="nav-row">
          {[
            { emoji: "♿", label: "שיקום" },
            { emoji: "🗺", label: "מפה" },
            { emoji: "🔍", label: "חיפוש" },
            { emoji: "👤", label: "פרופיל" },
          ].map(({ emoji, label }) => (
            <NavCard
              key={label}
              emoji={emoji}
              label={label}
              className={activeNav === label ? "nav-active" : "nav-inactive"}
              onClick={() => { setActiveNav(label); setClicked(label); }}
            />
          ))}
        </div>

        {clicked && (
          <div style={{
            marginTop: 24, padding: "10px 22px",
            background: "#ede8f8", borderRadius: 999,
            fontSize: 13, color: "#7a52b0", fontWeight: 600,
            animation: "none"
          }}>
            ✓ לחצת על: <strong>{clicked}</strong>
          </div>
        )}

        <p className="footer">בריאות נפש בישראל · שירותי שיקום בקהילה</p>
      </div>
    </>
  );
}
