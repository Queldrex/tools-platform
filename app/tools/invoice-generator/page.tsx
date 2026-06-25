'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface LineItem { description: string; qty: number; rate: number }

interface InvoiceData {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  fromName: string
  fromEmail: string
  fromAddress: string
  fromCity: string
  fromState: string
  fromZip: string
  toName: string
  toEmail: string
  toAddress: string
  toCity: string
  toState: string
  toZip: string
  items: LineItem[]
  taxRate: number
  discount: number
  notes: string
  currency: string
  accentColor: string
}

const today = new Date().toISOString().slice(0, 10)
const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)

const DEFAULTS: InvoiceData = {
  invoiceNumber: 'INV-001',
  issueDate: today,
  dueDate,
  fromName: '',
  fromEmail: '',
  fromAddress: '',
  fromCity: '',
  fromState: '',
  fromZip: '',
  toName: '',
  toEmail: '',
  toAddress: '',
  toCity: '',
  toState: '',
  toZip: '',
  items: [
    { description: 'Consulting Services', qty: 1, rate: 0 },
  ],
  taxRate: 0,
  discount: 0,
  notes: 'Thank you for your business. Payment is due within 30 days.',
  currency: 'USD',
  accentColor: '#06d6ff',
}

type PaymentTerms = 'due-on-receipt' | 'net-15' | 'net-30' | 'net-60'

function computeDueDate(invoiceDate: string, terms: PaymentTerms): string {
  if (terms === 'due-on-receipt') return invoiceDate
  const days = parseInt(terms.split('-')[1])
  const d = new Date(invoiceDate || Date.now())
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export default function InvoiceGeneratorPage() {
  const [data, setData] = useState<InvoiceData>(DEFAULTS)
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('net-30')
  const [isPaid, setIsPaid] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const update = (patch: Partial<InvoiceData>) => setData(d => ({ ...d, ...patch }))
  const updateItem = (idx: number, patch: Partial<LineItem>) =>
    setData(d => ({ ...d, items: d.items.map((it, i) => i === idx ? { ...it, ...patch } : it) }))

  function addItem() { update({ items: [...data.items, { description: '', qty: 1, rate: 0 }] }) }
  function removeItem(idx: number) { update({ items: data.items.filter((_, i) => i !== idx) }) }

  const subtotal = data.items.reduce((sum, it) => sum + it.qty * it.rate, 0)
  const discountAmt = (subtotal * data.discount) / 100
  const taxableAmt = subtotal - discountAmt
  const taxAmt = (taxableAmt * data.taxRate) / 100
  const total = taxableAmt + taxAmt

  function print() {
    const style = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 48px; color: #111; font-size: 13px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }
        .brand { font-size: 24px; font-weight: 900; color: ${data.accentColor}; }
        .invoice-label { text-align: right; }
        .invoice-label h1 { font-size: 28px; font-weight: 900; color: #111; }
        .invoice-label p { color: #666; font-size: 12px; margin-top: 4px; }
        .parties { display: flex; gap: 64px; margin-bottom: 40px; }
        .party h3 { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #999; margin-bottom: 8px; }
        .party p { color: #333; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead th { background: ${data.accentColor}15; padding: 10px 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #555; text-align: left; border-bottom: 2px solid ${data.accentColor}40; }
        thead th:last-child, thead th:nth-last-child(2), thead th:nth-last-child(3) { text-align: right; }
        tbody td { padding: 10px 12px; border-bottom: 1px solid #eee; color: #333; }
        tbody td:last-child, tbody td:nth-last-child(2), tbody td:nth-last-child(3) { text-align: right; font-variant-numeric: tabular-nums; }
        .totals { margin-left: auto; width: 280px; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #555; border-bottom: 1px solid #f0f0f0; }
        .totals-row.total { font-size: 16px; font-weight: 900; color: #111; border-bottom: none; padding-top: 12px; }
        .notes { margin-top: 40px; padding-top: 24px; border-top: 1px solid #eee; font-size: 12px; color: #888; }
        .accent-bar { height: 4px; background: ${data.accentColor}; border-radius: 2px; margin-bottom: 4px; width: 40px; }
      </style>
    `

    const fromAddr = [data.fromAddress, data.fromCity, data.fromState, data.fromZip].filter(Boolean).join(', ')
    const toAddr = [data.toAddress, data.toCity, data.toState, data.toZip].filter(Boolean).join(', ')

    const html = `<!DOCTYPE html><html><head>${style}</head><body>
      <div class="header">
        <div>
          <div class="brand">${data.fromName}</div>
          ${data.fromEmail ? `<div style="color:#666;font-size:12px;margin-top:4px;">${data.fromEmail}</div>` : ''}
          ${fromAddr ? `<div style="color:#666;font-size:12px;margin-top:2px;">${fromAddr}</div>` : ''}
        </div>
        <div class="invoice-label">
          <h1>INVOICE</h1>
          <p>#${data.invoiceNumber}</p>
          <p style="margin-top:8px;">Issue date: <strong>${data.issueDate}</strong></p>
          <p>Due date: <strong style="color:${data.accentColor};">${computeDueDate(data.issueDate, paymentTerms)}</strong></p>
          <p style="color:#999;font-size:11px;">Payment terms: ${paymentTerms === 'due-on-receipt' ? 'Due on Receipt' : paymentTerms.toUpperCase().replace('-', ' ')}</p>
        </div>
      </div>

      <div class="parties">
        <div class="party">
          <h3>From</h3>
          <p><strong>${data.fromName}</strong></p>
          ${data.fromEmail ? `<p>${data.fromEmail}</p>` : ''}
          ${fromAddr ? `<p>${fromAddr}</p>` : ''}
        </div>
        <div class="party">
          <h3>Bill To</h3>
          <p><strong>${data.toName}</strong></p>
          ${data.toEmail ? `<p>${data.toEmail}</p>` : ''}
          ${toAddr ? `<p>${toAddr}</p>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align:right;width:60px;">Qty</th>
            <th style="text-align:right;width:100px;">Rate</th>
            <th style="text-align:right;width:110px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(it => `
            <tr>
              <td>${it.description}</td>
              <td style="text-align:right;">${it.qty}</td>
              <td style="text-align:right;">${formatCurrency(it.rate, data.currency)}</td>
              <td style="text-align:right;">${formatCurrency(it.qty * it.rate, data.currency)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(subtotal, data.currency)}</span></div>
        ${data.discount > 0 ? `<div class="totals-row"><span>Discount (${data.discount}%)</span><span>−${formatCurrency(discountAmt, data.currency)}</span></div>` : ''}
        ${data.taxRate > 0 ? `<div class="totals-row"><span>Tax (${data.taxRate}%)</span><span>${formatCurrency(taxAmt, data.currency)}</span></div>` : ''}
        <div class="totals-row total" style="margin-top:8px;border-top:2px solid ${data.accentColor};padding-top:12px;">
          <span>Total Due</span><span style="color:${data.accentColor};">${formatCurrency(total, data.currency)}</span>
        </div>
      </div>

      ${data.notes ? `<div class="notes"><div class="accent-bar"></div><p>${data.notes}</p></div>` : ''}
      ${isPaid ? `<div style="position:fixed;top:40%;left:50%;transform:translate(-50%,-50%) rotate(-15deg);font-size:80px;font-weight:900;color:rgba(52,211,153,0.25);border:6px solid rgba(52,211,153,0.25);padding:0 20px;border-radius:8px;pointer-events:none;user-select:none;z-index:10;">PAID</div>` : ''}
    </body></html>`

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  const inputCls = "w-full bg-transparent border rounded-lg px-3 py-2 text-white/70 text-xs outline-none placeholder:text-white/20"
  const inputStyle = { borderColor: 'rgba(255,255,255,0.1)' }
  const labelCls = "block text-[10px] font-bold text-white/25 uppercase tracking-wider mb-1"

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-3"
              style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}>
              Free Tool · No Account · Print to PDF
            </div>
            <h1 className="text-3xl font-black text-white mb-1">Invoice Generator</h1>
            <p className="text-white/40 text-sm mb-3">Create professional invoices with line items, tax, discount, and PDF export — entirely in your browser. License from $15, or get all 51 tools from $149.</p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/pricing" className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-black text-black" style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)' }}>Get this tool — $15 →</Link>
              <Link href="/pricing" className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-black border text-white/60" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>All 51 tools — from $149 →</Link>
            </div>
          </div>
          <button onClick={print}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-black text-black flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.25)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Save as PDF
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT: Form */}
          <div className="space-y-4">
            {/* Header info */}
            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">Invoice Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Invoice #</label><input className={inputCls} style={inputStyle} value={data.invoiceNumber} onChange={e => update({ invoiceNumber: e.target.value })} /></div>
                <div>
                  <label className={labelCls}>Currency</label>
                  <select value={data.currency} onChange={e => update({ currency: e.target.value })}
                    className={inputCls} style={{ ...inputStyle, background: 'transparent', color: 'rgba(255,255,255,0.7)' }}>
                    {CURRENCIES.map(c => <option key={c} value={c} style={{ background: '#0d1117' }}>{c}</option>)}
                  </select>
                </div>
                <div><label className={labelCls}>Issue Date</label><input type="date" className={inputCls} style={{ ...inputStyle, colorScheme: 'dark' }} value={data.issueDate} onChange={e => update({ issueDate: e.target.value })} /></div>
                <div>
                  <label className={labelCls}>Payment Terms</label>
                  <select value={paymentTerms} onChange={e => {
                    const t = e.target.value as PaymentTerms
                    setPaymentTerms(t)
                    update({ dueDate: computeDueDate(data.issueDate, t) })
                  }} className={inputCls} style={{ ...inputStyle, background: 'transparent', color: 'rgba(255,255,255,0.7)' }}>
                    <option value="due-on-receipt" style={{ background: '#0d1117' }}>Due on Receipt</option>
                    <option value="net-15" style={{ background: '#0d1117' }}>Net 15</option>
                    <option value="net-30" style={{ background: '#0d1117' }}>Net 30</option>
                    <option value="net-60" style={{ background: '#0d1117' }}>Net 60</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <label className={labelCls}>Due Date</label>
                  <input type="date" className={inputCls} style={{ ...inputStyle, colorScheme: 'dark' }} value={data.dueDate} onChange={e => update({ dueDate: e.target.value })} />
                </div>
                <div className="flex-shrink-0 pt-5">
                  <button onClick={() => setIsPaid(p => !p)}
                    className="px-3 py-2 rounded-lg text-xs font-black transition-all"
                    style={isPaid
                      ? { background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {isPaid ? '✓ PAID' : 'Mark as Paid'}
                  </button>
                </div>
              </div>
            </div>

            {/* From */}
            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">From (Your Business)</p>
              <div className="space-y-2">
                <div><label className={labelCls}>Name / Company</label><input className={inputCls} style={inputStyle} value={data.fromName} onChange={e => update({ fromName: e.target.value })} placeholder="Your Name / Business" /></div>
                <div><label className={labelCls}>Email</label><input className={inputCls} style={inputStyle} value={data.fromEmail} onChange={e => update({ fromEmail: e.target.value })} placeholder="your@email.com" /></div>
                <div><label className={labelCls}>Address</label><input className={inputCls} style={inputStyle} value={data.fromAddress} onChange={e => update({ fromAddress: e.target.value })} placeholder="123 Main St" /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className={labelCls}>City</label><input className={inputCls} style={inputStyle} value={data.fromCity} onChange={e => update({ fromCity: e.target.value })} /></div>
                  <div><label className={labelCls}>State</label><input className={inputCls} style={inputStyle} value={data.fromState} onChange={e => update({ fromState: e.target.value })} /></div>
                  <div><label className={labelCls}>ZIP</label><input className={inputCls} style={inputStyle} value={data.fromZip} onChange={e => update({ fromZip: e.target.value })} /></div>
                </div>
              </div>
            </div>

            {/* To */}
            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">Bill To (Client)</p>
              <div className="space-y-2">
                <div><label className={labelCls}>Name / Company</label><input className={inputCls} style={inputStyle} value={data.toName} onChange={e => update({ toName: e.target.value })} placeholder="Client Company" /></div>
                <div><label className={labelCls}>Email</label><input className={inputCls} style={inputStyle} value={data.toEmail} onChange={e => update({ toEmail: e.target.value })} placeholder="billing@client.com" /></div>
                <div><label className={labelCls}>Address</label><input className={inputCls} style={inputStyle} value={data.toAddress} onChange={e => update({ toAddress: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className={labelCls}>City</label><input className={inputCls} style={inputStyle} value={data.toCity} onChange={e => update({ toCity: e.target.value })} /></div>
                  <div><label className={labelCls}>State</label><input className={inputCls} style={inputStyle} value={data.toState} onChange={e => update({ toState: e.target.value })} /></div>
                  <div><label className={labelCls}>ZIP</label><input className={inputCls} style={inputStyle} value={data.toZip} onChange={e => update({ toZip: e.target.value })} /></div>
                </div>
              </div>
            </div>

            {/* Accent color */}
            <div className="rounded-2xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <label className={labelCls}>Brand Color</label>
              <div className="flex items-center gap-3">
                {['#06d6ff','#6366f1','#f87171','#34d399','#fbbf24','#000000'].map(c => (
                  <button key={c} onClick={() => update({ accentColor: c })}
                    className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                    style={{ background: c, border: data.accentColor === c ? '2px solid white' : '2px solid transparent', outline: data.accentColor === c ? '2px solid rgba(255,255,255,0.3)' : 'none' }} />
                ))}
                <input type="color" value={data.accentColor} onChange={e => update({ accentColor: e.target.value })}
                  className="w-7 h-7 cursor-pointer rounded-full" />
              </div>
            </div>
          </div>

          {/* RIGHT: Line items + totals */}
          <div className="space-y-4">
            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">Line Items</p>
              <div className="space-y-2 mb-4">
                {data.items.map((item, idx) => (
                  <div key={idx} className="rounded-xl border p-3" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <input className={inputCls + ' flex-1'} style={inputStyle} value={item.description}
                        onChange={e => updateItem(idx, { description: e.target.value })} placeholder="Service or product description" />
                      <button onClick={() => removeItem(idx)} className="text-white/25 hover:text-red-400 transition-colors text-xs px-2">✕</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><label className={labelCls}>Qty</label><input type="number" min={0} step={0.5} className={inputCls} style={inputStyle} value={item.qty} onChange={e => updateItem(idx, { qty: parseFloat(e.target.value) || 0 })} /></div>
                      <div><label className={labelCls}>Rate ({data.currency})</label><input type="number" min={0} className={inputCls} style={inputStyle} value={item.rate} onChange={e => updateItem(idx, { rate: parseFloat(e.target.value) || 0 })} /></div>
                      <div><label className={labelCls}>Amount</label><div className="text-xs text-white/55 py-2 px-3 font-mono font-bold">{formatCurrency(item.qty * item.rate, data.currency)}</div></div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addItem}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white/40 border border-dashed border-white/15 hover:border-white/30 hover:text-white/60 transition-all">
                + Add Line Item
              </button>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-black uppercase tracking-widest text-white/25 mb-4">Adjustments</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div><label className={labelCls}>Tax Rate (%)</label><input type="number" min={0} max={50} className={inputCls} style={inputStyle} value={data.taxRate} onChange={e => update({ taxRate: parseFloat(e.target.value) || 0 })} /></div>
                <div><label className={labelCls}>Discount (%)</label><input type="number" min={0} max={100} className={inputCls} style={inputStyle} value={data.discount} onChange={e => update({ discount: parseFloat(e.target.value) || 0 })} /></div>
              </div>
              <div className="border-t border-white/6 pt-4 space-y-2">
                <div className="flex justify-between text-xs text-white/40"><span>Subtotal</span><span className="font-mono">{formatCurrency(subtotal, data.currency)}</span></div>
                {data.discount > 0 && <div className="flex justify-between text-xs text-white/40"><span>Discount ({data.discount}%)</span><span className="font-mono text-red-400">−{formatCurrency(discountAmt, data.currency)}</span></div>}
                {data.taxRate > 0 && <div className="flex justify-between text-xs text-white/40"><span>Tax ({data.taxRate}%)</span><span className="font-mono">{formatCurrency(taxAmt, data.currency)}</span></div>}
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="text-sm font-black text-white">Total Due</span>
                  <span className="text-lg font-black font-mono" style={{ color: '#06d6ff' }}>{formatCurrency(total, data.currency)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <label className={labelCls}>Notes / Payment Terms</label>
              <textarea value={data.notes} onChange={e => update({ notes: e.target.value })} rows={3}
                className={inputCls + ' resize-none'} style={inputStyle}
                placeholder="Payment due within 30 days. Thank you for your business." />
            </div>

            <button onClick={print}
              className="w-full py-4 rounded-xl text-sm font-black text-black"
              style={{ background: 'linear-gradient(135deg,#06d6ff,#0891b2)', boxShadow: '0 0 24px rgba(6,182,212,0.25)' }}>
              Save as PDF
            </button>
            <p className="text-xs text-white/20 text-center">Opens a print dialog — choose "Save as PDF" as the destination.</p>
          </div>
        </div>

        <div ref={printRef} />

        {/* Who This Is For */}
        <div className="mt-10 rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-3">Who This Is For</p>
          <ul className="space-y-1.5">
            {[
              'Freelancers billing clients without a monthly SaaS subscription',
              'Consultants who need quick branded invoices with tax calculation',
              'Small agencies sending one-off invoices between recurring billing software',
              'Solo developers billing for project work or code reviews',
            ].map(item => (
              <li key={item} className="text-xs text-white/50 flex items-start gap-2">
                <span className="text-cyan-400 mt-0.5 flex-shrink-0">→</span>{item}
              </li>
            ))}
          </ul>
        </div>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Create professional invoices with line items, tax, discount, and multi-currency support — then save as PDF instantly.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Fill invoice details', body: 'Add your business info, client details, invoice number, and due date. Add unlimited line items with quantity × rate.' },
              { n: '02', title: 'Apply tax & discounts', body: 'Set tax % (e.g. 8.5% sales tax) and a discount % applied to the subtotal. Switch currency: USD, EUR, GBP, CAD, or AUD.' },
              { n: '03', title: 'Save as PDF', body: 'Click "Download PDF" — a print-optimized HTML invoice opens in a new tab and the print dialog appears. Save as PDF from there.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Example calculation — 3 line items, 8.5% tax, 5% discount</p>
            <div className="space-y-1.5">
              {[
                { label: 'Website Design (1 × $2,500)', val: '$2,500.00', color: 'text-white/60' },
                { label: 'Monthly Hosting (12 × $25)', val: '$300.00', color: 'text-white/60' },
                { label: 'SEO Setup (1 × $150)', val: '$150.00', color: 'text-white/60' },
                { label: 'Subtotal', val: '$2,950.00', color: 'text-white/80' },
                { label: 'Discount (5%)', val: '−$147.50', color: 'text-red-400/70' },
                { label: 'Tax (8.5%)', val: '+$237.69', color: 'text-white/50' },
                { label: 'Total Due', val: '$3,040.19', color: 'text-green-400 font-black' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="text-xs text-white/40">{r.label}</span>
                  <span className={`text-sm font-mono ${r.color}`}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* License CTA */}
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(52,211,153,0.04)', borderColor: 'rgba(52,211,153,0.15)' }}>
          <p className="text-white font-black mb-1">Add invoice generation to your platform</p>
          <p className="text-white/40 text-sm mb-4">Line items, tax/discount, payment terms, PAID stamp, PDF export. Client-side only, one-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#34d399,#059669)' }}>Get this tool — $15 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $149 →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
