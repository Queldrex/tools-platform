import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

interface DeliveryEmailProps {
  to: string
  businessName: string
  downloadUrl: string
  score: number
}

export async function sendDeliveryEmail({ to, businessName, downloadUrl, score }: DeliveryEmailProps) {
  const scoreLabel = score >= 70 ? 'Good' : score >= 40 ? 'Needs Work' : 'Critical'

  await resend.emails.send({
    from: 'Queldrex <reports@queldrex.com>',
    to,
    subject: `Your AI Visibility Report is ready — ${businessName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="background:#0f172a;padding:32px;border-radius:16px 16px 0 0;text-align:center;">
      <div style="color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Queldrex</div>
      <div style="color:white;font-size:24px;font-weight:700;">Your AI Visibility Report</div>
    </div>
    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
      <p style="margin:0 0 16px;color:#374151;">Your report for <strong>${businessName}</strong> is ready.</p>

      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
        <div style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">AI Visibility Score</div>
        <div style="font-size:52px;font-weight:800;color:${score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626'};">${score}<span style="font-size:24px;color:#9ca3af;">/100</span></div>
        <div style="font-size:13px;color:#6b7280;">${scoreLabel}</div>
      </div>

      <p style="margin:0 0 24px;color:#374151;">Your package includes:</p>
      <ul style="margin:0 0 24px;padding-left:20px;color:#374151;line-height:2;">
        <li>Full AI Visibility Report (HTML)</li>
        <li>Generated llms.txt — ready to upload</li>
        <li>LocalBusiness JSON-LD schema — ready to paste</li>
        <li>Prioritized recommendations</li>
      </ul>

      <a href="${downloadUrl}" style="display:block;background:#0f172a;color:white;text-decoration:none;text-align:center;padding:16px;border-radius:10px;font-weight:600;font-size:16px;margin-bottom:16px;">
        Download Your Report
      </a>

      <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
        This link expires in 48 hours. Questions? Reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}
