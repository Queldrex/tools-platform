import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGO = 'aes-256-gcm'

function getKey(): Buffer {
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY || ''
  const clean = raw.replace(/^﻿/, '').trim()
  if (clean.length !== 64) {
    throw new Error('CREDENTIALS_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)')
  }
  return Buffer.from(clean, 'hex')
}

export function encryptCredentials(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Format: iv(24 hex) + tag(32 hex) + ciphertext(hex)
  return iv.toString('hex') + tag.toString('hex') + encrypted.toString('hex')
}

export function decryptCredentials(payload: string): string {
  const key = getKey()
  const iv = Buffer.from(payload.slice(0, 24), 'hex')
  const tag = Buffer.from(payload.slice(24, 56), 'hex')
  const ciphertext = Buffer.from(payload.slice(56), 'hex')
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(ciphertext) + decipher.final('utf8')
}
