export async function sendSmsAlert(message: string): Promise<void> {
  const sid = (process.env.TWILIO_ACCOUNT_SID || '').trim()
  const token = (process.env.TWILIO_AUTH_TOKEN || '').trim()
  const from = (process.env.TWILIO_FROM_NUMBER || '').trim()
  const to = (process.env.ADMIN_PHONE || '').trim()

  if (!sid || !token || !from || !to) return

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`
  const body = new URLSearchParams({ From: from, To: to, Body: message })

  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })
}
