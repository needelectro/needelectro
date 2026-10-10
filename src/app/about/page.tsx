import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { 
  Zap, MapPin, Phone, Mail, Globe, Clock, ArrowRight,
  Users, Wrench, ShieldCheck, Award, TrendingUp, Heart
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About NEED ELECTRO | Trusted Electrical & Technological Solutions – Moulvibazar',
  description:
    'NEED ELECTRO is a sister concern of Amdads Group, providing expert electrical services, technology products, and verified technicians across Moulvibazar, Bangladesh.',
};

const STATS = [
  { icon: Users, value: '500+', label: 'Happy Customers' },
  { icon: Wrench, value: '50+', label: 'Verified Technicians' },
  { icon: ShieldCheck, value: '1,000+', label: 'Services Completed' },
  { icon: Award, value: '3+', label: 'Years of Excellence' },
];

const TEAM = [
  {
    name: 'Amdad Hossain',
    role: 'Founder & CEO, Amdads Group',
    bio: 'Visionary entrepreneur who established NEED ELECTRO to bring reliable electrical and technological services to Moulvibazar.',
    avatar: '👨‍💼',
  },
  {
    name: 'Service Excellence Team',
    role: 'Field Technicians',
    bio: 'Our certified technicians are trained, background-verified, and committed to delivering quality work at every site.',
    avatar: '👷',
  },
  {
    name: 'Customer Support',
    role: 'Support & Operations',
    bio: 'Available 7 days a week to assist with bookings, orders, warranty claims, and any service-related inquiries.',
    avatar: '🎧',
  },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Trust & Transparency',
    description: 'Every technician is background-verified. Every transaction is documented. We build trust through accountability.',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: Zap,
    title: 'Technical Excellence',
    description: 'Our team stays current with the latest electrical standards, technology, and safety regulations.',
    color: 'text-brand-600 bg-brand-50',
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'From first contact to after-service support, your satisfaction is our measurement of success.',
    color: 'text-rose-600 bg-rose-50',
  },
  {
    icon: TrendingUp,
    title: 'Continuous Growth',
    description: 'We invest in technician training, platform technology, and service coverage to serve you better every day.',
    color: 'text-amber-600 bg-amber-50',
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero - Glass Dark Panel */}
      <section className="glass-card-dark text-white rounded-3xl py-16 px-6 sm:px-12 relative overflow-hidden shadow-2xl text-center">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-500/25 blur-[120px] pointer-events-none rounded-full" />
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="flex justify-center">
            <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl shadow-brand-500/25">
              <Image
                src="/brand/needelectro-logo-white.png"
                alt="NEED ELECTRO Logo"
                width={220}
                height={110}
                className="h-12 sm:h-14 w-auto object-contain filter drop-shadow"
                priority
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold text-brand-300 uppercase tracking-wider shadow-sm">
            <Zap className="w-3.5 h-3.5 text-brand-400" />
            Sister Concern of Amdads Group
          </div>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-sky-300 to-white">NEED ELECTRO</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Founded in 2023 and headquartered in Moulvibazar, NEED ELECTRO is building Bangladesh's most trusted 
            electrical and technological solutions ecosystem — connecting verified technicians with customers 
            who demand quality.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-300 pt-2">
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              Shop #5, MR Plaza, Kusumbag, Moulvibazar
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
              <Phone className="w-3.5 h-3.5 text-brand-400" />
              01733-983752
            </span>
          </div>
        </div>
      </section>

      {/* Stats - Frosted Gradient Sheen Banner */}
      <section className="bg-gradient-to-r from-brand-600/90 via-brand-700/90 to-brand-900/90 backdrop-blur-2xl rounded-3xl py-10 px-6 sm:px-10 border border-white/20 shadow-xl">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-white text-center">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="space-y-1">
              <Icon className="w-6 h-6 mx-auto opacity-80" />
              <p className="text-2xl sm:text-3xl font-black tracking-tight">{value}</p>
              <p className="text-xs font-semibold text-brand-100">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Our Mission</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Making Reliable Electrical Service Accessible to Every Home & Business
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              We believe every home and business deserves access to trained, trustworthy electrical and technology 
              professionals. Our digital platform eliminates the guesswork — verified technicians, transparent pricing, 
              real-time tracking, and documented service history.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Starting from Moulvibazar, our vision is a nationwide network that empowers local technicians with 
              consistent work while giving customers the quality assurance they need.
            </p>
            <Link href="/services" className="btn-primary text-xs py-2.5 inline-flex gap-2">
              Explore Our Services <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {VALUES.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2 hover:shadow-md transition">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-black text-slate-900 text-xs">{title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Our People</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Who Powers NEED ELECTRO
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-white rounded-3xl p-6 text-center space-y-3 border border-slate-100 shadow-sm hover:shadow-md transition">
                <div className="text-4xl">{member.avatar}</div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">{member.name}</h3>
                  <p className="text-xs text-brand-600 font-semibold">{member.role}</p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Info */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Find Us</h2>
            <div className="space-y-4">
              {[
                { icon: MapPin, label: 'Address', value: 'Shop #5, MR Plaza, Kusumbag, Moulvibazar-3200, Sylhet Division, Bangladesh' },
                { icon: Phone, label: 'Phone', value: '01733-983752' },
                { icon: Mail, label: 'Email', value: 'needelectro23@gmail.com' },
                { icon: Globe, label: 'Website', value: 'www.needelectro.com' },
                { icon: Clock, label: 'Hours', value: 'Sat–Thu 9:00 AM – 8:00 PM\nFri: 2:00 PM – 8:00 PM' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
                    <p className="text-sm text-slate-800 font-semibold whitespace-pre-line">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-100 rounded-3xl h-64 md:h-auto flex items-center justify-center text-slate-400 text-sm font-medium border border-slate-200">
            <div className="text-center space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-brand-400" />
              <p>Google Maps Integration</p>
              <p className="text-xs text-slate-400">MR Plaza, Kusumbag, Moulvibazar</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-brand-600 to-brand-500 py-14 px-4 text-white text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-black">Ready to Get Started?</h2>
          <p className="text-sm text-brand-100">
            Book a verified technician, explore our product catalog, or join our technician network today.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/services" className="bg-white text-brand-600 hover:bg-brand-50 font-bold text-xs py-3 px-6 rounded-xl transition shadow">
              Book a Service
            </Link>
            <Link href="/technician/register" className="bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs py-3 px-6 rounded-xl transition shadow">
              Become a Technician
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
