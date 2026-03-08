export default function ServiceCard({ service, typeColors, onClick }) {
  const color = typeColors[service.type] || '#F47B20'

  return (
    <div
      onClick={() => onClick(service)}
      style={{
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform .2s, box-shadow .2s',
        border: '1.5px solid #FFE8D6',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(244,123,32,0.18)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ height: 7, background: color }} />
      <div style={{ padding: '18px 20px 16px' }}>
        <h3 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 700, color: '#1A3A5C', lineHeight: 1.3 }}>
          {service.name}
        </h3>
        <div style={{ display: 'flex', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ background: color + '20', color, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>
            {service.type}
          </span>
          <span style={{ background: '#EEF2FF', color: '#1A3A5C', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 500 }}>
            📍 {service.city}{service.district ? `, ${service.district}` : ''}
          </span>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: 13.5, color: '#556', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {service.description || 'אין תיאור'}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          {service.phone && (
            <a href={`tel:${service.phone}`} onClick={e => e.stopPropagation()}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#F47B20', color: 'white', borderRadius: 20, padding: '9px 0', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              📞 {service.phone}
            </a>
          )}
          {service.email && (
            <a href={`mailto:${service.email}`} onClick={e => e.stopPropagation()}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#EEF2FF', color: '#1A3A5C', borderRadius: 20, padding: '9px 0', fontSize: 13, fontWeight: 700, textDecoration: 'none', border: '1.5px solid #C5D0F0' }}>
              ✉️ מייל
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
