import { useState, useEffect, useRef } from 'react'
import { getCategoryColor } from '../lib/categories'

const TREATMENT_CATEGORIES = ['בתים מאזנים', 'מחלקות אשפוז', 'טיפול יום', 'מרפאות בריאות נפש', 'חדרי מיון', 'אשפוז בית', 'שירותים נוספים']
const TREATMENT_COLORS = {
  'בתים מאזנים': '#0A3040', 'מחלקות אשפוז': '#1565A8',
  'טיפול יום': '#0891B2', 'מרפאות בריאות נפש': '#0284C7',
  'חדרי מיון': '#06B6D4', 'אשפוז בית': '#0E7490', 'שירותים נוספים': '#0A6080',
}

function getColor(service, type) {
  if (type === 'treatment') return TREATMENT_COLORS[service.category] || '#0891B2'
  return getCategoryColor(service.category, service.subcategory)
}

function MiniMap({ service, color }) {
  const mapId = useRef(`modal-map-${service.id}-${Date.now()}`)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const L = require('leaflet')
    require('leaflet/dist/leaflet.css')
    const map = L.map(mapId.current).setView([service.lat, service.lng], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
    const icon = L.divIcon({
      html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
      className: '', iconSize: [16, 16],
    })
    L.marker([service.lat, service.lng], { icon }).addTo(map)
    return () => map.remove()
  }, [])
  return <div id={mapId.current} style={{ height: 180, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }} />
}

export default function ServiceDetailModal({ service, type, onClose }) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // נעל גלילה ברקע
    document.body.style.overflow = 'hidden'
    // סגירה ב-Escape
    const handleKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  const isRehab = type === 'rehab'
  const color = getColor(service, type)
  const bgLight = isRehab ? '#f7f0ff' : '#f0faff'
  const borderLight = isRehab ? '#d4b0f0' : '#a0d8e8'
  const serviceUrl = `/${isRehab ? 'service' : 'treatment'}/${service.id}`

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}${serviceUrl}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    const text = `${service.name} – שירות ${isRehab ? 'שיקום' : 'טיפול'} ב${service.city}\n${window.location.origin}${serviceUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  const extraCats = (service.categories || []).filter(c => c && c !== service.category)
  const tags = [...(service.age_groups || []), ...(service.diagnoses || []), ...(service.populations || [])]

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={service.name}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(26,30,60,0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 20,
          maxWidth: 560,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          position: 'relative',
          direction: 'rtl',
        }}
      >
        {/* פס צבע עליון */}
        <div style={{ height: 7, background: color, borderRadius: '20px 20px 0 0', flexShrink: 0 }} />

        <div style={{ padding: '20px 20px 24px' }}>

          {/* כותרת + סגירה */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 }}>
            <div style={{ flex: 1 }}>
              {/* תגיות קטגוריה */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                <span style={{ background: color, color: 'white', borderRadius: '999px', padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>
                  {service.category}
                </span>
                {service.subcategory && service.subcategory !== service.category && (
                  <span style={{ background: `${color}22`, color, borderRadius: '999px', padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                    {service.subcategory}
                  </span>
                )}
                {extraCats.map(c => (
                  <span key={c} style={{ background: `${color}15`, color, borderRadius: '999px', padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                    + {c}
                  </span>
                ))}
                {service.is_national && (
                  <span style={{ background: '#EEF2FF', color: '#1A3A5C', borderRadius: '999px', padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                    🌍 פריסה ארצית
                  </span>
                )}
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1A3A5C', lineHeight: 1.3 }}>
                {service.name}
              </h2>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                📍 {service.address || service.city}{service.district ? `, ${service.district}` : ''}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="סגור"
              style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 32, height: 32, fontSize: 16, cursor: 'pointer', color: '#666', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </div>

          {/* תיאור */}
          {service.description && (
            <div style={{ background: bgLight, borderRadius: 12, padding: '14px 16px', marginBottom: 16, fontSize: 14, color: '#334', lineHeight: 1.7 }}>
              {service.description}
            </div>
          )}

          {/* פרטי קשר */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {service.phone && (
              <a href={`tel:${service.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F0FFF4', border: '1.5px solid #A5D6A7', borderRadius: 12, padding: '10px 12px', textDecoration: 'none', color: '#2E7D32' }}>
                <span style={{ fontSize: 18 }}>📞</span>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>טלפון</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{service.phone}</div>
                </div>
              </a>
            )}
            {service.phone && (
              <a href={`https://wa.me/972${service.phone.replace(/^0/, '').replace(/-/g, '')}`} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#E8F5E9', border: '1.5px solid #A5D6A7', borderRadius: 12, padding: '10px 12px', textDecoration: 'none', color: '#2E7D32' }}>
                <span style={{ fontSize: 18 }}>💬</span>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>וואטסאפ</div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>שלחו הודעה</div>
                </div>
              </a>
            )}
            {service.email && (
              <a href={`mailto:${service.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: bgLight, border: `1.5px solid ${borderLight}`, borderRadius: 12, padding: '10px 12px', textDecoration: 'none', color: isRehab ? '#4C0080' : '#0A6080' }}>
                <span style={{ fontSize: 18 }}>✉️</span>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>מייל</div>
                  <div style={{ fontWeight: 700, fontSize: 12, wordBreak: 'break-all' }}>{service.email}</div>
                </div>
              </a>
            )}
            {service.website && (
              <a href={service.website} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: bgLight, border: `1.5px solid ${borderLight}`, borderRadius: 12, padding: '10px 12px', textDecoration: 'none', color: isRehab ? '#4C0080' : '#0A6080', gridColumn: service.email ? 'auto' : 'span 2' }}>
                <span style={{ fontSize: 18 }}>🌐</span>
                <div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>אתר אינטרנט</div>
                  <div style={{ fontWeight: 700, fontSize: 12, wordBreak: 'break-all' }}>{service.website.replace(/^https?:\/\//, '')}</div>
                </div>
              </a>
            )}
          </div>

          {/* תגיות (גיל, אבחנות, אוכלוסייה) */}
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {tags.map(tag => (
                <span key={tag} style={{ background: '#f5f5f5', color: '#555', borderRadius: '999px', padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* מיני-מפה */}
          {mounted && service.lat && service.lng && (
            <MiniMap service={service} color={color} />
          )}

          {/* כפתורי שיתוף */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <button onClick={shareWhatsApp} style={{ flex: 1, background: '#25D366', color: 'white', border: 'none', borderRadius: '999px', padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
              💬 שתפו
            </button>
            <button onClick={copyLink} style={{ flex: 1, background: bgLight, color: isRehab ? '#4C0080' : '#0A6080', border: `1.5px solid ${borderLight}`, borderRadius: '999px', padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: "'Nunito', sans-serif" }}>
              {copied ? '✓ הועתק!' : '🔗 קישור'}
            </button>
            <a href={serviceUrl} style={{ flex: 1, background: color, color: 'white', borderRadius: '999px', padding: '11px 0', fontWeight: 700, fontSize: 14, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              דף מלא ←
            </a>
          </div>

          {/* אזהרה */}
          <div style={{ background: '#FFF8F0', border: '1.5px solid #FFD0A0', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#7A4500', lineHeight: 1.6 }}>
            <strong>שימו לב:</strong> המידע מסופק על ידי השירותים עצמם. במצב חירום — <strong>1201</strong> או <strong>101</strong>.
          </div>

        </div>
      </div>
    </div>
  )
}
