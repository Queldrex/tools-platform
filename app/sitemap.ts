import { MetadataRoute } from 'next'

const BASE = 'https://queldrex.com'

const TOOL_SLUGS = [
  'ssl-inspector', 'dep-scanner', 'prompt-injection', 'dns-health', 'email-deliverability',
  'privacy-analyzer', 'schema-validator', 'vibe-security', 'api-schema-drift', 'database-migration',
  'contract-scanner', 'package-hallucination', 'breach-lookup', 'threat-feed', 'password-generator',
  'hash-generator', 'schema-generator', 'robots-generator', 'nda-generator', 'tos-generator',
  'refund-policy', 'proposal-generator', 'job-description', 'ad-grader', 'subject-line',
  'cashflow', 'roi-calculator', 'business-name', 'saas-metrics', 'break-even', 'saas-spend',
  'invoice-fraud', 'agency-report', 'json-formatter', 'jwt-decoder', 'base64', 'cron-builder',
  'tech-stack', 'api-rate-limit', 'directory-extractor', 'invoice-generator', 'url-shortener',
  'meeting-cost', 'uptime-calculator', 'email-signature', 'color-palette', 'gdpr-generator',
  'og-previewer', 'http-headers', 'webhook-tester', 'audit',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPages: MetadataRoute.Sitemap = TOOL_SLUGS.map(slug => ({
    url: `${BASE}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/tools`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/scanner`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/monitor`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/portfolio`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/downloads`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/trust`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/changelog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.4 },
    { url: `${BASE}/restore-access`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ...toolPages,
  ]
}
