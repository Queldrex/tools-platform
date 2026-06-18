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

// ─── Implementation Engine Types ───────────────────────────────────────────────

export type ImplementationPlatform = 'ftp' | 'wordpress' | 'manual'

export interface FtpCredentials {
  platform: 'ftp'
  host: string
  port?: number
  username: string
  password: string
  webRoot?: string  // e.g. /public_html, /www — auto-detected if omitted
  secure?: boolean
}

export interface WordPressCredentials {
  platform: 'wordpress'
  siteUrl: string       // e.g. https://example.com
  username: string      // WP admin username
  appPassword: string   // WP Application Password (Settings > Users > Application Passwords)
}

export interface ManualCredentials {
  platform: 'manual'
}

export type ImplementationCredentials = FtpCredentials | WordPressCredentials | ManualCredentials

export interface ImplementedFile {
  path: string
  action: 'created' | 'updated' | 'skipped'
  note?: string
}

export interface ImplementationResult {
  implementationId: string
  scanId: string
  platform: ImplementationPlatform
  domain: string
  beforeScore: number
  afterScore?: number
  filesImplemented: ImplementedFile[]
  errors: string[]
  startedAt: string
  completedAt: string
  status: 'success' | 'partial' | 'failed'
  manualPackageUrl?: string  // for 'manual' platform
}
