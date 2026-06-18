'use client'

interface ScoreGaugeProps {
  score: number
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const color =
    score >= 70
      ? { ring: '#22c55e', bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.2)', text: 'text-green-400', label: 'Good', sublabel: 'Your site has strong AI visibility signals' }
      : score >= 40
      ? { ring: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)', text: 'text-amber-400', label: 'Needs Work', sublabel: 'AI systems are partially blind to your site' }
      : { ring: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)', text: 'text-red-400', label: 'Critical', sublabel: 'AI systems cannot find or describe your business' }

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="rounded-2xl p-8 flex flex-col items-center border" style={{ background: color.bg, borderColor: color.border }}>
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={color.ring}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white">{score}</span>
          <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <div className={`mt-4 text-xl font-bold ${color.text}`}>{color.label}</div>
      <div className="mt-1 text-sm text-white/45 text-center max-w-[200px]">{color.sublabel}</div>
    </div>
  )
}
