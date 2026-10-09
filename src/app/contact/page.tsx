import React from 'react';
import type { Metadata } from 'next';
import ContactForm from './ContactForm';
import { MapPin, Phone, Mail, Clock, Zap, MessageCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact NEED ELECTRO | Get in Touch – Moulvibazar',
  description:
    'Contact NEED ELECTRO for electrical services, product inquiries, technician support, and warranty help. Located in Moulvibazar, Bangladesh.',
};

const CONTACT_METHODS = [
  {
    icon: Phone,
    title: 'Call Us',
    detail: '01733-983752',
    sub: 'Sat–Thu: 9AM–8PM | Fri: 2PM–8PM',
    color: 'text-brand-600 bg-brand-50',
    href: 'tel:+8801733983752',
  },
  {
    icon: Mail,
    title: 'Email',
    detail: 'needelectro23@gmail.com',
    sub: 'We reply within 24 business hours',
    color: 'text-emerald-600 bg-emerald-50',
    href: 'mailto:needelectro23@gmail.com',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    detail: '+880 1733-983752',
    sub: 'Quick responses via WhatsApp',
    color: 'text-green-600 bg-green-50',
    href: 'https://wa.me/8801733983752',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    detail: 'Shop #5, MR Plaza, Kusumbag',
    sub: 'Moulvibazar-3200, Sylhet, Bangladesh',
    color: 'text-rose-600 bg-rose-50',
    href: 'https://maps.google.com/?q=MR+Plaza+Kusumbag+Moulvibazar',
  },
];

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero - Glass Dark */}
      <section className="glass-card-dark text-white rounded-3xl py-14 px-6 relative overflow-hidden shadow-2xl text-center">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-500/25 blur-[100px] pointer-events-none rounded-full" />
        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-brand-300 uppercase tracking-wider shadow-sm">
            <Zap className="w-3.5 h-3.5" />
            We&apos;re here to help
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Contact Us</h1>
          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Whether you need a service booking, product inquiry, warranty support, or want to join our technician team — reach out and we&apos;ll respond promptly.
          </p>
        </div>
      </section>

      {/* Contact Methods - Frosted Glass Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CONTACT_METHODS.map(({ icon: Icon, title, detail, sub, color, href }) => (
          <a
            key={title}
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="glass-card-hover group p-5 rounded-2xl shadow-xs space-y-3 text-center block"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm group-hover:text-brand-600 transition">{title}</h3>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">{detail}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
            </div>
          </a>
        ))}
      </section>

      {/* Form + Map */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact Form */}
        <div>
          <div className="space-y-2 mb-6">
            <h2 className="text-xl font-black text-slate-900">Send Us a Message</h2>
            <p className="text-xs text-slate-500">Fill out the form and we&apos;ll get back to you within one business day.</p>
          </div>
          <ContactForm />
        </div>

        {/* Office Info */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            <h3 className="font-black text-slate-900 text-sm">Main Office — Moulvibazar Branch</h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex gap-3 items-start">
                  <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Shop #5, MR Plaza, Kusumbag</strong>
                    <p>Moulvibazar-3200, Sylhet Division, Bangladesh</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Clock className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Business Hours</strong>
                    <p>Saturday – Thursday: 9:00 AM – 8:00 PM</p>
                    <p>Friday: 2:00 PM – 8:00 PM</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Phone className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Phone / WhatsApp</strong>
                    <p>01733-983752</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-200 rounded-3xl h-52 flex items-center justify-center border border-slate-200 overflow-hidden">
              <div className="text-center space-y-2 text-slate-500">
                <MapPin className="w-7 h-7 mx-auto text-brand-400" />
                <p className="text-xs font-semibold">MR Plaza, Kusumbag</p>
                <p className="text-[10px]">Moulvibazar, Sylhet</p>
                <a
                  href="https://maps.google.com/?q=Kusumbag+Moulvibazar"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-[11px] font-bold text-brand-600 hover:underline mt-1"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 backdrop-blur-md rounded-2xl p-4 text-xs text-amber-900 font-medium space-y-1 shadow-xs">
              <p className="font-bold">🚨 Emergency Services</p>
              <p>For urgent electrical emergencies, call <strong>01733-983752</strong> immediately. Emergency callout service is available for critical situations.</p>
            </div>
          </div>
      </section>
    </div>
  );
}
