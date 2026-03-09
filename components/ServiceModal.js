export default function ServiceModal({ service, onClose, getCategoryColor }) {
  const color = getCategoryColor(service.category, service.subcategory)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,58,92,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 20, maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
        <div style={{ height: 7, background: color, borderRadius: '20px 20px 0 0' }} />
        <div style={{ padding: '28px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#1A3A5C' }}>{service.name}</h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ background: color, color: 'white', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700 }}>{service.category}</span>
                {service.subcategory && service.subcategory !== service.category && (
                  <span style={{ background: `${color}22`, color, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{service.subcategory}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa', marginRight: 8 }}>✕</button>
          </div>

          <div style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>📍 {service.city}{service.district ? `, ${service.district}` : ''}</div>

          {service.description && (
            <div style={{ fontSize: 14.5, color: '#334', lineHeight: 1.7, marginBottom: 20, background: '#FFF8F3', borderRadius: 12, padding: '14px 16px' }}>
              {service.description}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {service.phone && (
              <a href={`tel:${service.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FFF8F3', borderRadius: 12, textDecoration: 'none', color: '#1A3A5C', fontWeight: 600, fontSize: 14 }}>
                <span style={{ fontSize: 20 }}>📞</span> {service.phone}
              </a>
            )}
            {service.phone && (
              <a href={`https://wa.me/972${service.phone.replace(/^0/, '').replace(/-/g, '')}`} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#E8F5E9', borderRadius: 12, textDecoration: 'none', color: '#2E7D32', fontWeight: 600, fontSize: 14 }}>
                <span style={{ fontSize: 20 }}>💬</span> WhatsApp
              </a>
            )}
            {service.email && (
              <a href={`mailto:${service.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FFF8F3', borderRadius: 12, textDecoration: 'none', color: '#1A3A5C', fontWeight: 600, fontSize: 14 }}>
                <span style={{ fontSize: 20 }}>✉️</span> {service.email}
              </a>
            )}
            {service.website && (
              <a href={service.website} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FFF8F3', borderRadius: 12, textDecoration: 'none', color: '#1A3A5C', fontWeight: 600, fontSize: 14 }}>
                <span style={{ fontSize: 20 }}>🌐</span> אתר אינטרנט
              </a>
            )}
            {service.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#FFF8F3', borderRadius: 12, color: '#1A3A5C', fontSize: 14 }}>
                <span style={{ fontSize: 20 }}>🏠</span> {service.address}
              </div>
            )}
          </div>

          <button onClick={() => {
            const text = `${service.name}\n📍 ${service.city}\n📞 ${service.phone || ''}\n🌐 ${service.website || ''}`
            const url = `https://wa.me/?text=${encodeURIComponent(text)}`
            window.open(url, '_blank')
          }} style={{ marginTop: 20, width: '100%', background: color, color: 'white', border: 'none', borderRadius: 20, padding: '12px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            שתפו שירות זה 📤
          </button>
        </div>
      </div>
    </div>
  )
}
