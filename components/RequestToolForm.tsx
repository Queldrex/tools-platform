'use client'
import { useState } from 'react'

export default function RequestToolForm() {
  const [form, setForm] = useState({ name: '', email: '', toolName: '', description: '', category: '', useCase: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/tool-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const input = 'w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all'
  const inputStyle = { background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', color: 'white' }
  const focusStyle = 'focus:border-violet-500/50'

  if (status === 'done') {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">✓</div>
        <p className="text-lg font-black text-white mb-2">Request submitted.</p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>We review every request. If we build it, you'll hear from us first.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="grid gap-4 max-w-xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Your name</label>
          <input required value={form.name} onChange={set('name')} placeholder="Alex Jordan" className={`${input} ${focusStyle}`} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Email</label>
          <input required type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" className={`${input} ${focusStyle}`} style={inputStyle} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Tool name</label>
        <input required value={form.toolName} onChange={set('toolName')} placeholder="e.g. Uptime Monitor, PDF Invoice Parser" className={`${input} ${focusStyle}`} style={inputStyle} />
      </div>

      <div>
        <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>What should it do?</label>
        <textarea required value={form.description} onChange={set('description')} rows={3}
          placeholder="Describe what the tool does and what problem it solves..."
          className={`${input} ${focusStyle} resize-none`} style={inputStyle} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Category</label>
          <select value={form.category} onChange={set('category')} className={`${input} ${focusStyle}`} style={inputStyle}>
            <option value="">Any</option>
            <option value="AI Visibility">AI Visibility</option>
            <option value="Security">Security</option>
            <option value="Developer">Developer</option>
            <option value="Business">Business</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Your use case <span style={{ color: 'rgba(255,255,255,0.2)' }}>(optional)</span></label>
          <input value={form.useCase} onChange={set('useCase')} placeholder="e.g. We run 50 client sites" className={`${input} ${focusStyle}`} style={inputStyle} />
        </div>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-400">Something went wrong. Try again or email hello@queldrex.com.</p>
      )}

      <button type="submit" disabled={status === 'loading'}
        className="w-full py-3.5 rounded-xl text-sm font-black text-white transition-all hover:scale-[1.01] disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 0 24px rgba(109,40,217,0.3)' }}>
        {status === 'loading' ? 'Submitting…' : 'Submit request →'}
      </button>
    </form>
  )
}
