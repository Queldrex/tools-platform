import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Queldrex — AI Visibility Scanner | Product Hunt',
  description: 'Find out if ChatGPT, Perplexity, and Google AI recommend your business. 14-signal scan, free to start. Launching on Product Hunt.',
  robots: { index: false, follow: false },
}

const PH_URL = 'https://www.producthunt.com/posts/queldrex'

const SIGNALS = [
  { name: 'robots.txt AI Access', desc: 'GPTBot, ClaudeBot, PerplexityBot allowed' },
  { name: 'llms.txt', desc: 'AI-specific context file at site root' },
  { name: 'LocalBusiness Schema', desc: 'Schema.org structured data present' },
  { name: 'Google Business Profile', desc: 'Verified and active GBP listing' },
  { name: 'Citation Consistency (NAP)', desc: 'Name, address, phone match across web' },
  { name: 'Open Graph Tags', desc: 'Rich preview metadata for AI parsers' },
  { name: 'HTTPS / Security', desc: 'Valid TLS certificate, no mixed content' },
  { name: 'Page Speed', desc: 'Under 3s load time for AI crawlers' },
  { name: 'Mobile Responsiveness', desc: 'Works across all viewports' },
  { name: 'Social Media Presence', desc: 'Active profiles AI can reference' },
  { name: 'Directory Listings', desc: '15 major directories checked' },
  { name: 'Review Signals', desc: 'Star rating and review volume' },
  { name: 'Content Authority', desc: 'Topical expertise signals' },
  { name: 'Sitemap Health', desc: 'Valid sitemap.xml accessible to crawlers' },
]

const STEPS = [
  { n: '1', label: 'Enter your domain', sub: 'No account needed' },
  { n: '2', label: 'We check 14 signals', sub: 'Takes ~30 seconds' },
  { n: '3', label: 'Get your score 0–100', sub: 'With grade A–F' },
  { n: '4', label: 'See exactly what to fix', sub: 'Prioritized checklist' },
]

const PRICING = [
  { label: 'Free', price: '$0', items: ['Full 14-signal scan', 'Score and grade', 'Signal breakdown'] },
  { label: 'Full Report', price: '$399', items: ['PDF report', 'Generated llms.txt', 'LocalBusiness schema', 'Deployment guide'], highlight: true },
  { label: 'Monitor', price: '$79/mo', items: ['Monthly rescans', 'Score drop alerts', 'Score history'] },
  { label: 'Agency', price: '$99/mo', items: ['25 clients/month', 'White-label reports', 'Client dashboard'] },
]

const FAQS = [
  {
    q: 'Is this just another SEO tool?',
    a: 'No. Traditional SEO tools optimize for Google\'s PageRank algorithm. Queldrex optimizes for AI search — different signals, different fixes. Being great at Google SEO does not mean ChatGPT will recommend you.',
  },
  {
    q: 'What makes the free scan actually free?',
    a: 'We check all 14 signals and show you your full score and breakdown at no cost. The $399 is for the fix package: a generated llms.txt file, LocalBusiness JSON-LD schema, full HTML report, and deployment instructions.',
  },
  {
    q: 'How accurate is it?',
    a: 'We check every observable technical signal — the things that directly influence how AI crawlers index and understand your site. We can\'t reach inside AI training data, but we can tell you exactly what signals you\'re missing that make AI engines likely to skip you.',
  },
  {
    q: 'Can agencies use this?',
    a: 'Yes. The Agency plan ($99/month) gives you a dashboard to manage up to 25 client domains, white-label PDF reports, and monthly auto-scans. Your clients never see the Queldrex name.',
  },
  {
    q: 'Will you add more signals?',
    a: 'Yes. The full roadmap is at queldrex.com/roadmap. More security and business tools ship regularly — CVE scanning, email deliverability, document generation, and more. All updates are included in existing plans.',
  },
]

export default function ProductHuntPage() {
  return (
    <div style={{ background: '#070b14', minHeight: '100vh', color: 'white' }}>

      {/* TOP BAR */}
      <div style={{ background: '#FF6154', padding: '10px 24px', textAlign: 'center' }}>
        <a
          href={PH_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'white', textDecoration: 'none', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          🚀 We&apos;re live on Product Hunt today — upvote to help us reach #1
          <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </a>
      </div>

      {/* HERO */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px 48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,97,84,0.1)', border: '1px solid rgba(255,97,84,0.3)', borderRadius: 99, padding: '6px 16px', marginBottom: 24 }}>
          <svg style={{ width: 14, height: 14, color: '#FF6154', fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#FF6154', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Product Hunt Launch</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: 20, letterSpacing: '-0.02em' }}>
          Queldrex
        </h1>
        <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontWeight: 700, color: '#06d6ff', marginBottom: 14 }}>
          Find out if ChatGPT recommends your business — in 60 seconds
        </p>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 32, maxWidth: 560, margin: '0 auto 32px' }}>
          14 signals. Free scan. No account needed. We tell you exactly why AI ignores your business and what to fix.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 36 }}>
          {[['14', 'signals checked'], ['60s', 'per scan'], ['48', 'tools live']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#06d6ff' }}>{n}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/scanner"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#06d6ff,#0891b2)', color: '#000', fontWeight: 900, fontSize: 14, textDecoration: 'none', boxShadow: '0 0 28px rgba(6,214,255,0.3)' }}
          >
            Try It Free
            <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <a
            href={PH_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: 'rgba(255,97,84,0.12)', border: '1px solid rgba(255,97,84,0.3)', color: '#FF6154', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
          >
            ▲ Upvote on Product Hunt
          </a>
        </div>
      </section>

      {/* MAKER HOOK */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,214,255,0.02)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, fontStyle: 'italic' }}>
            &ldquo;I built this because I kept getting the same question from clients: &lsquo;Why doesn&apos;t ChatGPT recommend us?&rsquo; So I automated the answer.&rdquo;
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>— Queldrex LLC · Castle Rock, Colorado</p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '64px 24px' }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#06d6ff', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>How It Works</p>
        <h2 style={{ fontSize: 28, fontWeight: 900, textAlign: 'center', marginBottom: 40 }}>Four steps. Thirty seconds.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {STEPS.map((step) => (
            <div key={step.n} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 18px', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#06d6ff,#0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 16, fontWeight: 900, color: '#000' }}>
                {step.n}
              </div>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 4 }}>{step.label}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{step.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE 14 SIGNALS */}
      <section style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#06d6ff', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>The 14 Signals</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>Makers love specifics. Here they are.</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 36 }}>Every one of these is checked in real time on every scan.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {SIGNALS.map((sig, i) => (
              <div key={sig.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#0d1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '12px 14px' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#06d6ff', background: 'rgba(6,214,255,0.1)', borderRadius: 6, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 2 }}>{sig.name}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{sig.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: '#06d6ff', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>Why This Matters</p>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 20 }}>AI search is eating local business queries.</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>
          When someone asks ChatGPT &ldquo;what&apos;s the best accountant in Denver?&rdquo; — the recommendations are based on these 14 signals. The businesses that show up aren&apos;t necessarily the best. They&apos;re the most AI-visible. Most businesses don&apos;t know they&apos;re invisible, because nobody told them AI search worked differently from Google.
        </p>
      </section>

      {/* PRICING */}
      <section style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, textAlign: 'center', marginBottom: 36 }}>What you get</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {PRICING.map((p) => (
              <div
                key={p.label}
                style={{
                  background: p.highlight ? 'linear-gradient(160deg,rgba(6,214,255,0.08),rgba(8,145,178,0.03))' : '#0d1117',
                  border: `1px solid ${p.highlight ? 'rgba(6,214,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 14,
                  padding: '20px 18px',
                  boxShadow: p.highlight ? '0 0 32px rgba(6,214,255,0.08)' : 'none',
                }}
              >
                <p style={{ fontSize: 10, fontWeight: 800, color: p.highlight ? '#06d6ff' : 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>{p.label}</p>
                <p style={{ fontSize: 22, fontWeight: 900, color: 'white', marginBottom: 14 }}>{p.price}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {p.items.map((item) => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>
                      <svg style={{ width: 12, height: 12, flexShrink: 0, color: p.highlight ? '#06d6ff' : 'rgba(255,255,255,0.3)' }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAKER STORY */}
      <section style={{ maxWidth: 680, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>The Maker</p>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75 }}>
          Built by Queldrex LLC, Castle Rock, Colorado. One company, one mission: give every business a way to see and fix their AI visibility. 48 tools are live now across AI visibility, security, developer, and business categories.
        </p>
      </section>

      {/* FAQ */}
      <section style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '64px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontSize: 26, fontWeight: 900, textAlign: 'center', marginBottom: 32 }}>FAQ</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQS.map((faq) => (
              <div key={faq.q} style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '18px 20px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 8 }}>{faq.q}</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '64px 24px', textAlign: 'center', background: 'linear-gradient(180deg,rgba(6,214,255,0.03) 0%,transparent 100%)' }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12 }}>Don&apos;t let competitors get AI-visible while you&apos;re invisible.</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>If this helps you, share it with someone who needs it.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/scanner"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#06d6ff,#0891b2)', color: '#000', fontWeight: 900, fontSize: 14, textDecoration: 'none', boxShadow: '0 0 28px rgba(6,214,255,0.3)' }}
          >
            Try the Free Scan
          </Link>
          <a
            href={PH_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, background: 'rgba(255,97,84,0.12)', border: '1px solid rgba(255,97,84,0.3)', color: '#FF6154', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
          >
            ▲ Upvote on Product Hunt
          </a>
        </div>
      </section>

      {/* SLIM FOOTER */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
          © 2026 Queldrex LLC · Castle Rock, Colorado ·{' '}
          <a href="https://queldrex.com" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>queldrex.com</a>
          {' · '}
          <a href="mailto:hello@queldrex.com" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>hello@queldrex.com</a>
          {' · '}
          <Link href="/privacy" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Privacy</Link>
          {' · '}
          <Link href="/terms" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>Terms</Link>
        </p>
      </div>
    </div>
  )
}
