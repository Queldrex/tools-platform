import { NextRequest } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

// Update these dates whenever you update a legal page
const LEGAL_DOCS = [
  { name: 'Privacy Policy', url: 'https://queldrex.com/privacy', lastUpdated: '2026-06-17' },
  { name: 'Terms of Service', url: 'https://queldrex.com/terms', lastUpdated: '2026-06-17' },
  { name: 'Refund Policy', url: 'https://queldrex.com/refunds', lastUpdated: '2026-06-19' },
]

const REVIEW_INTERVAL_DAYS = 180
const WARNING_DAYS_BEFORE = 20  // send reminder 20 days before review is due

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export async function GET(request: NextRequest) {
  // Verify cron secret — fails closed if neither secret is configured
  const cronSecret = (process.env.CRON_SECRET || '').trim()
  const adminSecret = (process.env.ADMIN_SECRET || '').trim()
  const validSecret = cronSecret || adminSecret
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
  if (!validSecret || token !== validSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dueItems = LEGAL_DOCS.filter(doc => {
    const age = daysSince(doc.lastUpdated)
    return age >= (REVIEW_INTERVAL_DAYS - WARNING_DAYS_BEFORE)
  })

  if (dueItems.length === 0) {
    return Response.json({ ok: true, message: 'No legal reviews due — all pages are current.' })
  }

  // Check if we already sent a reminder recently (within 25 days)
  // Use a lightweight check: store last-sent date in a Vercel env or just allow monthly emails when due
  // Since this cron runs monthly and only fires when docs are near/past due, monthly reminders are fine

  const adminEmail = process.env.ADMIN_EMAIL || 'hello@queldrex.com'
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return Response.json({ ok: false, error: 'No RESEND_API_KEY configured' }, { status: 500 })
  }

  const resend = new Resend(resendKey.replace(/^\uFEFF/, '').trim())

  const rows = dueItems.map(doc => {
    const age = daysSince(doc.lastUpdated)
    const daysLeft = REVIEW_INTERVAL_DAYS - age
    const status = daysLeft <= 0 ? 'OVERDUE' : `due in ${daysLeft} days`
    return `<tr>
      <td style="padding:10px 16px;border-bottom:1px solid #222;">${doc.name}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #222;color:#aaa;">${formatDate(doc.lastUpdated)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #222;color:#aaa;">${addDays(doc.lastUpdated, REVIEW_INTERVAL_DAYS)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #222;color:${daysLeft <= 0 ? '#f87171' : '#fbbf24'};font-weight:600;">${status}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #222;"><a href="${doc.url}" style="color:#22d3ee;text-decoration:none;">View →</a></td>
    </tr>`
  }).join('')

  await resend.emails.send({
    from: 'Queldrex <hello@queldrex.com>',
    to: adminEmail,
    subject: `Legal Review Due — ${dueItems.map(d => d.name).join(', ')}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0a0a0a;color:#fff;font-family:system-ui,sans-serif;padding:40px 24px;max-width:640px;margin:0 auto;">
  <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">Legal Compliance Reminder</h1>
  <p style="color:#aaa;font-size:14px;margin:0 0 28px;">One or more Queldrex legal pages are due for review. Review them every 6 months to stay compliant.</p>

  <table style="width:100%;border-collapse:collapse;background:#111;border:1px solid #222;border-radius:8px;overflow:hidden;font-size:13px;">
    <thead>
      <tr style="border-bottom:1px solid #333;">
        <th style="padding:10px 16px;text-align:left;color:#666;">Document</th>
        <th style="padding:10px 16px;text-align:left;color:#666;">Last Updated</th>
        <th style="padding:10px 16px;text-align:left;color:#666;">Next Review</th>
        <th style="padding:10px 16px;text-align:left;color:#666;">Status</th>
        <th style="padding:10px 16px;text-align:left;color:#666;">Link</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div style="margin-top:28px;padding:20px;background:#111;border:1px solid #222;border-radius:8px;">
    <p style="font-size:13px;font-weight:700;margin:0 0 12px;">What to check on each review:</p>
    <ul style="font-size:13px;color:#aaa;margin:0;padding:0 0 0 20px;line-height:1.8;">
      <li>All data collection practices still accurate?</li>
      <li>Any new third-party services added? (Add to Privacy Policy Section 4)</li>
      <li>Did data retention periods change?</li>
      <li>New features or pricing? Update Terms &amp; Refund Policy.</li>
      <li>Selling in new U.S. states? May need state-specific privacy rights.</li>
      <li>Colorado CPA or CCPA regulations changed? Check state AG websites.</li>
      <li>Business address / contact email still correct?</li>
    </ul>
  </div>

  <p style="font-size:12px;color:#444;margin-top:24px;">
    After updating legal pages, remember to also update the LEGAL_DOCS dates in <code style="color:#666;">app/api/cron/legal-review/route.ts</code> and in the admin panel Legal tab so the countdown resets.
  </p>

  <p style="font-size:12px;color:#333;margin-top:8px;">Queldrex legal compliance auto-reminder — sent from queldrex.com/api/cron/legal-review</p>
</body>
</html>`,
  })

  return Response.json({
    ok: true,
    reminded: dueItems.map(d => d.name),
    sentTo: adminEmail,
  })
}
