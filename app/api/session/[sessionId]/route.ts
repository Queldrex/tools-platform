import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { getScan } from '@/lib/store/redis'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const scanId = session.metadata?.scanId
    if (!scanId) return Response.json({ ready: false })

    const scan = await getScan(scanId)
    if (!scan || !scan.downloadToken) return Response.json({ ready: false })

    const baseUrl = env('NEXT_PUBLIC_BASE_URL', 'https://queldrex.com')
    return Response.json({
      ready: true,
      // Link to the download page UI, not the raw API endpoint
      downloadUrl: `${baseUrl}/download/${scan.downloadToken}`,
    })
  } catch {
    return Response.json({ ready: false })
  }
}
