import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { getScan } from '@/lib/store/redis'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const scanId = session.metadata?.scanId
    if (!scanId) return Response.json({ ready: false })

    const scan = await getScan(scanId)
    if (!scan || !scan.downloadToken) return Response.json({ ready: false })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    return Response.json({
      ready: true,
      downloadUrl: `${baseUrl}/api/download/${scan.downloadToken}`,
    })
  } catch {
    return Response.json({ ready: false })
  }
}
