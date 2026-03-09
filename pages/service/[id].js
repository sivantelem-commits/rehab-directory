import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { getCategoryColor } from '../../lib/categories'

export default function ServicePage() {
  const router = useRouter()
  const { id } = router.query
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!id) return
    fetch('/api/services')
      .then(r => r.json())
      .then(data => {
        const found = data.find(s => s.id === id)
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
    const text = `${service.name} – שירות סל שיקום ב${service.city}\n${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  if (!mounted) return null

  if (loading) return (
    <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#FFF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#F47B20', fontSize: 18 }}>טוען...</div>
    </div>
  )

  if (!service) return (
    <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#FFF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <div style={{ fontSize: 18, color: '#1A3A5C', fontWeight: 700 }}>השירות לא נמצא</div>
      <button onClick={() => router.push('/')} style={{ background: '#F47B20', color: 'white', border: 'none', borderRadius: 20, padding: '10px 24px', fontWeight: 700, cursor: 'pointer' }}>חזרה לרשימה</button>
    </div>
  )

  const color = getCategoryColor(service.category, service.subcategory)
  const title = `${service.name} – ${service.city} | סל שיקום`
  const description = service.description || `${service.category} ב${service.city}, ${service.district}`
  const url = `https://rehabdirectoryil.vercel.app/service/${id}`

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
      </Head>
      <div dir="rtl" style={{ fontFamily: 'Arial, sans-serif', minHeight: '100vh', background: '#FFF8F3' }}>
        <header style={{ background: '#1A3A5C', color: 'white', padding: '0 32px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F47B20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: 'white' }}>♿</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 19 }}>סל שיקום</div>
              <div style={{ fontSize: 11, opacity: 0.75 }}>מאגר שירותי שיקום בקהילה</div>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: 8 }}>
            {[['/', 'שירותים'], ['/map', '🗺️ מפה'], ['/register', 'הרשמת שירות'], ['/admin', 'ניהול']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '7px 18px', fontWeight: 600, fontSize: 13, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
            ))}
          </nav>
        </header>

        <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '32px' }}>
          <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 20, padding: '8px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            → חזרה לרשימה
          </button>
        </div>

        <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
            <div style={{ height: 8, background: color }} />
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <span style={{ background: color, color: 'white', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>{service.category}</span>
                {service.subcategory && <span style={{ background: `${color}22`, color, borderRadius: 20, padding: '4px 12px', fontSize: 13 }}>{service.subcategory}</span>}
              </div>

              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A3A5C', margin: '0 0 8px' }}>{service.name}</h1>
              <div style={{ fontSize: 15, color: '#888', marginBottom: 24 }}>📍 {service.address || service.city}, {service.district}</div>

              {service.description && (
                <div style={{ background: '#FFF8F3', borderRadius: 12, padding: '20px', marginBottom: 24, fontSize: 15, color: '#334', lineHeight: 1.7 }}>
                  {service.description}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                {service.phone && (
                  <a href={`tel:${service.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F0FFF4', border: '1.5px solid #A5D6A7', borderRadius: 14, padding: '14px 18px', textDecoration: 'none', color: '#2E7D32' }}>
                    <span style={{ fontSize: 22 }}>📞</span>
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>טלפון</div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{service.phone}</div>
                    </div>
                  </a>
                )}
                {service.email && (
                  <a href={`mailto:${service.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#EEF2FF', border: '1.5px solid #C5D0F0', borderRadius: 14, padding: '14px 18px', textDecoration: 'none', color: '#1A3A5C' }}>
                    <span style={{ fontSize: 22 }}>✉️</span>
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>מייל</div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{service.email}</div>
                    </div>
                  </a>
                )}
                {service.website && (
                  <a href={service.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFF8F3', border: '1.5px solid #FFD4B0', borderRadius: 14, padding: '14px 18px', textDecoration: 'none', color: '#F47B20', gridColumn: service.phone && service.email ? 'span 2' : 'span 1' }}>
                    <span style={{ fontSize: 22 }}>🌐</span>
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.7 }}>אתר אינטרנט</div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{service.website}</div>
                    </div>
                  </a>
                )}
              </div>

              {service.lat && <ServiceMap service={service} color={color} />}

              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button onClick={shareWhatsApp} style={{ flex: 1, background: '#25D366', color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  💬 שתפי בוואטסאפ
                </button>
                <button onClick={copyLink} style={{ flex: 1, background: copied ? '#E8F5E9' : '#EEF2FF', color: copied ? '#2E7D32' : '#1A3A5C', border: `1.5px solid ${copied ? '#A5D6A7' : '#C5D0F0'}`, borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  {copied ? '✓ הקישור הועתק!' : '🔗 העתקי קישור'}
                </button>
              </div>
            </div>
          </div>
        </main>

        <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13, marginTop: 48 }}>
          מאגר שירותי סל שיקום © {new Date().getFullYear()}
        </footer>
      </div>
    </>
  )
}

function ServiceMap({ service, color }) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')
    const map = L.map('service-map').setView([service.lat, service.lng], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    const icon = L.divIcon({
      html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
      className: '', iconSize: [16, 16],
    })
    L.marker([service.lat, service.lng], { icon }).addTo(map)
    return () => map.remove()
  }, [])
  return <div id="service-map" style={{ height: 220, borderRadius: 12, overflow: 'hidden', marginBottom: 24 }} />
}
