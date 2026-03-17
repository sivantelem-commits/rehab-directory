export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const adminKey = req.headers['adminkey']
  if (adminKey !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { serviceName, serviceEmail, contactEmail } = req.body
  const toEmail = contactEmail || serviceEmail
  if (!toEmail) return res.status(400).json({ error: 'Missing email' })

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: toEmail,
        subject: `✅ הבקשה שלכם אושרה – מאגר שירותי סל שיקום`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1A3A5C; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px;">מאגר שירותי סל שיקום</h1>
            </div>
            <div style="background: white; padding: 32px; border: 1px solid #FFE8D6; border-radius: 0 0 12px 12px;">
              <div style="font-size: 48px; text-align: center; margin-bottom: 16px;">✅</div>
              <h2 style="color: #1A3A5C; text-align: center;">הבקשה אושרה!</h2>
              <p style="font-size: 16px; color: #334; line-height: 1.7;">
                שלום,<br/><br/>
                אנו שמחים לבשר כי השירות <strong>${serviceName}</strong> אושר ומופיע כעת במאגר שירותי סל השיקום.
              </p>
              <div style="background: #FFF8F3; border-right: 4px solid #F47B20; padding: 16px; border-radius: 8px; margin: 24px 0;">
                <p style="margin: 0; color: #F47B20; font-weight: bold;">מה הלאה?</p>
                <p style="margin: 8px 0 0; color: #555; font-size: 14px;">השירות שלכם גלוי כעת לכל המשתמשים במאגר. אנשים יוכלו למצוא אתכם ולצור קשר ישירות.</p>
              </div>
              <p style="font-size: 14px; color: #888; text-align: center; margin-top: 24px;">
                בברכה,<br/>צוות מאגר שירותי סל שיקום
              </p>
            </div>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return res.status(500).json({ error: err })
    }

    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
