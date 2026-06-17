export type ScanStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'ERROR' | 'PAID' | 'DELIVERED'

export interface ScanChecks {
  robotsTxt: boolean
  sitemapXml: boolean
  llmsTxt: boolean
  openGraph: boolean
  jsonLd: boolean
  localBusinessSchema: boolean
}

export interface BusinessInfo {
  name: string
  description: string
  url: string
  domain: string
  title: string
  phone: string
  email: string
  address: string
  image: string
  social: string[]
  pages: string[]
}

export interface ScanResult {
  scanId: string
  toolId: string
  url: string
  emailAddress: string
  status: ScanStatus
  score: number
  checks: ScanChecks
  businessInfo: BusinessInfo
  generatedLlmsTxt: string
  generatedJsonLd: string
  recommendations: Recommendation[]
  paid: boolean
  stripeSessionId?: string
  downloadToken?: string
  createdAt: string
  paidAt?: string
  error?: string
}

export interface Recommendation {
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  fix: string
}

export interface ToolConfig {
  toolId: string
  name: string
  tagline: string
  description: string
  price: number
  currency: string
  stripePriceId: string
}
