import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api/', '/admin/', '/admin-login/', '/agency/dashboard/'] },
    ],
    sitemap: 'https://queldrex.com/sitemap.xml',
  }
}
