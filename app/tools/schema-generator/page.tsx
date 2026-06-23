'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// ─── Types ────────────────────────────────────────────────────────────────────

type DayHours = { open: string; close: string; closed: boolean }
type FaqItem = { question: string; answer: string }
type HowToStep = { name: string; text: string; image: string }
type BreadcrumbItem = { name: string; url: string }
type StackItem = { id: string; label: string; schema: string }
type HistoryItem = { id: string; type: string; label: string; schema: string; ts: number }
type SchemaTab = 'localbusiness' | 'faqpage' | 'article' | 'product' | 'event' | 'organization' | 'howto' | 'website' | 'softwareapp' | 'breadcrumb' | 'video' | 'recipe' | 'jobposting' | 'course' | 'newsarticle' | 'podcastepisode'

// ─── Constants ─────────────────────────────────────────────────────────────────

const BUSINESS_TYPES = [
  { value: 'LocalBusiness', label: 'Local Business (generic)' },
  { value: 'Restaurant', label: 'Restaurant' },
  { value: 'MedicalBusiness', label: 'Medical / Dental Practice' },
  { value: 'LegalService', label: 'Legal Service (Lawyer, Attorney)' },
  { value: 'HomeAndConstructionBusiness', label: 'Home Services (HVAC, Plumber, Electrician)' },
  { value: 'AccountingService', label: 'Accounting / Bookkeeping' },
  { value: 'AutoRepair', label: 'Auto Repair / Dealership' },
  { value: 'BeautySalon', label: 'Salon / Spa / Beauty' },
  { value: 'FitnessCenter', label: 'Gym / Fitness Center' },
  { value: 'RealEstateAgent', label: 'Real Estate' },
  { value: 'FinancialService', label: 'Financial Services' },
  { value: 'Hotel', label: 'Hotel / Lodging' },
  { value: 'Store', label: 'Retail Store' },
  { value: 'EducationalOrganization', label: 'School / Educational Org' },
  { value: 'Dentist', label: 'Dentist' },
  { value: 'Optician', label: 'Optometrist' },
  { value: 'Veterinary', label: 'Veterinary / Animal Care' },
  { value: 'CivicStructure', label: 'Civic / Government' },
  { value: 'SportsActivityLocation', label: 'Sports / Recreation' },
  { value: 'EntertainmentBusiness', label: 'Entertainment / Events' },
]

const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const CURRENCIES = ['USD','EUR','GBP','CAD','AUD','JPY','CHF','SEK','NOK','DKK']
const OS_OPTIONS = ['Web', 'iOS', 'Android', 'Windows', 'macOS']
const APP_CATEGORIES = [
  'BusinessApplication','DeveloperApplication','FinanceApplication',
  'HealthAndFitnessApplication','LifestyleApplication','MultimediaApplication',
  'SecurityApplication','UtilitiesApplication',
]

const defaultHours: Record<string, DayHours> = {
  Monday: { open: '09:00', close: '17:00', closed: false },
  Tuesday: { open: '09:00', close: '17:00', closed: false },
  Wednesday: { open: '09:00', close: '17:00', closed: false },
  Thursday: { open: '09:00', close: '17:00', closed: false },
  Friday: { open: '09:00', close: '17:00', closed: false },
  Saturday: { open: '10:00', close: '15:00', closed: false },
  Sunday: { open: '00:00', close: '00:00', closed: true },
}

const SOCIAL_PLATFORMS = [
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourbusiness' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourbusiness' },
  { key: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/yourbusiness' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourbusiness' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@yourbusiness' },
  { key: 'yelp', label: 'Yelp', placeholder: 'https://yelp.com/biz/yourbusiness' },
]

// ─── Schema Builders ───────────────────────────────────────────────────────────

function buildLocalBusiness(f: {
  type: string; name: string; description: string; url: string; phone: string
  email: string; street: string; city: string; state: string; zip: string; country: string
  priceRange: string; image: string; hours: Record<string, DayHours>
  lat: string; lng: string; ratingValue: string; ratingCount: string
  socials: Record<string, string>; foundingYear: string
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': f.type,
  }

  if (f.name) schema['name'] = f.name
  if (f.description) schema['description'] = f.description
  if (f.url) schema['url'] = f.url.startsWith('http') ? f.url : `https://${f.url}`
  if (f.phone) schema['telephone'] = f.phone
  if (f.email) schema['email'] = f.email
  if (f.image) schema['image'] = f.image.startsWith('http') ? f.image : `https://${f.image}`
  if (f.priceRange) schema['priceRange'] = f.priceRange
  if (f.foundingYear) schema['foundingDate'] = f.foundingYear

  if (f.street || f.city || f.state || f.zip) {
    schema['address'] = {
      '@type': 'PostalAddress',
      ...(f.street && { streetAddress: f.street }),
      ...(f.city && { addressLocality: f.city }),
      ...(f.state && { addressRegion: f.state }),
      ...(f.zip && { postalCode: f.zip }),
      addressCountry: f.country || 'US',
    }
  }

  if (f.lat && f.lng) {
    schema['geo'] = { '@type': 'GeoCoordinates', latitude: parseFloat(f.lat), longitude: parseFloat(f.lng) }
  }

  const openHours = DAYS.filter(d => !f.hours[d]?.closed).map(d => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: `https://schema.org/${d}`,
    opens: f.hours[d]?.open ?? '09:00',
    closes: f.hours[d]?.close ?? '17:00',
  }))
  if (openHours.length > 0) schema['openingHoursSpecification'] = openHours

  if (f.ratingValue && f.ratingCount) {
    schema['aggregateRating'] = {
      '@type': 'AggregateRating',
      ratingValue: parseFloat(f.ratingValue),
      reviewCount: parseInt(f.ratingCount),
      bestRating: 5,
      worstRating: 1,
    }
  }

  const sameAs = SOCIAL_PLATFORMS.map(p => f.socials[p.key]).filter(Boolean)
  if (sameAs.length > 0) schema['sameAs'] = sameAs

  return JSON.stringify(schema, null, 2)
}

function buildFaqPage(faqs: FaqItem[]) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.filter(f => f.question && f.answer).map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
  return JSON.stringify(schema, null, 2)
}

function buildArticle(f: {
  headline: string; description: string; image: string; authorName: string
  authorUrl: string; publisherName: string; publisherLogo: string
  datePublished: string; dateModified: string; articleUrl: string; articleType: string
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': f.articleType || 'Article',
  }
  if (f.headline) schema['headline'] = f.headline
  if (f.description) schema['description'] = f.description
  if (f.image) schema['image'] = f.image.startsWith('http') ? f.image : `https://${f.image}`
  if (f.articleUrl) schema['url'] = f.articleUrl.startsWith('http') ? f.articleUrl : `https://${f.articleUrl}`
  if (f.datePublished) schema['datePublished'] = f.datePublished
  if (f.dateModified) schema['dateModified'] = f.dateModified

  if (f.authorName) {
    schema['author'] = {
      '@type': 'Person',
      name: f.authorName,
      ...(f.authorUrl && { url: f.authorUrl.startsWith('http') ? f.authorUrl : `https://${f.authorUrl}` }),
    }
  }

  if (f.publisherName) {
    schema['publisher'] = {
      '@type': 'Organization',
      name: f.publisherName,
      ...(f.publisherLogo && {
        logo: {
          '@type': 'ImageObject',
          url: f.publisherLogo.startsWith('http') ? f.publisherLogo : `https://${f.publisherLogo}`,
        },
      }),
    }
  }

  return JSON.stringify(schema, null, 2)
}

function buildProduct(f: {
  name: string; description: string; image: string; brand: string; sku: string
  gtin: string; price: string; currency: string; availability: string; offerUrl: string
  ratingValue: string; ratingCount: string; condition: string
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
  }
  if (f.name) schema['name'] = f.name
  if (f.description) schema['description'] = f.description
  if (f.image) schema['image'] = f.image.startsWith('http') ? f.image : `https://${f.image}`
  if (f.brand) schema['brand'] = { '@type': 'Brand', name: f.brand }
  if (f.sku) schema['sku'] = f.sku
  if (f.gtin) schema['gtin'] = f.gtin

  if (f.price && f.currency) {
    schema['offers'] = {
      '@type': 'Offer',
      price: f.price,
      priceCurrency: f.currency,
      availability: `https://schema.org/${f.availability || 'InStock'}`,
      itemCondition: `https://schema.org/${f.condition || 'NewCondition'}`,
      ...(f.offerUrl && { url: f.offerUrl.startsWith('http') ? f.offerUrl : `https://${f.offerUrl}` }),
    }
  }

  if (f.ratingValue && f.ratingCount) {
    schema['aggregateRating'] = {
      '@type': 'AggregateRating',
      ratingValue: parseFloat(f.ratingValue),
      reviewCount: parseInt(f.ratingCount),
      bestRating: 5,
      worstRating: 1,
    }
  }

  return JSON.stringify(schema, null, 2)
}

function buildEvent(f: {
  name: string; description: string; image: string
  startDate: string; startTime: string; endDate: string; endTime: string
  locationName: string; locationAddress: string; locationCity: string; locationState: string
  eventStatus: string; attendanceMode: string; organizerName: string; organizerUrl: string
  price: string; currency: string; ticketUrl: string; eventUrl: string
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
  }
  if (f.name) schema['name'] = f.name
  if (f.description) schema['description'] = f.description
  if (f.image) schema['image'] = f.image.startsWith('http') ? f.image : `https://${f.image}`
  if (f.eventUrl) schema['url'] = f.eventUrl.startsWith('http') ? f.eventUrl : `https://${f.eventUrl}`

  if (f.startDate) {
    schema['startDate'] = f.startTime ? `${f.startDate}T${f.startTime}` : f.startDate
  }
  if (f.endDate) {
    schema['endDate'] = f.endTime ? `${f.endDate}T${f.endTime}` : f.endDate
  }

  schema['eventStatus'] = `https://schema.org/${f.eventStatus || 'EventScheduled'}`
  schema['eventAttendanceMode'] = `https://schema.org/${f.attendanceMode || 'OfflineEventAttendanceMode'}`

  if (f.locationName || f.locationAddress) {
    schema['location'] = {
      '@type': f.attendanceMode === 'OnlineEventAttendanceMode' ? 'VirtualLocation' : 'Place',
      ...(f.locationName && { name: f.locationName }),
      ...(f.locationAddress && {
        address: {
          '@type': 'PostalAddress',
          streetAddress: f.locationAddress,
          ...(f.locationCity && { addressLocality: f.locationCity }),
          ...(f.locationState && { addressRegion: f.locationState }),
        },
      }),
    }
  }

  if (f.organizerName) {
    schema['organizer'] = {
      '@type': 'Organization',
      name: f.organizerName,
      ...(f.organizerUrl && { url: f.organizerUrl.startsWith('http') ? f.organizerUrl : `https://${f.organizerUrl}` }),
    }
  }

  if (f.price && f.currency) {
    schema['offers'] = {
      '@type': 'Offer',
      price: f.price,
      priceCurrency: f.currency,
      ...(f.ticketUrl && { url: f.ticketUrl.startsWith('http') ? f.ticketUrl : `https://${f.ticketUrl}` }),
    }
  }

  return JSON.stringify(schema, null, 2)
}

function buildOrganization(f: {
  name: string; description: string; url: string; logo: string; email: string; phone: string
  foundingYear: string; employees: string; street: string; city: string; state: string; zip: string
  socials: Record<string, string>
}) {
  const schema: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'Organization' }
  if (f.name) schema['name'] = f.name
  if (f.description) schema['description'] = f.description
  if (f.url) schema['url'] = f.url.startsWith('http') ? f.url : `https://${f.url}`
  if (f.email) schema['email'] = f.email
  if (f.phone) schema['telephone'] = f.phone
  if (f.foundingYear) schema['foundingDate'] = f.foundingYear
  if (f.employees) schema['numberOfEmployees'] = { '@type': 'QuantitativeValue', value: parseInt(f.employees) }
  if (f.logo) schema['logo'] = { '@type': 'ImageObject', url: f.logo.startsWith('http') ? f.logo : `https://${f.logo}` }
  if (f.street || f.city || f.state || f.zip) {
    schema['address'] = {
      '@type': 'PostalAddress',
      ...(f.street && { streetAddress: f.street }),
      ...(f.city && { addressLocality: f.city }),
      ...(f.state && { addressRegion: f.state }),
      ...(f.zip && { postalCode: f.zip }),
    }
  }
  const sameAs = SOCIAL_PLATFORMS.map(p => f.socials[p.key]).filter(Boolean)
  if (sameAs.length > 0) schema['sameAs'] = sameAs
  return JSON.stringify(schema, null, 2)
}

function buildHowTo(f: {
  name: string; description: string; image: string; totalTime: string
  costAmount: string; costCurrency: string; steps: HowToStep[]
}) {
  const schema: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'HowTo' }
  if (f.name) schema['name'] = f.name
  if (f.description) schema['description'] = f.description
  if (f.image) schema['image'] = f.image.startsWith('http') ? f.image : `https://${f.image}`
  if (f.totalTime) schema['totalTime'] = f.totalTime
  if (f.costAmount && f.costCurrency) schema['estimatedCost'] = { '@type': 'MonetaryAmount', currency: f.costCurrency, value: f.costAmount }
  const validSteps = f.steps.filter(s => s.name && s.text)
  if (validSteps.length > 0) {
    schema['step'] = validSteps.map(s => ({
      '@type': 'HowToStep',
      name: s.name,
      text: s.text,
      ...(s.image && { image: s.image.startsWith('http') ? s.image : `https://${s.image}` }),
    }))
  }
  return JSON.stringify(schema, null, 2)
}

function buildWebSite(f: { name: string; url: string; description: string; enableSearch: boolean; searchUrl: string }) {
  const schema: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'WebSite' }
  if (f.name) schema['name'] = f.name
  if (f.url) schema['url'] = f.url.startsWith('http') ? f.url : `https://${f.url}`
  if (f.description) schema['description'] = f.description
  if (f.enableSearch && f.searchUrl) {
    schema['potentialAction'] = {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: f.searchUrl },
      'query-input': 'required name=search_term_string',
    }
  }
  return JSON.stringify(schema, null, 2)
}

function buildSoftwareApp(f: {
  name: string; description: string; url: string; image: string; category: string
  os: string[]; price: string; currency: string; ratingValue: string; ratingCount: string
}) {
  const schema: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'SoftwareApplication' }
  if (f.name) schema['name'] = f.name
  if (f.description) schema['description'] = f.description
  if (f.url) schema['url'] = f.url.startsWith('http') ? f.url : `https://${f.url}`
  if (f.image) schema['image'] = f.image.startsWith('http') ? f.image : `https://${f.image}`
  if (f.category) schema['applicationCategory'] = f.category
  if (f.os.length > 0) schema['operatingSystem'] = f.os.join(', ')
  const priceVal = f.price === '' ? '0' : f.price
  schema['offers'] = { '@type': 'Offer', price: priceVal, priceCurrency: f.currency || 'USD' }
  if (f.ratingValue && f.ratingCount) {
    schema['aggregateRating'] = { '@type': 'AggregateRating', ratingValue: parseFloat(f.ratingValue), reviewCount: parseInt(f.ratingCount), bestRating: 5, worstRating: 1 }
  }
  return JSON.stringify(schema, null, 2)
}

function buildBreadcrumb(items: BreadcrumbItem[]) {
  const valid = items.filter(i => i.name && i.url)
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: valid.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `https://${item.url}`,
    })),
  }
  return JSON.stringify(schema, null, 2)
}

function buildVideo(f: {
  name: string; description: string; thumbnailUrl: string; uploadDate: string
  durationMin: string; durationSec: string; contentUrl: string; embedUrl: string
  publisherName: string; publisherLogo: string
}) {
  const schema: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'VideoObject' }
  if (f.name) schema['name'] = f.name
  if (f.description) schema['description'] = f.description
  if (f.thumbnailUrl) schema['thumbnailUrl'] = f.thumbnailUrl.startsWith('http') ? f.thumbnailUrl : `https://${f.thumbnailUrl}`
  if (f.uploadDate) schema['uploadDate'] = f.uploadDate
  if (f.durationMin || f.durationSec) {
    const m = parseInt(f.durationMin || '0')
    const s = parseInt(f.durationSec || '0')
    schema['duration'] = `PT${m}M${s}S`
  }
  if (f.contentUrl) schema['contentUrl'] = f.contentUrl.startsWith('http') ? f.contentUrl : `https://${f.contentUrl}`
  if (f.embedUrl) schema['embedUrl'] = f.embedUrl
  if (f.publisherName) {
    schema['publisher'] = {
      '@type': 'Organization',
      name: f.publisherName,
      ...(f.publisherLogo && { logo: { '@type': 'ImageObject', url: f.publisherLogo.startsWith('http') ? f.publisherLogo : `https://${f.publisherLogo}` } }),
    }
  }
  return JSON.stringify(schema, null, 2)
}

function buildRecipe(f: {
  name: string; description: string; image: string; prepTime: string; cookTime: string
  totalTime: string; recipeYield: string; recipeCategory: string; recipeCuisine: string
  keywords: string; recipeIngredients: string; recipeInstructions: string
  calories: string; ratingValue: string; ratingCount: string
}) {
  const schema: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'Recipe' }
  if (f.name) schema['name'] = f.name
  if (f.description) schema['description'] = f.description
  if (f.image) schema['image'] = f.image.startsWith('http') ? f.image : `https://${f.image}`
  if (f.prepTime) schema['prepTime'] = f.prepTime
  if (f.cookTime) schema['cookTime'] = f.cookTime
  if (f.totalTime) schema['totalTime'] = f.totalTime
  if (f.recipeYield) schema['recipeYield'] = f.recipeYield
  if (f.recipeCategory) schema['recipeCategory'] = f.recipeCategory
  if (f.recipeCuisine) schema['recipeCuisine'] = f.recipeCuisine
  if (f.keywords) schema['keywords'] = f.keywords
  if (f.recipeIngredients) {
    schema['recipeIngredient'] = f.recipeIngredients.split('\n').map(s => s.trim()).filter(Boolean)
  }
  if (f.recipeInstructions) {
    schema['recipeInstructions'] = f.recipeInstructions.split('\n').map((s, i) => ({
      '@type': 'HowToStep',
      name: `Step ${i + 1}`,
      text: s.trim(),
    })).filter(s => s.text)
  }
  if (f.calories) schema['nutrition'] = { '@type': 'NutritionInformation', calories: f.calories }
  if (f.ratingValue && f.ratingCount) {
    schema['aggregateRating'] = { '@type': 'AggregateRating', ratingValue: parseFloat(f.ratingValue), reviewCount: parseInt(f.ratingCount), bestRating: 5, worstRating: 1 }
  }
  return JSON.stringify(schema, null, 2)
}

function buildJobPosting(f: {
  title: string; description: string; datePosted: string; validThrough: string
  employmentType: string; hiringOrgName: string; hiringOrgUrl: string
  baseSalaryMin: string; baseSalaryMax: string; salaryCurrency: string; salaryPeriod: string
  jobLocationCity: string; jobLocationState: string; jobLocationCountry: string; remote: boolean
}) {
  const schema: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'JobPosting' }
  if (f.title) schema['title'] = f.title
  if (f.description) schema['description'] = f.description
  if (f.datePosted) schema['datePosted'] = f.datePosted
  if (f.validThrough) schema['validThrough'] = f.validThrough
  if (f.employmentType) schema['employmentType'] = f.employmentType
  if (f.hiringOrgName) {
    schema['hiringOrganization'] = {
      '@type': 'Organization',
      name: f.hiringOrgName,
      ...(f.hiringOrgUrl && { sameAs: f.hiringOrgUrl.startsWith('http') ? f.hiringOrgUrl : `https://${f.hiringOrgUrl}` }),
    }
  }
  if (f.remote) {
    schema['applicantLocationRequirements'] = { '@type': 'Country', name: 'Anywhere' }
    schema['jobLocationType'] = 'TELECOMMUTE'
  } else if (f.jobLocationCity) {
    schema['jobLocation'] = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: f.jobLocationCity,
        ...(f.jobLocationState && { addressRegion: f.jobLocationState }),
        addressCountry: f.jobLocationCountry || 'US',
      },
    }
  }
  if (f.baseSalaryMin && f.salaryCurrency) {
    schema['baseSalary'] = {
      '@type': 'MonetaryAmount',
      currency: f.salaryCurrency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: parseFloat(f.baseSalaryMin),
        ...(f.baseSalaryMax && { maxValue: parseFloat(f.baseSalaryMax) }),
        unitText: f.salaryPeriod || 'YEAR',
      },
    }
  }
  return JSON.stringify(schema, null, 2)
}

function buildCourse(f: {
  name: string; description: string; provider: string; providerUrl: string
  url: string; courseMode: string; price: string; priceCurrency: string
  startDate: string; endDate: string
}) {
  const schema: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'Course' }
  if (f.name) schema['name'] = f.name
  if (f.description) schema['description'] = f.description
  if (f.url) schema['url'] = f.url.startsWith('http') ? f.url : `https://${f.url}`
  if (f.provider) {
    schema['provider'] = {
      '@type': 'Organization',
      name: f.provider,
      ...(f.providerUrl && { sameAs: f.providerUrl.startsWith('http') ? f.providerUrl : `https://${f.providerUrl}` }),
    }
  }
  const instance: Record<string, unknown> = { '@type': 'CourseInstance' }
  if (f.courseMode) instance['courseMode'] = f.courseMode
  if (f.startDate) instance['startDate'] = f.startDate
  if (f.endDate) instance['endDate'] = f.endDate
  if (f.price && f.priceCurrency) {
    instance['offers'] = { '@type': 'Offer', price: f.price, priceCurrency: f.priceCurrency }
  }
  schema['hasCourseInstance'] = instance
  return JSON.stringify(schema, null, 2)
}

function buildNewsArticle(f: {
  headline: string; description: string; image: string; datePublished: string
  dateModified: string; articleSection: string; authorName: string
  publisherName: string; publisherLogo: string; articleUrl: string
}) {
  const schema: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'NewsArticle' }
  if (f.headline) schema['headline'] = f.headline
  if (f.description) schema['description'] = f.description
  if (f.image) schema['image'] = f.image.startsWith('http') ? f.image : `https://${f.image}`
  if (f.articleUrl) schema['url'] = f.articleUrl.startsWith('http') ? f.articleUrl : `https://${f.articleUrl}`
  if (f.datePublished) schema['datePublished'] = f.datePublished
  if (f.dateModified) schema['dateModified'] = f.dateModified
  if (f.articleSection) schema['articleSection'] = f.articleSection
  if (f.authorName) schema['author'] = { '@type': 'Person', name: f.authorName }
  if (f.publisherName) {
    schema['publisher'] = {
      '@type': 'Organization',
      name: f.publisherName,
      ...(f.publisherLogo && { logo: { '@type': 'ImageObject', url: f.publisherLogo.startsWith('http') ? f.publisherLogo : `https://${f.publisherLogo}` } }),
    }
  }
  return JSON.stringify(schema, null, 2)
}

function buildPodcastEpisode(f: {
  name: string; description: string; partOfSeriesName: string; partOfSeriesUrl: string
  episodeNumber: string; datePublished: string; timeRequired: string; audioUrl: string
}) {
  const schema: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'PodcastEpisode' }
  if (f.name) schema['name'] = f.name
  if (f.description) schema['description'] = f.description
  if (f.episodeNumber) schema['episodeNumber'] = parseInt(f.episodeNumber)
  if (f.datePublished) schema['datePublished'] = f.datePublished
  if (f.timeRequired) schema['timeRequired'] = f.timeRequired
  if (f.partOfSeriesName) {
    schema['partOfSeries'] = {
      '@type': 'PodcastSeries',
      name: f.partOfSeriesName,
      ...(f.partOfSeriesUrl && { url: f.partOfSeriesUrl.startsWith('http') ? f.partOfSeriesUrl : `https://${f.partOfSeriesUrl}` }),
    }
  }
  if (f.audioUrl) {
    schema['associatedMedia'] = { '@type': 'MediaObject', contentUrl: f.audioUrl.startsWith('http') ? f.audioUrl : `https://${f.audioUrl}` }
  }
  return JSON.stringify(schema, null, 2)
}

// ─── Validation ────────────────────────────────────────────────────────────────

function getLocalBizWarnings(f: { name: string; url: string; phone: string; image: string; description: string; ratingValue: string; ratingCount: string }) {
  const warnings: string[] = []
  if (!f.name) warnings.push('Business name is required')
  if (!f.url) warnings.push('Website URL recommended — AI assistants use it to identify your business')
  if (!f.phone) warnings.push('Phone number recommended for Local Business rich results')
  if (!f.image) warnings.push('Image URL recommended — increases AI citation likelihood')
  if (!f.description) warnings.push('Description helps AI assistants understand what your business does')
  if (f.ratingValue && !f.ratingCount) warnings.push('Review count required when rating value is set')
  if (f.ratingCount && !f.ratingValue) warnings.push('Rating value required when review count is set')
  if (f.ratingValue && (parseFloat(f.ratingValue) < 1 || parseFloat(f.ratingValue) > 5)) warnings.push('Rating value must be between 1 and 5')
  return warnings
}

function getFaqWarnings(faqs: FaqItem[]) {
  const warnings: string[] = []
  if (faqs.filter(f => f.question && f.answer).length === 0) warnings.push('Add at least one question and answer')
  const incomplete = faqs.filter(f => (f.question && !f.answer) || (!f.question && f.answer))
  if (incomplete.length > 0) warnings.push(`${incomplete.length} FAQ item(s) are missing question or answer`)
  if (faqs.filter(f => f.question && f.answer).length > 0 && faqs.length > 20) warnings.push('Google recommends fewer than 20 FAQ items for optimal display')
  return warnings
}

function getArticleWarnings(f: { headline: string; image: string; authorName: string; publisherName: string; publisherLogo: string; datePublished: string }) {
  const warnings: string[] = []
  if (!f.headline) warnings.push('Headline is required')
  if (!f.image) warnings.push('Image URL required for Article rich results in Google')
  if (!f.authorName) warnings.push('Author name required for Article rich results')
  if (!f.publisherName) warnings.push('Publisher name required')
  if (!f.publisherLogo) warnings.push('Publisher logo required for Google News eligibility')
  if (!f.datePublished) warnings.push('Date published required')
  return warnings
}

function getProductWarnings(f: { name: string; image: string; price: string; currency: string }) {
  const warnings: string[] = []
  if (!f.name) warnings.push('Product name is required')
  if (!f.image) warnings.push('Image required for Product rich results')
  if (!f.price) warnings.push('Price required for shopping result eligibility')
  if (f.price && !f.currency) warnings.push('Currency required when price is set')
  return warnings
}

function getEventWarnings(f: { name: string; startDate: string; locationName: string }) {
  const warnings: string[] = []
  if (!f.name) warnings.push('Event name is required')
  if (!f.startDate) warnings.push('Start date required for Event rich results')
  if (!f.locationName) warnings.push('Location name recommended')
  return warnings
}

function getOrganizationWarnings(f: { name: string; url: string }) {
  const warnings: string[] = []
  if (!f.name) warnings.push('Organization name is required')
  if (!f.url) warnings.push('Website URL required — helps AI assistants identify your organization')
  return warnings
}

function getHowToWarnings(f: { name: string; steps: HowToStep[] }) {
  const warnings: string[] = []
  if (!f.name) warnings.push('HowTo name is required')
  const valid = f.steps.filter(s => s.name && s.text)
  if (valid.length === 0) warnings.push('Add at least one step with a name and instructions')
  const incomplete = f.steps.filter(s => (s.name && !s.text) || (!s.name && s.text))
  if (incomplete.length > 0) warnings.push(`${incomplete.length} step(s) are missing name or text`)
  return warnings
}

function getWebSiteWarnings(f: { name: string; url: string; enableSearch: boolean; searchUrl: string }) {
  const warnings: string[] = []
  if (!f.name) warnings.push('Site name is required')
  if (!f.url) warnings.push('Site URL is required')
  if (f.enableSearch && !f.searchUrl) warnings.push('Search URL pattern required when search is enabled')
  if (f.enableSearch && f.searchUrl && !f.searchUrl.includes('{search_term_string}')) warnings.push('Search URL must include {search_term_string} placeholder')
  return warnings
}

function getSoftwareAppWarnings(f: { name: string; ratingValue: string; ratingCount: string }) {
  const warnings: string[] = []
  if (!f.name) warnings.push('App name is required')
  if (f.ratingValue && !f.ratingCount) warnings.push('Review count required when rating is set')
  if (f.ratingCount && !f.ratingValue) warnings.push('Rating value required when review count is set')
  return warnings
}

function getBreadcrumbWarnings(items: BreadcrumbItem[]) {
  const warnings: string[] = []
  const valid = items.filter(i => i.name && i.url)
  if (valid.length < 2) warnings.push('At least 2 complete breadcrumb items required')
  const incomplete = items.filter(i => (i.name && !i.url) || (!i.name && i.url))
  if (incomplete.length > 0) warnings.push(`${incomplete.length} item(s) are missing name or URL`)
  return warnings
}

function getVideoWarnings(f: { name: string; description: string; thumbnailUrl: string; uploadDate: string }) {
  const warnings: string[] = []
  if (!f.name) warnings.push('Video name is required')
  if (!f.description) warnings.push('Description required for Video rich results')
  if (!f.thumbnailUrl) warnings.push('Thumbnail URL required for Video rich results')
  if (!f.uploadDate) warnings.push('Upload date required')
  return warnings
}

function getRecipeWarnings(f: { name: string; image: string }) {
  const warnings: string[] = []
  if (!f.name) warnings.push('Recipe name is required')
  if (!f.image) warnings.push('Image URL required for Recipe rich results')
  return warnings
}

function getJobPostingWarnings(f: { title: string; description: string; datePosted: string; hiringOrgName: string; jobLocationCity: string; remote: boolean }) {
  const warnings: string[] = []
  if (!f.title) warnings.push('Job title is required')
  if (!f.description) warnings.push('Job description is required')
  if (!f.datePosted) warnings.push('Date posted is required')
  if (!f.hiringOrgName) warnings.push('Hiring organization name is required')
  if (!f.remote && !f.jobLocationCity) warnings.push('Job location city is required (or enable Remote)')
  return warnings
}

function getCourseWarnings(f: { name: string; description: string }) {
  const warnings: string[] = []
  if (!f.name) warnings.push('Course name is required')
  if (!f.description) warnings.push('Course description is required')
  return warnings
}

function getNewsArticleWarnings(f: { headline: string; image: string; datePublished: string }) {
  const warnings: string[] = []
  if (!f.headline) warnings.push('Headline is required')
  if (!f.image) warnings.push('Image URL required for Google News eligibility')
  if (!f.datePublished) warnings.push('Date published is required')
  return warnings
}

function getPodcastEpisodeWarnings(f: { name: string }) {
  const warnings: string[] = []
  if (!f.name) warnings.push('Episode name is required')
  return warnings
}

// ─── Rich Results Preview ──────────────────────────────────────────────────────

function LocalBizPreview({ name, url, phone, ratingValue, ratingCount, priceRange }: {
  name: string; url: string; phone: string; ratingValue: string; ratingCount: string; priceRange: string
}) {
  const domain = url
    ? (url.includes('://') ? url.replace(/^https?:\/\//, '') : url).split('/')[0]
    : 'yourwebsite.com'
  const rating = parseFloat(ratingValue)
  const stars = !isNaN(rating) ? Math.round(rating) : 0

  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      <p className="text-xs text-gray-500 mb-1 font-mono">{domain}</p>
      <p className="text-lg font-semibold text-blue-600 leading-snug mb-1">{name || 'Your Business Name'}</p>
      {(ratingValue && ratingCount) && (
        <div className="flex items-center gap-1 mb-1">
          <span className="text-yellow-500 text-sm">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
          <span className="text-xs text-gray-600">{ratingValue} · {ratingCount} reviews</span>
          {priceRange && <span className="text-xs text-gray-500 ml-1">· {priceRange}</span>}
        </div>
      )}
      {phone && <p className="text-xs text-gray-600 mt-0.5">{phone}</p>}
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google</p>
    </div>
  )
}

function FaqPreview({ faqs }: { faqs: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)
  const valid = faqs.filter(f => f.question && f.answer)
  if (valid.length === 0) return (
    <div className="rounded-xl p-4" style={{ background: '#fff', color: '#5f6368' }}>
      <p className="text-xs">Add FAQ items to see preview</p>
    </div>
  )
  return (
    <div className="rounded-xl font-sans overflow-hidden" style={{ background: '#fff', color: '#202124' }}>
      <p className="text-xs text-gray-500 px-3 pt-3 mb-2">queldrex.com › your-page</p>
      {valid.slice(0, 4).map((faq, i) => (
        <div key={i} className="border-t" style={{ borderColor: '#e8eaed' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-3 py-2 text-left"
          >
            <span className="text-sm text-blue-700 font-medium">{faq.question}</span>
            <svg className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
          </button>
          {open === i && (
            <div className="px-3 pb-3">
              <p className="text-xs text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
      <p className="text-xs text-gray-400 px-3 py-2 italic">Preview — actual appearance varies in Google Search</p>
    </div>
  )
}

function ArticlePreview({ headline, description, authorName, publisherName }: { headline: string; description: string; authorName: string; publisherName: string }) {
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      {publisherName && <p className="text-xs text-gray-500 mb-1">{publisherName}</p>}
      <p className="text-base font-semibold text-blue-700 leading-snug mb-1">{headline || 'Article Headline'}</p>
      {description && <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">{description}</p>}
      {authorName && <p className="text-xs text-gray-500">By {authorName}</p>}
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google</p>
    </div>
  )
}

function ProductPreview({ name, price, currency, ratingValue, ratingCount, brand }: {
  name: string; price: string; currency: string; ratingValue: string; ratingCount: string; brand: string
}) {
  const rating = parseFloat(ratingValue)
  const stars = !isNaN(rating) ? Math.round(rating) : 0
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      {brand && <p className="text-xs text-gray-500 mb-1">{brand}</p>}
      <p className="text-base font-semibold text-blue-700 leading-snug mb-1">{name || 'Product Name'}</p>
      {(ratingValue && ratingCount) && (
        <div className="flex items-center gap-1 mb-1">
          <span className="text-yellow-500 text-sm">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
          <span className="text-xs text-gray-600">{ratingValue} ({ratingCount})</span>
        </div>
      )}
      {price && <p className="text-sm font-bold text-gray-800">{currency} {price}</p>}
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google Shopping</p>
    </div>
  )
}

function EventPreview({ name, startDate, startTime, locationName }: { name: string; startDate: string; startTime: string; locationName: string }) {
  const dateStr = startDate
    ? new Date(`${startDate}T${startTime || '00:00'}`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date TBD'
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      <p className="text-base font-semibold text-blue-700 leading-snug mb-1">{name || 'Event Name'}</p>
      <p className="text-xs text-gray-600 mb-0.5">{dateStr}{startTime ? ` · ${startTime}` : ''}</p>
      {locationName && <p className="text-xs text-gray-500">{locationName}</p>}
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google Events</p>
    </div>
  )
}

function OrganizationPreview({ name, url, description }: { name: string; url: string; description: string }) {
  const domain = url ? (url.includes('://') ? url.replace(/^https?:\/\//, '') : url).split('/')[0] : 'yoursite.com'
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      <p className="text-xs text-gray-500 mb-1">{domain}</p>
      <p className="text-base font-semibold text-blue-700 leading-snug mb-1">{name || 'Organization Name'}</p>
      {description && <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{description}</p>}
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google</p>
    </div>
  )
}

function HowToPreview({ name, steps }: { name: string; steps: HowToStep[] }) {
  const valid = steps.filter(s => s.name && s.text)
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      <p className="text-sm font-semibold text-blue-700 mb-2">{name || 'How To Guide'}</p>
      {valid.slice(0, 3).map((s, i) => (
        <div key={i} className="flex gap-2 mb-1.5">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">{i + 1}</span>
          <div>
            <p className="text-xs font-semibold text-gray-800">{s.name}</p>
            <p className="text-xs text-gray-500 line-clamp-1">{s.text}</p>
          </div>
        </div>
      ))}
      {valid.length === 0 && <p className="text-xs text-gray-400">Add steps to see preview</p>}
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google</p>
    </div>
  )
}

function WebSitePreview({ name, url, enableSearch }: { name: string; url: string; enableSearch: boolean }) {
  const domain = url ? (url.includes('://') ? url.replace(/^https?:\/\//, '') : url).split('/')[0] : 'yoursite.com'
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      <p className="text-xs text-gray-500 mb-1">{domain}</p>
      <p className="text-base font-semibold text-blue-700 mb-2">{name || 'Your Site Name'}</p>
      {enableSearch && (
        <div className="flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <span className="text-xs text-gray-400">Search {name || 'this site'}...</span>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google</p>
    </div>
  )
}

function SoftwareAppPreview({ name, category, os, price, currency, ratingValue, ratingCount }: {
  name: string; category: string; os: string[]; price: string; currency: string; ratingValue: string; ratingCount: string
}) {
  const rating = parseFloat(ratingValue)
  const stars = !isNaN(rating) ? Math.round(rating) : 0
  const priceLabel = (!price || price === '0') ? 'Free' : `${currency} ${price}`
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      {category && <p className="text-xs text-gray-500 mb-1">{category.replace('Application', '')}</p>}
      <p className="text-base font-semibold text-blue-700 mb-1">{name || 'App Name'}</p>
      {(ratingValue && ratingCount) && (
        <div className="flex items-center gap-1 mb-1">
          <span className="text-yellow-500 text-sm">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
          <span className="text-xs text-gray-600">{ratingValue} ({ratingCount})</span>
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-gray-700">{priceLabel}</span>
        {os.map(o => <span key={o} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{o}</span>)}
      </div>
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google</p>
    </div>
  )
}

function BreadcrumbPreview({ items }: { items: BreadcrumbItem[] }) {
  const valid = items.filter(i => i.name)
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      <p className="text-xs text-gray-500 mb-2">Google Search result</p>
      <div className="flex items-center gap-1 flex-wrap">
        {valid.map((item, i) => (
          <span key={i} className="flex items-center gap-1">
            <span className="text-xs text-gray-600">{item.name}</span>
            {i < valid.length - 1 && <span className="text-xs text-gray-400">›</span>}
          </span>
        ))}
        {valid.length === 0 && <span className="text-xs text-gray-400">Home › Category › Page</span>}
      </div>
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google</p>
    </div>
  )
}

function VideoPreview({ name, uploadDate, durationMin, durationSec }: { name: string; uploadDate: string; durationMin: string; durationSec: string }) {
  const dateStr = uploadDate ? new Date(uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''
  const dur = (durationMin || durationSec) ? `${durationMin || '0'}:${(durationSec || '0').padStart(2, '0')}` : ''
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      <div className="flex gap-3">
        <div className="w-24 h-14 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-700 leading-snug">{name || 'Video Title'}</p>
          {dateStr && <p className="text-xs text-gray-500 mt-0.5">{dateStr}</p>}
          {dur && <p className="text-xs text-gray-500">{dur}</p>}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google</p>
    </div>
  )
}

function RecipePreview({ name, ratingValue, ratingCount, prepTime, cookTime }: { name: string; ratingValue: string; ratingCount: string; prepTime: string; cookTime: string }) {
  const rating = parseFloat(ratingValue)
  const stars = !isNaN(rating) ? Math.round(rating) : 0
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      <p className="text-base font-semibold text-blue-700 mb-1">{name || 'Recipe Name'}</p>
      {ratingValue && ratingCount && (
        <div className="flex items-center gap-1 mb-1">
          <span className="text-yellow-500 text-sm">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
          <span className="text-xs text-gray-600">{ratingValue} ({ratingCount})</span>
        </div>
      )}
      <div className="flex gap-3 text-xs text-gray-500">
        {prepTime && <span>Prep: {prepTime.replace('PT', '').toLowerCase()}</span>}
        {cookTime && <span>Cook: {cookTime.replace('PT', '').toLowerCase()}</span>}
      </div>
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google</p>
    </div>
  )
}

function JobPostingPreview({ title, hiringOrgName, jobLocationCity, baseSalaryMin, salaryCurrency }: { title: string; hiringOrgName: string; jobLocationCity: string; baseSalaryMin: string; salaryCurrency: string }) {
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      <p className="text-base font-semibold text-blue-700 mb-1">{title || 'Job Title'}</p>
      {hiringOrgName && <p className="text-sm text-gray-700 mb-0.5">{hiringOrgName}</p>}
      {jobLocationCity && <p className="text-xs text-gray-500 mb-0.5">{jobLocationCity}</p>}
      {baseSalaryMin && <p className="text-xs font-semibold text-gray-700">{salaryCurrency || 'USD'} {baseSalaryMin}+/yr</p>}
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google for Jobs</p>
    </div>
  )
}

function CoursePreview({ name, provider, courseMode }: { name: string; provider: string; courseMode: string }) {
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      <p className="text-base font-semibold text-blue-700 mb-1">{name || 'Course Name'}</p>
      {provider && <p className="text-xs text-gray-600 mb-0.5">{provider}</p>}
      {courseMode && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{courseMode}</span>}
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google</p>
    </div>
  )
}

function NewsArticlePreview({ headline, description, authorName, publisherName }: { headline: string; description: string; authorName: string; publisherName: string }) {
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      {publisherName && <p className="text-xs text-gray-500 mb-1">{publisherName}</p>}
      <p className="text-base font-semibold text-blue-700 leading-snug mb-1">{headline || 'News Headline'}</p>
      {description && <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">{description}</p>}
      {authorName && <p className="text-xs text-gray-500">By {authorName}</p>}
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in Google News</p>
    </div>
  )
}

function PodcastEpisodePreview({ name, partOfSeriesName, episodeNumber }: { name: string; partOfSeriesName: string; episodeNumber: string }) {
  return (
    <div className="rounded-xl p-4 font-sans" style={{ background: '#fff', color: '#202124' }}>
      {partOfSeriesName && <p className="text-xs text-gray-500 mb-1">{partOfSeriesName}{episodeNumber ? ` · Ep. ${episodeNumber}` : ''}</p>}
      <p className="text-base font-semibold text-blue-700 leading-snug">{name || 'Episode Title'}</p>
      <p className="text-xs text-gray-400 mt-2 italic">Preview — actual appearance varies in AI podcast search</p>
    </div>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
  padding: '10px 14px', color: 'white', fontSize: 13, outline: 'none', width: '100%',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
}
const sectionStyle: React.CSSProperties = {
  background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)',
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SchemaGeneratorPage() {
  const [activeTab, setActiveTab] = useState<SchemaTab>('localbusiness')
  const [copied, setCopied] = useState(false)
  const [minify, setMinify] = useState(false)
  const [schemaStack, setSchemaStack] = useState<StackItem[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [restoredSchema, setRestoredSchema] = useState<string | null>(null)

  // LocalBusiness state
  const [lbType, setLbType] = useState('LocalBusiness')
  const [lbName, setLbName] = useState('')
  const [lbDescription, setLbDescription] = useState('')
  const [lbUrl, setLbUrl] = useState('')
  const [lbPhone, setLbPhone] = useState('')
  const [lbEmail, setLbEmail] = useState('')
  const [lbStreet, setLbStreet] = useState('')
  const [lbCity, setLbCity] = useState('')
  const [lbState, setLbState] = useState('CO')
  const [lbZip, setLbZip] = useState('')
  const [lbCountry] = useState('US')
  const [lbPriceRange, setLbPriceRange] = useState('')
  const [lbImage, setLbImage] = useState('')
  const [lbHours, setLbHours] = useState<Record<string, DayHours>>(defaultHours)
  const [lbLat, setLbLat] = useState('')
  const [lbLng, setLbLng] = useState('')
  const [lbRatingValue, setLbRatingValue] = useState('')
  const [lbRatingCount, setLbRatingCount] = useState('')
  const [lbFoundingYear, setLbFoundingYear] = useState('')
  const [lbSocials, setLbSocials] = useState<Record<string, string>>({})

  // FAQ state
  const [faqs, setFaqs] = useState<FaqItem[]>([
    { question: '', answer: '' },
    { question: '', answer: '' },
  ])

  // Article state
  const [artType, setArtType] = useState('Article')
  const [artHeadline, setArtHeadline] = useState('')
  const [artDescription, setArtDescription] = useState('')
  const [artImage, setArtImage] = useState('')
  const [artAuthorName, setArtAuthorName] = useState('')
  const [artAuthorUrl, setArtAuthorUrl] = useState('')
  const [artPublisherName, setArtPublisherName] = useState('')
  const [artPublisherLogo, setArtPublisherLogo] = useState('')
  const [artDatePublished, setArtDatePublished] = useState('')
  const [artDateModified, setArtDateModified] = useState('')
  const [artUrl, setArtUrl] = useState('')

  // Product state
  const [prodName, setProdName] = useState('')
  const [prodDescription, setProdDescription] = useState('')
  const [prodImage, setProdImage] = useState('')
  const [prodBrand, setProdBrand] = useState('')
  const [prodSku, setProdSku] = useState('')
  const [prodGtin, setProdGtin] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodCurrency, setProdCurrency] = useState('USD')
  const [prodAvailability, setProdAvailability] = useState('InStock')
  const [prodCondition, setProdCondition] = useState('NewCondition')
  const [prodOfferUrl, setProdOfferUrl] = useState('')
  const [prodRatingValue, setProdRatingValue] = useState('')
  const [prodRatingCount, setProdRatingCount] = useState('')

  // Event state
  const [evName, setEvName] = useState('')
  const [evDescription, setEvDescription] = useState('')
  const [evImage, setEvImage] = useState('')
  const [evStartDate, setEvStartDate] = useState('')
  const [evStartTime, setEvStartTime] = useState('')
  const [evEndDate, setEvEndDate] = useState('')
  const [evEndTime, setEvEndTime] = useState('')
  const [evLocationName, setEvLocationName] = useState('')
  const [evLocationAddress, setEvLocationAddress] = useState('')
  const [evLocationCity, setEvLocationCity] = useState('')
  const [evLocationState, setEvLocationState] = useState('')
  const [evStatus, setEvStatus] = useState('EventScheduled')
  const [evAttendanceMode, setEvAttendanceMode] = useState('OfflineEventAttendanceMode')
  const [evOrganizerName, setEvOrganizerName] = useState('')
  const [evOrganizerUrl, setEvOrganizerUrl] = useState('')
  const [evPrice, setEvPrice] = useState('')
  const [evCurrency, setEvCurrency] = useState('USD')
  const [evTicketUrl, setEvTicketUrl] = useState('')
  const [evUrl, setEvUrl] = useState('')

  // Organization state
  const [orgName, setOrgName] = useState('')
  const [orgDescription, setOrgDescription] = useState('')
  const [orgUrl, setOrgUrl] = useState('')
  const [orgLogo, setOrgLogo] = useState('')
  const [orgEmail, setOrgEmail] = useState('')
  const [orgPhone, setOrgPhone] = useState('')
  const [orgFoundingYear, setOrgFoundingYear] = useState('')
  const [orgEmployees, setOrgEmployees] = useState('')
  const [orgStreet, setOrgStreet] = useState('')
  const [orgCity, setOrgCity] = useState('')
  const [orgState, setOrgState] = useState('CO')
  const [orgZip, setOrgZip] = useState('')
  const [orgSocials, setOrgSocials] = useState<Record<string, string>>({})

  // HowTo state
  const [htName, setHtName] = useState('')
  const [htDescription, setHtDescription] = useState('')
  const [htImage, setHtImage] = useState('')
  const [htTotalTime, setHtTotalTime] = useState('')
  const [htCostAmount, setHtCostAmount] = useState('')
  const [htCostCurrency, setHtCostCurrency] = useState('USD')
  const [htSteps, setHtSteps] = useState<HowToStep[]>([
    { name: '', text: '', image: '' },
    { name: '', text: '', image: '' },
  ])

  // WebSite state
  const [wsName, setWsName] = useState('')
  const [wsUrl, setWsUrl] = useState('')
  const [wsDescription, setWsDescription] = useState('')
  const [wsEnableSearch, setWsEnableSearch] = useState(false)
  const [wsSearchUrl, setWsSearchUrl] = useState('')

  // SoftwareApp state
  const [appName, setAppName] = useState('')
  const [appDescription, setAppDescription] = useState('')
  const [appUrl, setAppUrl] = useState('')
  const [appImage, setAppImage] = useState('')
  const [appCategory, setAppCategory] = useState('BusinessApplication')
  const [appOs, setAppOs] = useState<string[]>(['Web'])
  const [appPrice, setAppPrice] = useState('0')
  const [appCurrency, setAppCurrency] = useState('USD')
  const [appRatingValue, setAppRatingValue] = useState('')
  const [appRatingCount, setAppRatingCount] = useState('')

  // Breadcrumb state
  const [bcItems, setBcItems] = useState<BreadcrumbItem[]>([
    { name: 'Home', url: 'https://example.com' },
    { name: 'Category', url: 'https://example.com/category' },
    { name: 'Page', url: 'https://example.com/category/page' },
  ])

  // Video state
  const [vidName, setVidName] = useState('')
  const [vidDescription, setVidDescription] = useState('')
  const [vidThumbnail, setVidThumbnail] = useState('')
  const [vidUploadDate, setVidUploadDate] = useState('')
  const [vidDurationMin, setVidDurationMin] = useState('')
  const [vidDurationSec, setVidDurationSec] = useState('')
  const [vidContentUrl, setVidContentUrl] = useState('')
  const [vidEmbedUrl, setVidEmbedUrl] = useState('')
  const [vidPublisherName, setVidPublisherName] = useState('')
  const [vidPublisherLogo, setVidPublisherLogo] = useState('')

  // Recipe state
  const [recName, setRecName] = useState('')
  const [recDescription, setRecDescription] = useState('')
  const [recImage, setRecImage] = useState('')
  const [recPrepTime, setRecPrepTime] = useState('')
  const [recCookTime, setRecCookTime] = useState('')
  const [recTotalTime, setRecTotalTime] = useState('')
  const [recYield, setRecYield] = useState('')
  const [recCategory, setRecCategory] = useState('')
  const [recCuisine, setRecCuisine] = useState('')
  const [recKeywords, setRecKeywords] = useState('')
  const [recIngredients, setRecIngredients] = useState('')
  const [recInstructions, setRecInstructions] = useState('')
  const [recCalories, setRecCalories] = useState('')
  const [recRatingValue, setRecRatingValue] = useState('')
  const [recRatingCount, setRecRatingCount] = useState('')

  // JobPosting state
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobDatePosted, setJobDatePosted] = useState('')
  const [jobValidThrough, setJobValidThrough] = useState('')
  const [jobEmploymentType, setJobEmploymentType] = useState('FULL_TIME')
  const [jobHiringOrgName, setJobHiringOrgName] = useState('')
  const [jobHiringOrgUrl, setJobHiringOrgUrl] = useState('')
  const [jobSalaryMin, setJobSalaryMin] = useState('')
  const [jobSalaryMax, setJobSalaryMax] = useState('')
  const [jobSalaryCurrency, setJobSalaryCurrency] = useState('USD')
  const [jobSalaryPeriod, setJobSalaryPeriod] = useState('YEAR')
  const [jobLocationCity, setJobLocationCity] = useState('')
  const [jobLocationState, setJobLocationState] = useState('')
  const [jobLocationCountry, setJobLocationCountry] = useState('US')
  const [jobRemote, setJobRemote] = useState(false)

  // Course state
  const [crsName, setCrsName] = useState('')
  const [crsDescription, setCrsDescription] = useState('')
  const [crsProvider, setCrsProvider] = useState('')
  const [crsProviderUrl, setCrsProviderUrl] = useState('')
  const [crsUrl, setCrsUrl] = useState('')
  const [crsCourseMode, setCrsCourseMode] = useState('Online')
  const [crsPrice, setCrsPrice] = useState('')
  const [crsPriceCurrency, setCrsPriceCurrency] = useState('USD')
  const [crsStartDate, setCrsStartDate] = useState('')
  const [crsEndDate, setCrsEndDate] = useState('')

  // NewsArticle state
  const [naHeadline, setNaHeadline] = useState('')
  const [naDescription, setNaDescription] = useState('')
  const [naImage, setNaImage] = useState('')
  const [naDatePublished, setNaDatePublished] = useState('')
  const [naDateModified, setNaDateModified] = useState('')
  const [naArticleSection, setNaArticleSection] = useState('')
  const [naAuthorName, setNaAuthorName] = useState('')
  const [naPublisherName, setNaPublisherName] = useState('')
  const [naPublisherLogo, setNaPublisherLogo] = useState('')
  const [naArticleUrl, setNaArticleUrl] = useState('')

  // PodcastEpisode state
  const [podName, setPodName] = useState('')
  const [podDescription, setPodDescription] = useState('')
  const [podSeriesName, setPodSeriesName] = useState('')
  const [podSeriesUrl, setPodSeriesUrl] = useState('')
  const [podEpisodeNumber, setPodEpisodeNumber] = useState('')
  const [podDatePublished, setPodDatePublished] = useState('')
  const [podTimeRequired, setPodTimeRequired] = useState('')
  const [podAudioUrl, setPodAudioUrl] = useState('')

  // localStorage history
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sqx-schema-history')
      if (stored) setHistory(JSON.parse(stored))
    } catch {}
  }, [])

  // ── Computed output ──
  let schema = ''
  let warnings: string[] = []
  let preview: React.ReactNode = null

  if (activeTab === 'localbusiness') {
    schema = buildLocalBusiness({
      type: lbType, name: lbName, description: lbDescription, url: lbUrl,
      phone: lbPhone, email: lbEmail, street: lbStreet, city: lbCity, state: lbState,
      zip: lbZip, country: lbCountry, priceRange: lbPriceRange, image: lbImage,
      hours: lbHours, lat: lbLat, lng: lbLng, ratingValue: lbRatingValue,
      ratingCount: lbRatingCount, socials: lbSocials, foundingYear: lbFoundingYear,
    })
    warnings = getLocalBizWarnings({ name: lbName, url: lbUrl, phone: lbPhone, image: lbImage, description: lbDescription, ratingValue: lbRatingValue, ratingCount: lbRatingCount })
    preview = <LocalBizPreview name={lbName} url={lbUrl} phone={lbPhone} ratingValue={lbRatingValue} ratingCount={lbRatingCount} priceRange={lbPriceRange} />
  } else if (activeTab === 'faqpage') {
    schema = buildFaqPage(faqs)
    warnings = getFaqWarnings(faqs)
    preview = <FaqPreview faqs={faqs} />
  } else if (activeTab === 'article') {
    schema = buildArticle({ headline: artHeadline, description: artDescription, image: artImage, authorName: artAuthorName, authorUrl: artAuthorUrl, publisherName: artPublisherName, publisherLogo: artPublisherLogo, datePublished: artDatePublished, dateModified: artDateModified, articleUrl: artUrl, articleType: artType })
    warnings = getArticleWarnings({ headline: artHeadline, image: artImage, authorName: artAuthorName, publisherName: artPublisherName, publisherLogo: artPublisherLogo, datePublished: artDatePublished })
    preview = <ArticlePreview headline={artHeadline} description={artDescription} authorName={artAuthorName} publisherName={artPublisherName} />
  } else if (activeTab === 'product') {
    schema = buildProduct({ name: prodName, description: prodDescription, image: prodImage, brand: prodBrand, sku: prodSku, gtin: prodGtin, price: prodPrice, currency: prodCurrency, availability: prodAvailability, offerUrl: prodOfferUrl, ratingValue: prodRatingValue, ratingCount: prodRatingCount, condition: prodCondition })
    warnings = getProductWarnings({ name: prodName, image: prodImage, price: prodPrice, currency: prodCurrency })
    preview = <ProductPreview name={prodName} price={prodPrice} currency={prodCurrency} ratingValue={prodRatingValue} ratingCount={prodRatingCount} brand={prodBrand} />
  } else if (activeTab === 'event') {
    schema = buildEvent({ name: evName, description: evDescription, image: evImage, startDate: evStartDate, startTime: evStartTime, endDate: evEndDate, endTime: evEndTime, locationName: evLocationName, locationAddress: evLocationAddress, locationCity: evLocationCity, locationState: evLocationState, eventStatus: evStatus, attendanceMode: evAttendanceMode, organizerName: evOrganizerName, organizerUrl: evOrganizerUrl, price: evPrice, currency: evCurrency, ticketUrl: evTicketUrl, eventUrl: evUrl })
    warnings = getEventWarnings({ name: evName, startDate: evStartDate, locationName: evLocationName })
    preview = <EventPreview name={evName} startDate={evStartDate} startTime={evStartTime} locationName={evLocationName} />
  } else if (activeTab === 'organization') {
    schema = buildOrganization({ name: orgName, description: orgDescription, url: orgUrl, logo: orgLogo, email: orgEmail, phone: orgPhone, foundingYear: orgFoundingYear, employees: orgEmployees, street: orgStreet, city: orgCity, state: orgState, zip: orgZip, socials: orgSocials })
    warnings = getOrganizationWarnings({ name: orgName, url: orgUrl })
    preview = <OrganizationPreview name={orgName} url={orgUrl} description={orgDescription} />
  } else if (activeTab === 'howto') {
    schema = buildHowTo({ name: htName, description: htDescription, image: htImage, totalTime: htTotalTime, costAmount: htCostAmount, costCurrency: htCostCurrency, steps: htSteps })
    warnings = getHowToWarnings({ name: htName, steps: htSteps })
    preview = <HowToPreview name={htName} steps={htSteps} />
  } else if (activeTab === 'website') {
    schema = buildWebSite({ name: wsName, url: wsUrl, description: wsDescription, enableSearch: wsEnableSearch, searchUrl: wsSearchUrl })
    warnings = getWebSiteWarnings({ name: wsName, url: wsUrl, enableSearch: wsEnableSearch, searchUrl: wsSearchUrl })
    preview = <WebSitePreview name={wsName} url={wsUrl} enableSearch={wsEnableSearch} />
  } else if (activeTab === 'softwareapp') {
    schema = buildSoftwareApp({ name: appName, description: appDescription, url: appUrl, image: appImage, category: appCategory, os: appOs, price: appPrice, currency: appCurrency, ratingValue: appRatingValue, ratingCount: appRatingCount })
    warnings = getSoftwareAppWarnings({ name: appName, ratingValue: appRatingValue, ratingCount: appRatingCount })
    preview = <SoftwareAppPreview name={appName} category={appCategory} os={appOs} price={appPrice} currency={appCurrency} ratingValue={appRatingValue} ratingCount={appRatingCount} />
  } else if (activeTab === 'breadcrumb') {
    schema = buildBreadcrumb(bcItems)
    warnings = getBreadcrumbWarnings(bcItems)
    preview = <BreadcrumbPreview items={bcItems} />
  } else if (activeTab === 'video') {
    schema = buildVideo({ name: vidName, description: vidDescription, thumbnailUrl: vidThumbnail, uploadDate: vidUploadDate, durationMin: vidDurationMin, durationSec: vidDurationSec, contentUrl: vidContentUrl, embedUrl: vidEmbedUrl, publisherName: vidPublisherName, publisherLogo: vidPublisherLogo })
    warnings = getVideoWarnings({ name: vidName, description: vidDescription, thumbnailUrl: vidThumbnail, uploadDate: vidUploadDate })
    preview = <VideoPreview name={vidName} uploadDate={vidUploadDate} durationMin={vidDurationMin} durationSec={vidDurationSec} />
  } else if (activeTab === 'recipe') {
    schema = buildRecipe({ name: recName, description: recDescription, image: recImage, prepTime: recPrepTime, cookTime: recCookTime, totalTime: recTotalTime, recipeYield: recYield, recipeCategory: recCategory, recipeCuisine: recCuisine, keywords: recKeywords, recipeIngredients: recIngredients, recipeInstructions: recInstructions, calories: recCalories, ratingValue: recRatingValue, ratingCount: recRatingCount })
    warnings = getRecipeWarnings({ name: recName, image: recImage })
    preview = <RecipePreview name={recName} ratingValue={recRatingValue} ratingCount={recRatingCount} prepTime={recPrepTime} cookTime={recCookTime} />
  } else if (activeTab === 'jobposting') {
    schema = buildJobPosting({ title: jobTitle, description: jobDescription, datePosted: jobDatePosted, validThrough: jobValidThrough, employmentType: jobEmploymentType, hiringOrgName: jobHiringOrgName, hiringOrgUrl: jobHiringOrgUrl, baseSalaryMin: jobSalaryMin, baseSalaryMax: jobSalaryMax, salaryCurrency: jobSalaryCurrency, salaryPeriod: jobSalaryPeriod, jobLocationCity, jobLocationState, jobLocationCountry, remote: jobRemote })
    warnings = getJobPostingWarnings({ title: jobTitle, description: jobDescription, datePosted: jobDatePosted, hiringOrgName: jobHiringOrgName, jobLocationCity, remote: jobRemote })
    preview = <JobPostingPreview title={jobTitle} hiringOrgName={jobHiringOrgName} jobLocationCity={jobLocationCity} baseSalaryMin={jobSalaryMin} salaryCurrency={jobSalaryCurrency} />
  } else if (activeTab === 'course') {
    schema = buildCourse({ name: crsName, description: crsDescription, provider: crsProvider, providerUrl: crsProviderUrl, url: crsUrl, courseMode: crsCourseMode, price: crsPrice, priceCurrency: crsPriceCurrency, startDate: crsStartDate, endDate: crsEndDate })
    warnings = getCourseWarnings({ name: crsName, description: crsDescription })
    preview = <CoursePreview name={crsName} provider={crsProvider} courseMode={crsCourseMode} />
  } else if (activeTab === 'newsarticle') {
    schema = buildNewsArticle({ headline: naHeadline, description: naDescription, image: naImage, datePublished: naDatePublished, dateModified: naDateModified, articleSection: naArticleSection, authorName: naAuthorName, publisherName: naPublisherName, publisherLogo: naPublisherLogo, articleUrl: naArticleUrl })
    warnings = getNewsArticleWarnings({ headline: naHeadline, image: naImage, datePublished: naDatePublished })
    preview = <NewsArticlePreview headline={naHeadline} description={naDescription} authorName={naAuthorName} publisherName={naPublisherName} />
  } else if (activeTab === 'podcastepisode') {
    schema = buildPodcastEpisode({ name: podName, description: podDescription, partOfSeriesName: podSeriesName, partOfSeriesUrl: podSeriesUrl, episodeNumber: podEpisodeNumber, datePublished: podDatePublished, timeRequired: podTimeRequired, audioUrl: podAudioUrl })
    warnings = getPodcastEpisodeWarnings({ name: podName })
    preview = <PodcastEpisodePreview name={podName} partOfSeriesName={podSeriesName} episodeNumber={podEpisodeNumber} />
  }

  const displaySchema = restoredSchema ?? schema
  const outputJson = minify
    ? (() => { try { return JSON.stringify(JSON.parse(displaySchema)) } catch { return displaySchema } })()
    : displaySchema
  const scriptTag = `<script type="application/ld+json">\n${outputJson}\n</script>`

  const TAB_LABELS: Record<SchemaTab, string> = {
    localbusiness: 'Local Business', faqpage: 'FAQ Page', article: 'Article',
    product: 'Product', event: 'Event', organization: 'Organization',
    howto: 'HowTo', website: 'WebSite', softwareapp: 'Software App',
    breadcrumb: 'Breadcrumb', video: 'Video', recipe: 'Recipe',
    jobposting: 'Job Posting', course: 'Course', newsarticle: 'News Article',
    podcastepisode: 'Podcast Episode',
  }

  const testUrl = (() => {
    const urlMap: Partial<Record<SchemaTab, string>> = {
      localbusiness: lbUrl, article: artUrl, product: prodOfferUrl,
      website: wsUrl, softwareapp: appUrl, organization: orgUrl,
    }
    const u = urlMap[activeTab]
    if (u) return `https://search.google.com/test/rich-results?url=${encodeURIComponent(u.startsWith('http') ? u : `https://${u}`)}`
    return 'https://search.google.com/test/rich-results'
  })()

  function copy() {
    if (restoredSchema) {
      navigator.clipboard.writeText(`<script type="application/ld+json">\n${restoredSchema}\n</script>`)
    } else {
      navigator.clipboard.writeText(scriptTag)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      type: activeTab,
      label: TAB_LABELS[activeTab],
      schema: displaySchema,
      ts: Date.now(),
    }
    try {
      const next = [newItem, ...history].slice(0, 5)
      localStorage.setItem('sqx-schema-history', JSON.stringify(next))
      setHistory(next)
    } catch {}
  }

  function download() {
    const blob = new Blob([scriptTag], { type: 'text/html' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `schema-${activeTab}.html`
    a.click()
  }

  const TABS: { id: SchemaTab; label: string; badge?: string }[] = [
    { id: 'localbusiness', label: 'Local Business' },
    { id: 'faqpage', label: 'FAQ Page', badge: 'Deprecated' },
    { id: 'article', label: 'Article' },
    { id: 'product', label: 'Product' },
    { id: 'event', label: 'Event' },
    { id: 'organization', label: 'Organization' },
    { id: 'howto', label: 'HowTo', badge: 'Deprecated' },
    { id: 'website', label: 'WebSite' },
    { id: 'softwareapp', label: 'Software App' },
    { id: 'breadcrumb', label: 'Breadcrumb' },
    { id: 'video', label: 'Video' },
    { id: 'recipe', label: 'Recipe', badge: 'Popular' },
    { id: 'jobposting', label: 'Job Posting', badge: 'New' },
    { id: 'course', label: 'Course' },
    { id: 'newsarticle', label: 'News Article', badge: 'New' },
    { id: 'podcastepisode', label: 'Podcast Episode' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#070b14' }}>
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-10">

        <Link href="/tools" className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors mb-8">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          All Tools
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase"
              style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}>
              Free Tool · AI Visibility
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase"
              style={{ borderColor: 'rgba(74,222,128,0.25)', background: 'rgba(74,222,128,0.08)', color: '#4ade80' }}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              No API Key Required
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Schema Markup Generator</h1>
          <p className="text-white/45 text-sm leading-relaxed max-w-2xl mb-4">
            Generate valid JSON-LD structured data for 16 schema types — Local Business, Article, Product, Recipe, Job Posting, and more. Test free here, then license this tool for your own platform or agency. Runs entirely in your browser, no API key needed.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Get this tool — $29 →</Link>
            <Link href="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>All 51 tools — from $99 →</Link>
          </div>
        </div>

        {/* Schema Type Tabs */}
        <div className="flex items-center gap-1 mb-8 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={{
                background: activeTab === tab.id ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                color: activeTab === tab.id ? '#06d6ff' : 'rgba(255,255,255,0.4)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {tab.label}
              {tab.badge && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── FORM PANEL ────────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* LOCAL BUSINESS */}
            {activeTab === 'localbusiness' && (
              <>
                <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Business Details</p>
                  <div>
                    <label style={labelStyle}>Business Type</label>
                    <select value={lbType} onChange={e => setLbType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {BUSINESS_TYPES.map(bt => <option key={bt.value} value={bt.value}>{bt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Business Name *</label>
                    <input type="text" value={lbName} onChange={e => setLbName(e.target.value)} placeholder="Acme Plumbing LLC" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea value={lbDescription} onChange={e => setLbDescription(e.target.value)} placeholder="We provide residential and commercial plumbing services in Castle Rock, CO." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Website URL</label>
                      <input type="text" value={lbUrl} onChange={e => setLbUrl(e.target.value)} placeholder="example.com" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <input type="text" value={lbPhone} onChange={e => setLbPhone(e.target.value)} placeholder="+1-303-555-0100" style={inputStyle} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input type="email" value={lbEmail} onChange={e => setLbEmail(e.target.value)} placeholder="hello@example.com" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Founding Year</label>
                      <input type="text" value={lbFoundingYear} onChange={e => setLbFoundingYear(e.target.value)} placeholder="2015" style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Image URL</label>
                    <input type="text" value={lbImage} onChange={e => setLbImage(e.target.value)} placeholder="example.com/logo.png" style={inputStyle} />
                  </div>
                </div>

                <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Address</p>
                  <div>
                    <label style={labelStyle}>Street Address</label>
                    <input type="text" value={lbStreet} onChange={e => setLbStreet(e.target.value)} placeholder="123 Main St" style={inputStyle} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label style={labelStyle}>City</label>
                      <input type="text" value={lbCity} onChange={e => setLbCity(e.target.value)} placeholder="Castle Rock" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>State</label>
                      <select value={lbState} onChange={e => setLbState(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>ZIP</label>
                      <input type="text" value={lbZip} onChange={e => setLbZip(e.target.value)} placeholder="80104" style={inputStyle} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Latitude (optional)</label>
                      <input type="text" value={lbLat} onChange={e => setLbLat(e.target.value)} placeholder="39.3722" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Longitude (optional)</label>
                      <input type="text" value={lbLng} onChange={e => setLbLng(e.target.value)} placeholder="-104.8561" style={inputStyle} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Ratings & Pricing</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label style={labelStyle}>Avg Rating (1–5)</label>
                      <input type="number" min="1" max="5" step="0.1" value={lbRatingValue} onChange={e => setLbRatingValue(e.target.value)} placeholder="4.8" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Review Count</label>
                      <input type="number" min="1" value={lbRatingCount} onChange={e => setLbRatingCount(e.target.value)} placeholder="127" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Price Range</label>
                      <select value={lbPriceRange} onChange={e => setLbPriceRange(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">— optional —</option>
                        <option value="$">$ (inexpensive)</option>
                        <option value="$$">$$ (moderate)</option>
                        <option value="$$$">$$$ (expensive)</option>
                        <option value="$$$$">$$$$ (very expensive)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Social Profiles (sameAs)</p>
                  <p className="text-xs text-white/30 -mt-2">Helps AI assistants and Google link your profiles together.</p>
                  {SOCIAL_PLATFORMS.map(platform => (
                    <div key={platform.key}>
                      <label style={labelStyle}>{platform.label}</label>
                      <input
                        type="text"
                        value={lbSocials[platform.key] || ''}
                        onChange={e => setLbSocials(s => ({ ...s, [platform.key]: e.target.value }))}
                        placeholder={platform.placeholder}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border p-6" style={sectionStyle}>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Business Hours</p>
                  <div className="space-y-2">
                    {DAYS.map(day => (
                      <div key={day} className="flex items-center gap-3">
                        <button
                          onClick={() => setLbHours(h => ({ ...h, [day]: { ...h[day], closed: !h[day].closed } }))}
                          className="w-5 h-5 rounded flex-shrink-0 border flex items-center justify-center transition-colors"
                          style={{
                            background: lbHours[day].closed ? 'rgba(255,255,255,0.05)' : 'rgba(6,182,212,0.2)',
                            borderColor: lbHours[day].closed ? 'rgba(255,255,255,0.15)' : 'rgba(6,182,212,0.5)',
                          }}
                        >
                          {!lbHours[day].closed && (
                            <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span className="text-xs text-white/60 w-24 flex-shrink-0">{day}</span>
                        {lbHours[day].closed ? (
                          <span className="text-xs text-white/25">Closed</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input type="time" value={lbHours[day].open} onChange={e => setLbHours(h => ({ ...h, [day]: { ...h[day], open: e.target.value } }))}
                              style={{ ...inputStyle, width: 'auto', padding: '5px 10px', fontSize: 12 }} />
                            <span className="text-white/25 text-xs">to</span>
                            <input type="time" value={lbHours[day].close} onChange={e => setLbHours(h => ({ ...h, [day]: { ...h[day], close: e.target.value } }))}
                              style={{ ...inputStyle, width: 'auto', padding: '5px 10px', fontSize: 12 }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* FAQ PAGE */}
            {activeTab === 'faqpage' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">FAQ Items</p>
                  <button
                    onClick={() => setFaqs(f => [...f, { question: '', answer: '' }])}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(6,182,212,0.1)', color: '#06d6ff', border: '1px solid rgba(6,182,212,0.25)' }}
                  >
                    + Add Question
                  </button>
                </div>
                <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', color: 'rgba(251,191,36,0.9)' }}>
                  ⚠️ Google removed FAQ rich results on May 7, 2026. This schema no longer generates rich snippets in Google Search. It still helps AI assistants (ChatGPT, Perplexity) cite your content.
                </div>
                {faqs.map((faq, i) => (
                  <div key={i} className="rounded-xl border p-4 space-y-3" style={{ background: '#070b14', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/30">Question {i + 1}</span>
                      {faqs.length > 1 && (
                        <button onClick={() => setFaqs(f => f.filter((_, idx) => idx !== i))}
                          className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Remove</button>
                      )}
                    </div>
                    <div>
                      <label style={labelStyle}>Question</label>
                      <input type="text" value={faq.question} onChange={e => setFaqs(f => f.map((item, idx) => idx === i ? { ...item, question: e.target.value } : item))}
                        placeholder="What services do you offer?" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Answer</label>
                      <textarea value={faq.answer} onChange={e => setFaqs(f => f.map((item, idx) => idx === i ? { ...item, answer: e.target.value } : item))}
                        placeholder="We offer residential plumbing, drain cleaning, water heater installation, and emergency repairs." rows={3}
                        style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ARTICLE */}
            {activeTab === 'article' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Article Details</p>
                <div>
                  <label style={labelStyle}>Article Type</label>
                  <select value={artType} onChange={e => setArtType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="Article">Article (generic)</option>
                    <option value="BlogPosting">Blog Post</option>
                    <option value="NewsArticle">News Article</option>
                    <option value="TechArticle">Technical Article</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Headline *</label>
                  <input type="text" value={artHeadline} onChange={e => setArtHeadline(e.target.value)} placeholder="How to Optimize Your Business for AI Search" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={artDescription} onChange={e => setArtDescription(e.target.value)} placeholder="A comprehensive guide to..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>Article URL</label>
                  <input type="text" value={artUrl} onChange={e => setArtUrl(e.target.value)} placeholder="example.com/blog/your-article" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Image URL *</label>
                  <input type="text" value={artImage} onChange={e => setArtImage(e.target.value)} placeholder="example.com/images/article.jpg" style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Date Published *</label>
                    <input type="date" value={artDatePublished} onChange={e => setArtDatePublished(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Date Modified</label>
                    <input type="date" value={artDateModified} onChange={e => setArtDateModified(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Author Name *</label>
                    <input type="text" value={artAuthorName} onChange={e => setArtAuthorName(e.target.value)} placeholder="Jane Smith" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Author URL</label>
                    <input type="text" value={artAuthorUrl} onChange={e => setArtAuthorUrl(e.target.value)} placeholder="example.com/about/jane" style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Publisher Name *</label>
                    <input type="text" value={artPublisherName} onChange={e => setArtPublisherName(e.target.value)} placeholder="Queldrex" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Publisher Logo URL *</label>
                    <input type="text" value={artPublisherLogo} onChange={e => setArtPublisherLogo(e.target.value)} placeholder="example.com/logo.png" style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCT */}
            {activeTab === 'product' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Product Details</p>
                <div>
                  <label style={labelStyle}>Product Name *</label>
                  <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} placeholder="Wireless Noise-Cancelling Headphones" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={prodDescription} onChange={e => setProdDescription(e.target.value)} placeholder="Premium wireless headphones with 30-hour battery life..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>Image URL *</label>
                  <input type="text" value={prodImage} onChange={e => setProdImage(e.target.value)} placeholder="example.com/products/headphones.jpg" style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Brand</label>
                    <input type="text" value={prodBrand} onChange={e => setProdBrand(e.target.value)} placeholder="Sony" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>SKU</label>
                    <input type="text" value={prodSku} onChange={e => setProdSku(e.target.value)} placeholder="WH-1000XM5" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>GTIN / Barcode (optional)</label>
                  <input type="text" value={prodGtin} onChange={e => setProdGtin(e.target.value)} placeholder="012345678901" style={inputStyle} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label style={labelStyle}>Price *</label>
                    <input type="number" min="0" step="0.01" value={prodPrice} onChange={e => setProdPrice(e.target.value)} placeholder="299.99" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Currency</label>
                    <select value={prodCurrency} onChange={e => setProdCurrency(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Availability</label>
                    <select value={prodAvailability} onChange={e => setProdAvailability(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="InStock">In Stock</option>
                      <option value="OutOfStock">Out of Stock</option>
                      <option value="PreOrder">Pre-Order</option>
                      <option value="Discontinued">Discontinued</option>
                      <option value="LimitedAvailability">Limited Availability</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Condition</label>
                    <select value={prodCondition} onChange={e => setProdCondition(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="NewCondition">New</option>
                      <option value="UsedCondition">Used</option>
                      <option value="RefurbishedCondition">Refurbished</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Offer / Buy URL</label>
                    <input type="text" value={prodOfferUrl} onChange={e => setProdOfferUrl(e.target.value)} placeholder="example.com/buy/headphones" style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Avg Rating (1–5)</label>
                    <input type="number" min="1" max="5" step="0.1" value={prodRatingValue} onChange={e => setProdRatingValue(e.target.value)} placeholder="4.6" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Review Count</label>
                    <input type="number" min="1" value={prodRatingCount} onChange={e => setProdRatingCount(e.target.value)} placeholder="1243" style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {/* EVENT */}
            {activeTab === 'event' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Event Details</p>
                <div>
                  <label style={labelStyle}>Event Name *</label>
                  <input type="text" value={evName} onChange={e => setEvName(e.target.value)} placeholder="Annual Tech Summit 2026" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={evDescription} onChange={e => setEvDescription(e.target.value)} placeholder="Join industry leaders for a full day of talks..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>Event URL</label>
                  <input type="text" value={evUrl} onChange={e => setEvUrl(e.target.value)} placeholder="example.com/events/tech-summit" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Image URL</label>
                  <input type="text" value={evImage} onChange={e => setEvImage(e.target.value)} placeholder="example.com/events/banner.jpg" style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Start Date *</label>
                    <input type="date" value={evStartDate} onChange={e => setEvStartDate(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Start Time</label>
                    <input type="time" value={evStartTime} onChange={e => setEvStartTime(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input type="date" value={evEndDate} onChange={e => setEvEndDate(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Time</label>
                    <input type="time" value={evEndTime} onChange={e => setEvEndTime(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Event Status</label>
                    <select value={evStatus} onChange={e => setEvStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="EventScheduled">Scheduled</option>
                      <option value="EventCancelled">Cancelled</option>
                      <option value="EventPostponed">Postponed</option>
                      <option value="EventRescheduled">Rescheduled</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Attendance Mode</label>
                    <select value={evAttendanceMode} onChange={e => setEvAttendanceMode(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="OfflineEventAttendanceMode">In Person</option>
                      <option value="OnlineEventAttendanceMode">Online</option>
                      <option value="MixedEventAttendanceMode">Hybrid</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Location Name</label>
                  <input type="text" value={evLocationName} onChange={e => setEvLocationName(e.target.value)} placeholder="Denver Convention Center" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Location Address</label>
                  <input type="text" value={evLocationAddress} onChange={e => setEvLocationAddress(e.target.value)} placeholder="700 14th St, Denver, CO 80202" style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Organizer Name</label>
                    <input type="text" value={evOrganizerName} onChange={e => setEvOrganizerName(e.target.value)} placeholder="Queldrex LLC" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Organizer URL</label>
                    <input type="text" value={evOrganizerUrl} onChange={e => setEvOrganizerUrl(e.target.value)} placeholder="queldrex.com" style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label style={labelStyle}>Ticket Price</label>
                    <input type="number" min="0" step="0.01" value={evPrice} onChange={e => setEvPrice(e.target.value)} placeholder="49" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Currency</label>
                    <select value={evCurrency} onChange={e => setEvCurrency(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Ticket URL</label>
                    <input type="text" value={evTicketUrl} onChange={e => setEvTicketUrl(e.target.value)} placeholder="eventbrite.com/..." style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {/* ORGANIZATION */}
            {activeTab === 'organization' && (
              <>
                <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Organization Details</p>
                  <div><label style={labelStyle}>Organization Name *</label><input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Acme Corp" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Description</label><textarea value={orgDescription} onChange={e => setOrgDescription(e.target.value)} placeholder="What does your organization do?" rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label style={labelStyle}>Website URL *</label><input type="text" value={orgUrl} onChange={e => setOrgUrl(e.target.value)} placeholder="example.com" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Logo URL</label><input type="text" value={orgLogo} onChange={e => setOrgLogo(e.target.value)} placeholder="example.com/logo.png" style={inputStyle} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label style={labelStyle}>Email</label><input type="email" value={orgEmail} onChange={e => setOrgEmail(e.target.value)} placeholder="hello@example.com" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Phone</label><input type="text" value={orgPhone} onChange={e => setOrgPhone(e.target.value)} placeholder="+1-303-555-0100" style={inputStyle} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label style={labelStyle}>Founding Year</label><input type="text" value={orgFoundingYear} onChange={e => setOrgFoundingYear(e.target.value)} placeholder="2015" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Number of Employees</label><input type="number" min="1" value={orgEmployees} onChange={e => setOrgEmployees(e.target.value)} placeholder="50" style={inputStyle} /></div>
                  </div>
                </div>
                <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Address (optional)</p>
                  <div><label style={labelStyle}>Street</label><input type="text" value={orgStreet} onChange={e => setOrgStreet(e.target.value)} placeholder="123 Main St" style={inputStyle} /></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1"><label style={labelStyle}>City</label><input type="text" value={orgCity} onChange={e => setOrgCity(e.target.value)} placeholder="Denver" style={inputStyle} /></div>
                    <div><label style={labelStyle}>State</label><select value={orgState} onChange={e => setOrgState(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>{STATES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    <div><label style={labelStyle}>ZIP</label><input type="text" value={orgZip} onChange={e => setOrgZip(e.target.value)} placeholder="80201" style={inputStyle} /></div>
                  </div>
                </div>
                <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Social Profiles (sameAs)</p>
                  {SOCIAL_PLATFORMS.map(platform => (
                    <div key={platform.key}>
                      <label style={labelStyle}>{platform.label}</label>
                      <input type="text" value={orgSocials[platform.key] || ''} onChange={e => setOrgSocials(s => ({ ...s, [platform.key]: e.target.value }))} placeholder={platform.placeholder} style={inputStyle} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* HOWTO */}
            {activeTab === 'howto' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">HowTo Details</p>
                <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', color: 'rgba(251,191,36,0.9)' }}>
                  ⚠️ Google removed HowTo rich results. This schema no longer generates rich snippets in Google Search. It still helps AI assistants cite your content.
                </div>
                <div><label style={labelStyle}>Guide Name *</label><input type="text" value={htName} onChange={e => setHtName(e.target.value)} placeholder="How to Change a Tire" style={inputStyle} /></div>
                <div><label style={labelStyle}>Description</label><textarea value={htDescription} onChange={e => setHtDescription(e.target.value)} rows={2} placeholder="A step-by-step guide to..." style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <div><label style={labelStyle}>Image URL</label><input type="text" value={htImage} onChange={e => setHtImage(e.target.value)} placeholder="example.com/guide-image.jpg" style={inputStyle} /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label style={labelStyle}>Total Time</label><input type="text" value={htTotalTime} onChange={e => setHtTotalTime(e.target.value)} placeholder="PT30M" style={inputStyle} /><p className="text-xs text-white/25 mt-1">PT30M = 30 min, PT1H = 1 hr</p></div>
                  <div><label style={labelStyle}>Est. Cost</label><input type="number" min="0" step="0.01" value={htCostAmount} onChange={e => setHtCostAmount(e.target.value)} placeholder="0" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Currency</label><select value={htCostCurrency} onChange={e => setHtCostCurrency(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>{CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Steps</p>
                  <button onClick={() => setHtSteps(s => [...s, { name: '', text: '', image: '' }])} className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#06d6ff', border: '1px solid rgba(6,182,212,0.25)' }}>+ Add Step</button>
                </div>
                {htSteps.map((step, i) => (
                  <div key={i} className="rounded-xl border p-4 space-y-3" style={{ background: '#070b14', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/30">Step {i + 1}</span>
                      {htSteps.length > 1 && <button onClick={() => setHtSteps(s => s.filter((_, idx) => idx !== i))} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Remove</button>}
                    </div>
                    <div><label style={labelStyle}>Step Name *</label><input type="text" value={step.name} onChange={e => setHtSteps(s => s.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} placeholder="Remove the flat tire" style={inputStyle} /></div>
                    <div><label style={labelStyle}>Instructions *</label><textarea value={step.text} onChange={e => setHtSteps(s => s.map((x, idx) => idx === i ? { ...x, text: e.target.value } : x))} placeholder="Loosen the lug nuts counterclockwise..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></div>
                    <div><label style={labelStyle}>Step Image URL</label><input type="text" value={step.image} onChange={e => setHtSteps(s => s.map((x, idx) => idx === i ? { ...x, image: e.target.value } : x))} placeholder="example.com/step1.jpg" style={inputStyle} /></div>
                  </div>
                ))}
              </div>
            )}

            {/* WEBSITE */}
            {activeTab === 'website' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">WebSite Details</p>
                <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', color: 'rgba(251,191,36,0.8)' }}>
                  WebSite schema with SearchAction enables the Google Sitelinks Searchbox — a search bar shown directly in your search result.
                </div>
                <div><label style={labelStyle}>Site Name *</label><input type="text" value={wsName} onChange={e => setWsName(e.target.value)} placeholder="Queldrex" style={inputStyle} /></div>
                <div><label style={labelStyle}>Site URL *</label><input type="text" value={wsUrl} onChange={e => setWsUrl(e.target.value)} placeholder="queldrex.com" style={inputStyle} /></div>
                <div><label style={labelStyle}>Description</label><textarea value={wsDescription} onChange={e => setWsDescription(e.target.value)} rows={2} placeholder="What your site does..." style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={() => setWsEnableSearch(s => !s)} className="w-5 h-5 rounded flex-shrink-0 border flex items-center justify-center transition-colors" style={{ background: wsEnableSearch ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)', borderColor: wsEnableSearch ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.15)' }}>
                    {wsEnableSearch && <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                  </button>
                  <span className="text-xs text-white/60">Enable Sitelinks Searchbox (SearchAction)</span>
                </div>
                {wsEnableSearch && (
                  <div>
                    <label style={labelStyle}>Search URL Pattern *</label>
                    <input type="text" value={wsSearchUrl} onChange={e => setWsSearchUrl(e.target.value)} placeholder="https://example.com/search?q={search_term_string}" style={inputStyle} />
                    <p className="text-xs text-white/25 mt-1">Must include {'{search_term_string}'} placeholder</p>
                  </div>
                )}
              </div>
            )}

            {/* SOFTWARE APP */}
            {activeTab === 'softwareapp' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Software Application</p>
                <div><label style={labelStyle}>App Name *</label><input type="text" value={appName} onChange={e => setAppName(e.target.value)} placeholder="Queldrex AI Scanner" style={inputStyle} /></div>
                <div><label style={labelStyle}>Description</label><textarea value={appDescription} onChange={e => setAppDescription(e.target.value)} rows={2} placeholder="What does your app do?" style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label style={labelStyle}>App URL</label><input type="text" value={appUrl} onChange={e => setAppUrl(e.target.value)} placeholder="example.com/app" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Image URL</label><input type="text" value={appImage} onChange={e => setAppImage(e.target.value)} placeholder="example.com/icon.png" style={inputStyle} /></div>
                </div>
                <div><label style={labelStyle}>Category</label><select value={appCategory} onChange={e => setAppCategory(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>{APP_CATEGORIES.map(c => <option key={c} value={c}>{c.replace('Application', '')}</option>)}</select></div>
                <div>
                  <label style={labelStyle}>Operating System(s)</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {OS_OPTIONS.map(os => (
                      <button key={os} onClick={() => setAppOs(prev => prev.includes(os) ? prev.filter(x => x !== os) : [...prev, os])} className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all" style={{ background: appOs.includes(os) ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.05)', color: appOs.includes(os) ? '#06d6ff' : 'rgba(255,255,255,0.4)', border: `1px solid ${appOs.includes(os) ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.1)'}` }}>{os}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label style={labelStyle}>Price (0 = Free)</label><input type="number" min="0" step="0.01" value={appPrice} onChange={e => setAppPrice(e.target.value)} placeholder="0" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Currency</label><select value={appCurrency} onChange={e => setAppCurrency(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>{CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><label style={labelStyle}>Avg Rating</label><input type="number" min="1" max="5" step="0.1" value={appRatingValue} onChange={e => setAppRatingValue(e.target.value)} placeholder="4.5" style={inputStyle} /></div>
                </div>
                <div><label style={labelStyle}>Review Count</label><input type="number" min="1" value={appRatingCount} onChange={e => setAppRatingCount(e.target.value)} placeholder="234" style={inputStyle} /></div>
              </div>
            )}

            {/* BREADCRUMB */}
            {activeTab === 'breadcrumb' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Breadcrumb Items</p>
                  <button onClick={() => setBcItems(s => [...s, { name: '', url: '' }])} className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: 'rgba(6,182,212,0.1)', color: '#06d6ff', border: '1px solid rgba(6,182,212,0.25)' }}>+ Add Item</button>
                </div>
                {bcItems.map((item, i) => (
                  <div key={i} className="rounded-xl border p-4 space-y-3" style={{ background: '#070b14', borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/30">Item {i + 1}</span>
                      {bcItems.length > 2 && <button onClick={() => setBcItems(s => s.filter((_, idx) => idx !== i))} className="text-xs text-red-400/60 hover:text-red-400 transition-colors">Remove</button>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label style={labelStyle}>Name</label><input type="text" value={item.name} onChange={e => setBcItems(s => s.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))} placeholder="Home" style={inputStyle} /></div>
                      <div><label style={labelStyle}>URL</label><input type="text" value={item.url} onChange={e => setBcItems(s => s.map((x, idx) => idx === i ? { ...x, url: e.target.value } : x))} placeholder="https://example.com" style={inputStyle} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* VIDEO */}
            {activeTab === 'video' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Video Details</p>
                <div><label style={labelStyle}>Video Name *</label><input type="text" value={vidName} onChange={e => setVidName(e.target.value)} placeholder="How to Optimize Your AI Visibility" style={inputStyle} /></div>
                <div><label style={labelStyle}>Description *</label><textarea value={vidDescription} onChange={e => setVidDescription(e.target.value)} rows={3} placeholder="In this video we cover..." style={{ ...inputStyle, resize: 'vertical' }} /></div>
                <div><label style={labelStyle}>Thumbnail URL *</label><input type="text" value={vidThumbnail} onChange={e => setVidThumbnail(e.target.value)} placeholder="example.com/thumbnail.jpg" style={inputStyle} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label style={labelStyle}>Upload Date *</label><input type="date" value={vidUploadDate} onChange={e => setVidUploadDate(e.target.value)} style={inputStyle} /></div>
                  <div>
                    <label style={labelStyle}>Duration</label>
                    <div className="flex items-center gap-2">
                      <input type="number" min="0" value={vidDurationMin} onChange={e => setVidDurationMin(e.target.value)} placeholder="5" style={{ ...inputStyle, width: 'auto' }} />
                      <span className="text-white/30 text-xs flex-shrink-0">min</span>
                      <input type="number" min="0" max="59" value={vidDurationSec} onChange={e => setVidDurationSec(e.target.value)} placeholder="30" style={{ ...inputStyle, width: 'auto' }} />
                      <span className="text-white/30 text-xs flex-shrink-0">sec</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label style={labelStyle}>Content URL</label><input type="text" value={vidContentUrl} onChange={e => setVidContentUrl(e.target.value)} placeholder="example.com/video.mp4" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Embed URL</label><input type="text" value={vidEmbedUrl} onChange={e => setVidEmbedUrl(e.target.value)} placeholder="youtube.com/embed/..." style={inputStyle} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label style={labelStyle}>Publisher Name</label><input type="text" value={vidPublisherName} onChange={e => setVidPublisherName(e.target.value)} placeholder="Queldrex" style={inputStyle} /></div>
                  <div><label style={labelStyle}>Publisher Logo URL</label><input type="text" value={vidPublisherLogo} onChange={e => setVidPublisherLogo(e.target.value)} placeholder="example.com/logo.png" style={inputStyle} /></div>
                </div>
              </div>
            )}

            {/* RECIPE */}
            {activeTab === 'recipe' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Recipe Details</p>
                <div>
                  <label style={labelStyle}>Recipe Name <span style={{ color: '#f87171' }}>*</span></label>
                  <input type="text" value={recName} onChange={e => setRecName(e.target.value)} placeholder="Classic Chocolate Chip Cookies" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={recDescription} onChange={e => setRecDescription(e.target.value)} rows={2} placeholder="The best chewy chocolate chip cookies..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>Image URL <span style={{ color: '#f87171' }}>*</span></label>
                  <input type="text" value={recImage} onChange={e => setRecImage(e.target.value)} placeholder="example.com/cookies.jpg" style={inputStyle} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label style={labelStyle}>Prep Time</label>
                    <input type="text" value={recPrepTime} onChange={e => setRecPrepTime(e.target.value)} placeholder="PT15M" style={inputStyle} />
                    <p className="text-xs text-white/25 mt-1">PT15M = 15 min</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Cook Time</label>
                    <input type="text" value={recCookTime} onChange={e => setRecCookTime(e.target.value)} placeholder="PT12M" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Total Time</label>
                    <input type="text" value={recTotalTime} onChange={e => setRecTotalTime(e.target.value)} placeholder="PT27M" style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label style={labelStyle}>Yield / Servings</label>
                    <input type="text" value={recYield} onChange={e => setRecYield(e.target.value)} placeholder="24 cookies" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Category</label>
                    <input type="text" value={recCategory} onChange={e => setRecCategory(e.target.value)} placeholder="Dessert" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Cuisine</label>
                    <input type="text" value={recCuisine} onChange={e => setRecCuisine(e.target.value)} placeholder="American" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Keywords</label>
                  <input type="text" value={recKeywords} onChange={e => setRecKeywords(e.target.value)} placeholder="cookies, chocolate chip, baking" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Ingredients (one per line)</label>
                  <textarea value={recIngredients} onChange={e => setRecIngredients(e.target.value)} rows={5} placeholder={"2 1/4 cups all-purpose flour\n1 tsp baking soda\n1 tsp salt\n1 cup butter, softened"} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>Instructions (one step per line)</label>
                  <textarea value={recInstructions} onChange={e => setRecInstructions(e.target.value)} rows={5} placeholder={"Preheat oven to 375°F.\nBeat butter and sugars until creamy.\nAdd eggs and vanilla, mix well.\nBake for 9-11 minutes or until golden brown."} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label style={labelStyle}>Calories</label>
                    <input type="text" value={recCalories} onChange={e => setRecCalories(e.target.value)} placeholder="150 calories" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Avg Rating (1–5)</label>
                    <input type="number" min="1" max="5" step="0.1" value={recRatingValue} onChange={e => setRecRatingValue(e.target.value)} placeholder="4.9" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Review Count</label>
                    <input type="number" min="1" value={recRatingCount} onChange={e => setRecRatingCount(e.target.value)} placeholder="842" style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {/* JOB POSTING */}
            {activeTab === 'jobposting' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Job Posting Details</p>
                <div>
                  <label style={labelStyle}>Job Title <span style={{ color: '#f87171' }}>*</span></label>
                  <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Senior Software Engineer" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Job Description <span style={{ color: '#f87171' }}>*</span></label>
                  <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={5} placeholder="We are looking for a Senior Software Engineer to join our team..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Date Posted <span style={{ color: '#f87171' }}>*</span></label>
                    <input type="date" value={jobDatePosted} onChange={e => setJobDatePosted(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Valid Through</label>
                    <input type="date" value={jobValidThrough} onChange={e => setJobValidThrough(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Employment Type</label>
                  <select value={jobEmploymentType} onChange={e => setJobEmploymentType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACTOR">Contract</option>
                    <option value="TEMPORARY">Temporary</option>
                    <option value="INTERN">Intern</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Hiring Organization <span style={{ color: '#f87171' }}>*</span></label>
                    <input type="text" value={jobHiringOrgName} onChange={e => setJobHiringOrgName(e.target.value)} placeholder="Acme Corp" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Organization URL</label>
                    <input type="text" value={jobHiringOrgUrl} onChange={e => setJobHiringOrgUrl(e.target.value)} placeholder="example.com" style={inputStyle} />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={() => setJobRemote(r => !r)} className="w-5 h-5 rounded flex-shrink-0 border flex items-center justify-center transition-colors" style={{ background: jobRemote ? 'rgba(6,182,212,0.2)' : 'rgba(255,255,255,0.05)', borderColor: jobRemote ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.15)' }}>
                    {jobRemote && <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                  </button>
                  <span className="text-xs text-white/60">Remote / Work from Anywhere</span>
                </div>
                {!jobRemote && (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label style={labelStyle}>City <span style={{ color: '#f87171' }}>*</span></label>
                      <input type="text" value={jobLocationCity} onChange={e => setJobLocationCity(e.target.value)} placeholder="Denver" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>State</label>
                      <select value={jobLocationState} onChange={e => setJobLocationState(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">—</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Country</label>
                      <input type="text" value={jobLocationCountry} onChange={e => setJobLocationCountry(e.target.value)} placeholder="US" style={inputStyle} />
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Min Salary</label>
                    <input type="number" min="0" value={jobSalaryMin} onChange={e => setJobSalaryMin(e.target.value)} placeholder="80000" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Max Salary</label>
                    <input type="number" min="0" value={jobSalaryMax} onChange={e => setJobSalaryMax(e.target.value)} placeholder="120000" style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Currency</label>
                    <select value={jobSalaryCurrency} onChange={e => setJobSalaryCurrency(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Pay Period</label>
                    <select value={jobSalaryPeriod} onChange={e => setJobSalaryPeriod(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="YEAR">Per Year</option>
                      <option value="MONTH">Per Month</option>
                      <option value="WEEK">Per Week</option>
                      <option value="HOUR">Per Hour</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* COURSE */}
            {activeTab === 'course' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Course Details</p>
                <div>
                  <label style={labelStyle}>Course Name <span style={{ color: '#f87171' }}>*</span></label>
                  <input type="text" value={crsName} onChange={e => setCrsName(e.target.value)} placeholder="Introduction to Machine Learning" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description <span style={{ color: '#f87171' }}>*</span></label>
                  <textarea value={crsDescription} onChange={e => setCrsDescription(e.target.value)} rows={3} placeholder="Learn the fundamentals of machine learning..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Provider / School</label>
                    <input type="text" value={crsProvider} onChange={e => setCrsProvider(e.target.value)} placeholder="Coursera" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Provider URL</label>
                    <input type="text" value={crsProviderUrl} onChange={e => setCrsProviderUrl(e.target.value)} placeholder="coursera.org" style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Course URL</label>
                  <input type="text" value={crsUrl} onChange={e => setCrsUrl(e.target.value)} placeholder="coursera.org/learn/machine-learning" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Course Mode</label>
                  <select value={crsCourseMode} onChange={e => setCrsCourseMode(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="Online">Online</option>
                    <option value="OnSite">On-site / In-person</option>
                    <option value="Blended">Blended</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Price</label>
                    <input type="number" min="0" step="0.01" value={crsPrice} onChange={e => setCrsPrice(e.target.value)} placeholder="49" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Currency</label>
                    <select value={crsPriceCurrency} onChange={e => setCrsPriceCurrency(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input type="date" value={crsStartDate} onChange={e => setCrsStartDate(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input type="date" value={crsEndDate} onChange={e => setCrsEndDate(e.target.value)} style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {/* NEWS ARTICLE */}
            {activeTab === 'newsarticle' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">News Article Details</p>
                <div>
                  <label style={labelStyle}>Headline <span style={{ color: '#f87171' }}>*</span></label>
                  <input type="text" value={naHeadline} onChange={e => setNaHeadline(e.target.value)} placeholder="Breaking: Major Development in AI Regulation" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={naDescription} onChange={e => setNaDescription(e.target.value)} rows={2} placeholder="A brief summary of the article..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={labelStyle}>Article URL</label>
                  <input type="text" value={naArticleUrl} onChange={e => setNaArticleUrl(e.target.value)} placeholder="example.com/news/ai-regulation" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Image URL <span style={{ color: '#f87171' }}>*</span></label>
                  <input type="text" value={naImage} onChange={e => setNaImage(e.target.value)} placeholder="example.com/images/article.jpg" style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Date Published <span style={{ color: '#f87171' }}>*</span></label>
                    <input type="date" value={naDatePublished} onChange={e => setNaDatePublished(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Date Modified</label>
                    <input type="date" value={naDateModified} onChange={e => setNaDateModified(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Article Section</label>
                  <input type="text" value={naArticleSection} onChange={e => setNaArticleSection(e.target.value)} placeholder="Technology" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Author Name</label>
                  <input type="text" value={naAuthorName} onChange={e => setNaAuthorName(e.target.value)} placeholder="Jane Smith" style={inputStyle} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Publisher Name</label>
                    <input type="text" value={naPublisherName} onChange={e => setNaPublisherName(e.target.value)} placeholder="The Daily Tech" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Publisher Logo URL</label>
                    <input type="text" value={naPublisherLogo} onChange={e => setNaPublisherLogo(e.target.value)} placeholder="example.com/logo.png" style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {/* PODCAST EPISODE */}
            {activeTab === 'podcastepisode' && (
              <div className="rounded-2xl border p-6 space-y-4" style={sectionStyle}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Podcast Episode Details</p>
                <div>
                  <label style={labelStyle}>Episode Title <span style={{ color: '#f87171' }}>*</span></label>
                  <input type="text" value={podName} onChange={e => setPodName(e.target.value)} placeholder="How AI is Changing SEO in 2026" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea value={podDescription} onChange={e => setPodDescription(e.target.value)} rows={3} placeholder="In this episode we discuss..." style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Podcast Series Name</label>
                    <input type="text" value={podSeriesName} onChange={e => setPodSeriesName(e.target.value)} placeholder="The AI Growth Podcast" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Series URL</label>
                    <input type="text" value={podSeriesUrl} onChange={e => setPodSeriesUrl(e.target.value)} placeholder="example.com/podcast" style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Episode Number</label>
                    <input type="number" min="1" value={podEpisodeNumber} onChange={e => setPodEpisodeNumber(e.target.value)} placeholder="42" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Date Published</label>
                    <input type="date" value={podDatePublished} onChange={e => setPodDatePublished(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Duration</label>
                    <input type="text" value={podTimeRequired} onChange={e => setPodTimeRequired(e.target.value)} placeholder="PT45M" style={inputStyle} />
                    <p className="text-xs text-white/25 mt-1">PT45M = 45 minutes</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Audio File URL</label>
                    <input type="text" value={podAudioUrl} onChange={e => setPodAudioUrl(e.target.value)} placeholder="example.com/podcast/ep42.mp3" style={inputStyle} />
                  </div>
                </div>
              </div>
            )}

            {/* Recent History */}
            {history.length > 0 && (
              <div className="rounded-2xl border overflow-hidden" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
                <button onClick={() => setHistoryOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-3 text-left">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/30">Recent Schemas ({history.length})</p>
                  <svg className={`w-3.5 h-3.5 text-white/30 transition-transform ${historyOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </button>
                {historyOpen && (
                  <div className="border-t border-white/6 p-3 space-y-1.5">
                    {history.map(item => (
                      <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <span className="text-xs text-white/60">{item.label}</span>
                          <span className="text-xs text-white/25 ml-2">· {Math.round((Date.now() - item.ts) / 60000) < 1 ? 'just now' : `${Math.round((Date.now() - item.ts) / 60000)} min ago`}</span>
                        </div>
                        <button onClick={() => { setRestoredSchema(item.schema); setHistoryOpen(false) }} className="text-xs font-bold text-cyan-400/60 hover:text-cyan-400 transition-colors">Restore</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── OUTPUT PANEL ──────────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">

            {/* Validation warnings */}
            {warnings.length > 0 && (
              <div className="rounded-xl border p-4" style={{ background: 'rgba(251,191,36,0.06)', borderColor: 'rgba(251,191,36,0.2)' }}>
                <p className="text-xs font-bold text-yellow-400 mb-2 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                  Validation Warnings
                </p>
                <ul className="space-y-1">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-xs text-yellow-400/75 flex items-start gap-1.5">
                      <span className="mt-0.5 flex-shrink-0">•</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rich results preview */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="px-5 py-3 border-b border-white/6">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Rich Results Preview</p>
              </div>
              <div className="p-4">{preview}</div>
            </div>

            {/* Generated code */}
            <div className="rounded-2xl border overflow-hidden" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/6 flex-wrap gap-2">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Generated Schema</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button onClick={() => setMinify(m => !m)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: minify ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.05)', color: minify ? '#06d6ff' : 'rgba(255,255,255,0.4)', border: `1px solid ${minify ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                    Minify
                  </button>
                  <a href={testUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
                    Test in Google ↗
                  </a>
                  <button onClick={() => {
                    if (schemaStack.length >= 6) return
                    setSchemaStack(s => [...s, { id: Date.now().toString(), label: TAB_LABELS[activeTab], schema: displaySchema }])
                  }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)', opacity: schemaStack.length >= 6 ? 0.4 : 1 }}>
                    + Stack
                  </button>
                  <button onClick={download}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Download
                  </button>
                  <button onClick={copy}
                    className="text-xs font-bold px-4 py-1.5 rounded-lg transition-all"
                    style={{
                      background: copied ? 'rgba(74,222,128,0.15)' : 'rgba(6,182,212,0.15)',
                      color: copied ? '#4ade80' : '#06d6ff',
                      border: `1px solid ${copied ? 'rgba(74,222,128,0.3)' : 'rgba(6,182,212,0.3)'}`,
                    }}>
                    {copied ? 'Copied!' : 'Copy <script> Tag'}
                  </button>
                </div>
              </div>
              {restoredSchema && (
                <div className="px-4 py-2 flex items-center justify-between border-b border-white/6" style={{ background: 'rgba(167,139,250,0.06)' }}>
                  <span className="text-xs text-violet-400">Showing restored schema</span>
                  <button onClick={() => setRestoredSchema(null)} className="text-xs text-violet-400 hover:text-violet-300">Back to editor</button>
                </div>
              )}
              <pre className="p-5 text-xs text-white/65 overflow-auto max-h-[500px] leading-relaxed font-mono whitespace-pre-wrap">
                {scriptTag}
              </pre>
            </div>

            {/* Schema Stack */}
            {schemaStack.length > 0 && (
              <div className="rounded-2xl border overflow-hidden" style={{ background: '#0d1117', borderColor: 'rgba(167,139,250,0.2)' }}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                  <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Schema Stack ({schemaStack.length}/6)</p>
                  <button
                    onClick={() => {
                      const all = schemaStack.map(s => `<script type="application/ld+json">\n${s.schema}\n</script>`).join('\n\n')
                      navigator.clipboard.writeText(all)
                    }}
                    className="text-xs font-bold px-3 py-1 rounded-lg"
                    style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
                    Copy All
                  </button>
                </div>
                <div className="p-3 space-y-1.5">
                  {schemaStack.map(item => (
                    <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-xs text-white/60">{item.label}</span>
                      <button onClick={() => setSchemaStack(s => s.filter(x => x.id !== item.id))} className="text-xs text-white/25 hover:text-red-400 transition-colors ml-3">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How to add */}
            <div className="rounded-xl border p-4" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}>
              <p className="text-xs font-bold text-cyan-400 mb-1">How to add this to your site</p>
              <p className="text-xs text-white/45 leading-relaxed">
                Paste this code into the <code className="text-white/70">&lt;head&gt;</code> section of your page. On WordPress, use &quot;Insert Headers and Footers&quot;. On Shopify, edit your theme&apos;s <code className="text-white/70">theme.liquid</code>. On Squarespace, use Code Injection in Settings.
              </p>
            </div>

            <div className="rounded-xl border p-4 flex items-center justify-between gap-4" style={{ background: 'rgba(6,182,212,0.04)', borderColor: 'rgba(6,182,212,0.12)' }}>
              <div>
                <p className="text-xs font-bold text-white mb-0.5">Verify your full AI Visibility Score</p>
                <p className="text-xs text-white/40">Check all 14 signals — including whether this schema is properly indexed.</p>
              </div>
              <Link href="/scanner" className="flex-shrink-0 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors whitespace-nowrap">
                Free scan →
              </Link>
            </div>
          </div>
        </div>

        {/* AI Citation Score Panel */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">AI Citation Impact by Schema Type</h2>
          <p className="text-white/35 text-sm mb-6">How much each schema type improves your chances of being cited by ChatGPT, Perplexity, and Google AI Overviews.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {([
              { tab: 'localbusiness', label: 'Local Business', score: 95, note: 'Strongest signal for local AI citations and Google knowledge panel' },
              { tab: 'article', label: 'Article', score: 88, note: 'Top driver of ChatGPT and Perplexity citations for written content' },
              { tab: 'newsarticle', label: 'News Article', score: 82, note: 'Unlocks Google News and AI news digest citations' },
              { tab: 'organization', label: 'Organization', score: 85, note: 'Confirms entity identity — critical for AI to trust and cite your brand' },
              { tab: 'product', label: 'Product', score: 80, note: 'Google Shopping + AI product recommendations' },
              { tab: 'recipe', label: 'Recipe', score: 75, note: 'High Google rich result traffic + AI cooking assistant citations' },
              { tab: 'video', label: 'Video', score: 72, note: 'Video carousels and AI video recommendations' },
              { tab: 'jobposting', label: 'Job Posting', score: 70, note: 'Google for Jobs + AI job search visibility' },
              { tab: 'course', label: 'Course', score: 68, note: 'Growing AI education assistant citation signal' },
              { tab: 'softwareapp', label: 'Software App', score: 65, note: 'App store-style AI citations' },
              { tab: 'event', label: 'Event', score: 65, note: 'Event discovery in AI search answers' },
              { tab: 'podcastepisode', label: 'Podcast Episode', score: 60, note: 'Growing AI podcast citation signal' },
              { tab: 'website', label: 'WebSite', score: 55, note: 'Enables sitelinks searchbox — moderate AI impact' },
              { tab: 'faqpage', label: 'FAQ Page', score: 40, note: 'Rich results removed May 2026 — AI citation value remains' },
              { tab: 'howto', label: 'HowTo', score: 40, note: 'Rich results removed May 2026 — AI citation value remains' },
              { tab: 'breadcrumb', label: 'Breadcrumb', score: 35, note: 'Navigation context for AI — low direct citation impact' },
            ] as { tab: SchemaTab; label: string; score: number; note: string }[]).map(item => {
              const isActive = activeTab === item.tab
              const barOpacity = item.score >= 80 ? 1 : item.score >= 60 ? 0.65 : 0.4
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className="rounded-xl border p-4 text-left transition-all"
                  style={{
                    background: isActive ? 'rgba(6,182,212,0.08)' : '#0d1117',
                    borderColor: isActive ? 'rgba(6,182,212,0.35)' : 'rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-black" style={{ color: isActive ? '#06d6ff' : 'rgba(255,255,255,0.7)' }}>{item.label}</p>
                    <p className="text-xs font-black" style={{ color: isActive ? '#06d6ff' : 'rgba(255,255,255,0.35)' }}>{item.score}%</p>
                  </div>
                  <div className="w-full h-1.5 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${item.score}%`, background: `rgba(6,214,255,${barOpacity})` }} />
                  </div>
                  <p className="text-[10px] text-white/35 leading-relaxed">{item.note}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Requirements & Setup Instructions */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="grid lg:grid-cols-3 gap-8 mb-14">

            {/* No API required */}
            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(74,222,128,0.2)' }}>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4"
                style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                No API Key Required
              </div>
              <h3 className="text-base font-black text-white mb-2">Works right out of the box</h3>
              <p className="text-sm text-white/45 leading-relaxed">
                This tool runs entirely in your browser. No account, no API key, no server setup needed. Generate schema markup and copy it directly to your site.
              </p>
            </div>

            {/* Who it&apos;s for */}
            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Who This Is For</p>
              <ul className="space-y-2.5">
                {[
                  'Website owners who want to rank in AI search results',
                  'SEO agencies managing schema for multiple clients',
                  'Developers adding structured data to any web platform',
                  'Marketers optimizing for Google rich results',
                  'Businesses wanting to appear in ChatGPT and Perplexity answers',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/55 leading-relaxed">
                    <span className="text-cyan-400 mt-0.5 flex-shrink-0">→</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What you need */}
            <div className="rounded-2xl border p-6" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">What You Need</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'A website', note: 'Any platform — WordPress, Shopify, Webflow, custom HTML' },
                  { label: 'Your business info', note: 'Name, address, hours, description, social profiles' },
                  { label: 'Access to your site\'s code', note: 'Ability to edit the <head> tag or use a plugin' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 flex-shrink-0 text-xs font-black">✓</span>
                    <div>
                      <p className="text-xs font-bold text-white">{item.label}</p>
                      <p className="text-xs text-white/40">{item.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Platform setup instructions */}
          <div className="mb-14">
            <h2 className="text-xl font-black text-white mb-1">How to Add Schema to Your Site</h2>
            <p className="text-white/35 text-sm mb-6">Copy the generated script tag above, then follow the instructions for your platform.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  platform: 'WordPress',
                  steps: [
                    'Install the "Insert Headers and Footers" plugin',
                    'Go to Settings → Insert Headers and Footers',
                    'Paste the script tag into the Header section',
                    'Save — schema is now live on every page',
                  ],
                  note: 'For page-specific schema, use a plugin like Yoast or RankMath instead.',
                },
                {
                  platform: 'Shopify',
                  steps: [
                    'Go to Online Store → Themes → Edit Code',
                    'Open theme.liquid',
                    'Paste the script tag just before </head>',
                    'Save — Shopify deploys instantly',
                  ],
                  note: 'For product schema, add to product.liquid instead.',
                },
                {
                  platform: 'Squarespace',
                  steps: [
                    'Go to Settings → Advanced → Code Injection',
                    'Paste the script tag into the Header field',
                    'Save — applies site-wide',
                  ],
                  note: 'Squarespace Business plan or higher required for code injection.',
                },
                {
                  platform: 'Webflow',
                  steps: [
                    'Open your project → Pages panel',
                    'Click the gear icon on the page',
                    'Paste into "Inside <head> tag" field',
                    'Publish your site',
                  ],
                  note: 'For site-wide schema, use Project Settings → Custom Code.',
                },
                {
                  platform: 'Next.js / React',
                  steps: [
                    'Copy just the JSON object (not the script tag)',
                    'In your layout or page component add:',
                    '<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />',
                    'Deploy — Next.js renders it server-side',
                  ],
                  note: 'Place in generateMetadata or directly in JSX for best crawlability.',
                },
                {
                  platform: 'Raw HTML',
                  steps: [
                    'Open your HTML file in any editor',
                    'Find the <head> section',
                    'Paste the full script tag before </head>',
                    'Upload/save the file',
                  ],
                  note: 'Works on any static site, cPanel hosting, or hand-coded HTML.',
                },
              ].map(p => (
                <div key={p.platform} className="rounded-xl border p-5" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <p className="text-sm font-black text-white mb-3">{p.platform}</p>
                  <ol className="space-y-1.5 mb-3">
                    {p.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/50 leading-relaxed">
                        <span className="text-white/20 font-bold flex-shrink-0">{i + 1}.</span>{step}
                      </li>
                    ))}
                  </ol>
                  <p className="text-[10px] text-white/25 leading-relaxed border-t border-white/6 pt-2">{p.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why Schema Matters */}
        <div className="border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">Why Schema Markup Matters for AI Search</h2>
          <p className="text-white/35 text-sm mb-8">Structured data is one of the strongest signals for AI citations. When ChatGPT, Perplexity, and Google understand exactly what your business is, they can recommend it.</p>
          <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { type: 'Local Business', label: 'Knowledge panel, map pack, and "best near me" AI citations', color: '#06d6ff' },
              { type: 'Article', label: 'Top Stories carousel, Google Discover, and news eligibility', color: '#34d399' },
              { type: 'News Article', label: 'Google News eligibility and AI news digest citations', color: '#22d3ee' },
              { type: 'Organization', label: 'Knowledge panel for companies — links social profiles and disambiguates your entity', color: '#38bdf8' },
              { type: 'Product', label: 'Google Shopping results with price, rating, and availability', color: '#fb923c' },
              { type: 'Recipe', label: 'Recipe cards with image, rating, cook time, and calories in Google', color: '#f97316' },
              { type: 'Job Posting', label: 'Google for Jobs listing with salary, location, and direct apply', color: '#a78bfa' },
              { type: 'Course', label: 'Course cards in Google with provider, mode, and price', color: '#818cf8' },
              { type: 'Event', label: 'Event cards in search with date, location, and ticket links', color: '#f472b6' },
              { type: 'Podcast Episode', label: 'Growing signal for AI podcast search and audio discovery', color: '#e879f9' },
              { type: 'FAQ Page', label: 'Rich results removed May 2026 — still helps AI assistant citations', color: '#a78bfa' },
              { type: 'HowTo', label: 'Rich results removed May 2026 — still helps AI assistant citations', color: '#4ade80' },
              { type: 'WebSite', label: 'Enables the Google Sitelinks Searchbox for large or well-known sites', color: '#fbbf24' },
              { type: 'Software App', label: 'Star ratings and pricing shown directly in app search results', color: '#e879f9' },
              { type: 'Breadcrumb', label: 'Replaces URL slug in search result with readable navigation path', color: '#94a3b8' },
              { type: 'Video', label: 'Video carousel and rich snippet with thumbnail, duration, and date', color: '#f87171' },
            ].map(s => (
              <div key={s.type} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black mb-1" style={{ color: s.color }}>{s.type}</div>
                <div className="text-xs text-white/40 leading-relaxed">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 rounded-2xl border p-6 text-center" style={{ background: 'rgba(99,102,241,0.05)', borderColor: 'rgba(99,102,241,0.15)' }}>
          <p className="text-white font-black mb-1">Add schema markup generation to your platform</p>
          <p className="text-white/40 text-sm mb-4">16 schema types, JSON-LD output, minified export. One-time license.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black text-black" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>Get this tool — $29 →</Link>
            <Link href="/pricing" className="px-5 py-2.5 rounded-xl text-sm font-black border text-white/70" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>All 51 tools — from $99 →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
