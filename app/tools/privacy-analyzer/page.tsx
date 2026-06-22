'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface GdprResult { score: number; lawfulBasis: boolean; dataMinimization: boolean; userRights: boolean; dataRetention: boolean; thirdPartySharing: boolean; dpo: boolean }
interface CcpaResult { score: number; optOut: boolean; disclosure: boolean; financialIncentives: boolean }
interface Result {
  complianceScore: number
  gdpr: GdprResult; ccpa: CcpaResult
  dataCollected: string[]; thirdParties: string[]
  retentionPeriod: string
  redFlags: string[]; missingClauses: string[]
  summary: string; verdict: string; analyzedAt: string
}

function Check({ pass, label }: { pass: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: pass ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)' }}>
        {pass ? <svg className="w-2.5 h-2.5 text-green-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          : <svg className="w-2.5 h-2.5 text-red-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>}
      </div>
      <span className="text-xs text-white/60">{label}</span>
    </div>
  )
}

export default function PrivacyAnalyzerPage() {
  const [tab, setTab] = useState<'url' | 'text'>('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [paywall, setPaywall] = useState(false)

  const analyze = async (urlArg?: string) => {
    const activeUrl = urlArg ?? url
    const body = urlArg ? { url: urlArg } : (tab === 'url' ? { url: url.trim() } : { text: text.trim() })
    if (!urlArg && tab === 'url' && !url.trim()) return
    if (!urlArg && tab === 'text' && !text.trim()) return
    setLoading(true); setError(''); setResult(null); setPaywall(false)
    try {
      const res = await fetch('/api/tools/privacy-analyzer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.paywall || res.status === 402) { setPaywall(true); return }
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Analysis failed') }
    finally { setLoading(false) }
  }

  const loadExample = () => { setTab('url'); setUrl('https://www.apple.com/legal/privacy/en-ww/'); analyze('https://www.apple.com/legal/privacy/en-ww/') }

  const scoreColor = result ? (result.complianceScore >= 70 ? '#4ade80' : result.complianceScore >= 40 ? '#facc15' : '#f87171') : '#4ade80'

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>All Tools
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#fb923c', borderColor: 'rgba(251,146,60,0.3)', background: 'rgba(251,146,60,0.08)' }}>Live</span>
          <span className="text-sm font-bold text-white/30">1 free analysis/day · Unlimited with Pro</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Privacy Policy <span style={{ color: '#fb923c' }}>GDPR/CCPA Analyzer</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-xl">Paste a privacy policy URL or text. AI reads the actual document and scores it for GDPR and CCPA compliance — lawful basis, data retention, user rights, third-party disclosures, and red flags.</p>
        <div className="mb-6 px-4 py-3 rounded-xl border text-xs leading-relaxed" style={{ background: 'rgba(251,191,36,0.05)', borderColor: 'rgba(251,191,36,0.2)', color: 'rgba(251,191,36,0.7)' }}>
          This tool uses AI to analyze privacy policy language for informational purposes only. Results do not constitute legal advice and do not establish an attorney-client relationship. Have a qualified attorney review your privacy policy and compliance posture before relying on any output.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">How it works</p>
            <p className="text-sm text-white/60 leading-relaxed">Fetches the full text of any privacy policy URL, strips the HTML, and sends it to AI for structured GDPR and CCPA analysis. Checks for 8 required disclosures: data collection practices, third-party sharing, user rights, retention policies, security measures, contact info, cookie policy, and children&apos;s data.</p>
          </div>
          <div className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">What you get</p>
            <ul className="space-y-2">
              {['GDPR compliance score (0-100) with letter grade', 'CCPA compliance assessment', '8 required sections checked — present or missing', 'Red flags: vague language, missing disclosures', 'Plain-English verdict on the most critical gaps'].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/55">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border p-6 mb-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex gap-2 mb-5">
            {(['url', 'text'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all"
                style={tab === t ? { background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' } : { background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {t === 'url' ? 'URL' : 'Paste Text'}
              </button>
            ))}
          </div>
          {tab === 'url' ? (
            <input aria-label="Privacy policy URL" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && analyze()}
              placeholder="https://example.com/privacy-policy" className="w-full text-sm text-white placeholder-white/20 outline-none"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 16px' }} />
          ) : (
            <textarea aria-label="Privacy policy text" value={text} onChange={e => setText(e.target.value)} placeholder="Paste the full text of the privacy policy here…" rows={10}
              className="w-full text-sm text-white/80 placeholder-white/20 outline-none resize-y"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '14px 16px', minHeight: 200 }} />
          )}
          <div className="flex justify-between items-center mt-4">
            <button onClick={loadExample} disabled={loading} className="px-4 py-3 rounded-xl text-sm font-bold border transition-colors hover:bg-white/5 disabled:opacity-40" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
              Try Example → Apple Privacy Policy
            </button>
            <button onClick={() => analyze()} disabled={loading || (tab === 'url' ? !url.trim() : !text.trim())}
              className="px-6 py-3 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#ea580c,#c2410c)', boxShadow: '0 0 20px rgba(234,88,12,0.3)' }}>
              {loading ? 'Analyzing policy…' : 'Analyze'}
            </button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-5 py-4 mb-6 text-sm text-red-400">{error}</div>}
        {paywall && !loading && (
          <div className="rounded-2xl border p-8 text-center mb-6" style={{ background: 'rgba(251,146,60,0.05)', borderColor: 'rgba(251,146,60,0.2)' }}>
            <h3 className="text-xl font-black text-white mb-2">Unlimited policy analysis with Pro</h3>
            <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">Pro gives you unlimited GDPR/CCPA analysis and full compliance reports — $79/month.</p>
            <Link href="/pricing" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white" style={{ background: 'linear-gradient(135deg,#ea580c,#c2410c)' }}>Start Pro — $79/month</Link>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-6 mb-4">
                <div className="text-center flex-shrink-0">
                  <div className="text-5xl font-black" style={{ color: scoreColor }}>{result.complianceScore}</div>
                  <div className="text-xs font-black uppercase tracking-widest text-white/35 mt-1">Score / 100</div>
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full" style={{ width: `${result.complianceScore}%`, background: scoreColor, transition: 'width 0.6s ease' }} />
                  </div>
                  <p className="text-sm text-white/60">{result.verdict}</p>
                </div>
              </div>
              <p className="text-xs text-white/45 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border px-5 py-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">GDPR <span className="text-white/20">({result.gdpr.score}/100)</span></div>
                <div className="space-y-2">
                  <Check pass={result.gdpr.lawfulBasis} label="Lawful basis for processing" />
                  <Check pass={result.gdpr.dataMinimization} label="Data minimization" />
                  <Check pass={result.gdpr.userRights} label="User rights (access/delete/portability)" />
                  <Check pass={result.gdpr.dataRetention} label="Retention period stated" />
                  <Check pass={result.gdpr.thirdPartySharing} label="Third-party sharing disclosed" />
                  <Check pass={result.gdpr.dpo} label="DPO or privacy contact" />
                </div>
              </div>
              <div className="rounded-xl border px-5 py-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">CCPA <span className="text-white/20">({result.ccpa.score}/100)</span></div>
                <div className="space-y-2">
                  <Check pass={result.ccpa.optOut} label="Right to opt out of data sale" />
                  <Check pass={result.ccpa.disclosure} label="Categories of PI disclosed" />
                  <Check pass={result.ccpa.financialIncentives} label="Financial incentives addressed" />
                </div>
                {result.retentionPeriod && (
                  <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="text-xs text-white/30 mb-0.5">Data Retention</div>
                    <div className="text-xs font-bold text-white/60">{result.retentionPeriod}</div>
                  </div>
                )}
              </div>
            </div>

            {result.redFlags.length > 0 && (
              <div className="rounded-xl border px-5 py-4" style={{ background: 'rgba(248,113,113,0.05)', borderColor: 'rgba(248,113,113,0.15)' }}>
                <div className="text-xs font-black uppercase tracking-widest text-red-400 mb-3">Red Flags</div>
                <ul className="space-y-1.5">{result.redFlags.map((f, i) => <li key={i} className="text-xs text-white/60 flex gap-2"><span className="text-red-400 flex-shrink-0">!</span>{f}</li>)}</ul>
              </div>
            )}

            {result.missingClauses.length > 0 && (
              <div className="rounded-xl border px-5 py-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Missing Required Clauses</div>
                <ul className="space-y-1.5">{result.missingClauses.map((c, i) => <li key={i} className="text-xs text-white/55 flex gap-2"><span className="text-yellow-400 flex-shrink-0">→</span>{c}</li>)}</ul>
              </div>
            )}

            {(result.dataCollected.length > 0 || result.thirdParties.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.dataCollected.length > 0 && (
                  <div className="rounded-xl border px-5 py-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Data Collected</div>
                    <div className="flex flex-wrap gap-1.5">{result.dataCollected.map(d => <span key={d} className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }}>{d}</span>)}</div>
                  </div>
                )}
                {result.thirdParties.length > 0 && (
                  <div className="rounded-xl border px-5 py-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="text-xs font-black uppercase tracking-widest text-white/35 mb-3">Third Parties</div>
                    <div className="flex flex-wrap gap-1.5">{result.thirdParties.map(p => <span key={p} className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }}>{p}</span>)}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
