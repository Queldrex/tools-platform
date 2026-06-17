'use client'

interface ScoreGaugeProps {
  score: number
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  const color =
    score >= 70
      ? { ring: '#16a34a', bg: 'bg-green-50', text: 'text-green-700', label: 'Good', sublabel: 'Your site has some AI visibility' }
      : score >= 40
      ? { ring: '#d97706', bg: 'bg-amber-50', text: 'text-amber-700', label: 'Needs Work', sublabel: 'AI systems are partially blind to your site' }
      : { ring: '#dc2626', bg: 'bg-red-50', text: 'text-red-700', label: 'Critical', sublabel: 'AI systems cannot find or describe your business' }

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className={`rounded-2xl ${color.bg} p-8 flex flex-col items-center`}>
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={radius}
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
          <span className="text-4xl font-black text-slate-900">{score}</span>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <div className={`mt-4 text-xl font-bold ${color.text}`}>{color.label}</div>
      <div className="mt-1 text-sm text-slate-500 text-center max-w-[200px]">{color.sublabel}</div>
    </div>
  )
}
