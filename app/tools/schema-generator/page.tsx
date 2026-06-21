'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const BUSINESS_TYPES = [
  { value: 'LocalBusiness', label: 'Local Business (generic)' },
  { value: 'Restaurant', label: 'Restaurant' },
  { value: 'MedicalBusiness', label: 'Medical Practice (Doctor, Dentist, etc.)' },
  { value: 'LegalService', label: 'Legal Service (Lawyer, Attorney)' },
  { value: 'HomeAndConstructionBusiness', label: 'Home Services (HVAC, Plumber, Electrician)' },
  { value: 'AccountingService', label: 'Accounting / Bookkeeping' },
  { value: 'AutoRepair', label: 'Auto Repair / Dealership' },
  { value: 'BeautySalon', label: 'Salon / Spa / Beauty' },
  { value: 'FitnessCenter', label: 'Gym / Fitness Center' },
  { value: 'RealEstateAgent', label: 'Real Estate' },
  { value: 'FinancialService', label: 'Financial Services' },
]

const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

type DayHours = { open: string; close: string; closed: boolean }

const defaultHours: Record<string, DayHours> = {
  Monday: { open: '09:00', close: '17:00', closed: false },
  Tuesday: { open: '09:00', close: '17:00', closed: false },
  Wednesday: { open: '09:00', close: '17:00', closed: false },
  Thursday: { open: '09:00', close: '17:00', closed: false },
  Friday: { open: '09:00', close: '17:00', closed: false },
  Saturday: { open: '10:00', close: '15:00', closed: false },
  Sunday: { open: '00:00', close: '00:00', closed: true },
}

function buildSchema(fields: {
  type: string; name: string; description: string; url: string
  phone: string; street: string; city: string; state: string; zip: string
  priceRange: string; image: string; hours: Record<string, DayHours>
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': fields.type,
  }

  if (fields.name) schema['name'] = fields.name
  if (fields.description) schema['description'] = fields.description
  if (fields.url) schema['url'] = fields.url.startsWith('http') ? fields.url : `https://${fields.url}`
  if (fields.phone) schema['telephone'] = fields.phone
  if (fields.image) schema['image'] = fields.image.startsWith('http') ? fields.image : `https://${fields.image}`
  if (fields.priceRange) schema['priceRange'] = fields.priceRange

  if (fields.street || fields.city || fields.state || fields.zip) {
    schema['address'] = {
      '@type': 'PostalAddress',
      ...(fields.street && { streetAddress: fields.street }),
      ...(fields.city && { addressLocality: fields.city }),
      ...(fields.state && { addressRegion: fields.state }),
      ...(fields.zip && { postalCode: fields.zip }),
      addressCountry: 'US',
    }
  }

  const openHours = DAYS
    .filter(d => !fields.hours[d]?.closed)
    .map(d => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${d}`,
      opens: fields.hours[d]?.open ?? '09:00',
      closes: fields.hours[d]?.close ?? '17:00',
    }))

  if (openHours.length > 0) schema['openingHoursSpecification'] = openHours

  return JSON.stringify(schema, null, 2)
}

export default function SchemaGeneratorPage() {
  const [type, setType] = useState('LocalBusiness')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('CO')
  const [zip, setZip] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [image, setImage] = useState('')
  const [hours, setHours] = useState<Record<string, DayHours>>(defaultHours)
  const [copied, setCopied] = useState(false)

  const schema = buildSchema({ type, name, description, url, phone, street, city, state, zip, priceRange, image, hours })

  function copy() {
    const tag = `<script type="application/ld+json">\n${schema}\n</script>`
    navigator.clipboard.writeText(tag)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputStyle: React.CSSProperties = {
    background: '#0d1117',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '10px 14px',
    color: 'white',
    fontSize: 13,
    outline: 'none',
    width: '100%',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 11,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 6,
  }

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-4"
            style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}>
            Free Tool · AI Visibility
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Schema Markup Generator</h1>
          <p className="text-white/45 text-sm leading-relaxed max-w-2xl">
            Generate valid LocalBusiness JSON-LD schema markup for your website. Structured data helps AI assistants like ChatGPT, Perplexity, and Google understand your business — and recommend you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* FORM */}
          <div className="space-y-5">
            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Business Details</p>
              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>Business Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {BUSINESS_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Business Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Acme Plumbing LLC" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="We provide residential and commercial plumbing services in Castle Rock, CO." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Website URL</label>
                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="example.com" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1-303-555-0100" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Street Address</label>
                  <input type="text" value={street} onChange={e => setStreet(e.target.value)} placeholder="123 Main St" style={inputStyle} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label style={labelStyle}>City</label>
                    <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Castle Rock" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>State</label>
                    <select value={state} onChange={e => setState(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>ZIP</label>
                    <input type="text" value={zip} onChange={e => setZip(e.target.value)} placeholder="80104" style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Price Range</label>
                    <select value={priceRange} onChange={e => setPriceRange(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">— optional —</option>
                      <option value="$">$ (inexpensive)</option>
                      <option value="$$">$$ (moderate)</option>
                      <option value="$$$">$$$ (expensive)</option>
                      <option value="$$$$">$$$$ (very expensive)</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Image URL</label>
                    <input type="text" value={image} onChange={e => setImage(e.target.value)} placeholder="example.com/logo.png" style={inputStyle} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Business Hours</p>
              <div className="space-y-2">
                {DAYS.map(day => (
                  <div key={day} className="flex items-center gap-3">
                    <button
                      onClick={() => setHours(h => ({ ...h, [day]: { ...h[day], closed: !h[day].closed } }))}
                      className="w-5 h-5 rounded flex-shrink-0 border flex items-center justify-center transition-colors"
                      style={{
                        background: hours[day].closed ? 'rgba(255,255,255,0.05)' : 'rgba(6,182,212,0.2)',
                        borderColor: hours[day].closed ? 'rgba(255,255,255,0.15)' : 'rgba(6,182,212,0.5)',
                      }}
                    >
                      {!hours[day].closed && (
                        <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className="text-xs text-white/60 w-24 flex-shrink-0">{day}</span>
                    {hours[day].closed ? (
                      <span className="text-xs text-white/25">Closed</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input type="time" value={hours[day].open} onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], open: e.target.value } }))}
                          style={{ ...inputStyle, width: 'auto', padding: '5px 10px', fontSize: 12 }} />
                        <span className="text-white/25 text-xs">to</span>
                        <input type="time" value={hours[day].close} onChange={e => setHours(h => ({ ...h, [day]: { ...h[day], close: e.target.value } }))}
                          style={{ ...inputStyle, width: 'auto', padding: '5px 10px', fontSize: 12 }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OUTPUT */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl border overflow-hidden" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/6">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Generated Schema</p>
                <button onClick={copy}
                  className="text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
                  style={{
                    background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(6,182,212,0.15)',
                    color: copied ? '#4ade80' : '#06d6ff',
                    border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(6,182,212,0.3)'}`,
                  }}>
                  {copied ? 'Copied!' : 'Copy <script> Tag'}
                </button>
              </div>
              <pre className="p-5 text-xs text-white/65 overflow-auto max-h-[600px] leading-relaxed font-mono whitespace-pre-wrap">
                {`<script type="application/ld+json">\n${schema}\n</script>`}
              </pre>
            </div>

            <div className="mt-4 rounded-xl border p-4" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}>
              <p className="text-xs font-bold text-cyan-400 mb-1">How to add this to your site</p>
              <p className="text-xs text-white/45 leading-relaxed">
                Paste this code into the <code className="text-white/70">&lt;head&gt;</code> section of your homepage. On WordPress, use the &quot;Insert Headers and Footers&quot; plugin. On Squarespace, use Code Injection in Settings.
              </p>
            </div>

            <div className="mt-3 rounded-xl border p-4 flex items-center justify-between gap-4" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}>
              <div>
                <p className="text-xs font-bold text-white mb-0.5">Verify your full AI Visibility Score</p>
                <p className="text-xs text-white/40">Check all 14 signals — including if this schema is properly indexed.</p>
              </div>
              <Link href="/scanner" className="flex-shrink-0 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap">
                Free scan →
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">How It Works</h2>
          <p className="text-white/35 text-sm mb-8">Schema markup (JSON-LD) tells AI search engines exactly what your business is — boosting AI citation chances by up to 40%.</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { n: '01', title: 'Choose schema type', body: 'Pick your business category: Local Business, Restaurant, Doctor, Lawyer, HVAC/Plumber, Gym, Real Estate, or more.' },
              { n: '02', title: 'Fill your details', body: 'Name, address, phone, hours, website, social links. The generator validates required fields per schema.org spec.' },
              { n: '03', title: 'Add to your website', body: 'Copy the JSON-LD and paste it inside a <script type="application/ld+json"> tag in your site\'s <head> or <body>.' },
            ].map(s => (
              <div key={s.n} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black text-white/20 mb-2">{s.n}</div>
                <div className="text-sm font-black text-white mb-1">{s.title}</div>
                <div className="text-xs text-white/45 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Example output — Local Business (Plumbing)</p>
            <pre className="text-xs font-mono text-green-400/70 leading-relaxed overflow-x-auto">{`<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "Sunrise Plumbing",
  "telephone": "+1-303-555-0100",
  "url": "https://sunriseplumbing.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Denver",
    "addressRegion": "CO",
    "postalCode": "80201"
  },
  "openingHours": ["Mo-Fr 08:00-18:00", "Sa 09:00-14:00"]
}
</script>`}</pre>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
