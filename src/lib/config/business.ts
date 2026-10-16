/**
 * NEED ELECTRO — Official Business Configuration (Single Source of Truth)
 * AMDADS GROUP
 * Market: Bangladesh | Currency: BDT (৳) | Timezone: Asia/Dhaka
 */

export const BUSINESS_CONFIG = {
  brand: {
    name: 'NEED ELECTRO',
    shortName: 'NEED ELECTRO',
    tagline: 'Trusted Electrical and Technological Solutions',
    parentCompany: 'AMDADS GROUP',
    established: '2023',
    market: 'Bangladesh',
    currency: 'BDT (৳)',
    currencySymbol: '৳',
    currencyCode: 'BDT',
    timezone: 'Asia/Dhaka',
    canonicalDomain: 'https://www.needelectro.store',
  },
  colors: {
    electricBlue: '#008CFF',
    darkNavy: '#002B5B',
    white: '#FFFFFF',
    lightGrey: '#F4F6F8',
    primary: '#008CFF',
    secondary: '#002B5B',
    background: '#F4F6F8',
  },
  contact: {
    phone: '01733 983752',
    phoneRaw: '+8801733983752',
    email: 'needelectro23@gmail.com',
    whatsapp: '+880 1733-983752',
    whatsappLink: 'https://wa.me/8801733983752',
    supportHours: 'Saturday – Thursday: 9:00 AM – 8:00 PM | Friday: 2:00 PM – 8:00 PM',
    emergencyHotline: '01733 983752',
  },
  coverage: {
    nationwideDelivery: true,
    totalDistricts: 64,
    totalDivisions: 8,
    deliveryRates: {
      insideLocalDistrict: 60, // BDT (Moulvibazar)
      insideFreeThreshold: 10000, // Free delivery over ৳10,000
      outsideDistrict: 120, // BDT (All other 63 districts)
      outsideFreeThreshold: 15000, // Free delivery over ৳15,000
    },
    serviceCoverage: {
      type: 'On-site Certified Technician Dispatch',
      primaryHubs: ['Moulvibazar', 'Sreemangal', 'Sylhet'],
      expansionStatus: 'Progressively rolling out with verified licensed electricians',
    },
  },
  seo: {
    defaultTitle: 'NEED ELECTRO | Laptops, Computers, CCTV & Electrical Services in Bangladesh',
    titleTemplate: '%s | NEED ELECTRO',
    defaultDescription:
      'Shop laptops, computers, CCTV cameras, networking equipment and electrical products at NEED ELECTRO. Certified electrical installation, electrician booking, and nationwide delivery across Bangladesh.',
    keywords: [
      'laptop price in bangladesh',
      'computer shop bangladesh',
      'cctv camera price in bangladesh',
      'cctv installation service',
      'electrician service bangladesh',
      'electrical repair service',
      'router price in bangladesh',
      'need electro',
      'amdads group',
    ],
  },
} as const;

export type BusinessConfig = typeof BUSINESS_CONFIG;
