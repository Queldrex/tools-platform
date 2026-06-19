const UPCOMING = [
  {
    name: 'API Schema Drift Scanner',
    hook: 'Your API breaks silently. Users hit errors before you do.',
    color: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.18)',
    href: '/tools/api-schema-drift',
    accentColor: '#818cf8',
  },
  {
    name: 'Database Migration Middleware',
    hook: 'One botched migration means downtime and corrupted data.',
    color: 'rgba(16,185,129,0.06)',
    border: 'rgba(16,185,129,0.15)',
    href: '/tools/database-migration',
    accentColor: '#34d399',
  },
  {
    name: 'Vibe Coding Security Shield',
    hook: 'AI writes code fast. It also writes SQL injection holes.',
    color: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.15)',
    href: '/tools/vibe-security',
    accentColor: '#fbbf24',
  },
  {
    name: 'High-Speed Directory Extractor',
    hook: 'Extract thousands of clean business listings in minutes, not days.',
    color: 'rgba(236,72,153,0.06)',
    border: 'rgba(236,72,153,0.15)',
    href: '/tools/directory-extractor',
    accentColor: '#f472b6',
  },
]

export default function UpcomingTools() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-cyan-500 text-xs font-bold tracking-[0.28em] uppercase mb-2">Also from Queldrex</p>
        <h3 className="text-xl font-black text-white mb-2">AI visibility is one piece. Here&apos;s what else we&apos;re building.</h3>
        <p className="text-white/55 text-sm">Four more tools in development. Join the waitlist for early access.</p>
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {UPCOMING.map((tool) => (
          <a
            key={tool.name}
            href={tool.href}
            className="rounded-xl p-5 border flex flex-col gap-3 hover:border-white/25 transition-colors group"
            style={{ background: tool.color, borderColor: tool.border }}
          >
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full mb-2" style={{ color: tool.accentColor, borderColor: `${tool.accentColor}30`, background: `${tool.accentColor}10` }}>In Development</span>
              <h4 className="text-sm font-bold text-white leading-snug">{tool.name}</h4>
            </div>
            <p className="text-xs text-white/55 leading-relaxed flex-1">{tool.hook}</p>
            <span className="text-xs font-bold text-white/40 group-hover:text-cyan-400 transition-colors">
              Join waitlist →
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
