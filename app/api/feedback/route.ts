import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { saveFeedback } from '@/lib/store/redis'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { name, email, category, message } = await request.json()

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return Response.json({ error: 'Message is required (minimum 10 characters)' }, { status: 400 })
  }

  await saveFeedback({
    id: uuidv4(),
    category: typeof category === 'string' ? category.slice(0, 50) : 'General',
    name: typeof name === 'string' ? name.trim().slice(0, 100) : '',
    email: typeof email === 'string' ? email.trim().slice(0, 200) : '',
    message: message.trim().slice(0, 5000),
    createdAt: new Date().toISOString(),
  })

  return Response.json({ ok: true })
}
