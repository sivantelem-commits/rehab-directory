export default function ServiceModal({ service, onClose, typeColors }) {
  if (!service) return null
  const color = typeColors[service.type] || '#F47B20'

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 20, maxWidth: 520, width: '100%', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
      >
        <div style={{ height: 8, background: color }} />
        <div style={{ padding: '28px 32px' }}>
          <button onClick={onClose} style={{ float: 'left', background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>

          <h2 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800, color: '#1A3A5C' }}>{service.name}</h2>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ background: color + '20', color, borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>{service.type}</span>
            <span style={{ background: '#EEF2FF', color: '#1A3A5C', borderRadius: 20, padding: '4px 14px', fontSize: 13 }}>
              📍 {service.city}{service.district ? `, מחוז ${service.district}` : ''}
            </span>
          </div>

          {service.address && (
            <div style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>🏠 {service.address}</div>
          )}

          <p style={{ fontSize: 15, color: '#334', lineHeight: 1.75, marginBottom: 24 }}>
            {service.description || 'אין תיאור זמין.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {service.phone && (
              <a href={`tel:${service.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F47B20', color: 'white', borderRadius: 20, padding: '13px 24px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                📞 <span>התקשר: {service.phone}</span>
              </a>
            )}
            {service.email && (
              <a href={`mailto:${service.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#EEF2FF', color: '#1A3A5C', borderRadius: 20, padding: '13px 24px', fontSize: 15, fontWeight: 700, textDecoration: 'none', border: '1.5px solid #C5D0F0' }}>
                ✉️ <span>שלח מייל: {service.email}</span>
              </a>
            )}
            {service.website && (
              <a href={service.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FFF8F3', color: '#F47B20', borderRadius: 20, padding: '13px 24px', fontSize: 15, fontWeight: 700, textDecoration: 'none', border: '1.5px solid #FFD4B0' }}>
                🌐 <span>לאתר השירות</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
