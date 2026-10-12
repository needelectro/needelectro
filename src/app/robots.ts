import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/customer/',
          '/technician/',
          '/cart',
          '/checkout',
        ],
      },
    ],
    sitemap: 'https://www.needelectro.store/sitemap.xml',
  };
}
