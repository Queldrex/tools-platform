export interface ToolPrice {
  name: string
  oneTimePrice: number  // 0 = rate-limited free tool, no per-tool purchase
  freePerDay: number
}

export const TOOL_PRICING: Record<string, ToolPrice> = {
  'vibe-security':        { name: 'Vibe Coding Security Shield',       oneTimePrice: 49, freePerDay: 1 },
  'api-schema-drift':     { name: 'API Schema Drift Scanner',           oneTimePrice: 49, freePerDay: 1 },
  'database-migration':   { name: 'Database Migration Checker',         oneTimePrice: 49, freePerDay: 2 },
  'contract-scanner':     { name: 'Contract Risk Scanner',              oneTimePrice: 49, freePerDay: 1 },
  'package-hallucination':{ name: 'Hallucinated Package Detector',      oneTimePrice: 49, freePerDay: 3 },
  'saas-spend':           { name: 'SaaS Spend Optimizer',               oneTimePrice: 49, freePerDay: 1 },
  'invoice-fraud':        { name: 'Invoice Fraud Detector',             oneTimePrice: 49, freePerDay: 2 },
  'agency-report':        { name: 'Agency Client Report Generator',     oneTimePrice: 49, freePerDay: 1 },
  'dep-scanner':          { name: 'Dependency CVE Scanner',             oneTimePrice: 29, freePerDay: 2 },
  'privacy-analyzer':     { name: 'Privacy Policy Analyzer',            oneTimePrice: 29, freePerDay: 1 },
  'schema-validator':     { name: 'Structured Data Validator',          oneTimePrice: 29, freePerDay: 2 },
  'ad-grader':            { name: 'Ad Copy Grader',                     oneTimePrice: 29, freePerDay: 3 },
  'proposal-generator':   { name: 'Proposal Generator',                 oneTimePrice: 29, freePerDay: 1 },
  'nda-generator':        { name: 'NDA Generator',                      oneTimePrice: 29, freePerDay: 1 },
  'tos-generator':        { name: 'Terms of Service Generator',         oneTimePrice: 29, freePerDay: 1 },
  'refund-policy':        { name: 'Refund Policy Generator',            oneTimePrice: 29, freePerDay: 2 },
  'job-description':      { name: 'Job Description Writer',             oneTimePrice: 15, freePerDay: 2 },
  'http-headers':         { name: 'HTTP Header Inspector',              oneTimePrice: 0,  freePerDay: 10 },
  'og-previewer':         { name: 'OG Previewer',                       oneTimePrice: 0,  freePerDay: 5 },
}
