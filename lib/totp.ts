import { createHmac } from 'crypto'

export function generateTotpSecret(): string {
  const bytes = new Uint8Array(20)
  crypto.getRandomValues(bytes)
  return base32Encode(bytes)
}

function base32Encode(bytes: Uint8Array): string {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = 0, value = 0, out = ''
  for (const b of bytes) {
    value = (value << 8) | b
    bits += 8
    while (bits >= 5) { out += alpha[(value >>> (bits - 5)) & 31]; bits -= 5 }
  }
  if (bits > 0) out += alpha[(value << (5 - bits)) & 31]
  return out
}

function base32Decode(str: string): Buffer {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const clean = str.toUpperCase().replace(/=+$/, '')
  let bits = 0, value = 0
  const bytes: number[] = []
  for (const ch of clean) {
    const idx = alpha.indexOf(ch)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) { bytes.push((value >>> (bits - 8)) & 255); bits -= 8 }
  }
  return Buffer.from(bytes)
}

function generateTotp(secret: string, counter: number): string {
  const key = base32Decode(secret)
  const buf = Buffer.alloc(8)
  buf.writeBigInt64BE(BigInt(counter))
  const hmac = createHmac('sha1', key).update(buf).digest()
  const offset = hmac[hmac.length - 1] & 0xf
  const code = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3]
  return String(code % 1_000_000).padStart(6, '0')
}

export function verifyTotp(secret: string, code: string): boolean {
  const now = Math.floor(Date.now() / 1000)
  for (const delta of [-1, 0, 1]) {
    const counter = Math.floor((now + delta * 30) / 30)
    if (code === generateTotp(secret, counter)) return true
  }
  return false
}

export function totpQrUrl(secret: string, email: string): string {
  const label = encodeURIComponent(`Queldrex Admin:${email}`)
  const issuer = encodeURIComponent('Queldrex')
  const otpauth = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`
}
