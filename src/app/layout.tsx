import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { CartProvider } from '@/lib/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import PwaInstallPrompt from '@/components/pwa/PwaInstallPrompt';
import AdminGuard from '@/components/common/AdminGuard';

export const metadata: Metadata = {
  title: 'NEED ELECTRO | Trusted Electrical & Technological Solutions',
  description:
    'Book verified electricians, order laptops, computers, CCTV surveillance systems, and manage warranty through NEED ELECTRO - Moulvibazar, Bangladesh. A sister concern of Amdads Group.',
  keywords: [
    'electrical service bangladesh',
    'moulvibazar electrician',
    'cctv installation moulvibazar',
    'laptop repair bangladesh',
    'house wiring expert',
    'need electro',
    'amdads group',
    'ips inverter setup',
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
    statusBarStyle: 'default',
    title: 'NEED ELECTRO',
  },
  openGraph: {
    title: 'NEED ELECTRO - Trusted Electrical & Technological Solutions',
    description:
      'Digital platform connecting residential & commercial clients with certified technicians and verified technology products.',
    url: 'https://www.needelectro.com',
    siteName: 'NEED ELECTRO',
    images: [
      {
        url: '/brand/needelectro-logo.png',
        width: 1132,
        height: 570,
        alt: 'NEED ELECTRO Brand Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#087FE5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-x-hidden max-w-full">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="icon" href="/brand/needelectro-icon.png" type="image/png" sizes="256x256" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 text-slate-900 selection:bg-brand-500 selection:text-white font-sans relative antialiased overflow-x-hidden max-w-full">
        {/* Ambient Glassmorphism Background Mesh & Light Orbs */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          {/* Subtle tech dot matrix */}
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.20]" />
          
          {/* Luminous Top-Right Electric Blue Glow */}
          <div className="absolute -top-32 -right-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-brand-400/20 to-brand-600/10 blur-[130px] animate-ambient-1" />
          
          {/* Luminous Mid-Left Sky Glow */}
          <div className="absolute top-1/3 -left-40 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-sky-400/20 to-indigo-400/10 blur-[140px] animate-ambient-2" />
          
          {/* Luminous Bottom-Center Cyan/Blue Accent */}
          <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-gradient-to-t from-cyan-400/15 via-brand-500/10 to-transparent blur-[140px]" />
        </div>

        <AuthProvider>
          <CartProvider>
            <AdminGuard>
              <Header />
              <main className="flex-1 pb-24 md:pb-0 relative z-0 min-w-0 w-full overflow-x-hidden">{children}</main>
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
