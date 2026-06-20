import { NextRequest } from 'next/server'
import { getAllActiveMonitors, updateMonitor } from '@/lib/store/redis'
import { scanWebsite } from '@/lib/tools/ai-visibility-scanner/scanner'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret')
  const cronSecret = (process.env.CRON_SECRET || '').replace(/^﻿/, '').trim()
  const adminSecret = (process.env.ADMIN_SECRET || '').replace(/^﻿/, '').trim()
  if (!secret || (secret !== adminSecret && (cronSecret && secret !== cronSecret))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const monitors = await getAllActiveMonitors()
  if (monitors.length === 0) return Response.json({ scanned: 0, alerts: 0 })

  const results: Array<{ domain: string; oldScore?: number; newScore: number; alerted: boolean }> = []

  for (const monitor of monitors) {
    try {
      const url = `https://${monitor.domain}`
      const { score } = await scanWebsite(url)
      const oldScore = monitor.lastScore
      const dropped = oldScore !== undefined && (oldScore - score) >= 5
      const history = [...(monitor.scoreHistory || []), { score, scannedAt: new Date().toISOString() }]
        .slice(-12)
      await updateMonitor(monitor.id, {
        lastScore: score,
        lastScanAt: new Date().toISOString(),
        scoreHistory: history,
      })
      if (dropped) {
        await sendDropAlert(monitor.email, monitor.domain, oldScore!, score)
      }
      results.push({ domain: monitor.domain, oldScore, newScore: score, alerted: dropped })
    } catch (err) {
      console.error(`Monitor scan failed for ${monitor.domain}:`, err instanceof Error ? err.message : err)
      results.push({ domain: monitor.domain, oldScore: monitor.lastScore, newScore: -1, alerted: false })
    }
  }

  const alerts = results.filter(r => r.alerted).length
  return Response.json({ scanned: results.length, alerts, results })
}

async function sendDropAlert(email: string, domain: string, oldScore: number, newScore: number) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend((process.env.RESEND_API_KEY || '').replace(/^﻿/, '').trim())
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://queldrex.com').replace(/^﻿/, '').trim()
    await resend.emails.send({
      from: 'Queldrex Monitor <reports@queldrex.com>',
      to: email,
      subject: `AI visibility score dropped for ${domain}`,
      html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#f8fafc;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#0f172a;padding:28px;border-radius:12px;">
  <div style="font-size:11px;color:#f87171;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:12px;">Queldrex · Score Alert</div>
  <div style="font-size:22px;font-weight:800;color:white;margin-bottom:12px;">Your AI visibility dropped.</div>
  <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin-bottom:20px;">
    <strong style="color:white;">${domain}</strong> scored <strong style="color:#f87171;">${newScore}/100</strong> this month, down from <strong style="color:white;">${oldScore}/100</strong> last month.
  </p>
  <a href="${baseUrl}/scanner" style="display:inline-block;background:linear-gradient(135deg,#06d6ff,#0891b2);color:#000;font-weight:700;font-size:13px;padding:11px 22px;border-radius:8px;text-decoration:none;">Run a Full Scan →</a>
  <p style="color:#475569;font-size:12px;margin-top:20px;">Your full score history is on your <a href="${baseUrl}/monitor" style="color:#22d3ee;">monitoring dashboard</a>.</p>
</div>
</body></html>`,
    })
  } catch { /* email non-fatal */ }
}
