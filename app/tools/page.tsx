import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ToolsClient, { CATEGORIES } from '@/components/ToolsClient'
import RequestToolForm from '@/components/RequestToolForm'

export const metadata = {
  title: 'All Tools | Queldrex',
  description: 'Security scanning, DNS health, legal documents, and business analytics. 51 professional tools, free to start, no account required.',
  alternates: { canonical: 'https://queldrex.com/tools' },
  openGraph: {
    title: '51 Free Developer & Business Tools | Queldrex',
    description: 'Security scanning, DNS health, legal documents, and business analytics. Free to start, no account required.',
    url: 'https://queldrex.com/tools',
    siteName: 'Queldrex',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: '51 Free Developer & Business Tools | Queldrex',
    description: 'Security scanning, DNS health, legal documents, and business analytics. Free to start, no account required.',
  },
}

export default function ToolsPage() {
  return (
    <div className="min-h-screen" style={{ background: '#09090B' }}>
      <Header />
      <ToolsClient categories={CATEGORIES} />

      {/* Request a tool */}
      <section id="request-tool" className="py-20 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: '#a78bfa' }}>
            Don&apos;t see what you need?
          </p>
          <h2 className="text-3xl font-black mb-3" style={{ color: '#FAFAFA', letterSpacing: '-0.02em' }}>
            Request a tool.
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            We build based on what people actually need. If you need a tool that isn&apos;t here, tell us. We review every request.
          </p>
        </div>
        <RequestToolForm />
      </section>

      <Footer />
    </div>
  )
}
