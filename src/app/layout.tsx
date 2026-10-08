import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/context/AuthContext';
import { CartProvider } from '@/lib/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import PwaInstallPrompt from '@/components/pwa/PwaInstallPrompt';
import DemoRoleSwitcher from '@/components/shared/DemoRoleSwitcher';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

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
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
            <MobileNav />
            <PwaInstallPrompt />
            <DemoRoleSwitcher />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
