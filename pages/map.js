import { useEffect, useState } from 'react'

const TYPE_COLORS = { 'שיקום תעסוקתי': '#F47B20', 'בית מאזן': '#1A3A5C', 'דיור מוגן': '#E85D9A' }

export default function MapPage() {
  const [services, setServices] = useState([])
  const [mounted, setMounted] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => setServices(Array.isArray(data) ? data.filter(s => s.lat && s.lng) : []))
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return

    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')

    const map = L.map('map').setView([31.5, 34.8], 8)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map)

    services.forEach(s => {
      const color = TYPE_COLORS[s.type] || '#F47B20'
      const icon = L.divIcon({
        html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        className: '',
        iconSize: [14, 14],
      })
      L.marker([s.lat, s.lng], { icon })
        .addTo(map)
        .bindPopup(`<div dir="rtl"><strong>${s.name}</strong><br/>${s.city}<br/><span style="color:${color}">${s.type}</span></div>`)
    })

    return () => map.remove()
  }, [mounted, services])

  if (!mounted) return null

  return (
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
          {[['/', 'שירותים'], ['/map', 'מפה'], ['/register', 'הרשמת שירות'], ['/admin', 'ניהול']].map(([href, label]) => (
            <a key={href} href={href} style={{ color: 'white', background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '7px 18px', fontWeight: 600, fontSize: 13, border: '1.5px solid rgba(255,255,255,0.25)', textDecoration: 'none' }}>{label}</a>
          ))}
        </nav>
      </header>

      <div style={{ background: 'linear-gradient(135deg, #1A3A5C, #2A5298)', color: 'white', padding: '28px 32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>🗺️ מפת שירותים</h1>
        <p style={{ fontSize: 14, opacity: 0.85, margin: 0 }}>{services.length} שירותים על המפה</p>
      </div>

      <div style={{ display: 'flex', gap: 16, padding: '16px 24px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
            <span>{type}</span>
          </div>
        ))}
      </div>

      <div id="map" style={{ height: 'calc(100vh - 280px)', width: '100%' }} />

      <footer style={{ background: '#1A3A5C', color: 'rgba(255,255,255,0.7)', textAlign: 'center', padding: '24px', fontSize: 13 }}>
        מאגר שירותי סל שיקום © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
