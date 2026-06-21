export interface ToolPrice {
  name: string
  monthlyPrice: number
  freePerDay: number
}

export const TOOL_PRICING: Record<string, ToolPrice> = {
  'vibe-security': { name: 'Vibe Coding Security Shield', monthlyPrice: 19, freePerDay: 1 },
  'api-schema-drift': { name: 'API Schema Drift Scanner', monthlyPrice: 14, freePerDay: 1 },
  'database-migration': { name: 'Database Migration Checker', monthlyPrice: 14, freePerDay: 2 },
  'contract-scanner': { name: 'Contract Risk Scanner', monthlyPrice: 19, freePerDay: 1 },
  'package-hallucination': { name: 'Hallucinated Package Detector', monthlyPrice: 12, freePerDay: 3 },
  'dep-scanner': { name: 'Dependency CVE Scanner', monthlyPrice: 19, freePerDay: 2 },
  'privacy-analyzer': { name: 'Privacy Policy Analyzer', monthlyPrice: 14, freePerDay: 1 },
  'schema-validator': { name: 'Structured Data Validator', monthlyPrice: 9, freePerDay: 2 },
  'saas-spend': { name: 'SaaS Spend Optimizer', monthlyPrice: 19, freePerDay: 1 },
  'invoice-fraud': { name: 'Invoice Fraud Detector', monthlyPrice: 12, freePerDay: 2 },
  'agency-report': { name: 'Agency Client Report Generator', monthlyPrice: 19, freePerDay: 1 },
  'ad-grader': { name: 'Ad Copy Grader', monthlyPrice: 12, freePerDay: 3 },
  'job-description': { name: 'Job Description Writer', monthlyPrice: 12, freePerDay: 2 },
  'proposal-generator': { name: 'Proposal Generator', monthlyPrice: 19, freePerDay: 1 },
  'nda-generator': { name: 'NDA Generator', monthlyPrice: 12, freePerDay: 1 },
  'tos-generator': { name: 'Terms of Service Generator', monthlyPrice: 12, freePerDay: 1 },
  'refund-policy': { name: 'Refund Policy Generator', monthlyPrice: 9, freePerDay: 2 },
}
