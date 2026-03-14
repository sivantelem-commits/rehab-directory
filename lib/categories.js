export const CATEGORIES = {
  'דיור': {
    color: '#2E0060',
    subcategories: ['הוסטל', 'קהילה תומכת', 'דיור מוגן'],
    shades: ['#2E0060', '#4A0090', '#6B00BB']
  },
  'תעסוקה': {
    color: '#6A0099',
    subcategories: ['תעסוקה נתמכת', 'מפעל מוגן', 'מועדון תעסוקתי', 'התנדבות לצבא', 'שירות לאומי מותאם'],
    shades: ['#6A0099', '#8500C0', '#9B00CC', '#7800BB', '#A020D0']
  },
  'השכלה': {
    color: '#9B00CC',
    subcategories: ['השלמת בגרויות', 'מכינות', 'לימודי תעודה', 'השכלה גבוהה'],
    shades: ['#9B00CC', '#B020E0', '#C040F0', '#D060FF']
  },
  'חברה ופנאי': {
    color: '#5E35B1',
    subcategories: ['מועדון חברתי', 'חונכות'],
    shades: ['#5E35B1', '#7C4DCC']
  },
  'ליווי ותמיכה': {
    color: '#CE66F0',
    subcategories: ['סומכות שיקומית', 'תיאום טיפול'],
    shades: ['#CE66F0', '#D880F8']
  },
  'טיפולי שיניים': {
    color: '#7800BB',
    subcategories: ['טיפולי שיניים'],
    shades: ['#7800BB']
  },
  'שירותים נוספים': {
    color: '#E099F8',
    subcategories: ['ייעוץ למשפחות', 'סיוע ברכישת ציוד ראשוני'],
    shades: ['#E099F8', '#EAB0FF']
  },
}

export const CATEGORY_NAMES = Object.keys(CATEGORIES)
export const ALL_SUBCATEGORIES = Object.values(CATEGORIES).flatMap(c => c.subcategories)

export function getCategoryColor(category, subcategory) {
  const cat = CATEGORIES[category]
  if (!cat) return '#6A0099'
  if (!subcategory) return cat.color
  const idx = cat.subcategories.indexOf(subcategory)
  return cat.shades[idx] || cat.color
}
