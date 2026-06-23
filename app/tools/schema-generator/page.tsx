'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// ─── Types ────────────────────────────────────────────────────────────────────

type DayHours = { open: string; close: string; closed: boolean }
type FaqItem = { question: string; answer: string }
type SchemaTab = 'localbusiness' | 'faqpage' | 'article' | 'product' | 'event'

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
  }

  const scriptTag = `<script type="application/ld+json">\n${schema}\n</script>`

  function copy() {
    navigator.clipboard.writeText(scriptTag)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
    { id: 'faqpage', label: 'FAQ Page', badge: 'Popular' },
    { id: 'article', label: 'Article' },
    { id: 'product', label: 'Product' },
    { id: 'event', label: 'Event' },
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase mb-4"
            style={{ borderColor: 'rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.08)', color: '#06d6ff' }}>
            Free Tool · AI Visibility
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Schema Markup Generator</h1>
          <p className="text-white/45 text-sm leading-relaxed max-w-2xl">
            Generate valid JSON-LD structured data for Local Business, FAQ pages, Articles, Products, and Events. Structured data helps Google, ChatGPT, and Perplexity understand — and recommend — your content.
          </p>
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
                <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', color: 'rgba(251,191,36,0.8)' }}>
                  FAQPage schema can generate accordion-style rich results directly in Google Search — one of the highest-visibility schema types available.
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
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/6">
                <p className="text-xs font-bold uppercase tracking-widest text-white/30">Generated Schema</p>
                <div className="flex items-center gap-2">
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
              <pre className="p-5 text-xs text-white/65 overflow-auto max-h-[500px] leading-relaxed font-mono whitespace-pre-wrap">
                {scriptTag}
              </pre>
            </div>

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

        {/* Why Schema Matters */}
        <div className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="text-xl font-black text-white mb-1">Why Schema Markup Matters for AI Search</h2>
          <p className="text-white/35 text-sm mb-8">Structured data is one of the strongest signals for AI citations. When ChatGPT, Perplexity, and Google understand exactly what your business is, they can recommend it.</p>
          <div className="grid sm:grid-cols-5 gap-4">
            {[
              { type: 'Local Business', label: 'Knowledge panel, map pack, "best near me" citations', color: '#06d6ff' },
              { type: 'FAQ Page', label: 'Accordion results in Google Search — massive click-through boost', color: '#a78bfa' },
              { type: 'Article', label: 'Top Stories carousel, Google Discover, news eligibility', color: '#34d399' },
              { type: 'Product', label: 'Google Shopping results with price, rating, availability', color: '#fb923c' },
              { type: 'Event', label: 'Event cards in search with date, location, ticket links', color: '#f472b6' },
            ].map(s => (
              <div key={s.type} className="rounded-xl border p-4" style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="text-xs font-black mb-1" style={{ color: s.color }}>{s.type}</div>
                <div className="text-xs text-white/40 leading-relaxed">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
