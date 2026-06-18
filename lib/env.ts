/** Strip BOM and invisible chars from env var values saved with wrong encoding */
export function env(key: string, fallback: string): string {
  const val = process.env[key]
  if (!val) return fallback
  return val.replace(/^﻿/, '').trim()
}
