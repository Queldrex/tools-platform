import { Resend } from 'resend'
import type { ImplementationResult } from '@/lib/framework/types'

let _resend: Resend | null = null
function getResend(): Resend {
  // Strip BOM and any leading/trailing invisible characters that break HTTP headers
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!.replace(/^﻿/, '').trim())
  return _resend
}

interface FreeScoreEmailProps {
  to: string
  domain: string
  score: number
  passingSignals: number
  blockedAiBots: string[]
  topIssue: string
  shareUrl: string
  scanId: string
}

export async function sendFreeScoreEmail({
  to, domain, score, passingSignals, blockedAiBots, topIssue, shareUrl, scanId,
}: FreeScoreEmailProps) {
  const scoreColor = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626'
  const scoreLabel = score >= 70 ? 'Good' : score >= 40 ? 'Needs Work' : 'Critical'
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim()
  const reportUrl = `${baseUrl}/scanner`

  const botWarning = blockedAiBots.length > 0
    ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;margin-bottom:20px;">
        <div style="font-weight:700;color:#dc2626;font-size:13px;margin-bottom:6px;">⚠ CRITICAL: AI crawlers are blocked</div>
        <div style="font-size:13px;color:#7f1d1d;line-height:1.6;">Your robots.txt is blocking <strong>${blockedAiBots.join(', ')}</strong>. These AI systems cannot read your website at all — even after fixing other signals. This must be fixed first.</div>
      </div>`
    : ''

  await getResend().emails.send({
    from: 'Queldrex (No Reply) <reports@queldrex.com>',
    replyTo: 'hello@queldrex.com',
    to,
    subject: `Your AI visibility score for ${domain}: ${score}/100`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:540px;margin:40px auto;padding:0 20px;">

    <!-- Header -->
    <div style="background:#0f172a;padding:32px;border-radius:16px 16px 0 0;text-align:center;">
      <div style="color:#22d3ee;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:10px;">Queldrex · AI Visibility Scanner</div>
      <div style="color:white;font-size:22px;font-weight:800;">Your free scan is ready</div>
      <div style="color:#94a3b8;font-size:13px;margin-top:6px;">${domain}</div>
    </div>

    <div style="background:white;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">

      <!-- Score -->
      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center;">
        <div style="font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">AI Visibility Score</div>
        <div style="font-size:68px;font-weight:900;line-height:1;color:${scoreColor};margin-bottom:4px;">${score}<span style="font-size:28px;color:#d1d5db;">/100</span></div>
        <div style="display:inline-block;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;background:${scoreColor}18;color:${scoreColor};border:1px solid ${scoreColor}30;">${scoreLabel}</div>
        <div style="margin-top:10px;font-size:13px;color:#6b7280;">${passingSignals} of 8 core signals passing</div>
      </div>

      ${botWarning}

      <!-- Top issue -->
      ${topIssue ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px;margin-bottom:24px;">
        <div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">Top priority fix</div>
        <div style="font-size:14px;color:#78350f;font-weight:600;">${topIssue}</div>
      </div>` : ''}

      <!-- What's in the full report -->
      <div style="margin-bottom:24px;">
        <div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:12px;">Unlock your full report for $149:</div>
        <table style="width:100%;border-collapse:collapse;">
          ${[
            ['Complete llms.txt file', 'Upload-ready. Tells ChatGPT, Claude & Perplexity exactly what your business does.'],
            ['LocalBusiness JSON-LD schema', 'Paste-ready structured data for AI search and Google Knowledge Panel.'],
            ['robots.txt fix', 'Correct AI bot permissions so every crawler can read your site.'],
            ['HTML Report + action checklist', 'Full breakdown with step-by-step fixes for every signal.'],
          ].map(([title, desc], i) => `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:12px 0;vertical-align:top;">
              <span style="color:#16a34a;font-weight:700;margin-right:8px;">✓</span>
              <span style="font-weight:600;color:#1e293b;font-size:13px;">${title}</span>
              <div style="font-size:12px;color:#6b7280;margin-top:2px;padding-left:20px;">${desc}</div>
            </td>
          </tr>`).join('')}
        </table>
      </div>

      <!-- CTA -->
      <a href="${baseUrl}/scanner?scanId=${scanId}" style="display:block;background:linear-gradient(135deg,#06b6d4,#0891b2);color:white;text-decoration:none;text-align:center;padding:17px;border-radius:12px;font-weight:800;font-size:16px;margin-bottom:12px;">
        Get Your Full Report — $149 →
      </a>

      <!-- Share -->
      <a href="${shareUrl}" style="display:block;background:#f8fafc;color:#374151;text-decoration:none;text-align:center;padding:13px;border-radius:10px;font-weight:600;font-size:13px;border:1px solid #e5e7eb;margin-bottom:24px;">
        Share your score →
      </a>

      <p style="margin:0;color:#9ca3af;font-size:11px;text-align:center;line-height:1.8;">
        <strong style="color:#9ca3af;">Do not reply to this email</strong> — for questions contact <a href="mailto:hello@queldrex.com" style="color:#9ca3af;">hello@queldrex.com</a><br>
        This email was sent because you entered ${to} when scanning ${domain}.<br>
        <a href="${baseUrl}/privacy" style="color:#9ca3af;">Privacy Policy</a> &nbsp;·&nbsp; Queldrex LLC, a Colorado limited liability company
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}

// ─── Email: Download + Instructions (Stripe handles the receipt automatically) ─

interface DeliveryEmailProps {
  to: string
  businessName: string
  downloadUrl: string
  score: number
}

export async function sendDeliveryEmail({ to, businessName, downloadUrl, score }: DeliveryEmailProps) {
  const scoreColor = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626'
  const scoreLabel = score >= 70 ? 'Good' : score >= 40 ? 'Needs Work' : 'Critical'

  await getResend().emails.send({
    from: 'Queldrex (No Reply) <reports@queldrex.com>',
    replyTo: 'hello@queldrex.com',
    to,
    subject: `Your AI Visibility Report is ready — ${businessName}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:40px auto;padding:0 16px 40px;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:36px 40px;border-radius:16px 16px 0 0;text-align:center;">
    <div style="color:#22d3ee;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:10px;">Queldrex · AI Visibility Scanner</div>
    <div style="color:white;font-size:26px;font-weight:800;margin-bottom:6px;">Order Confirmed</div>
    <div style="color:#94a3b8;font-size:14px;">Your report is ready to download below.</div>
  </div>

  <!-- Body -->
  <div style="background:white;padding:36px 40px;border-radius:0 0 16px 16px;box-shadow:0 4px 16px rgba(0,0,0,0.06);">

    <!-- Score -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
      <div style="font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">AI Visibility Score — ${businessName}</div>
      <div style="font-size:60px;font-weight:900;line-height:1;color:${scoreColor};margin-bottom:6px;">${score}<span style="font-size:26px;color:#cbd5e1;">/100</span></div>
      <div style="display:inline-block;padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;background:${scoreColor}18;color:${scoreColor};border:1px solid ${scoreColor}30;">${scoreLabel}</div>
    </div>

    <!-- Download CTA -->
    <a href="${downloadUrl}" style="display:block;background:linear-gradient(135deg,#06b6d4,#0891b2);color:white;text-decoration:none;text-align:center;padding:18px;border-radius:12px;font-weight:800;font-size:17px;margin-bottom:12px;">
      Download Your Report &rarr;
    </a>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 16px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Or copy this link into your browser</p>
      <a href="${downloadUrl}" style="font-size:12px;color:#0891b2;word-break:break-all;">${downloadUrl}</a>
      <p style="margin:6px 0 0;font-size:11px;color:#94a3b8;">This private link expires in 7 days &nbsp;·&nbsp; For your eyes only — do not share</p>
    </div>

    <!-- What's in the package -->
    <div style="margin-bottom:28px;">
      <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:14px;">What's in your package (5 files):</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 0;vertical-align:top;width:130px;">
            <span style="font-family:monospace;font-size:12px;background:#f8fafc;border:1px solid #e2e8f0;padding:3px 8px;border-radius:4px;color:#374151;">report.html</span>
          </td>
          <td style="padding:12px 0 12px 12px;vertical-align:top;">
            <div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px;">Full AI Visibility Report</div>
            <div style="font-size:12px;color:#6b7280;">Open in any browser. Shows your 13-signal score breakdown and all recommendations with severity rankings.</div>
          </td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 0;vertical-align:top;">
            <span style="font-family:monospace;font-size:12px;background:#f8fafc;border:1px solid #e2e8f0;padding:3px 8px;border-radius:4px;color:#374151;">llms.txt</span>
          </td>
          <td style="padding:12px 0 12px 12px;vertical-align:top;">
            <div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px;">AI Identity File — upload-ready</div>
            <div style="font-size:12px;color:#6b7280;">Upload this file to your website root so it's accessible at <strong>${businessName}/llms.txt</strong>. Tells ChatGPT, Claude, and Perplexity exactly what your business does.</div>
          </td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 0;vertical-align:top;">
            <span style="font-family:monospace;font-size:12px;background:#f8fafc;border:1px solid #e2e8f0;padding:3px 8px;border-radius:4px;color:#374151;">schema-install.html</span>
          </td>
          <td style="padding:12px 0 12px 12px;vertical-align:top;">
            <div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px;">JSON-LD Schema — paste-ready</div>
            <div style="font-size:12px;color:#6b7280;">Open this file, copy the &lt;script&gt; block, and paste it into your site's &lt;head&gt;. Works with WordPress (Yoast/Rank Math), Shopify (theme.liquid), or any HTML page.</div>
          </td>
        </tr>
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:12px 0;vertical-align:top;">
            <span style="font-family:monospace;font-size:12px;background:#f8fafc;border:1px solid #e2e8f0;padding:3px 8px;border-radius:4px;color:#374151;">recommendations.md</span>
          </td>
          <td style="padding:12px 0 12px 12px;vertical-align:top;">
            <div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px;">Prioritized Fix Checklist</div>
            <div style="font-size:12px;color:#6b7280;">Step-by-step fixes ranked High → Medium → Low priority. Open in any text editor, Notion, or Obsidian.</div>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;vertical-align:top;">
            <span style="font-family:monospace;font-size:12px;background:#f8fafc;border:1px solid #e2e8f0;padding:3px 8px;border-radius:4px;color:#374151;">README.txt</span>
          </td>
          <td style="padding:12px 0 12px 12px;vertical-align:top;">
            <div style="font-size:13px;font-weight:600;color:#1e293b;margin-bottom:2px;">Quick-Start Instructions</div>
            <div style="font-size:12px;color:#6b7280;">Step-by-step guide for installing all files on your website, with platform-specific notes.</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Installation steps -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:22px;margin-bottom:28px;">
      <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:14px;">How to install (4 steps, ~10 minutes):</div>
      ${[
        ['Upload llms.txt', `Use FTP, cPanel File Manager, or your hosting panel to upload <code>llms.txt</code> to your website's root folder — the same folder that contains your homepage. Verify it's live by visiting <strong>${businessName}/llms.txt</strong> in your browser.`],
        ['Add the JSON-LD schema', `Open <code>schema-install.html</code> and copy the entire <code>&lt;script type="application/ld+json"&gt;</code> block. Paste it into the <code>&lt;head&gt;</code> section of every page on your site. In WordPress: Yoast SEO → Schema, or paste via a Custom HTML widget. In Shopify: Online Store → Themes → Edit Code → <code>theme.liquid</code>.`],
        ['Review your report', `Open <code>report.html</code> in any browser. It shows your full 13-signal breakdown and exactly which fixes will have the most impact. Work through the High Priority items first.`],
        ['Re-scan in 24–48 hours', `After installing, return to <a href="https://queldrex.com/scanner" style="color:#0891b2;">queldrex.com/scanner</a> and re-scan your site. DNS and crawl caches take time to refresh — your score should increase within 1–2 days.`],
      ].map(([title, body], i) => `
      <div style="display:flex;gap:14px;margin-bottom:${i < 3 ? '14px' : '0'};">
        <div style="width:26px;height:26px;min-width:26px;border-radius:50%;background:#0f172a;color:white;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px;">${i + 1}</div>
        <div>
          <div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:3px;">${title}</div>
          <div style="font-size:12px;color:#4b5563;line-height:1.6;">${body}</div>
        </div>
      </div>`).join('')}
    </div>

    <!-- Need help -->
    <div style="text-align:center;margin-bottom:8px;">
      <p style="margin:0;font-size:13px;color:#374151;">Do not reply to this email — it is sent from an unmonitored address. For questions or support, contact <a href="mailto:hello@queldrex.com" style="color:#0891b2;font-weight:600;">hello@queldrex.com</a></p>
    </div>

  </div>

  <!-- Legal footer -->
  <div style="padding:20px 8px 0;text-align:center;">
    <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;">
      Queldrex LLC, a Colorado limited liability company &nbsp;·&nbsp; queldrex.com
    </p>
    <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;">
      <a href="https://queldrex.com/privacy" style="color:#94a3b8;">Privacy Policy</a> &nbsp;·&nbsp;
      <a href="https://queldrex.com/terms" style="color:#94a3b8;">Terms of Service</a> &nbsp;·&nbsp;
      <a href="https://queldrex.com/refunds" style="color:#94a3b8;">Refund Policy</a>
    </p>
    <p style="margin:0;font-size:11px;color:#cbd5e1;">
      This email was sent to ${to} because you purchased an AI Visibility Report at queldrex.com.
    </p>
  </div>

</div>
</body>
</html>`,
  })
}

interface CredentialsRequestEmailProps {
  to: string
  domain: string
  credentialsUrl: string
  formattedTime: string
}

export async function sendCredentialsRequestEmail({ to, domain, credentialsUrl, formattedTime }: CredentialsRequestEmailProps) {
  await getResend().emails.send({
    from: 'Queldrex (No Reply) <reports@queldrex.com>',
    replyTo: 'hello@queldrex.com',
    to,
    subject: `Action required: Submit hosting access for ${domain}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="background:#0f172a;padding:32px;border-radius:16px 16px 0 0;text-align:center;">
      <div style="color:#22d3ee;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;">Queldrex · Done-For-You</div>
      <div style="color:white;font-size:22px;font-weight:800;">Your slot is booked</div>
      <div style="color:#94a3b8;font-size:13px;margin-top:6px;">${formattedTime}</div>
    </div>
    <div style="background:white;padding:36px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">

      <p style="margin:0 0 20px;color:#374151;font-size:15px;">
        Booking confirmed for <strong>${domain}</strong>. Before your session, submit your hosting credentials so we can prepare.
      </p>

      <a href="${credentialsUrl}" style="display:block;background:linear-gradient(135deg,#06b6d4,#0891b2);color:white;text-decoration:none;text-align:center;padding:18px;border-radius:12px;font-weight:700;font-size:16px;margin-bottom:24px;">
        Submit Hosting Credentials →
      </a>

      <p style="margin:0 0 16px;color:#374151;font-size:13px;font-weight:600;">Which credentials do we need?</p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px;">
        <tr style="background:#f8fafc;">
          <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#1e293b;">FTP / cPanel</td>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280;">FTP host, username, password. Found in your hosting control panel.</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#1e293b;">WordPress</td>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280;">Site URL + Application Password (Users → Profile → Application Passwords).</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#1e293b;">Vercel / Netlify</td>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280;">GitHub repo name + Personal Access Token with repo scope.</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#1e293b;">Shopify</td>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280;">Store URL + Admin API token with write_themes permission.</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#1e293b;">Other / Not sure</td>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280;">Tell us your platform — we'll send you a manual file package.</td>
        </tr>
      </table>

      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:16px;margin-bottom:20px;">
        <p style="margin:0;font-size:12px;color:#78350f;line-height:1.8;">
          <strong>Security:</strong> Your credentials are transmitted over HTTPS, stored encrypted, used only during the implementation session, and permanently deleted within 48 hours of completion. You can revoke access any time by changing your password.
        </p>
      </div>

      <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
        Do not reply to this email — contact <a href="mailto:hello@queldrex.com" style="color:#6b7280;">hello@queldrex.com</a> &nbsp;·&nbsp; <a href="https://queldrex.com/terms" style="color:#6b7280;">Terms</a> &nbsp;·&nbsp; <a href="https://queldrex.com/privacy" style="color:#6b7280;">Privacy</a>
        <br>Queldrex LLC, a Colorado limited liability company · queldrex.com
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}

interface DfyAuthorizationEmailProps {
  to: string
  domain: string
  score: number
  credentialsUrl: string
  bookingUrl: string
}

export async function sendDfyAuthorizationEmail({ to, domain, score, credentialsUrl, bookingUrl }: DfyAuthorizationEmailProps) {
  const scoreLabel = score >= 70 ? 'Good' : score >= 40 ? 'Needs Work' : 'Critical'
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  await getResend().emails.send({
    from: 'Queldrex (No Reply) <reports@queldrex.com>',
    replyTo: 'hello@queldrex.com',
    to,
    subject: `Implementation Confirmed — Action Required for ${domain}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;padding:0 20px;">

    <!-- Header -->
    <div style="background:#0f172a;padding:32px;border-radius:16px 16px 0 0;text-align:center;">
      <div style="color:#22d3ee;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px;">Queldrex · Done-For-You</div>
      <div style="color:white;font-size:22px;font-weight:800;">Payment Confirmed — Next Steps</div>
      <div style="color:#94a3b8;font-size:13px;margin-top:6px;">${domain} · ${date}</div>
    </div>

    <div style="background:white;padding:36px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">

      <!-- Score -->
      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:28px;text-align:center;">
        <div style="font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Current AI Visibility Score</div>
        <div style="font-size:48px;font-weight:800;color:${score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626'};">${score}<span style="font-size:22px;color:#9ca3af;">/100</span></div>
        <div style="font-size:12px;color:#6b7280;">${scoreLabel} — We&apos;ll fix this.</div>
      </div>

      <!-- Steps -->
      <p style="margin:0 0 20px;color:#1e293b;font-size:15px;font-weight:600;">Complete these two steps:</p>

      <div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:28px;">
        <div style="padding:18px 20px;border-bottom:1px solid #f0f0f0;display:flex;align-items:flex-start;gap:14px;">
          <div style="width:28px;height:28px;min-width:28px;border-radius:50%;background:#0f172a;color:white;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px;">1</div>
          <div>
            <div style="font-weight:700;color:#1e293b;margin-bottom:4px;">Book your implementation slot</div>
            <div style="font-size:13px;color:#6b7280;margin-bottom:10px;">Pick a time that works for you. The session takes about 30 minutes — we do all the work while you watch or step away.</div>
            <a href="${bookingUrl}" style="display:inline-block;background:#0f172a;color:white;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:13px;">Book Your Slot →</a>
          </div>
        </div>
        <div style="padding:18px 20px;display:flex;align-items:flex-start;gap:14px;">
          <div style="width:28px;height:28px;min-width:28px;border-radius:50%;background:#0f172a;color:white;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px;">2</div>
          <div>
            <div style="font-weight:700;color:#1e293b;margin-bottom:4px;">Submit your hosting credentials</div>
            <div style="font-size:13px;color:#6b7280;margin-bottom:10px;">We need access to install the files. Supported: FTP/cPanel, WordPress, GitHub (Vercel/Netlify), Shopify, or send us a ZIP package.</div>
            <a href="${credentialsUrl}" style="display:inline-block;background:#0891b2;color:white;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600;font-size:13px;">Submit Credentials →</a>
          </div>
        </div>
      </div>

      <!-- What we'll do -->
      <p style="margin:0 0 14px;color:#1e293b;font-size:14px;font-weight:600;">What we&apos;ll install on ${domain}:</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;font-size:13px;">
        <tr style="background:#f8fafc;">
          <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#1e293b;">llms.txt</td>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280;">Uploaded to your web root. Tells AI models what your site is about and how to cite it.</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#1e293b;">LocalBusiness JSON-LD</td>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280;">Structured data injected into your <code>&lt;head&gt;</code>. Helps AI and search engines understand your business.</td>
        </tr>
        <tr style="background:#f8fafc;">
          <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#1e293b;">robots.txt</td>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280;">Created or updated to include your sitemap reference and correct AI crawler permissions.</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;font-weight:600;color:#1e293b;">Before/After Report</td>
          <td style="padding:10px 14px;border:1px solid #e5e7eb;color:#6b7280;">Emailed to you after implementation confirming all signals passed.</td>
        </tr>
      </table>

      <!-- Legal disclosure -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:18px;margin-bottom:20px;">
        <div style="font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">Data &amp; Credential Handling</div>
        <ul style="margin:0;padding-left:16px;color:#78350f;font-size:13px;line-height:2;">
          <li>Your credentials are transmitted over HTTPS and stored encrypted.</li>
          <li>We access your website only during the agreed implementation window.</li>
          <li>All credentials are permanently deleted within 48 hours of project completion.</li>
          <li>We will not modify any files outside the scope listed above without your written approval.</li>
          <li>This service is governed by our <a href="https://queldrex.com/terms" style="color:#92400e;">Terms of Service</a> and <a href="https://queldrex.com/privacy" style="color:#92400e;">Privacy Policy</a>.</li>
        </ul>
        <p style="margin:10px 0 0;font-size:12px;color:#92400e;">By submitting credentials at the link above, you confirm you own or are authorized to modify ${domain}.</p>
      </div>

      <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
        Do not reply to this email — contact <a href="mailto:hello@queldrex.com" style="color:#6b7280;">hello@queldrex.com</a>
        <br>Queldrex LLC, a Colorado limited liability company · queldrex.com
      </p>
    </div>
  </div>
</body>
</html>`,
  })
}

export async function sendAdminNotification({ domain, token, platform }: { domain: string; token: string; platform: string }) {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim()
  await getResend().emails.send({
    from: 'Queldrex (No Reply) <reports@queldrex.com>',
    to: 'hello@queldrex.com',
    subject: `[Action Required] DFY credentials submitted — ${domain}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;padding:32px;background:#f8fafc;">
  <div style="max-width:480px;margin:0 auto;background:white;padding:28px;border-radius:12px;border:1px solid #e5e7eb;">
    <h2 style="margin:0 0 16px;color:#0f172a;">Credentials ready for implementation</h2>
    <table style="width:100%;font-size:14px;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#6b7280;width:100px;">Domain</td><td style="padding:8px 0;font-weight:600;">${domain}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7280;">Platform</td><td style="padding:8px 0;">${platform}</td></tr>
    </table>
    <a href="${baseUrl}/admin" style="display:block;margin-top:20px;background:#0f172a;color:white;text-decoration:none;text-align:center;padding:12px;border-radius:8px;font-weight:600;">
      Open Admin Dashboard →
    </a>
    <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;text-align:center;">Token: ${token}</p>
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
    from: 'Queldrex (No Reply) <reports@queldrex.com>',
    replyTo: 'hello@queldrex.com',
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

export async function sendDiscoveryEmail({ to, name, url, score, bookingUrl, agreementUrl }: {
  to: string
  name: string
  url: string
  score?: number
  bookingUrl: string
  agreementUrl: string
}) {
  const firstName = name.split(' ')[0]
  await getResend().emails.send({
    from: 'Sean at Queldrex <hello@queldrex.com>',
    to,
    replyTo: 'hello@queldrex.com',
    subject: `Quick call about your AI visibility — ${url}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="background:#070b14;padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;">
      <div style="color:#06b6d4;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px;">Queldrex · Done-For-You</div>
      <div style="color:white;font-size:22px;font-weight:800;">Let's talk, ${firstName}.</div>
    </div>
    <div style="background:white;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px;">
        I reviewed your application for <strong>${url}</strong> and I'd like to schedule a quick 15-minute call before we get started — so I can walk you through exactly what we'll do and answer any questions.
      </p>
      ${score !== undefined ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 20px;margin-bottom:24px;text-align:center;">
        <div style="font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Current AI Visibility Score</div>
        <div style="font-size:36px;font-weight:800;color:#dc2626;">${score}<span style="font-size:18px;color:#9ca3af;">/100</span></div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">We'll bring this to 80+ or better.</div>
      </div>` : ''}
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">
        The call takes 15 minutes. I'll show you the exact fixes we'll make and how they improve your score. Pick a time that works for you:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td bgcolor="#0891b2" style="border-radius:10px;padding:16px 32px;">
                  <a href="${bookingUrl}" style="color:white;text-decoration:none;font-size:16px;font-weight:800;white-space:nowrap;">📅 Book a 15-Minute Call →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 20px;text-align:center;">
        After our call I'll send you the payment link to complete your $499 order and we'll get to work within 48 hours.
      </p>
      <div style="border-top:1px solid #f0f0f0;padding-top:16px;">
        <p style="font-size:12px;color:#9ca3af;margin:0 0 6px;">
          Before the call, you can review the <a href="${agreementUrl}" style="color:#0891b2;">DFY Service Agreement</a> — it covers exactly what we do, your data security, and our satisfaction guarantee.
        </p>
        <p style="font-size:12px;color:#9ca3af;margin:0;">Reply to this email with any questions. — Sean, Queldrex</p>
      </div>
    </div>
  </div>
</body>
</html>`,
  })
}

export async function sendPaymentLinkEmail({ to, name, url, paymentUrl, score }: {
  to: string
  name: string
  url: string
  paymentUrl: string
  score?: number
}) {
  const agreementUrl = `${(process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim()}/dfy-agreement`
  await getResend().emails.send({
    from: 'Queldrex (No Reply) <reports@queldrex.com>',
    to,
    replyTo: 'hello@queldrex.com',
    subject: 'Your Queldrex implementation is ready — complete your order',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:40px auto;padding:0 20px;">
    <div style="background:#070b14;padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;">
      <div style="color:#06b6d4;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:6px;">Queldrex</div>
      <div style="color:white;font-size:22px;font-weight:800;">Your spot is reserved, ${name.split(' ')[0]}.</div>
    </div>
    <div style="background:white;padding:32px;border-radius:0 0 12px 12px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Following our call, everything is confirmed. Complete your payment below and we'll start your AI visibility implementation for <strong>${url}</strong> within 48 hours.
      </p>
      ${score !== undefined ? `
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:16px 20px;margin-bottom:24px;text-align:center;">
        <div style="font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Current AI Visibility Score</div>
        <div style="font-size:36px;font-weight:800;color:${score >= 80 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'};">${score}<span style="font-size:18px;color:#9ca3af;">/100</span></div>
        <div style="font-size:12px;color:#6b7280;margin-top:4px;">We'll bring this to 80+ or better.</div>
      </div>` : ''}
      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:28px;">
        <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:12px;">What's included — $499 one-time:</div>
        ${['llms.txt — tells every AI exactly what your business does','LocalBusiness JSON-LD schema — machine-readable identity card','robots.txt — ensures all AI crawlers can access your site','sitemap.xml — AI crawlers discover every page','Before/after visibility report confirming every signal fixed','Score improvement to 80+ guaranteed'].map(item =>
          `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px;font-size:13px;color:#374151;"><span style="color:#16a34a;font-size:16px;flex-shrink:0;line-height:1.2;">✓</span>${item}</div>`
        ).join('')}
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td bgcolor="#0891b2" style="border-radius:10px;padding:18px 40px;">
                  <a href="${paymentUrl}" style="color:white;text-decoration:none;font-size:17px;font-weight:900;white-space:nowrap;">Complete Payment — $499 →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0 0 16px;">
        Secure checkout powered by Stripe. By completing payment you agree to the <a href="${agreementUrl}" style="color:#0891b2;">DFY Service Agreement</a>.
      </p>
      <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">Do not reply to this email — for questions contact <a href="mailto:hello@queldrex.com" style="color:#06b6d4;">hello@queldrex.com</a></p>
    </div>
  </div>
</body>
</html>`,
  })
}

// ── Admin alert emails ────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'janitor.clean.base@gmail.com'

export async function sendAdminScanAlert({ domain, email, score }: { domain: string; email: string; score: number }) {
  const adminUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim() + '/admin'
  const scoreColor = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#dc2626'
  await getResend().emails.send({
    from: 'Queldrex (No Reply) <reports@queldrex.com>',
    to: ADMIN_EMAIL,
    subject: `New scan lead: ${domain} — ${score}/100`,
    html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
  <div style="max-width:420px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
    <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · New Scan Lead</div>
    <div style="font-size:20px;font-weight:800;color:white;margin-bottom:4px;">${domain}</div>
    <div style="font-size:13px;color:#94a3b8;margin-bottom:20px;">${email}</div>
    <div style="display:inline-block;background:#1e293b;border-radius:10px;padding:14px 24px;margin-bottom:24px;">
      <span style="font-size:36px;font-weight:800;color:${scoreColor};">${score}</span><span style="font-size:18px;color:#64748b;">/100</span>
    </div>
    <a href="${adminUrl}" style="display:block;background:#22d3ee;color:#0f172a;text-decoration:none;text-align:center;padding:12px;border-radius:8px;font-weight:700;font-size:14px;">Open Admin Panel →</a>
  </div>
</body></html>`,
  })
}

export async function sendAdminPurchaseAlert({ domain, email, score, product, amount }: { domain: string; email: string; score: number; product: string; amount: string }) {
  const adminUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim() + '/admin'
  await getResend().emails.send({
    from: 'Queldrex (No Reply) <reports@queldrex.com>',
    to: ADMIN_EMAIL,
    subject: `💰 New purchase: ${product} — ${domain}`,
    html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
  <div style="max-width:420px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
    <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · New Purchase</div>
    <div style="font-size:24px;font-weight:800;color:#4ade80;margin-bottom:4px;">${amount}</div>
    <div style="font-size:15px;font-weight:600;color:white;margin-bottom:4px;">${product}</div>
    <div style="font-size:13px;color:#94a3b8;margin-bottom:4px;">${domain}</div>
    <div style="font-size:13px;color:#64748b;margin-bottom:24px;">${email}</div>
    <a href="${adminUrl}" style="display:block;background:#22d3ee;color:#0f172a;text-decoration:none;text-align:center;padding:12px;border-radius:8px;font-weight:700;font-size:14px;">Open Admin Panel →</a>
  </div>
</body></html>`,
  })
}

export async function sendAdminDownloadAlert({
  domain, email, scanId, downloadUrl, score, timestamp,
}: { domain: string; email: string; scanId: string; downloadUrl: string; score: number; timestamp: string }) {
  const adminUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim() + '/admin'
  await getResend().emails.send({
    from: 'Queldrex (No Reply) <reports@queldrex.com>',
    to: ADMIN_EMAIL,
    subject: `📥 Download confirmed: ${domain}`,
    html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
  <div style="max-width:480px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
    <div style="font-size:11px;color:#22d3ee;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · Download Confirmed</div>
    <div style="font-size:20px;font-weight:800;color:white;margin-bottom:4px;">${domain}</div>
    <div style="font-size:13px;color:#94a3b8;margin-bottom:20px;">${email}</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr>
        <td style="font-size:12px;color:#64748b;padding:6px 0;">Scan ID</td>
        <td style="font-size:12px;color:#cbd5e1;text-align:right;font-family:monospace;">${scanId}</td>
      </tr>
      <tr>
        <td style="font-size:12px;color:#64748b;padding:6px 0;">Score</td>
        <td style="font-size:12px;color:#4ade80;text-align:right;font-weight:700;">${score}/100</td>
      </tr>
      <tr>
        <td style="font-size:12px;color:#64748b;padding:6px 0;">Downloaded At</td>
        <td style="font-size:12px;color:#cbd5e1;text-align:right;">${timestamp}</td>
      </tr>
      <tr>
        <td style="font-size:12px;color:#64748b;padding:6px 0;">Status</td>
        <td style="font-size:12px;color:#4ade80;text-align:right;font-weight:700;">DOWNLOADED ✓</td>
      </tr>
    </table>
    <div style="background:#1e293b;border-radius:8px;padding:12px;margin-bottom:20px;">
      <div style="font-size:11px;color:#64748b;margin-bottom:4px;">Download URL (for your records)</div>
      <div style="font-size:11px;color:#22d3ee;word-break:break-all;font-family:monospace;">${downloadUrl}</div>
    </div>
    <a href="${adminUrl}" style="display:block;background:#22d3ee;color:#0f172a;text-decoration:none;text-align:center;padding:12px;border-radius:8px;font-weight:700;font-size:14px;">Open Admin Panel →</a>
  </div>
</body></html>`,
  })
}
