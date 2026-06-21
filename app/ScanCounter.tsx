'use client'
import { useEffect, useState } from 'react'

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!target) return
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return count
}

export default function ScanCounter() {
  const [target, setTarget] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(d => { if (d.scans) setTarget(d.scans) }).catch(() => {})
  }, [])
  const count = useCountUp(target ?? 0)
  if (!target) return null
  return <span className="count-reveal">{count.toLocaleString('en-US')} scans run</span>
}
