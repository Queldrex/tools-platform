export interface DownloadProduct {
  id: string
  name: string
  tagline: string
  description: string
  price: number
  fileKey: string
  fileExt: 'txt' | 'csv'
  category: 'security' | 'business' | 'developer' | 'legal'
  accent: string
  items: string[]
}

export const DOWNLOAD_PRODUCTS: DownloadProduct[] = [
  {
    id: 'security-audit-checklist',
    name: 'Security Audit Checklist',
    tagline: '50-point security audit for web apps and APIs',
    description: 'A structured checklist covering authentication, authorization, injection attacks, HTTPS/TLS, dependency vulnerabilities, secrets management, and incident response readiness. Based on OWASP Top 10 and real-world audit experience.',
    price: 19,
    fileKey: 'security-audit-checklist',
    fileExt: 'txt',
    category: 'security',
    accent: '#f87171',
    items: ['50 audit checkpoints', 'OWASP Top 10 coverage', 'API security section', 'Dependency scanning guide', 'Secrets management checklist', 'Incident response readiness'],
  },
  {
    id: 'gdpr-compliance-checklist',
    name: 'GDPR Compliance Checklist',
    tagline: 'What your SaaS actually needs to be GDPR compliant',
    description: 'A practical checklist for SaaS founders. Covers data mapping, consent flows, cookie banners, privacy policy requirements, data subject rights, breach notification timelines, and third-party processor agreements.',
    price: 29,
    fileKey: 'gdpr-compliance-checklist',
    fileExt: 'txt',
    category: 'legal',
    accent: '#a78bfa',
    items: ['Data mapping template', 'Consent flow requirements', 'Privacy policy checklist', 'Data subject rights workflow', 'Breach notification timeline', 'Third-party processor checklist'],
  },
  {
    id: 'saas-metrics-dashboard',
    name: 'SaaS Metrics Dashboard Template',
    tagline: 'Track MRR, churn, LTV, and CAC in a spreadsheet',
    description: 'A CSV template with example data and formulas for every key SaaS metric: MRR, ARR, LTV, churn rate, NRR, CAC, CAC payback period, and Quick Ratio. Includes benchmark ranges for each metric at different growth stages.',
    price: 29,
    fileKey: 'saas-metrics-dashboard',
    fileExt: 'csv',
    category: 'business',
    accent: '#4ade80',
    items: ['MRR and ARR tracking', 'LTV:CAC ratio calculator', 'Churn rate by cohort', 'NRR and expansion revenue', 'Benchmark ranges included', 'Monthly and annual views'],
  },
  {
    id: 'invoice-fraud-checklist',
    name: 'Invoice Fraud Detection Checklist',
    tagline: '25 red flags to check before approving any invoice',
    description: 'A practical checklist for finance teams and business owners. Covers BEC (Business Email Compromise) indicators, round-number manipulation, fake vendor patterns, urgency pressure tactics, and bank account change red flags.',
    price: 19,
    fileKey: 'invoice-fraud-checklist',
    fileExt: 'txt',
    category: 'business',
    accent: '#fb923c',
    items: ['BEC email domain checks', 'Round-number pattern flags', 'Vendor verification steps', 'Urgency pressure indicators', 'Bank account change protocol', 'Payment approval workflow'],
  },
  {
    id: 'api-security-playbook',
    name: 'API Security Playbook',
    tagline: 'How to secure any REST or GraphQL API',
    description: 'A step-by-step playbook covering authentication, rate limiting, input validation, schema drift detection, logging and monitoring, and common API attack vectors with mitigation strategies.',
    price: 39,
    fileKey: 'api-security-playbook',
    fileExt: 'txt',
    category: 'developer',
    accent: '#06b6d4',
    items: ['Auth method comparison (API key / JWT / OAuth)', 'Rate limiting implementation guide', 'Input validation patterns', 'Schema drift detection setup', 'Logging and monitoring checklist', 'Common attack vector mitigations'],
  },
  {
    id: 'sql-migration-safety-guide',
    name: 'SQL Migration Safety Guide',
    tagline: 'Run database migrations without downtime or data loss',
    description: 'A practical guide for zero-downtime database migrations. Covers expand/contract pattern, column-level vs table-level changes, rollback planning, testing against production data size, and anti-patterns that cause outages.',
    price: 19,
    fileKey: 'sql-migration-safety-guide',
    fileExt: 'txt',
    category: 'developer',
    accent: '#06b6d4',
    items: ['Expand/contract migration pattern', 'Zero-downtime column changes', 'Rollback strategy template', 'Production data size testing', 'Lock timeout configuration', '10 anti-patterns that cause outages'],
  },
]

export function getDownloadProduct(id: string): DownloadProduct | undefined {
  return DOWNLOAD_PRODUCTS.find(p => p.id === id)
}
