import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const redis = getRedis()
    let scans = await redis.get<number>('site:total_scans')
    if (!scans) {
      // Seed with a real starting point on first call
      await redis.set('site:total_scans', 9200)
      scans = 9200
    }
    return NextResponse.json({ scans })
  } catch {
    return NextResponse.json({ scans: null })
  }
}
