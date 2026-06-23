'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const WORD_LIST = [
  'anchor','apple','arrow','atlas','badge','banjo','baron','beach','blade','blend',
  'bloom','brave','break','bride','brook','brown','brush','cabin','cable','camel',
  'candy','cargo','cedar','chain','chalk','charm','chase','chest','chief','child',
  'chord','civil','claim','clamp','clash','clasp','cliff','cloud','clown','coach',
  'coast','coral','comet','coral','crane','creek','crest','crisp','cross','crown',
  'cruel','crush','curve','cycle','dance','delta','depot','derby','depth','draft',
  'drift','drill','drive','drome','drone','drown','drums','dunno','dwarf','eagle',
  'earth','ember','epoch','equip','erode','event','exact','exile','extra','fable',
  'facet','faint','faith','false','fancy','feast','fence','field','fixed','flame',
  'flash','flask','fleet','flesh','float','floor','floss','flute','forge','forte',
  'forum','frame','frank','freed','fresh','front','frost','fruit','fully','funky',
  'fused','fuzzy','gamer','gauge','ghost','giant','given','glass','gleam','glide',
  'globe','gloom','gloss','glove','glyph','grace','grade','grain','grand','grant',
  'graph','grasp','grass','grave','graze','great','green','greet','grief','grind',
  'groan','grove','grown','guard','guide','guild','guile','guise','gully','gusto',
  'happy','harbor','harsh','haven','hedge','hinge','hippo','honey','honor','horse',
  'hound','hunch','hunky','hurry','hatch','image','index','indie','inert','infer',
  'inlet','inner','input','inter','intro','ivory','jewel','joker','jolly','jumpy',
  'ketch','knack','knave','kneel','knife','knoll','knot','known','label','lance',
  'lanky','lapel','laser','latch','later','latte','layer','leach','leapt','learn',
  'ledge','lemon','level','lever','light','liner','lingo','lively','llama','lodge',
  'lotus','lover','lower','lucky','lunar','lusty','maple','march','match','mayor',
  'merit','meter','might','mimic','minor','minus','mirth','mixed','model','moist',
]

interface Preset {
  label: string
  length: number
  upper: boolean
  lower: boolean
  numbers: boolean
  symbols: boolean
  count: number
  passphrase: boolean
  wordCount?: number
  hexOnly?: boolean
}

const PRESETS: Preset[] = [
  { label: 'Bank PIN', length: 6, upper: false, lower: false, numbers: true, symbols: false, count: 1, passphrase: false },
  { label: 'WiFi', length: 16, upper: true, lower: true, numbers: true, symbols: false, count: 1, passphrase: false },
  { label: 'API Key', length: 32, upper: false, lower: false, numbers: true, symbols: false, count: 1, passphrase: false, hexOnly: true },
  { label: 'Corporate', length: 20, upper: true, lower: true, numbers: true, symbols: true, count: 1, passphrase: false },
  { label: 'Passphrase', length: 0, upper: false, lower: false, numbers: false, symbols: false, count: 1, passphrase: true, wordCount: 5 },
  { label: 'Master', length: 28, upper: true, lower: true, numbers: true, symbols: true, count: 1, passphrase: false },
]

function generatePassword(length: number, opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }): string {
  const u = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const l = 'abcdefghijklmnopqrstuvwxyz'
  const n = '0123456789'
  const s = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  let charset = ''
  if (opts.upper) charset += u
  if (opts.lower) charset += l
  if (opts.numbers) charset += n
  if (opts.symbols) charset += s
  if (!charset) charset = l
  const array = new Uint32Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, x => charset[x % charset.length]).join('')
}

function generateHexKey(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('')
}

function generatePassphrase(wordCount: number, separator: string): string {
  const arr = new Uint32Array(wordCount)
  crypto.getRandomValues(arr)
  return Array.from(arr, x => WORD_LIST[x % WORD_LIST.length]).join(separator)
}

function calcEntropy(length: number, charsetSize: number): number {
  return Math.floor(length * Math.log2(charsetSize))
}

function passphraseEntropy(wordCount: number): number {
  return Math.floor(wordCount * Math.log2(WORD_LIST.length))
}

function crackTime(entropyBits: number): string {
  const guessesPerSec = 1e12
  const seconds = Math.pow(2, entropyBits) / guessesPerSec
  if (seconds < 1) return 'instantly'
  if (seconds < 60) return `${Math.round(seconds)} seconds`
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`
  if (seconds < 3.154e9) return `${Math.round(seconds / 31536000)} years`
  if (seconds < 3.154e12) return `${(seconds / 3.154e9).toFixed(1)}K years`
  if (seconds < 3.154e15) return `${(seconds / 3.154e12).toFixed(1)}M years`
  return `${(seconds / 3.154e15).toFixed(1)}B years`
}

async function checkBreach(password: string): Promise<number> {
  const msgBuffer = new TextEncoder().encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  const prefix = hashHex.slice(0, 5)
  const suffix = hashHex.slice(5)
  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)
    if (!response.ok) return -1
    const text = await response.text()
    const match = text.split('\n').find(line => line.startsWith(suffix))
    if (!match) return 0
    return parseInt(match.split(':')[1], 10)
  } catch {
    return -1
  }
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

interface SavedRecipe {
  name: string
  settings: {
    length: number; upper: boolean; lower: boolean; numbers: boolean; symbols: boolean
    count: number; mode: string; wordCount: number; separator: string
  }
}

export default function PasswordGeneratorClient() {
  const [length, setLength] = useState(20)
  const [upper, setUpper] = useState(true)
  const [lower, setLower] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [count, setCount] = useState(1)
  const [passwords, setPasswords] = useState<string[]>([])
  const [copied, setCopied] = useState<number | null>(null)
  const [mode, setMode] = useState<'password' | 'passphrase'>('password')
  const [wordCount, setWordCount] = useState(5)
  const [separator, setSeparator] = useState('-')
  const [breachCount, setBreachCount] = useState<number | null>(null)
  const [breachLoading, setBreachLoading] = useState(false)
  const [entropy, setEntropy] = useState(0)
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([])
  const [recipeName, setRecipeName] = useState('')
  const [hexOnly, setHexOnly] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pw-recipes') || '[]')
      setSavedRecipes(saved)
    } catch {}
  }, [])

  const generate = useCallback(() => {
    setBreachCount(null)
    let pws: string[]
    let ent = 0
    if (mode === 'passphrase') {
      pws = Array.from({ length: count }, () => generatePassphrase(wordCount, separator))
      ent = passphraseEntropy(wordCount)
    } else if (hexOnly) {
      pws = Array.from({ length: count }, () => generateHexKey())
      ent = 128
    } else {
      const opts = { upper, lower, numbers, symbols }
      pws = Array.from({ length: count }, () => generatePassword(length, opts))
      let charsetSize = 0
      if (upper) charsetSize += 26
      if (lower) charsetSize += 26
      if (numbers) charsetSize += 10
      if (symbols) charsetSize += 28
      if (charsetSize === 0) charsetSize = 26
      ent = calcEntropy(length, charsetSize)
    }
    setPasswords(pws)
    setEntropy(ent)
  }, [length, upper, lower, numbers, symbols, count, mode, wordCount, separator, hexOnly])

  useEffect(() => { generate() }, [generate])

  function applyPreset(p: Preset) {
    setActivePreset(p.label)
    setHexOnly(!!p.hexOnly)
    if (p.passphrase) {
      setMode('passphrase')
      setWordCount(p.wordCount ?? 5)
    } else {
      setMode('password')
      setLength(p.length)
      setUpper(p.upper)
      setLower(p.lower)
      setNumbers(p.numbers)
      setSymbols(p.symbols)
    }
    setCount(p.count)
  }

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

  function exportTxt() {
    const blob = new Blob([passwords.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'passwords.txt'; a.click()
    URL.revokeObjectURL(url)
  }

  function exportCsv() {
    const rows = passwords.map((pw, i) => `${i + 1},"${pw}",${entropy} bits`)
    const blob = new Blob([['#,Password,Entropy', ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'passwords.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  async function handleBreachCheck() {
    if (!passwords[0]) return
    setBreachLoading(true)
    const result = await checkBreach(passwords[0])
    setBreachCount(result)
    setBreachLoading(false)
  }

  function saveRecipe() {
    if (!recipeName.trim()) return
    const recipe: SavedRecipe = {
      name: recipeName.trim(),
      settings: { length, upper, lower, numbers, symbols, count, mode, wordCount, separator }
    }
    const updated = [...savedRecipes, recipe]
    setSavedRecipes(updated)
    localStorage.setItem('pw-recipes', JSON.stringify(updated))
    setRecipeName('')
  }

  function loadRecipe(r: SavedRecipe) {
    setLength(r.settings.length)
    setUpper(r.settings.upper)
    setLower(r.settings.lower)
    setNumbers(r.settings.numbers)
    setSymbols(r.settings.symbols)
    setCount(r.settings.count)
    setMode(r.settings.mode as 'password' | 'passphrase')
    setWordCount(r.settings.wordCount)
    setSeparator(r.settings.separator)
    setActivePreset(null)
    setHexOnly(false)
  }

  function deleteRecipe(idx: number) {
    const updated = savedRecipes.filter((_, i) => i !== idx)
    setSavedRecipes(updated)
    localStorage.setItem('pw-recipes', JSON.stringify(updated))
  }

  const strength = passwords[0] ? strengthLabel(passwords[0]) : null
  const nistNote = entropy >= 40
    ? entropy >= 60 ? 'Exceeds NIST SP 800-63B minimum' : 'Meets NIST SP 800-63B minimum'
    : 'Below NIST SP 800-63B minimum (15-char)'

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
            Free Tool · No API Key · Client-Side Only
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Password Generator</h1>
          <p className="text-white/40 text-sm mb-4">Generate cryptographically secure passwords and passphrases — with breach detection, entropy scoring, and bulk export. No account, no server, no data sent. License this tool for your platform from $15, or get all 51 tools from $99.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/pricing" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">Get this tool — $15 →</Link>
            <Link href="/pricing" className="text-xs font-bold text-white/40 hover:text-white/60 transition-colors">All 51 tools — from $99 →</Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => applyPreset(p)}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all border"
              style={{
                background: activePreset === p.label ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                borderColor: activePreset === p.label ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.1)',
                color: activePreset === p.label ? '#06d6ff' : 'rgba(255,255,255,0.4)',
              }}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border p-6 mb-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex gap-1 mb-5 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['password', 'passphrase'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setActivePreset(null); setHexOnly(false) }}
                className="flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all"
                style={{
                  background: mode === m ? 'rgba(6,182,212,0.15)' : 'transparent',
                  color: mode === m ? '#06d6ff' : 'rgba(255,255,255,0.3)',
                  border: mode === m ? '1px solid rgba(6,182,212,0.3)' : '1px solid transparent',
                }}>
                {m}
              </button>
            ))}
          </div>

          {mode === 'password' && (
            <>
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/30">Length</span>
                  <span className="text-lg font-black text-white tabular-nums">{hexOnly ? 32 : length}</span>
                </div>
                <input type="range" min={8} max={64} value={length} onChange={e => { setLength(Number(e.target.value)); setActivePreset(null); setHexOnly(false) }}
                  className="w-full" style={{ accentColor: '#06d6ff' }} disabled={hexOnly} />
                <div className="flex justify-between text-xs text-white/20 mt-1"><span>8</span><span>64</span></div>
              </div>
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-3">Character Types</p>
                <div className="grid grid-cols-2 gap-2">
                  <Toggle label="Uppercase A–Z" value={upper} onChange={v => { setUpper(v); setActivePreset(null); setHexOnly(false) }} />
                  <Toggle label="Lowercase a–z" value={lower} onChange={v => { setLower(v); setActivePreset(null); setHexOnly(false) }} />
                  <Toggle label="Numbers 0–9" value={numbers} onChange={v => { setNumbers(v); setActivePreset(null); setHexOnly(false) }} />
                  <Toggle label="Symbols !@#$%" value={symbols} onChange={v => { setSymbols(v); setActivePreset(null); setHexOnly(false) }} />
                </div>
                {hexOnly && <p className="text-xs text-cyan-400/60 mt-2">API Key mode: generating 32-character hex string</p>}
              </div>
            </>
          )}

          {mode === 'passphrase' && (
            <div className="mb-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/30">Words</span>
                  <span className="text-lg font-black text-white tabular-nums">{wordCount}</span>
                </div>
                <input type="range" min={3} max={8} value={wordCount} onChange={e => setWordCount(Number(e.target.value))}
                  className="w-full" style={{ accentColor: '#06d6ff' }} />
                <div className="flex justify-between text-xs text-white/20 mt-1"><span>3</span><span>8</span></div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">Separator</p>
                <div className="flex gap-2 flex-wrap">
                  {['-', ' ', '.', '_'].map(s => (
                    <button key={s} onClick={() => setSeparator(s)}
                      className="px-3 py-1.5 rounded-lg text-sm font-mono font-bold border transition-all"
                      style={{
                        background: separator === s ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                        borderColor: separator === s ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.1)',
                        color: separator === s ? '#06d6ff' : 'rgba(255,255,255,0.4)',
                      }}>
                      {s === ' ' ? '·space·' : `"${s}"`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-white/30">Generate</span>
              <span className="text-sm font-black text-white tabular-nums">{count} password{count > 1 ? 's' : ''}</span>
            </div>
            <input type="range" min={1} max={10} value={count} onChange={e => setCount(Number(e.target.value))}
              className="w-full" style={{ accentColor: '#06d6ff' }} />
          </div>
        </div>

        <div className="space-y-2 mb-3">
          {passwords.map((pw, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
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

        {passwords[0] && (
          <div className="mb-3 px-1">
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={handleBreachCheck} disabled={breachLoading}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
                {breachLoading ? 'Checking...' : 'Check breach status'}
              </button>
              {breachCount === 0 && <span className="text-xs font-bold text-green-400">✓ Not found in any known breach</span>}
              {breachCount !== null && breachCount > 0 && <span className="text-xs font-bold text-red-400">⚠ Found in {breachCount.toLocaleString()} breached databases — regenerate</span>}
              {breachCount === -1 && <span className="text-xs text-white/30">Could not check (network error)</span>}
            </div>
          </div>
        )}

        {entropy > 0 && (
          <div className="rounded-xl border px-4 py-3 mb-3 font-mono text-xs" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.15)', color: '#06d6ff' }}>
            <span>Entropy: {entropy} bits</span>
            <span className="text-white/20 mx-2">·</span>
            <span>Time to crack: {crackTime(entropy)}</span>
            <span className="text-white/20 mx-2">·</span>
            <span style={{ color: entropy >= 40 ? '#4ade80' : '#f87171' }}>{nistNote}</span>
          </div>
        )}

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

        <div className="flex gap-3 mb-4">
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

        {count > 1 && (
          <div className="flex gap-2 mb-5">
            <button onClick={exportTxt}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
              Download .txt
            </button>
            <button onClick={exportCsv}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
              Download .csv
            </button>
          </div>
        )}

        <div className="mb-5">
          <div className="flex gap-2 items-center mb-2">
            <input value={recipeName} onChange={e => setRecipeName(e.target.value)}
              placeholder="Name this recipe…"
              className="flex-1 bg-transparent border rounded-lg px-3 py-1.5 text-xs text-white/70 placeholder-white/20 outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              onKeyDown={e => e.key === 'Enter' && saveRecipe()} />
            <button onClick={saveRecipe}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
              Save recipe
            </button>
          </div>
          {savedRecipes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {savedRecipes.map((r, i) => (
                <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full border text-xs"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                  <button onClick={() => loadRecipe(r)} className="text-white/50 hover:text-white/80 transition-colors font-semibold">{r.name}</button>
                  <button onClick={() => deleteRecipe(i)} className="text-white/20 hover:text-red-400 transition-colors ml-1">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-white/15 mt-2 text-center">
          Uses <code className="text-white/25">crypto.getRandomValues()</code> — cryptographically secure. Passwords never leave your browser.
        </p>

        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-6">Who This Is For</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {[
              { title: 'Security-conscious individuals', body: 'Setting up a password manager and need strong, unique passwords for every account.' },
              { title: 'Sysadmins', body: 'Creating bulk credentials for new user accounts — export as CSV with entropy column.' },
              { title: 'Developers', body: 'Generating API keys, session secrets, and encryption keys locally without sending them to a server.' },
              { title: 'IT teams', body: 'Enforcing corporate password policies with presets for length, complexity, and compliance requirements.' },
            ].map(c => (
              <div key={c.title} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-sm font-black text-white mb-1">{c.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{c.body}</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Cryptographically secure — uses the same randomness source as TLS certificate generation.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Configure your options', body: 'Set length, toggle character sets, choose a preset, or switch to passphrase mode with the EFF-style word list.' },
              { n: '02', title: 'Crypto-secure generation', body: 'crypto.getRandomValues() fills a Uint32Array with true random bytes. Each byte selects a character from your charset.' },
              { n: '03', title: 'Entropy + breach check', body: 'Entropy (bits) and time-to-crack are shown instantly. Check breach status via k-anonymity — your password is never sent.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
