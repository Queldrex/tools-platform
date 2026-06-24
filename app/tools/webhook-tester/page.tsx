'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface WebhookEvent {
  id: string
  method: string
  headers: Record<string, string>
  body: string
  timestamp: string
  contentType: string | null
  query: Record<string, string>
}

function genId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('')
}

const METHOD_COLOR: Record<string, string> = {
  POST: '#60a5fa',
  GET: '#4ade80',
  PUT: '#facc15',
  PATCH: '#fb923c',
  DELETE: '#f87171',
}

function formatBody(body: string, contentType: string | null) {
  if (!body) return '(empty body)'
  if (contentType?.includes('application/json') || contentType?.includes('json')) {
    try { return JSON.stringify(JSON.parse(body), null, 2) } catch { /* not valid json */ }
  }
  return body
}

export default function WebhookTesterPage() {
  const [endpointId, setEndpointId] = useState('')
  useEffect(() => { setEndpointId(genId()) }, [])
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)
  const [curlCopied, setCurlCopied] = useState(false)
  const [showHeaders, setShowHeaders] = useState<Set<string>>(new Set())
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const seenIds = useRef<Set<string>>(new Set())

  const endpointUrl = `https://queldrex.com/api/tools/webhook-tester/${endpointId}`

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/tools/webhook-tester/${endpointId}/events`)
      if (!res.ok) return
      const data = await res.json()
      const newEvents: WebhookEvent[] = (data.events || []).filter((e: WebhookEvent) => !seenIds.current.has(e.id))
      if (newEvents.length > 0) {
        newEvents.forEach(e => seenIds.current.add(e.id))
        setEvents(prev => [...newEvents, ...prev].slice(0, 20))
      }
    } catch { /* ignore */ }
  }, [endpointId])

  useEffect(() => {
    pollRef.current = setInterval(poll, 2000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [poll])

  const copyUrl = () => {
    navigator.clipboard.writeText(endpointUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearEvents = async () => {
    await fetch(`/api/tools/webhook-tester/${endpointId}/events`, { method: 'DELETE' })
    setEvents([])
    seenIds.current.clear()
  }

  const toggle = (id: string) => setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleHeaders = (id: string) => setShowHeaders(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const relTime = (ts: string) => {
    const diff = Math.round((Date.now() - new Date(ts).getTime()) / 1000)
    if (diff < 5) return 'just now'
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`
    return new Date(ts).toLocaleTimeString()
  }

  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/tools" className="text-xs font-semibold text-white/35 hover:text-white/60 transition-colors flex items-center gap-1.5 mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>All Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border" style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.08)' }}>Free</span>
          <span className="text-sm font-bold text-white/30">No account required · Endpoints expire in 1 hour</span>
        </div>

        <h1 className="text-4xl font-black text-white mb-3">Webhook <span style={{ color: '#a78bfa' }}>Tester</span></h1>
        <p className="text-white/55 text-base mb-4 max-w-2xl">Get a unique endpoint URL, send webhooks to it from Stripe, GitHub, or any service, and inspect every request in real time.</p>
        <div className="flex gap-3 flex-wrap mb-8">
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl text-black" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Get this tool — $29 →</Link>
          <Link href="/pricing" className="inline-flex items-center gap-1 text-sm font-black px-4 py-2 rounded-xl border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>All 51 tools — from $99 →</Link>
        </div>

        {/* Endpoint URL */}
        <div className="rounded-2xl border p-6 mb-8" style={{ background: '#111318', borderColor: 'rgba(167,139,250,0.2)' }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: '#a78bfa' }}>Your Webhook Endpoint</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm font-mono text-white break-all py-3 px-4 rounded-xl" style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)' }}>
              {endpointUrl}
            </code>
            <button
              onClick={copyUrl}
              className="px-4 py-3 rounded-xl text-sm font-black whitespace-nowrap transition-all"
              style={copied
                ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }
                : { background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff' }}
            >
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2 p-2 rounded-lg font-mono text-xs" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <code className="flex-1 text-white/40 truncate">{`curl -X POST ${endpointUrl} -H "Content-Type: application/json" -d '{"test":true}'`}</code>
              <button onClick={() => {
                navigator.clipboard.writeText(`curl -X POST ${endpointUrl} -H "Content-Type: application/json" -d '{"test":true}'`)
                setCurlCopied(true)
                setTimeout(() => setCurlCopied(false), 2000)
              }} className="text-xs font-bold px-2 py-1 rounded flex-shrink-0" style={{ background: 'rgba(6,214,255,0.08)', color: '#06d6ff' }}>
                {curlCopied ? 'Copied!' : 'Copy curl'}
              </button>
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: '#A1A1AA' }}>Accepts all HTTP methods (GET, POST, PUT, PATCH, DELETE). Stores up to 20 requests. Endpoint expires in 1 hour and is unique to this browser session.</p>
        </div>

        {/* Events list */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#a78bfa' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#a78bfa' }} />
              </span>
              <span className="text-sm font-black text-white">
                {events.length === 0 ? 'Waiting for webhooks…' : `${events.length} request${events.length !== 1 ? 's' : ''} received`}
              </span>
            </div>
          </div>
          {events.length > 0 && (
            <button onClick={clearEvents} className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: '#A1A1AA', border: '1px solid rgba(255,255,255,0.1)' }}>
              Clear all
            </button>
          )}
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border p-12 text-center" style={{ background: '#111318', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(167,139,250,0.1)' }}>
              <svg className="w-6 h-6" style={{ color: '#a78bfa' }} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"/></svg>
            </div>
            <p className="font-black text-white mb-2">Listening for requests</p>
            <p className="text-sm" style={{ color: '#A1A1AA' }}>Copy the URL above and configure it as a webhook in Stripe, GitHub, Slack, or any other service. Requests will appear here instantly.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <button
                  onClick={() => toggle(event.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                  style={{ background: '#111318' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black px-2 py-1 rounded font-mono" style={{ background: `${METHOD_COLOR[event.method] ?? '#A1A1AA'}15`, color: METHOD_COLOR[event.method] ?? '#A1A1AA', border: `1px solid ${METHOD_COLOR[event.method] ?? '#A1A1AA'}33` }}>
                      {event.method}
                    </span>
                    <span className="text-xs text-white font-mono">/api/tools/webhook-tester/{endpointId}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: '#A1A1AA' }}>{relTime(event.timestamp)}</span>
                    <svg className={`w-4 h-4 transition-transform ${expanded.has(event.id) ? 'rotate-180' : ''}`} style={{ color: '#A1A1AA' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </button>

                {expanded.has(event.id) && (
                  <div className="border-t px-5 py-4 space-y-4" style={{ background: '#0a0f1a', borderColor: 'rgba(255,255,255,0.05)' }}>
                    {/* Content-Type */}
                    {event.contentType && (
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#A1A1AA' }}>Content-Type</p>
                        <code className="text-xs font-mono text-white/60">{event.contentType}</code>
                      </div>
                    )}

                    {/* Query params */}
                    {Object.keys(event.query).length > 0 && (
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#A1A1AA' }}>Query Params</p>
                        <div className="space-y-1">
                          {Object.entries(event.query).map(([k, v]) => (
                            <div key={k} className="flex gap-2 text-xs font-mono">
                              <span className="text-white/60">{k}</span>
                              <span style={{ color: '#A1A1AA' }}>=</span>
                              <span className="text-white/40">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Body */}
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#A1A1AA' }}>Body</p>
                      <pre className="text-xs font-mono text-white/60 whitespace-pre-wrap break-all p-3 rounded-lg overflow-auto max-h-64" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {formatBody(event.body, event.contentType)}
                      </pre>
                    </div>

                    {/* Headers toggle */}
                    <div>
                      <button onClick={() => toggleHeaders(event.id)} className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: '#A1A1AA' }}>
                        <svg className={`w-3 h-3 transition-transform ${showHeaders.has(event.id) ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                        Headers ({Object.keys(event.headers).length})
                      </button>
                      {showHeaders.has(event.id) && (
                        <div className="mt-2 space-y-1">
                          {Object.entries(event.headers).map(([k, v]) => (
                            <div key={k} className="flex gap-2 text-xs font-mono">
                              <span className="text-white/50 flex-shrink-0">{k}:</span>
                              <span className="text-white/30 break-all">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <section className="mt-14 max-w-2xl">
          <h2 className="text-base font-black text-white mb-4">Who This Is For</h2>
          <ul className="space-y-2">
            {[
              'Backend developers testing webhook integrations with Stripe, GitHub, or Slack',
              'DevOps engineers debugging event-driven pipelines without exposing local ports',
              'QA engineers verifying webhook payload structures during API development',
              'Developers building automations who need to inspect raw HTTP requests',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#A1A1AA' }}>
                <span className="text-violet-400 flex-shrink-0 mt-0.5">→</span>{item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 pt-8 border-t max-w-2xl" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-lg font-black text-white mb-4">What is a webhook and how do you test one?</h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>A webhook is an HTTP callback — when an event happens in a third-party service (a Stripe payment, a GitHub push, a form submission), that service makes a POST request to your URL with the event data. Testing webhooks is hard during development because your localhost isn&apos;t publicly reachable. This tool gives you a real HTTPS URL that any external service can reach immediately, with no tunneling software needed.</p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#A1A1AA' }}>To test a Stripe webhook: copy the endpoint URL above, go to Stripe Dashboard → Developers → Webhooks → Add endpoint, paste the URL, select the event types you want to test (e.g. checkout.session.completed), and trigger a test event. You&apos;ll see the full JSON payload here within seconds, including all headers Stripe sends (including its stripe-signature header for verification).</p>
          <p className="text-sm leading-relaxed" style={{ color: '#A1A1AA' }}>For GitHub webhooks: go to your repository Settings → Webhooks → Add webhook, paste the URL as the Payload URL, set Content-Type to application/json, and select which events to receive. Every push, pull request, issue, or deployment event will show up here with the full payload. Use this to understand the exact shape of the JSON your webhook handler needs to parse before writing a single line of code.</p>
        </section>
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(6,214,255,0.04)', borderColor: 'rgba(6,214,255,0.12)' }}>
          <p className="text-white font-black mb-1">Add webhook testing to your platform</p>
          <p className="text-white/40 text-sm mb-4">Unique endpoints, live polling, payload inspection, curl snippets. One-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Get this tool — $29 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $99 →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
