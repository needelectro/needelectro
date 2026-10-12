import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | NEED ELECTRO',
  description: 'NEED ELECTRO privacy policy — how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Privacy Policy</h1>
        </div>
        <p className="text-xs text-slate-500">Last updated: October 2024 · Effective: October 2024</p>
      </div>

      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-xs text-brand-800 font-medium">
        NEED ELECTRO is a sister concern of Amdads Group, registered in Moulvibazar, Bangladesh.
      </div>

      <div className="prose prose-sm max-w-none space-y-6 text-slate-700">
        {[
          {
            title: '1. Information We Collect',
            content: `We collect personal information that you provide when creating an account, placing orders, booking services, or contacting us. This includes:\n\n• Name, email address, phone number, and address\n• Payment method information (we do not store full card details)\n• NID information for technician verification\n• Device and warranty information you register\n• Service booking details and location\n• Support communications`,
          },
          {
            title: '2. How We Use Your Information',
            content: `We use your information to:\n\n• Process service bookings and dispatch verified technicians\n• Fulfill product orders and coordinate delivery\n• Provide warranty tracking and support services\n• Send booking confirmations and status updates via phone or SMS\n• Verify technician identity and professional credentials\n• Improve our platform and services\n• Comply with legal obligations under Bangladesh law`,
          },
          {
            title: '3. Information Sharing',
            content: `We share your information only when necessary:\n\n• With assigned technicians: your name, phone, and location for the purposes of the service booking\n• With delivery partners: your name and address for product delivery\n• With payment processors: transaction details required to process payments\n• With law enforcement: when legally required to comply with applicable law\n\nWe do NOT sell your personal data to third parties.`,
          },
          {
            title: '4. Data Security',
            content: `We implement appropriate technical and organizational security measures to protect your information:\n\n• Passwords are hashed using industry-standard algorithms\n• Authentication sessions use secure HTTP-only cookies\n• All sensitive data is encrypted in transit (TLS/HTTPS)\n• Access to personal data is restricted to authorized staff only\n• Regular security reviews are conducted`,
          },
          {
            title: '5. Data Retention',
            content: `We retain your personal information for as long as your account is active or as needed to provide services. Financial records and order histories are retained for a minimum of 7 years as required by Bangladesh tax and commercial law. You may request deletion of your account by contacting us directly.`,
          },
          {
            title: '6. Your Rights',
            content: `You have the right to:\n\n• Access the personal information we hold about you\n• Correct inaccurate or incomplete information\n• Request deletion of your account and associated data\n• Withdraw consent for marketing communications\n• Receive a copy of your data in a portable format\n\nTo exercise these rights, contact us at needelectro23@gmail.com or call 01733-983752.`,
          },
          {
            title: '7. Cookies',
            content: `We use essential cookies for authentication and session management. We do not use third-party tracking cookies. You can disable cookies in your browser settings, but this may affect functionality.`,
          },
          {
            title: '8. Changes to This Policy',
            content: `We may update this Privacy Policy from time to time. Material changes will be communicated via email or prominent notice on our platform. Continued use of our services after changes constitutes acceptance.`,
          },
          {
            title: '9. Contact Us',
            content: `For privacy-related inquiries:\n\nNEED ELECTRO SHOP (A Sister Concern of AMDADS Group)\nMoulvibazar, Bangladesh\nPhone: 01733 983752\nEmail: needelectro23@gmail.com`,
          },
        ].map(({ title, content }) => (
          <div key={title} className="space-y-3">
            <h2 className="text-base font-black text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">{content}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-6 flex flex-wrap gap-4 text-xs">
        <Link href="/policies/terms" className="text-brand-600 font-bold hover:underline">Terms of Service</Link>
        <Link href="/policies/technician" className="text-brand-600 font-bold hover:underline">Technician Policy</Link>
        <Link href="/contact" className="text-brand-600 font-bold hover:underline">Contact Us</Link>
      </div>
    </div>
  );
}
