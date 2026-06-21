'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every day at noon', value: '0 12 * * *' },
  { label: 'Every Monday at 9am', value: '0 9 * * 1' },
  { label: 'Every weekday at 8am', value: '0 8 * * 1-5' },
  { label: 'Every Sunday at midnight', value: '0 0 * * 0' },
  { label: 'First of the month', value: '0 0 1 * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Twice a day (noon & midnight)', value: '0 0,12 * * *' },
  { label: 'Every quarter', value: '0 0 1 */3 *' },
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function parsePart(val: string, min: number, max: number): string {
  if (val === '*') return 'every'
  if (val.startsWith('*/')) return `every ${val.slice(2)}`
  if (val.includes('-')) {
    const [a, b] = val.split('-')
    return `${a} through ${b}`
  }
  if (val.includes(',')) return val.split(',').join(', ')
  return val
}

function describeExpression(expr: string): string {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return 'Invalid expression'
  const [min, hour, dom, month, dow] = parts

  const minuteStr = parsePart(min, 0, 59)
  const hourStr = parsePart(hour, 0, 23)
  const domStr = parsePart(dom, 1, 31)
  const monthStr = parsePart(month, 1, 12)
  const dowStr = parsePart(dow, 0, 7)

  if (min === '*' && hour === '*' && dom === '*' && month === '*' && dow === '*') return 'Every minute'

  let result = 'At '
  if (min.startsWith('*/')) result = `Every ${min.slice(2)} minutes`
  else if (hour === '*' && !hour.startsWith('*/')) result = `At minute ${minuteStr} of every hour`
  else {
    const h = parseInt(hour)
    const m = parseInt(min)
    if (!isNaN(h) && !isNaN(m)) {
      const period = h >= 12 ? 'PM' : 'AM'
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
      const displayM = m.toString().padStart(2, '0')
      result = `At ${displayH}:${displayM} ${period}`
    } else {
      result = `At minute ${minuteStr}, hour ${hourStr}`
    }
  }

  if (dow !== '*') {
    const days = dow.includes('-')
      ? `${DAYS[parseInt(dow[0])]} through ${DAYS[parseInt(dow[2])]}`
      : dow.split(',').map(d => DAYS[parseInt(d)] || d).join(', ')
    result += `, every ${days}`
  } else if (dom !== '*') {
    result += `, on day ${domStr} of the month`
  } else {
    result += ', every day'
  }

  if (month !== '*') {
    const months = month.split(',').map(m => MONTHS[parseInt(m) - 1] || m).join(', ')
    result += `, in ${months}`
  }

  return result
}

type FieldMode = 'every' | 'specific' | 'range' | 'step'

interface Field {
  mode: FieldMode
  specific: string
  rangeFrom: string
  rangeTo: string
  step: string
}

function buildPart(field: Field): string {
  switch (field.mode) {
    case 'every': return '*'
    case 'specific': return field.specific || '*'
    case 'range': return `${field.rangeFrom}-${field.rangeTo}`
    case 'step': return `*/${field.step}`
  }
}

function defaultField(): Field {
  return { mode: 'every', specific: '', rangeFrom: '0', rangeTo: '5', step: '5' }
}

function FieldEditor({ label, field, onChange, min, max, names }: {
  label: string; field: Field; onChange: (f: Field) => void; min: number; max: number; names?: string[]
}) {
  const update = (patch: Partial<Field>) => onChange({ ...field, ...patch })

  return (
    <div className="rounded-xl border p-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
      <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-3">{label}</p>
      <div className="flex gap-1 mb-3">
        {(['every', 'specific', 'range', 'step'] as FieldMode[]).map(m => (
          <button key={m} onClick={() => update({ mode: m })}
            className="flex-1 text-[10px] font-bold py-1.5 rounded-lg capitalize transition-all"
            style={{
              background: field.mode === m ? '#06d6ff' : 'rgba(255,255,255,0.05)',
              color: field.mode === m ? '#000' : 'rgba(255,255,255,0.35)',
            }}>
            {m}
          </button>
        ))}
      </div>
      {field.mode === 'specific' && (
        names ? (
          <div className="flex flex-wrap gap-1">
            {names.map((n, i) => {
              const isSelected = field.specific.split(',').includes(String(min + i))
              return (
                <button key={n} onClick={() => {
                  const current = field.specific ? field.specific.split(',').filter(Boolean) : []
                  const val = String(min + i)
                  const next = isSelected ? current.filter(x => x !== val) : [...current, val].sort((a, b) => +a - +b)
                  update({ specific: next.join(',') || '*' })
                }}
                  className="text-[10px] font-bold px-2 py-1 rounded transition-all"
                  style={{
                    background: isSelected ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)',
                    color: isSelected ? '#06d6ff' : 'rgba(255,255,255,0.4)',
                    border: isSelected ? '1px solid rgba(6,182,212,0.35)' : '1px solid rgba(255,255,255,0.07)',
                  }}>
                  {n}
                </button>
              )
            })}
          </div>
        ) : (
          <input value={field.specific} onChange={e => update({ specific: e.target.value })}
            placeholder={`e.g. ${min},${min+2},${min+5}`}
            className="w-full text-xs bg-transparent border rounded px-3 py-2 text-white/70 outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        )
      )}
      {field.mode === 'range' && (
        <div className="flex items-center gap-2">
          <input value={field.rangeFrom} onChange={e => update({ rangeFrom: e.target.value })}
            type="number" min={min} max={max}
            className="flex-1 text-xs bg-transparent border rounded px-3 py-2 text-white/70 outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          <span className="text-white/25 text-xs">to</span>
          <input value={field.rangeTo} onChange={e => update({ rangeTo: e.target.value })}
            type="number" min={min} max={max}
            className="flex-1 text-xs bg-transparent border rounded px-3 py-2 text-white/70 outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        </div>
      )}
      {field.mode === 'step' && (
        <div className="flex items-center gap-2">
          <span className="text-white/25 text-xs">Every</span>
          <input value={field.step} onChange={e => update({ step: e.target.value })}
            type="number" min={1} max={max}
            className="w-20 text-xs bg-transparent border rounded px-3 py-2 text-white/70 outline-none"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          <span className="text-white/25 text-xs">units</span>
        </div>
      )}
    </div>
  )
}

export default function CronBuilderPage() {
  const [minute, setMinute] = useState<Field>(defaultField())
  const [hour, setHour] = useState<Field>(defaultField())
  const [dom, setDom] = useState<Field>(defaultField())
  const [month, setMonth] = useState<Field>(defaultField())
  const [dow, setDow] = useState<Field>(defaultField())
  const [copied, setCopied] = useState(false)
  const [rawInput, setRawInput] = useState('')

  const expression = rawInput || [
    buildPart(minute), buildPart(hour), buildPart(dom), buildPart(month), buildPart(dow)
  ].join(' ')

  const description = describeExpression(expression)

  function applyPreset(val: string) {
    setRawInput('')
    const [m, h, d, mo, dw] = val.split(' ')
    const parse = (v: string): Field => {
      if (v === '*') return { ...defaultField(), mode: 'every' }
      if (v.startsWith('*/')) return { ...defaultField(), mode: 'step', step: v.slice(2) }
      if (v.includes('-')) {
        const [a, b] = v.split('-')
        return { ...defaultField(), mode: 'range', rangeFrom: a, rangeTo: b }
      }
      return { ...defaultField(), mode: 'specific', specific: v }
    }
    setMinute(parse(m)); setHour(parse(h)); setDom(parse(d)); setMonth(parse(mo)); setDow(parse(dw))
  }

  function copy() {
    navigator.clipboard.writeText(expression)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
            style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'rgba(99,102,241,0.08)', color: 'rgb(99,102,241)' }}>
            Free Tool · Developer
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Cron Expression Builder</h1>
          <p className="text-white/40 text-sm">Build and understand cron schedules visually. Paste an expression to decode it, or use the editor to build one from scratch.</p>
        </div>

        {/* Raw input */}
        <div className="rounded-2xl border overflow-hidden mb-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
            <span className="text-xs font-bold text-white/25 uppercase tracking-widest">Expression</span>
            <button onClick={copy}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: copied ? 'rgba(74,222,128,0.12)' : 'rgba(6,182,212,0.1)',
                color: copied ? '#4ade80' : '#06d6ff',
                border: `1px solid ${copied ? 'rgba(74,222,128,0.25)' : 'rgba(6,182,212,0.25)'}`,
              }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="p-4">
            <code className="block text-2xl font-black text-white font-mono tracking-widest mb-3">{expression}</code>
            <p className="text-sm text-cyan-400 font-medium">{description}</p>
          </div>
          <div className="px-4 pb-4">
            <input value={rawInput} onChange={e => setRawInput(e.target.value)}
              placeholder="Or paste an existing cron expression to decode it..."
              className="w-full text-xs bg-transparent border rounded-lg px-3 py-2.5 text-white/60 outline-none placeholder:text-white/20 font-mono"
              style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          </div>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-3">Common Schedules</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button key={p.value} onClick={() => applyPreset(p.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual builder */}
        {!rawInput && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-white/25">Visual Builder</p>
            <FieldEditor label="Minute (0–59)" field={minute} onChange={setMinute} min={0} max={59} />
            <FieldEditor label="Hour (0–23)" field={hour} onChange={setHour} min={0} max={23} />
            <FieldEditor label="Day of Month (1–31)" field={dom} onChange={setDom} min={1} max={31} />
            <FieldEditor label="Month" field={month} onChange={setMonth} min={1} max={12} names={MONTHS} />
            <FieldEditor label="Day of Week" field={dow} onChange={setDow} min={0} max={6} names={DAYS} />
          </div>
        )}

        <div className="mt-6 rounded-xl border p-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-2">How to implement</p>
          <p className="text-xs text-white/40 mb-2">Paste the expression into your scheduler:</p>
          <div className="space-y-1">
            {[
              ['Node.js / node-cron', `cron.schedule('${expression}', () => { /* your task */ })`],
              ['Linux crontab', `${expression}  /path/to/script.sh`],
              ['GitHub Actions', `schedule:\n  - cron: '${expression}'`],
              ['Vercel Cron (vercel.json)', `"crons": [{"path": "/api/cron", "schedule": "${expression}"}]`],
            ].map(([label, code]) => (
              <div key={label as string}>
                <p className="text-[10px] text-white/25 mb-0.5">{label}</p>
                <code className="block text-[11px] text-white/50 font-mono break-all">{code}</code>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Build, validate, and explain cron schedules with point-and-click simplicity.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Visual field editor', body: 'Each of the 5 cron fields (minute, hour, day, month, weekday) has a dropdown — no memorizing syntax needed.' },
              { n: '02', title: 'Human description', body: 'The expression is translated to plain English in real-time: "0 9 * * 1" → "Every Monday at 9:00 AM".' },
              { n: '03', title: 'Copy-ready code', body: 'Implementation snippets for Node.js (node-cron), Linux crontab, GitHub Actions, and Vercel crons are shown instantly.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Example expressions</p>
            <div className="space-y-2">
              {[
                { expr: '0 9 * * 1', desc: 'Every Monday at 9:00 AM' },
                { expr: '*/15 * * * *', desc: 'Every 15 minutes' },
                { expr: '0 0 1 * *', desc: 'First day of every month at midnight' },
                { expr: '0 6,18 * * *', desc: 'At 6:00 AM and 6:00 PM every day' },
                { expr: '0 2 * * 0', desc: 'Every Sunday at 2:00 AM' },
              ].map(r => (
                <div key={r.expr} className="flex items-center gap-4">
                  <code className="text-sm font-mono text-cyan-400/80 w-32 flex-shrink-0">{r.expr}</code>
                  <span className="text-xs text-white/50">{r.desc}</span>
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
