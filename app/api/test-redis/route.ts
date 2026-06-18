import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    })
    await redis.set('test-ping', 'ok', { ex: 60 })
    const val = await redis.get('test-ping')
    return Response.json({ status: 'ok', value: val })
  } catch (err) {
    return Response.json({ status: 'error', message: String(err) }, { status: 500 })
  }
}
