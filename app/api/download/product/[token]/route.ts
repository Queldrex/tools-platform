import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/store/redis'
import { getDownloadProduct } from '@/lib/download-products'
import fs from 'node:fs'
import path from 'node:path'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const productId = await getRedis().get<string>(`download_product:${token}`)
  if (!productId) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })

  const product = getDownloadProduct(productId)
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const filePath = path.join(process.cwd(), 'public', 'downloads', `${product.fileKey}.${product.fileExt}`)

  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'File not found' }, { status: 404 })

  const content = fs.readFileSync(filePath, 'utf-8')
  const mimeType = product.fileExt === 'csv' ? 'text/csv' : 'text/plain'

  return new NextResponse(content, {
    headers: {
      'Content-Type': `${mimeType}; charset=utf-8`,
      'Content-Disposition': `attachment; filename="${product.fileKey}.${product.fileExt}"`,
    },
  })
}
