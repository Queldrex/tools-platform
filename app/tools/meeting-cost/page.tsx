'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const ROLES = [
  { label: 'Junior Developer', salary: 75000 },
  { label: 'Senior Developer', salary: 130000 },
  { label: 'Engineering Manager', salary: 170000 },
  { label: 'Product Manager', salary: 120000 },
  { label: 'Designer', salary: 95000 },
  { label: 'Sales Rep', salary: 80000 },
  { label: 'Account Executive', salary: 110000 },
  { label: 'VP / Director', salary: 200000 },
  { label: 'C-Suite', salary: 350000 },
  { label: 'Custom', salary: 0 },
]

interface Attendee {
  id: number
  role: string
  salary: number
  count: number
}

let nextId = 1

const HOURLY_MARKUP = 1.25 // benefits / overhead multiplier

function annualToHourly(annual: number): number {
  return (annual * HOURLY_MARKUP) / 2080
}

export default function MeetingCostPage() {
  const [attendees, setAttendees] = useState<Attendee[]>([
    { id: nextId++, role: 'Senior Developer', salary: 130000, count: 3 },
    { id: nextId++, role: 'Engineering Manager', salary: 170000, count: 1 },
    { id: nextId++, role: 'Product Manager', salary: 120000, count: 1 },
  ])
  const [duration, setDuration] = useState(60)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const hourlyTotal = attendees.reduce((sum, a) => sum + annualToHourly(a.salary) * a.count, 0)
  const projectedCost = (hourlyTotal * duration) / 60
  const liveCost = (hourlyTotal * elapsed) / 3600
  const perMinute = hourlyTotal / 60

  function toggleTimer() {
    if (running) {
      clearInterval(intervalRef.current!)
      setRunning(false)
    } else {
      setRunning(true)
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    }
  }

  function resetTimer() {
    clearInterval(intervalRef.current!)
    setRunning(false)
    setElapsed(0)
  }

  useEffect(() => () => clearInterval(intervalRef.current!), [])

  function addAttendee() {
    setAttendees(a => [...a, { id: nextId++, role: 'Senior Developer', salary: 130000, count: 1 }])
  }

  function removeAttendee(id: number) {
    setAttendees(a => a.filter(x => x.id !== id))
  }

  function updateAttendee(id: number, patch: Partial<Attendee>) {
    setAttendees(a => a.map(x => x.id === id ? { ...x, ...patch } : x))
  }

  function handleRoleChange(id: number, role: string) {
    const preset = ROLES.find(r => r.label === role)
    if (preset && preset.salary > 0) {
      updateAttendee(id, { role, salary: preset.salary })
    } else {
      updateAttendee(id, { role })
    }
  }

  const elapsedMins = Math.floor(elapsed / 60)
  const elapsedSecs = elapsed % 60
  const overBudget = elapsed > duration * 60

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
            style={{ borderColor: 'rgba(251,191,36,0.25)', background: 'rgba(251,191,36,0.08)', color: 'rgb(251,191,36)' }}>
            Free Tool · Business
          </div>
          <h1 className="text-3xl font-black text-white mb-1">Meeting Cost Calculator</h1>
          <p className="text-white/40 text-sm">See what your meeting is actually costing the company in real time. Add attendees, set their roles, and watch the cost tick up the moment you start the timer.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ATTENDEES */}
          <div>
            <div className="rounded-2xl border p-5 mb-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">Attendees</p>
              <div className="space-y-3">
                {attendees.map(a => (
                  <div key={a.id} className="rounded-xl border p-3" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <select value={a.role} onChange={e => handleRoleChange(a.id, e.target.value)}
                        className="flex-1 text-xs bg-transparent border rounded-lg px-2 py-1.5 text-white/70 outline-none"
                        style={{ borderColor: 'rgba(255,255,255,0.1)', background: '#0d1117' }}>
                        {ROLES.map(r => <option key={r.label} value={r.label} style={{ background: '#0d1117' }}>{r.label}</option>)}
                      </select>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateAttendee(a.id, { count: Math.max(1, a.count - 1) })}
                          className="w-7 h-7 rounded text-white/50 hover:text-white hover:bg-white/10 transition-all font-bold text-sm">−</button>
                        <span className="text-sm font-bold text-white w-5 text-center">{a.count}</span>
                        <button onClick={() => updateAttendee(a.id, { count: a.count + 1 })}
                          className="w-7 h-7 rounded text-white/50 hover:text-white hover:bg-white/10 transition-all font-bold text-sm">+</button>
                      </div>
                      <button onClick={() => removeAttendee(a.id)} className="text-white/20 hover:text-red-400 transition-colors text-xs px-1">✕</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/30">Salary:</span>
                      <input type="number" value={a.salary} onChange={e => updateAttendee(a.id, { salary: Number(e.target.value) })}
                        className="flex-1 text-xs bg-transparent border rounded px-2 py-1 text-white/60 outline-none font-mono"
                        style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                      <span className="text-[10px] text-white/25">/yr → {fmt(annualToHourly(a.salary))}/hr</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addAttendee}
                className="w-full mt-3 py-2 rounded-xl text-xs font-bold text-white/35 border border-dashed border-white/12 hover:border-white/25 hover:text-white/55 transition-all">
                + Add Attendee
              </button>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-3">Planned Duration</p>
              <div className="flex items-center gap-3">
                {[15, 30, 45, 60, 90, 120].map(d => (
                  <button key={d} onClick={() => setDuration(d)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: duration === d ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                      color: duration === d ? 'rgb(251,191,36)' : 'rgba(255,255,255,0.35)',
                      border: duration === d ? '1px solid rgba(251,191,36,0.3)' : '1px solid transparent',
                    }}>
                    {d < 60 ? `${d}m` : `${d / 60}h`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* COST DISPLAY */}
          <div className="space-y-4">
            {/* Live cost */}
            <div className="rounded-2xl border p-6 text-center" style={{
              background: running ? (overBudget ? 'rgba(248,113,113,0.08)' : 'rgba(251,191,36,0.08)') : '#0d1117',
              borderColor: running ? (overBudget ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.3)') : 'rgba(255,255,255,0.08)',
              transition: 'all 0.3s',
            }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: running ? (overBudget ? '#f87171' : 'rgb(251,191,36)') : 'rgba(255,255,255,0.3)' }}>
                {running ? (overBudget ? 'Over scheduled time' : 'Live meeting cost') : 'Projected cost'}
              </p>
              <p className="text-5xl font-black font-mono mb-1" style={{ color: running ? (overBudget ? '#f87171' : 'rgb(251,191,36)') : 'white' }}>
                {running ? fmt(liveCost) : fmt(projectedCost)}
              </p>
              {running && (
                <p className="text-xl font-mono text-white/50 mt-1">
                  {String(elapsedMins).padStart(2, '0')}:{String(elapsedSecs).padStart(2, '0')}
                  <span className="text-xs ml-2 text-white/30">elapsed</span>
                </p>
              )}
              {!running && elapsed === 0 && (
                <p className="text-sm text-white/30 mt-1">for a {duration}-minute meeting</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Per minute', value: fmt(perMinute) },
                { label: 'Per hour', value: fmt(hourlyTotal) },
                { label: `${duration}min projected`, value: fmt(projectedCost) },
                { label: 'Attendees', value: String(attendees.reduce((s, a) => s + a.count, 0)) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-lg font-black font-mono text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Timer controls */}
            <div className="flex gap-3">
              <button onClick={toggleTimer}
                className="flex-1 py-4 rounded-xl text-sm font-black transition-all"
                style={{
                  background: running ? 'rgba(248,113,113,0.15)' : 'linear-gradient(135deg,rgb(251,191,36),rgb(217,119,6))',
                  color: running ? '#f87171' : '#000',
                  border: running ? '1px solid rgba(248,113,113,0.3)' : 'none',
                  boxShadow: running ? 'none' : '0 0 24px rgba(251,191,36,0.3)',
                }}>
                {running ? 'Pause Meeting' : (elapsed > 0 ? 'Resume' : 'Start Meeting Timer')}
              </button>
              {elapsed > 0 && (
                <button onClick={resetTimer}
                  className="px-5 py-4 rounded-xl text-sm font-bold text-white/35 border border-white/10 hover:text-white/60 transition-all">
                  Reset
                </button>
              )}
            </div>

            <div className="rounded-xl border p-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/25 mb-2">How it's calculated</p>
              <p className="text-xs text-white/35 leading-relaxed">Annual salary ÷ 2,080 working hours × 1.25 overhead multiplier (benefits, office, tools) × meeting duration. This reflects the true all-in cost per employee hour.</p>
            </div>
          </div>
        </div>

        {/* Use cases */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {[
            { title: 'When to use this', body: 'Before scheduling a recurring meeting. If a 10-person weekly 1-hour meeting costs $1,200, that\'s $62K per year.' },
            { title: 'What it changes', body: 'Teams that track meeting cost run shorter meetings, invite fewer people, and cancel unnecessary recurrings.' },
            { title: 'The 1.25x multiplier', body: 'Salary is only part of the cost. Benefits, payroll taxes, and overhead typically add 20–30% on top.' },
          ].map(({ title, body }) => (
            <div key={title} className="rounded-xl border p-4" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold text-white/60 mb-1">{title}</p>
              <p className="text-xs text-white/35 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Real-time cost ticker — see your meeting cost grow by the second, not just at the end.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Add attendees', body: 'Add each attendee with their role and annual salary. Use the role presets (IC, Senior, Lead, Manager, VP, C-Suite) for quick setup.' },
              { n: '02', title: 'Set duration', body: 'Choose planned duration (15, 30, 45, 60, 90, 120 min) and click Start. The ticker runs in real-time using setInterval(1000ms).' },
              { n: '03', title: 'Watch the cost', body: 'Cost per minute = (total_hourly_rate / 60). Turns red when elapsed time exceeds planned duration — instant over-budget alert.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Example — 4 attendees, 45-minute standup</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { role: 'Senior Engineer × 2', salary: '$130,000 × 2', hourly: '$78.13/hr each' },
                { role: 'Engineering Manager', salary: '$160,000', hourly: '$96.15/hr' },
                { role: 'Product Manager', salary: '$140,000', hourly: '$84.13/hr' },
              ].map(r => (
                <div key={r.role} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-white/40">{r.role}</span>
                  <span className="text-xs font-mono text-white/60">{r.hourly}</span>
                </div>
              ))}
              <div className="sm:col-span-2 border-t border-white/8 pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-white/60">45-minute cost</span>
                <span className="text-xl font-black text-cyan-400">$172.13</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
