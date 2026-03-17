export default async function handler(req, res) {
  const adminKey = req.headers['adminkey']
  if (adminKey !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Unauthorized' })
  if (req.method !== 'POST') return res.status(405).end()

  const { serviceEmail, serviceName, reason } = req.body
  if (!serviceEmail) return res.status(400).json({ error: 'Missing email' })

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.RESEND_API_KEY}` },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: serviceEmail,
        subject: `עדכון בנוגע לבקשתך – ${serviceName}`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1A3A5C; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 20px;">בריאות נפש בישראל</h1>
            </div>
            <div style="background: white; padding: 32px; border: 1px solid #e0e0e0; border-radius: 0 0 12px 12px;">
              <p style="font-size: 15px; color: #333;">שלום,</p>
              <p style="font-size: 14px; color: #333; line-height: 1.7;">
                בקשת הרישום של <strong>${serviceName}</strong> נבדקה על ידי צוות האתר.
              </p>
              ${reason ? `
              <div style="background: #FFF8F3; border-right: 4px solid #F47B20; padding: 14px 16px; border-radius: 8px; margin: 16px 0; font-size: 14px; color: #555; line-height: 1.6;">
                ${reason}
              </div>` : ''}
              <p style="font-size: 14px; color: #333; line-height: 1.7;">
                לשאלות ובירורים ניתן לפנות אלינו דרך <a href="https://rehabdirectoryil.vercel.app/contact" style="color: #8B00D4;">דף יצירת קשר</a>.
              </p>
              <p style="font-size: 13px; color: #888; margin-top: 24px;">צוות בריאות נפש בישראל</p>
            </div>
          </div>
        `,
      }),
    })
    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
