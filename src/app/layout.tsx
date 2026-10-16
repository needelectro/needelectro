import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { CartProvider } from '@/lib/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import PwaInstallPrompt from '@/components/pwa/PwaInstallPrompt';
import AdminGuard from '@/components/common/AdminGuard';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.needelectro.store'),
  title: {
    default: 'NEED ELECTRO | Laptops, Computers, CCTV & Electrical Services in Bangladesh',
    template: '%s | NEED ELECTRO',
  },
  description:
    'Shop laptops, computers, CCTV cameras, networking devices and electrical products at NEED ELECTRO. Explore electrical installation, electrician booking, repairs and technology services across Bangladesh.',
  keywords: [
    'laptop price in bangladesh',
    'computer shop bangladesh',
    'cctv camera price in bangladesh',
    'cctv installation service',
    'electrician service bangladesh',
    'electrical repair service',
    'router price in bangladesh',
    'wifi installation service',
    'need electro',
    'amdads group',
  ],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/brand/needelectro-icon.png', sizes: '256x256', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent', // Allows content to render under iOS status bar
    title: 'NEED ELECTRO',
  },
  openGraph: {
    title: 'NEED ELECTRO | Laptops, Computers, CCTV & Electrical Services in Bangladesh',
    description:
      'Shop laptops, computers, CCTV cameras, networking devices and electrical products at NEED ELECTRO. Explore electrical installation, electrician booking, repairs and technology services across Bangladesh.',
    url: 'https://www.needelectro.store',
    siteName: 'NEED ELECTRO',
    images: [
      {
        url: '/brand/needelectro-logo.png',
        width: 1132,
        height: 570,
        alt: 'NEED ELECTRO Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEED ELECTRO | Laptops, Computers, CCTV & Electrical Services in Bangladesh',
    description:
      'Shop laptops, computers, CCTV cameras, networking devices and electrical products at NEED ELECTRO across Bangladesh.',
    images: ['/brand/needelectro-logo.png'],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#008CFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  // NOTE: Do NOT set userScalable: false — it's a WCAG 2.1 violation (SC 1.4.4)
  // and hurts Google mobile ranking. Allow users to zoom.
  viewportFit: 'cover', // Enables safe-area-inset CSS env() on iOS notch devices
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-BD" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="icon" href="/brand/needelectro-icon.png" type="image/png" sizes="256x256" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'NEED ELECTRO',
              legalName: 'NEED ELECTRO',
              url: 'https://www.needelectro.store',
              logo: 'https://www.needelectro.store/brand/needelectro-logo.png',
              description:
                'Bangladesh-wide online technology, electronics, electrical products, and technical services marketplace.',
              parentOrganization: {
                '@type': 'Organization',
                name: 'AMDADS Group',
              },
              founder: {
                '@type': 'Person',
                name: 'Amdadur Rahman',
                jobTitle: 'Founder & CEO',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+8801733983752',
                contactType: 'customer service',
                areaServed: 'BD',
                availableLanguage: ['Bengali', 'English'],
              },
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Moulvibazar',
                addressRegion: 'Sylhet',
                addressCountry: 'BD',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'NEED ELECTRO',
              url: 'https://www.needelectro.store',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://www.needelectro.store/shop?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={`flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 text-slate-900 selection:bg-brand-500 selection:text-white font-sans relative antialiased max-w-full ${inter.className}`}>
        {/* Hardware-Accelerated Ambient Background Mesh & Tech Glows */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          {/* Subtle tech dot matrix */}
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.16]" />
          
          {/* Static Top-Right Electric Blue Ambient Gradient */}
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(8,127,229,0.12)_0%,rgba(8,127,229,0)_70%)] pointer-events-none" />
          
          {/* Static Mid-Left Sky Ambient Gradient */}
          <div className="absolute top-1/3 -left-28 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.10)_0%,rgba(56,189,248,0)_70%)] pointer-events-none" />
          
          {/* Static Bottom-Center Cyan/Blue Accent */}
          <div className="absolute -bottom-24 left-1/3 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.08)_0%,rgba(6,182,212,0)_70%)] pointer-events-none" />
        </div>

        <AuthProvider>
          <CartProvider>
            <AdminGuard>
              <Header />
              <main className="flex-1 pb-24 md:pb-0 relative z-0 min-w-0 w-full">{children}</main>
              <Footer />
              <MobileNav />
              <PwaInstallPrompt />
            </AdminGuard>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
