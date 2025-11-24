import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://research-ai-assistant.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/login/',
          '/signup/',
          '/profile/',
          '/dashboard/',
          '/upload/',
          '/paper/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/auth/',
          '/login/',
          '/signup/',
          '/profile/',
          '/dashboard/',
          '/upload/',
          '/paper/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

