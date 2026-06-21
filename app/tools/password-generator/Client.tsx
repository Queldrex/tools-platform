'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function generatePassword(length: number, opts: {
  upper: boolean; lower: boolean; numbers: boolean; symbols: boolean
}): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  let charset = ''
  if (opts.upper) charset += upper
  if (opts.lower) charset += lower
  if (opts.numbers) charset += numbers
  if (opts.symbols) charset += symbols
  if (!charset) charset = lower

  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, x => charset[x % charset.length]).join('')
}

function strengthLabel(pw: string): { label: string; color: string; width: string } {
  let score = 0
  if (pw.length >= 12) score++
  if (pw.length >= 16) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 2) return { label: 'Weak', color: '#f87171', width: '25%' }
  if (score <= 3) return { label: 'Fair', color: '#fbbf24', width: '50%' }
  if (score <= 4) return { label: 'Good', color: '#34d399', width: '75%' }
  return { label: 'Strong', color: '#06d6ff', width: '100%' }
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(20)
  const [upper, setUpper] = useState(true)
  const [lower, setLower] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [count, setCount] = useState(1)
  const [passwords, setPasswords] = useState<string[]>([])
  const [copied, setCopied] = useState<number | null>(null)

  const generate = useCallback(() => {
    const opts = { upper, lower, numbers, symbols }
    setPasswords(Array.from({ length: count }, () => generatePassword(length, opts)))
  }, [length, upper, lower, numbers, symbols, count])

  useEffect(() => { generate() }, [generate])

  function copy(pw: string, idx: number) {
    navigator.clipboard.writeText(pw)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  function copyAll() {
    navigator.clipboard.writeText(passwords.join('\n'))
    setCopied(-1)
    setTimeout(() => setCopied(null), 2000)
  }

  const strength = passwords[0] ? strengthLabel(passwords[0]) : null

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all text-sm font-semibold"
      style={{
        background: value ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.03)',
        borderColor: value ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.08)',
        color: value ? '#06d6ff' : 'rgba(255,255,255,0.35)',
      }}>
      <span className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
        style={{ background: value ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.07)', border: value ? '1px solid rgba(6,182,212,0.5)' : '1px solid rgba(255,255,255,0.15)' }}>
        {value && <svg className="w-2.5 h-2.5 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
      </span>
      {label}
    </button>
  )

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
            style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.08)', color: 'rgb(99,102,241)' }}>
            Free Tool · Security
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Password Generator</h1>
          <p className="text-white/40 text-sm">Generate cryptographically secure passwords. Everything runs in your browser — passwords are never sent anywhere.</p>
        </div>

        <div className="rounded-2xl border p-6 mb-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-white/30">Length</span>
              <span className="text-lg font-black text-white tabular-nums">{length}</span>
            </div>
            <input type="range" min={8} max={64} value={length} onChange={e => setLength(Number(e.target.value))}
              className="w-full" style={{ accentColor: '#06d6ff' }} />
            <div className="flex justify-between text-xs text-white/20 mt-1">
              <span>8</span><span>64</span>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Character Types</p>
            <div className="grid grid-cols-2 gap-2">
              <Toggle label="Uppercase A–Z" value={upper} onChange={setUpper} />
              <Toggle label="Lowercase a–z" value={lower} onChange={setLower} />
              <Toggle label="Numbers 0–9" value={numbers} onChange={setNumbers} />
              <Toggle label="Symbols !@#$%" value={symbols} onChange={setSymbols} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-white/30">Generate</span>
              <span className="text-sm font-black text-white tabular-nums">{count} password{count > 1 ? 's' : ''}</span>
            </div>
            <input type="range" min={1} max={10} value={count} onChange={e => setCount(Number(e.target.value))}
              className="w-full" style={{ accentColor: '#06d6ff' }} />
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {passwords.map((pw, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border px-4 py-3 group" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <code className="flex-1 text-sm text-white/80 font-mono break-all leading-relaxed">{pw}</code>
              <button onClick={() => copy(pw, i)}
                className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: copied === i ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
                  color: copied === i ? '#4ade80' : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${copied === i ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                {copied === i ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>

        {strength && (
          <div className="rounded-xl border p-4 mb-5" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Strength</span>
              <span className="text-xs font-black" style={{ color: strength.color }}>{strength.label}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: strength.width, background: strength.color }} />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={generate}
            className="flex-1 py-3.5 rounded-xl text-sm font-black text-black transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.25)' }}>
            Regenerate
          </button>
          {count > 1 && (
            <button onClick={copyAll}
              className="px-5 py-3.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: copied === -1 ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
                color: copied === -1 ? '#4ade80' : 'rgba(255,255,255,0.55)',
                border: `1px solid ${copied === -1 ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.1)'}`,
              }}>
              {copied === -1 ? 'All Copied!' : 'Copy All'}
            </button>
          )}
        </div>

        <p className="text-xs text-white/15 mt-6 text-center">
          Uses <code className="text-white/25">crypto.getRandomValues()</code> — cryptographically secure randomness. Passwords are generated in your browser and never transmitted.
        </p>

        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Cryptographically secure — uses the same randomness source as TLS certificate generation.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Configure your options', body: 'Set length (8–64 chars), toggle character sets (uppercase, lowercase, numbers, symbols), and how many passwords to generate.' },
              { n: '02', title: 'Crypto-secure generation', body: 'crypto.getRandomValues() fills a Uint32Array with true random bytes. Each byte picks a character from your selected charset.' },
              { n: '03', title: 'Strength check & copy', body: 'Strength is calculated from entropy (log2 of charset^length). Click any password to copy it instantly.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Example — 24 chars, all sets enabled</p>
            <div className="space-y-2">
              {['K#7mQzN2@vRpT9xL!dB4sWfY', 'h3@XwQm!KpZ8jNtR#2vYcL5s', 'P!9kMnX4@rZqT7vW#2jHbF6c'].map((pw, i) => (
                <div key={i} className="flex items-center gap-3">
                  <code className="flex-1 text-sm font-mono text-green-400/80 bg-black/30 rounded-lg px-3 py-2">{pw}</code>
                  <span className="text-[10px] font-black text-green-400 border border-green-400/20 px-2 py-1 rounded">STRONG</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
