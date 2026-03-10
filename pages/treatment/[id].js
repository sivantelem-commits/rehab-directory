import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

const CATEGORIES = {
  'בתי"מ': { color: '#0277BD', icon: '🏠' },
  'מחלקות אשפוז': { color: '#7B2D8B', icon: '🏥' },
  'מרפאות יום': { color: '#2E7D32', icon: '☀️' },
  'חדרי מיון': { color: '#C62828', icon: '🚨' },
}

export default function TreatmentServicePage() {
  const router = useRouter()
  const { id } = router.query
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/api/treatment?id=${id}`)
      .then(r => r.json())
      .then(data => {
        const found = Array.isArray(data) ? data.find(s => s.id === id) : null
        setService(found || null)
        setLoading(false)
      })
  }, [id])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    const text = `${service.name} – שירות טיפולי ב${service.city}\n${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  if (!mounted) return null

  if (loading) return (
    <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#0277BD', fontSize: 18 }}>טוען...</div>
    </div>
  )

  if (!service) return (
    <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F0F7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <div style={{ fontSize: 18, color: '#0277BD', fontWeight: 700 }}>השירות לא נמצא</div>
      <button onClick={() => router.push('/treatment')} style={{ background: '#0277BD', color: 'white', border: 'none', borderRadius: 20, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>חזרה לרשימה</button>
    </div>
  )

  const cat = CATEGORIES[service.category] || { color: '#0277BD', icon: '🏥' }

  return (
    <>
      <Head>
        <title>{service.name} – {service.city} | בריאות נפש בישראל</title>
        <meta name="description" content={service.description || `${service.category} ב${service.city}`} />
      </Head>
      <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#F0F7FF' }}>
        <header style={{ background: '#0277BD', color: 'white', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🧠</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 19 }}>בריאות נפש בישראל</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>שירותי טיפול</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['/', '🏠 ראשי'], ['/rehab', '♿ שיקום'], ['/treatment', '🏥 טיפול']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '6px 12px', fontWeight: 600, fontSize: 12, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(135deg, #0277BD, #0288D1)', color: 'white', padding: '20px 16px' }}>
          <button onClick={() => router.push('/treatment')} style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 20, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            → חזרה לרשימה
          </button>
        </div>

        <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <div style={{ height: 8, background: cat.color }} />
            <div style={{ padding: '24px 20px' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ background: cat.color, color: 'white', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>{cat.icon} {service.category}</span>
              </div>

              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1A3A5C', margin: '0 0 8px' }}>{service.name}</h1>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>📍 {service.address || service.city}{service.district ? `, ${service.district}` : ''}</div>

              {service.description && (
                <div style={{ background: '#F0F7FF', borderRadius: 12, padding: '16px', marginBottom: 20, fontSize: 14, color: '#334', lineHeight: 1.7 }}>
                  {service.description}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {service.phone && (
                  <a href={`tel:${service.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F0FFF4', border: '1.5px solid #A5D6A7', borderRadius: 14, padding: '12px 14px', textDecoration: 'none', color: '#2E7D32' }}>
                    <span style={{ fontSize: 20 }}>📞</span>
                    <div>
                      <div style={{ fontSize: 10, opacity: 0.7 }}>טלפון</div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{service.phone}</div>
                    </div>
                  </a>
                )}
                {service.email && (
                  <a href={`mailto:${service.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#EEF2FF', border: '1.5px solid #C5D0F0', borderRadius: 14, padding: '12px 14px', textDecoration: 'none', color: '#1A3A5C' }}>
                    <span style={{ fontSize: 20 }}>✉️</span>
                    <div>
                      <div style={{ fontSize: 10, opacity: 0.7 }}>מייל</div>
                      <div style={{ fontWeight: 700, fontSize: 12, wordBreak: 'break-all' }}>{service.email}</div>
                    </div>
                  </a>
                )}
                {service.website && (
                  <a href={service.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F0F7FF', border: '1.5px solid #B3D4E8', borderRadius: 14, padding: '12px 14px', textDecoration: 'none', color: '#0277BD', gridColumn: 'span 2' }}>
                    <span style={{ fontSize: 20 }}>🌐</span>
                    <div>
                      <div style={{ fontSize: 10, opacity: 0.7 }}>אתר אינטרנט</div>
                      <div style={{ fontWeight: 700, fontSize: 12, wordBreak: 'break-all' }}>{service.website}</div>
                    </div>
                  </a>
                )}
              </div>

              {service.lat && <TreatmentMap service={service} color={cat.color} />}

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={shareWhatsApp} style={{ flex: 1, background: '#25D366', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  💬 וואטסאפ
                </button>
                <button onClick={copyLink} style={{ flex: 1, background: copied ? '#E8F5E9' : '#EEF2FF', color: copied ? '#2E7D32' : '#1A3A5C', border: `1.5px solid ${copied ? '#A5D6A7' : '#C5D0F0'}`, borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {copied ? '✓ הועתק!' : '🔗 קישור'}
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer style={{ background: '#0277BD', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
          בריאות נפש בישראל © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}

function TreatmentMap({ service, color }) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')
    const map = L.map('treatment-map').setView([service.lat, service.lng], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    const icon = L.divIcon({
      html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
      className: '', iconSize: [16, 16],
    })
    L.marker([service.lat, service.lng], { icon }).addTo(map)
    return () => map.remove()
  }, [])
  return <div id="treatment-map" style={{ height: 200, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }} />
}
