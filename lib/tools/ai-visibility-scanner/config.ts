import type { ToolConfig } from '@/lib/framework/types'

export const AI_VISIBILITY_SCANNER_CONFIG: ToolConfig = {
  toolId: 'ai-visibility-scanner',
  name: 'AI Visibility Scanner',
  tagline: 'Find out if AI can find your business',
  description:
    'Scan your website and get an instant AI readiness report with a generated llms.txt, JSON-LD schema, and prioritized fix list.',
  price: 399,
  currency: 'usd',
  stripePriceId: process.env.STRIPE_PRICE_ID || '',
}
