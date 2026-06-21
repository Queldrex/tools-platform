import { NextRequest } from 'next/server'
import { hasFreeOrProAccess } from '@/lib/tool-access'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const SCHEMA_SCORES: Record<string, number> = {
  FAQPage: 20, HowTo: 12, Article: 15, NewsArticle: 15, BlogPosting: 15,
  AggregateRating: 10, Review: 10, Organization: 10, Product: 10, Service: 10,
  Event: 8, Recipe: 8, BreadcrumbList: 8, VideoObject: 7, Person: 5,
  Author: 5, WebPage: 5, WebSite: 5, SiteLinksSearchBox: 5, ImageObject: 3,
}

const REQUIRED_PROPS: Record<string, string[]> = {
  Article: ['headline', 'author', 'datePublished'],
  NewsArticle: ['headline', 'author', 'datePublished'],
  BlogPosting: ['headline', 'author', 'datePublished'],
  Product: ['name', 'offers'],
  FAQPage: ['mainEntity'],
  Organization: ['name'],
  BreadcrumbList: ['itemListElement'],
  Event: ['name', 'startDate'],
  Recipe: ['name', 'recipeIngredient'],
  HowTo: ['name', 'step'],
  VideoObject: ['name', 'uploadDate'],
  Review: ['itemReviewed', 'reviewRating'],
}

const PENALTY_PROPS: Record<string, Array<[string, number]>> = {
  Article: [['headline', -3], ['datePublished', -3], ['author', -3]],
  NewsArticle: [['headline', -3], ['datePublished', -3], ['author', -3]],
  Organization: [['name', -2], ['url', -2], ['contactPoint', -2]],
  Product: [['name', -3], ['description', -3], ['offers', -3]],
  FAQPage: [['mainEntity', -5]],
}

const HIGH_VALUE = ['FAQPage', 'HowTo', 'Article', 'Organization', 'Product', 'AggregateRating', 'Review', 'VideoObject']

function extractType(schema: Record<string, unknown>): string {
  const t = schema['@type']
  if (Array.isArray(t)) return String(t[0])
  return String(t ?? 'Unknown')
}

function getProps(schema: Record<string, unknown>): string[] {
  return Object.keys(schema).filter(k => !k.startsWith('@'))
}

function validateSchema(schema: Record<string, unknown>): { errors: string[]; warnings: string[] } {
  const type = extractType(schema)
  const props = getProps(schema)
  const errors: string[] = []
  const warnings: string[] = []
  const required = REQUIRED_PROPS[type] ?? []
  for (const rp of required) {
    if (!props.includes(rp)) errors.push(`Missing required property: '${rp}'`)
  }
  if (!schema['@context']) warnings.push("Missing '@context' — add \"https://schema.org\"")
  return { errors, warnings }
}

export async function POST(request: NextRequest) {
  let body: { url?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const url = (body.url || '').trim()
  if (!url) return Response.json({ error: 'URL is required' }, { status: 400 })
  if (!/^https?:\/\/.+/.test(url)) return Response.json({ error: 'URL must start with http:// or https://' }, { status: 400 })

  const access = await hasFreeOrProAccess(request, 'schema-validator', 2)
  if (!access.allowed) return Response.json({ paywall: true, remaining: 0 }, { status: 402 })

  let html: string
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Queldrex Schema Validator/1.0 (+https://queldrex.com)', Accept: 'text/html,application/xhtml+xml' },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    })
    if (!res.ok) return Response.json({ error: `Could not fetch page: HTTP ${res.status}` }, { status: 400 })
    html = await res.text()
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Fetch failed'
    return Response.json({ error: `Could not reach ${url}: ${msg}` }, { status: 400 })
  }

  const jsonLdBlocks: string[] = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) jsonLdBlocks.push(m[1].trim())

  const hasMicrodata = /itemscope/i.test(html)
  const itemPropCount = (html.match(/itemprop=/gi) ?? []).length

  const rawSchemas: Record<string, unknown>[] = []
  for (const block of jsonLdBlocks) {
    try {
      const parsed = JSON.parse(block)
      if (Array.isArray(parsed)) rawSchemas.push(...parsed)
      else rawSchemas.push(parsed)
    } catch { /* skip invalid JSON */ }
  }

  const typesFound = new Set(rawSchemas.map(s => extractType(s as Record<string, unknown>)))
  let score = 0
  for (const [type, pts] of Object.entries(SCHEMA_SCORES)) {
    if (typesFound.has(type)) score += pts
  }

  for (const schema of rawSchemas) {
    const s = schema as Record<string, unknown>
    const type = extractType(s)
    const props = getProps(s)
    for (const [prop, penalty] of PENALTY_PROPS[type] ?? []) {
      if (!props.includes(prop)) score += penalty
    }
  }
  score = Math.max(0, Math.min(100, score))

  const missingHighValue = HIGH_VALUE.filter(t => !typesFound.has(t)).slice(0, 5)

  const recommendations: string[] = []
  if (!typesFound.has('FAQPage')) recommendations.push('Add FAQPage schema — pages with FAQ markup are 3.2× more likely to appear in AI-generated answers.')
  if (!typesFound.has('Organization')) recommendations.push('Add Organization schema with contactPoint, url, and logo to help AI engines identify your brand as an entity.')
  if (!typesFound.has('BreadcrumbList')) recommendations.push('Add BreadcrumbList schema to improve site structure signals for AI search crawlers.')
  if (typesFound.has('Article') && !typesFound.has('AggregateRating')) recommendations.push('Add AggregateRating to article pages — review signals boost trust in AI-generated summaries.')
  if (rawSchemas.length === 0) recommendations.push('No structured data found. Adding JSON-LD schema is the highest-impact action for AI search visibility.')
  if (hasMicrodata && rawSchemas.length === 0) recommendations.push('You have Microdata markup but no JSON-LD. Migrate to JSON-LD for better AI search support.')

  const schemas = rawSchemas.map(s => {
    const schema = s as Record<string, unknown>
    const { errors, warnings } = validateSchema(schema)
    return {
      '@type': extractType(schema),
      '@context': String(schema['@context'] ?? ''),
      valid: errors.length === 0,
      errors,
      warnings,
      properties: getProps(schema),
      raw: schema,
    }
  })

  return Response.json({
    url,
    aiVisibilityScore: score,
    schemasFound: rawSchemas.length,
    jsonLdBlocks: jsonLdBlocks.length,
    hasMicrodata,
    itemPropCount,
    schemas,
    typesFound: [...typesFound],
    missingHighValueTypes: missingHighValue,
    recommendations: recommendations.slice(0, 5),
    checkedAt: new Date().toISOString(),
  })
}
