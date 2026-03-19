import { getCategoryColor } from '../lib/categories'
const TREATMENT_CATEGORIES = ['בתים מאזנים', 'מחלקות אשפוז', 'מרפאות יום', 'חדרי מיון', 'אשפוז בית', 'שירותים נוספים']
const TREATMENT_COLOR = '#0891B2'
export default function ServiceCard({ service }) {
  const isTreatment = TREATMENT_CATEGORIES.includes(service.category)
  const color = isTreatment ? TREATMENT_COLOR : getCategoryColor(service.category, service.subcategory)
  // קטגוריות נוספות — ללא כפילות עם הראשית
  const extraCats = (service.categories || []).filter(c => c && c !== service.category)
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '20px 22px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.07)', border: `1.5px solid ${isTreatment ? '#a0d8e8' : '#d4b0f0'}`, borderTop: `4px solid ${color}`, transition: 'transform 0.15s, box-shadow 0.15s', display: 'flex', flexDirection: 'column', height: '220px' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${isTreatment ? 'rgba(8,145,178,0.12)' : 'rgba(76,0,128,0.12)'}` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: '#1A3A5C', lineHeight: 1.3, flex: 1 }}>{service.name}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          <span style={{ background: color, color: 'white', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{service.category}</span>
          {service.subcategory && service.subcategory !== service.category && (
            <span style={{ background: `${color}22`, color, borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>{service.subcategory}</span>
          )}
          {extraCats.slice(0, 2).map(cat => {
            const catColor = getCategoryColor(cat)
            return (
              <span key={cat} style={{ background: `${catColor}22`, color: catColor, borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>+ {cat}</span>
            )
          })}
        </div>
      </div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        📍 {service.city}{service.district ? `, ${service.district}` : ''}
        {service.is_national && <span style={{ background: '#1A3A5C', color: 'white', borderRadius: 20, padding: '2px 8px', fontSize: 10, fontWeight: 700 }}>🌍 ארצי</span>}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {service.description && (
          <div style={{ fontSize: 13.5, color: '#445', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {service.description}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, fontSize: 13, color, flexWrap: 'wrap', marginTop: 12 }}>
        {service.phone && <span>📞 {service.phone}</span>}
        {service.email && <span>✉️ {service.email}</span>}
      </div>
    </div>
  )
}
