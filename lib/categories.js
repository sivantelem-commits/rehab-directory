export const CATEGORIES = {
  'דיור': {
    color: '#7B2D8B',
    subcategories: ['הוסטל', 'קהילה תומכת', 'דיור מוגן'],
    shades: ['#7B2D8B', '#9C4DB0', '#BE8FCC']
  },
  'תעסוקה': {
    color: '#F47B20',
    subcategories: ['תעסוקה נתמכת', 'מפעל מוגן', 'מועדון תעסוקתי'],
    shades: ['#F47B20', '#F6953F', '#F9B87A']
  },
  'השכלה': {
    color: '#1A3A5C',
    subcategories: ['השלמת בגרויות', 'מכינות', 'לימודי תעודה', 'השכלה גבוהה'],
    shades: ['#1A3A5C', '#2A5A8C', '#5B8AB8']
  },
  'חברה ופנאי': {
    color: '#2E7D32',
    subcategories: ['מועדון חברתי', 'חונכות'],
    shades: ['#2E7D32', '#4CAF50', '#81C784']
  },
  'ליווי ותמיכה': {
    color: '#0277BD',
    subcategories: ['סומכות שיקומית', 'תיאום טיפול'],
    shades: ['#0277BD', '#0288D1', '#4FC3F7']
  },
  'טיפולי שיניים': {
    color: '#C2185B',
    subcategories: ['טיפולי שיניים'],
    shades: ['#C2185B', '#E91E8C', '#F48FB1']
  },
  'שירותים נוספים': {
    color: '#546E7A',
    subcategories: ['ייעוץ למשפחות', 'סיוע ברכישת ציוד ראשוני'],
    shades: ['#546E7A', '#78909C', '#B0BEC5']
  },
}

export const CATEGORY_NAMES = Object.keys(CATEGORIES)
export const ALL_SUBCATEGORIES = Object.values(CATEGORIES).flatMap(c => c.subcategories)

export function getCategoryColor(category, subcategory) {
  const cat = CATEGORIES[category]
  if (!cat) return '#F47B20'
  if (!subcategory) return cat.color
  const idx = cat.subcategories.indexOf(subcategory)
  return cat.shades[idx] || cat.color
}
