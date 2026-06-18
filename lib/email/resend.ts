import { Resend } from 'resend'
import type { ImplementationResult } from '@/lib/framework/types'

let _resend: Resend | null = null
function getResend(): Resend {
  // Strip BOM and any leading/trailing invisible characters that break HTTP headers
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!.replace(/^﻿/, '').trim())
  return _resend
}

interface DeliveryEmailProps {
  to: string
  businessName: string
  downloadUrl: string
  score: number
}

export async function sendDeliveryEmail({ to, businessName, downloadUrl, score }: DeliveryEmailProps) {
  const scoreLabel = score >= 70 ? 'Good' : score >= 40 ? 'Needs Work' : 'Critical'

  await getResend().emails.send({
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

interface ImplementationEmailProps {
  to: string
  result: ImplementationResult
  afterScore?: number
}

export async function sendImplementationEmail({ to, result, afterScore }: ImplementationEmailProps) {
  const statusColor = result.status === 'success' ? '#16a34a' : result.status === 'partial' ? '#d97706' : '#dc2626'
  const statusLabel = result.status === 'success' ? 'Complete' : result.status === 'partial' ? 'Partial' : 'Failed'

  const scoreImprovement = afterScore !== undefined
    ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
        <div style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Score Improvement</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:16px;">
          <div><div style="font-size:36px;font-weight:800;color:#dc2626;">${result.beforeScore}</div><div style="font-size:12px;color:#6b7280;">Before</div></div>
          <div style="font-size:24px;color:#9ca3af;">→</div>
          <div><div style="font-size:36px;font-weight:800;color:#16a34a;">${afterScore}</div><div style="font-size:12px;color:#6b7280;">After</div></div>
        </div>
        <div style="font-size:14px;color:#16a34a;font-weight:600;margin-top:8px;">+${afterScore - result.beforeScore} points</div>
      </div>`
    : `<div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
        <div style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Score Before Implementation</div>
        <div style="font-size:52px;font-weight:800;color:#dc2626;">${result.beforeScore}<span style="font-size:24px;color:#9ca3af;">/100</span></div>
        <div style="font-size:13px;color:#6b7280;margin-top:4px;">Re-scan in 24–48 hours to see your updated score</div>
      </div>`

  const filesHtml = result.filesImplemented.map(f => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;font-family:monospace;font-size:13px;">${f.path.split('/').pop() || f.path}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;text-align:center;">
        ${f.action === 'created' ? '<span style="color:#16a34a;font-weight:600;">✓ Created</span>'
          : f.action === 'updated' ? '<span style="color:#2563eb;font-weight:600;">✓ Updated</span>'
          : '<span style="color:#9ca3af;">– Skipped</span>'}
      </td>
      <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#6b7280;">${f.note || ''}</td>
    </tr>`).join('')

  const errorsHtml = result.errors.length > 0
    ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-top:16px;">
        <div style="font-weight:600;color:#dc2626;margin-bottom:8px;">Issues encountered:</div>
        ${result.errors.map(e => `<div style="color:#7f1d1d;font-size:13px;margin-bottom:4px;">• ${e}</div>`).join('')}
      </div>`
    : ''

  await getResend().emails.send({
    from: 'Queldrex <reports@queldrex.com>',
    to,
    subject: `Implementation ${statusLabel} — ${result.domain}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;padding:0 20px;">
    <div style="background:#0f172a;padding:32px;border-radius:16px 16px 0 0;text-align:center;">
      <div style="color:#94a3b8;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Queldrex · Done-For-You</div>
      <div style="color:white;font-size:22px;font-weight:700;">AI Visibility Implementation Report</div>
      <div style="display:inline-block;margin-top:12px;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;color:white;background:${statusColor};">${statusLabel}</div>
    </div>
    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
      <p style="margin:0 0 20px;color:#374151;">Implementation complete for <strong>${result.domain}</strong>. Here&apos;s what was done:</p>

      ${scoreImprovement}

      <div style="font-size:15px;font-weight:600;color:#1e293b;margin-bottom:12px;">Files Implemented</div>
      <table style="width:100%;border-collapse:collapse;background:#fafafa;border-radius:10px;overflow:hidden;margin-bottom:16px;">
        <thead><tr>
          <th style="background:#f1f5f9;padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">File</th>
          <th style="background:#f1f5f9;padding:10px 16px;text-align:center;font-size:11px;text-transform:uppercase;color:#6b7280;">Status</th>
          <th style="background:#f1f5f9;padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;color:#6b7280;">Notes</th>
        </tr></thead>
        <tbody>${filesHtml}</tbody>
      </table>

      ${errorsHtml}

      <p style="margin:20px 0 0;color:#9ca3af;font-size:12px;text-align:center;">
        Completed ${new Date(result.completedAt).toLocaleString()} · Queldrex Done-For-You · queldrex.com
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}
