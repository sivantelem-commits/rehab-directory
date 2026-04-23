// pages/api/verify-license.js
// אימות מספר רישיון פסיכולוג/ית מול מאגר משרד הבריאות ב-data.gov.il
// POST { license_number, profession }
// מחזיר { valid, name, profession, found }

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })

  const { license_number, profession } = req.body

  if (!license_number || !license_number.toString().trim())
    return res.status(400).json({ error: 'חסר מספר רישיון' })

  const licenseNum = license_number.toString().trim()

  try {
    // מאגר פסיכולוגים — data.gov.il
    // resource_id: dc7f4e4d-8c2a-4975-ad76-f1f28e576b44 (פסיכולוגים)
    // resource_id: עובדים סוציאליים — f972be48-47d1-4c72-8b7b-7a3b8d9e5e5e
    const RESOURCES = {
      'פסיכולוג/ית קלינית':     'dc7f4e4d-8c2a-4975-ad76-f1f28e576b44',
      'פסיכולוג/ית חינוכי/ת':   'dc7f4e4d-8c2a-4975-ad76-f1f28e576b44',
      'עובד/ת סוציאלי/ת':        'f972be48-47d1-4c72-8b7b-7a3b8d9e5e5e',
      'default':                 'dc7f4e4d-8c2a-4975-ad76-f1f28e576b44',
    }

    const resourceId = RESOURCES[profession] || RESOURCES['default']

    const url = `https://data.gov.il/api/3/action/datastore_search?` +
      `resource_id=${resourceId}&` +
      `q=${encodeURIComponent(licenseNum)}&` +
      `limit=5`

    const response = await fetch(url, {
      headers: { 'User-Agent': 'RehabDirectory/1.0' },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      // אם ה-API לא זמין — מחזיר "לא ניתן לאמת" במקום שגיאה
      return res.status(200).json({
        valid:      null,
        found:      false,
        message:    'לא ניתן לאמת כרגע — מאגר המשרד לא זמין. הרישיון יאומת ידנית.',
        manual:     true,
      })
    }

    const data = await response.json()

    if (!data.success || !data.result?.records?.length) {
      return res.status(200).json({
        valid:   false,
        found:   false,
        message: 'מספר הרישיון לא נמצא במאגר משרד הבריאות.',
        manual:  false,
      })
    }

    // מחפש התאמה מדויקת למספר הרישיון
    const records = data.result.records
    const exact = records.find(r =>
      String(r['מספר_רשיון'] || r['license_number'] || r['מספר_הרשיון'] || '').trim() === licenseNum
    )

    if (exact) {
      const name = exact['שם'] || exact['name'] || exact['שם_פרטי'] + ' ' + exact['שם_משפחה'] || ''
      return res.status(200).json({
        valid:    true,
        found:    true,
        name:     name.trim(),
        message:  `הרישיון תקף ✓${name ? ` — ${name.trim()}` : ''}`,
        manual:   false,
      })
    }

    // נמצא אבל לא התאמה מדויקת
    return res.status(200).json({
      valid:   false,
      found:   false,
      message: 'מספר הרישיון לא אומת — לא נמצאה התאמה מדויקת.',
      manual:  false,
    })

  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      return res.status(200).json({
        valid:   null,
        found:   false,
        message: 'הזמן הסתיים — מאגר המשרד לא הגיב. הרישיון יאומת ידנית.',
        manual:  true,
      })
    }
    console.error('License verification error:', err)
    return res.status(200).json({
      valid:   null,
      found:   false,
      message: 'שגיאה בבדיקת הרישיון. ניתן להמשיך — הרישיון יאומת ידנית.',
      manual:  true,
    })
  }
}
