import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://queldrex.com', lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: 'https://queldrex.com/scanner', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://queldrex.com/privacy', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://queldrex.com/terms', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]
}
