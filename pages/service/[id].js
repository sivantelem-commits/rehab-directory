import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { getCategoryColor } from '../../lib/categories'

const NAV = [['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול'], ['/map', '🗺️ מפה'], ['/register', 'הוספת שירות'], ['/about', 'אודות'], ['/contact', '✉️ צור קשר'], ['/admin', 'ניהול']]
const BASE_URL = 'https://rehabdirectoryil.vercel.app'

export default function ServicePage() {
  const router = useRouter()
  const { id } = router.query
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [backUrl, setBackUrl] = useState('/rehab')

  useEffect(() => {
    // שמור את הדף הקודם כדי לחזור אליו עם הפילטרים
    if (document.referrer && document.referrer.includes(window.location.host)) {
      setBackUrl(document.referrer.replace(window.location.origin, ''))
    } else if (window.history.length > 1) {
      setBackUrl(null) // יחזיר אחורה
    }
  }, [])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/services?id=${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) { setLoading(false); return }
        setService(Array.isArray(data) ? data.find(s => s.id === id) : (data?.id ? data : null))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    const text = `${service.name} – שירות שיקום ב${service.city}\n${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  const reportError = () => {
    router.push(`/contact?type=fix&serviceName=${encodeURIComponent(service.name)}`)
  }

  if (!mounted) return null

  if (loading) return (
    <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f7f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#8B00D4', fontSize: 18, fontWeight: 700 }}>טוען...</div>
    </div>
  )

  if (!service) return (
    <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f7f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <div style={{ fontSize: 18, color: '#8B00D4', fontWeight: 700 }}>השירות לא נמצא</div>
      <button onClick={() => router.push('/rehab')} style={{ background: 'linear-gradient(160deg, #8B00D4, #4C0080)', color: 'white', border: 'none', borderRadius: '999px', padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Nunito', sans-serif", boxShadow: '0 4px 0 #2E0060' }}>חזרה לרשימה</button>
    </div>
  )

  const color = getCategoryColor(service.category, service.subcategory)
  const pageUrl = `${BASE_URL}/service/${id}`
  const pageDesc = service.description
    ? service.description.slice(0, 155)
    : `${service.category}${service.subcategory ? ` – ${service.subcategory}` : ''} ב${service.city}. שירות שיקום בקהילה.`

  return (
    <>
      <Head>
        <title>{service.name} – {service.city} | בריאות נפש בישראל</title>
        <meta name="description" content={pageDesc} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "LocalBusiness",
              "name": service.name,
              "description": service.description || undefined,
              "address": {
                "@type": "PostalAddress",
                "addressLocality": service.city,
                "addressRegion": service.district || undefined,
                "addressCountry": "IL"
              },
              "telephone": service.phone || undefined,
              "email": service.email || undefined,
              "url": service.website || pageUrl,
            },
            {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "בריאות נפש בישראל", "item": "https://rehabdirectoryil.vercel.app" },
                { "@type": "ListItem", "position": 2, "name": "שירותי שיקום", "item": "https://rehabdirectoryil.vercel.app/rehab" },
                { "@type": "ListItem", "position": 3, "name": service.name, "item": pageUrl },
              ]
            }
          ]
        }) }} />
        <meta property="og:title" content={`${service.name} – ${service.city} | בריאות נפש בישראל`} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:locale" content="he_IL" />
        <meta property="og:site_name" content="בריאות נפש בישראל" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div dir="rtl" style={{ fontFamily: "'Nunito', sans-serif", minHeight: '100vh', background: '#f7f0ff' }}>

        <header style={{
          background: 'linear-gradient(135deg, #2E0060, #8B00D4)',
          color: 'white', padding: '10px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 2px 12px rgba(76,0,128,0.2)', flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/logo.png" alt="לוגו" style={{ width: 44, height: 44, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>שירותי שיקום בקהילה</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {NAV.map(([href, label]) => (
              <a key={href} href={href} style={{
                color: 'white', background: 'rgba(255,255,255,0.1)',
                borderRadius: '999px', padding: '6px 14px', fontWeight: 600, fontSize: 12,
                border: '1.5px solid rgba(255,255,255,0.2)', textDecoration: 'none',
              }}>{label}</a>
            ))}
          </nav>
        </header>

        {/* breadcrumb + חזרה */}
        <div style={{ background: 'linear-gradient(160deg, #4C0080, #8B00D4)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => backUrl ? router.push(backUrl) : router.back()} style={{
            background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)',
            color: 'white', borderRadius: '999px', padding: '6px 14px',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            fontFamily: "'Nunito', sans-serif",
          }}>← חזרה לרשימה</button>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>←</span>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{service.name}</span>
        </div>

        <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(76,0,128,0.1)', border: '1.5px solid #d4b0f0' }}>
            <div style={{ height: 8, background: color }} />
            <div style={{ padding: '24px 20px' }}>

              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ background: color, color: 'white', borderRadius: '999px', padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>{service.category}</span>
                {service.subcategory && <span style={{ background: `${color}22`, color, borderRadius: '999px', padding: '4px 14px', fontSize: 13, fontWeight: 600 }}>{service.subcategory}</span>}
                {service.is_national && <span style={{ background: '#EEF2FF', color: '#1A3A5C', borderRadius: '999px', padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>🌍 פריסה ארצית</span>}
              </div>

              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#4C0080', margin: '0 0 8px' }}>{service.name}</h1>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>📍 {service.address || service.city}{service.district ? `, ${service.district}` : ''}</div>

              {service.description && (
                <div style={{ background: '#f7f0ff', borderRadius: 12, padding: '16px', marginBottom: 20, fontSize: 14, color: '#334', lineHeight: 1.7 }}>
                  {service.description}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {service.phone && (
                  <a href={`tel:${service.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F0FFF4', border: '1.5px solid #A5D6A7', borderRadius: 14, padding: '12px 14px', textDecoration: 'none', color: '#2E7D32' }}>
                    <span style={{ fontSize: 20 }}>📞</span>
                    <div><div style={{ fontSize: 10, opacity: 0.7 }}>טלפון</div><div style={{ fontWeight: 700, fontSize: 13 }}>{service.phone}</div></div>
                  </a>
                )}
                {service.email && (
                  <a href={`mailto:${service.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f7f0ff', border: '1.5px solid #d4b0f0', borderRadius: 14, padding: '12px 14px', textDecoration: 'none', color: '#4C0080' }}>
                    <span style={{ fontSize: 20 }}>✉️</span>
                    <div><div style={{ fontSize: 10, opacity: 0.7 }}>מייל</div><div style={{ fontWeight: 700, fontSize: 12, wordBreak: 'break-all' }}>{service.email}</div></div>
                  </a>
                )}
                {service.website && (
                  <a href={service.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f7f0ff', border: '1.5px solid #d4b0f0', borderRadius: 14, padding: '12px 14px', textDecoration: 'none', color: '#4C0080', gridColumn: 'span 2' }}>
                    <span style={{ fontSize: 20 }}>🌐</span>
                    <div><div style={{ fontSize: 10, opacity: 0.7 }}>אתר אינטרנט</div><div style={{ fontWeight: 700, fontSize: 12, wordBreak: 'break-all' }}>{service.website}</div></div>
                  </a>
                )}
              </div>

              {service.lat && <RehabMap service={service} color={color} />}

              {/* כפתורי שיתוף */}
              <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                <button onClick={shareWhatsApp} style={{ flex: 1, background: '#25D366', color: 'white', border: 'none', borderRadius: '999px', padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>💬 וואטסאפ</button>
                <button onClick={copyLink} style={{ flex: 1, background: '#f7f0ff', color: '#4C0080', border: '1.5px solid #d4b0f0', borderRadius: '999px', padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
                  {copied ? '✓ הועתק!' : '🔗 קישור'}
                </button>
              </div>

              {/* דווח על שגיאה */}
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <button onClick={reportError} style={{
                  background: 'none', border: 'none', color: '#aaa', fontSize: 12,
                  cursor: 'pointer', fontFamily: "'Nunito', sans-serif", textDecoration: 'underline',
                }}>
                  ⚠️ דווח על שגיאה או מידע לא עדכני
                </button>
              </div>

            </div>
          </div>
        </main>

        <footer style={{
          background: 'linear-gradient(135deg, #2E0060, #4C0080)',
          color: 'rgba(255,255,255,0.75)', textAlign: 'center',
          padding: '24px', fontSize: 13, marginTop: 48, fontWeight: 500,
        }}>
          <div style={{ marginBottom: 8 }}>
            <a href="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>✉️ צור קשר</a>
          </div>
          בריאות נפש בישראל © 2026
        </footer>
      </div>
    </>
  )
}

function RehabMap({ service, color }) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')
    const map = L.map('rehab-map').setView([service.lat, service.lng], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    const icon = L.divIcon({
      html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
      className: '', iconSize: [16, 16],
    })
    L.marker([service.lat, service.lng], { icon }).addTo(map)
    return () => map.remove()
  }, [])
  return <div id="rehab-map" style={{ height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }} />
}
