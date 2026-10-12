import React from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Wallet, 
  TrendingUp, 
  Clock, 
  Award, 
  Star, 
  Users, 
  Smartphone, 
  MapPin, 
  Zap, 
  Check, 
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export const metadata = {
  title: 'Become a Technician | Build Your Career With NEED ELECTRO',
  description:
    'Join the NEED ELECTRO verified technician network in Moulvibazar and Bangladesh. Flexible work, fast job dispatch, instant earnings tracking, and career growth.',
};

export default function BecomeATechnicianPage() {
  return (
    <div className="flex flex-col space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION - Glass Dark Panel */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-card-dark text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          {/* Luminous Glow backdrop */}
          <div className="absolute top-0 right-10 w-[600px] h-[400px] bg-brand-500/25 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-[400px] h-[300px] bg-sky-400/20 blur-[110px] rounded-full pointer-events-none" />

          <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-brand-300 text-xs font-semibold tracking-wide border border-white/20 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>NEED ELECTRO Professional Network &bull; Moulvibazar, Bangladesh</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.15]">
              Build Your Career With <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-blue-400 to-sky-300">
                NEED ELECTRO
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Create your professional profile, receive service opportunities, complete jobs, and grow your career through the NEED ELECTRO technician network.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/technician/register"
                className="btn-primary text-base py-3.5 px-8 shadow-lg shadow-brand-500/30"
              >
                Join as a Technician
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="/technicians"
                className="inline-flex items-center justify-center font-semibold px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md transition shadow-xs"
              >
                View Technician Directory
              </Link>
            </div>

            {/* Quick Metrics - Frosted Glass Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 max-w-4xl mx-auto text-left">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-xs">
                <p className="text-2xl font-black text-white">৳35,000+</p>
                <p className="text-xs text-slate-300 mt-0.5">Average Monthly Earning</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-xs">
                <p className="text-2xl font-black text-brand-400">100%</p>
                <p className="text-xs text-slate-300 mt-0.5">Verified Job Matching</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-xs">
                <p className="text-2xl font-black text-emerald-400">24h</p>
                <p className="text-xs text-slate-300 mt-0.5">Withdrawal Processing</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-xs">
                <p className="text-2xl font-black text-amber-400">4.9 / 5.0</p>
                <p className="text-xs text-slate-300 mt-0.5">Customer Trust Score</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY JOIN NEED ELECTRO - KEY BENEFITS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Empowering Professionals</span>
          <h2 className="text-3xl font-black text-slate-900">Why Technicians Choose NEED ELECTRO</h2>
          <p className="text-sm text-slate-600">
            We give electrical and technical experts the digital tools, steady client pipeline, and business credibility needed to thrive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-premium p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Flexible Work Opportunities</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Work on your own terms. Set your daily schedule, toggle between Available and Offline, choose your preferred travel radius, and accept only the jobs that match your expertise.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Customizable working hours</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Optional emergency job dispatch</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Service radius control (5 - 30 km)</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Verified Technician Status</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Stand out with an official NEED ELECTRO Verified Technician badge. Customers trust verified professionals, resulting in higher booking rates and premium pricing for your skills.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Official Amdads Group backing</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> NID &amp; certificate validation badge</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> High-trust public profile page</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Transparent Earnings &amp; Wallet</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Track every taka you earn. Access daily, weekly, and monthly earnings breakdown with transparent platform commissions and instant payouts via bKash, Nagad, or Bank.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Real-time wallet balance</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Clear fee breakdown per job</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Fast withdrawals to bKash/Nagad</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Steady Job Opportunities</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No more waiting around for word-of-mouth clients. The platform continuously feeds qualified residential and commercial job requests straight to your technician dashboard.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Smart location-based matching</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Job details &amp; photos before acceptance</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Guaranteed customer confirmations</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Customer Ratings &amp; Work History</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Build a lifelong digital portfolio. Every completed service earns reviews for professionalism, punctuality, quality, and behavior that build your reputable brand name.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 5-category detailed rating score</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Permanent verifiable job records</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Protection against fraudulent reviews</li>
            </ul>
          </div>

          <div className="card-premium p-6 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Professional Growth &amp; Training</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Level up into advanced tech disciplines like CCTV networking, smart home automation, solar inverter setups, and laptop motherboard repair with NEED ELECTRO Academy programs.
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Specialization certifications</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Higher-tier commission bonuses</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Priority commercial project assignments</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS - 4 SIMPLE STEPS */}
      <section className="bg-slate-100/70 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Simple Onboarding</span>
            <h2 className="text-3xl font-black text-slate-900">How to Become a Verified Technician</h2>
            <p className="text-sm text-slate-600">
              Get approved in under 24 hours with our streamlined verification process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <span className="absolute top-4 right-4 text-3xl font-black text-slate-100">01</span>
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 font-bold flex items-center justify-center mb-4">1</div>
              <h4 className="font-bold text-slate-900 mb-2">Create Account</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide basic details, phone number, primary skills, service areas, and create your technician login.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <span className="absolute top-4 right-4 text-3xl font-black text-slate-100">02</span>
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 font-bold flex items-center justify-center mb-4">2</div>
              <h4 className="font-bold text-slate-900 mb-2">Submit Verification</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Upload your NID front/back, trade certificates, profile photo, and work experience documents securely.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <span className="absolute top-4 right-4 text-3xl font-black text-slate-100">03</span>
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 font-bold flex items-center justify-center mb-4">3</div>
              <h4 className="font-bold text-slate-900 mb-2">Admin Approval</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our operations team in Moulvibazar reviews your credentials and issues the Verified Technician badge.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative">
              <span className="absolute top-4 right-4 text-3xl font-black text-slate-100">04</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center mb-4">4</div>
              <h4 className="font-bold text-slate-900 mb-2">Accept &amp; Earn</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Browse available jobs on your dashboard or PWA, accept assignments, update statuses, and get paid directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TECHNICIAN APP / PWA EXPERIENCE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 border border-slate-700/60 shadow-xl overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-semibold">
                <Smartphone className="w-4 h-4" />
                <span>Installed PWA Experience</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                Manage Your Work Right From Your Phone
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Install NEED ELECTRO on your smartphone as a Progressive Web App. Get instant job notifications, one-tap navigation to customer locations, offline access, and fast status updates without downloading heavy app store packages.
              </p>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-bold text-white mb-1">One-Tap Job Accept</p>
                  <p className="text-slate-400">View job issue photos and accept work in seconds.</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-bold text-white mb-1">Live Job Status</p>
                  <p className="text-slate-400">From &apos;On The Way&apos; to &apos;Work Completed&apos; with timestamps.</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/technician/register"
                  className="btn-primary py-3 px-6 bg-brand-500 hover:bg-brand-600 text-white font-bold"
                >
                  Register Now &mdash; It&apos;s Free
                </Link>
              </div>
            </div>

            <div className="space-y-3 p-6 bg-slate-950/70 rounded-2xl border border-slate-700/80 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                <span>Technician Dashboard Preview</span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>Job #NE20261001</span>
                  <span className="text-emerald-400">৳1,500</span>
                </div>
                <p className="text-slate-400">CCTV 4-Channel Setup &bull; Kusumbag, Moulvibazar</p>
                <div className="pt-2 flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 text-[10px]">ACCEPT JOB</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">DECLINE</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>Job #NE20260995</span>
                  <span className="text-brand-400">COMPLETED</span>
                </div>
                <p className="text-slate-400">IPS Inverter Wiring Check &bull; Sreemangal Road</p>
                <p className="text-[10px] text-slate-500">Earnings credited to wallet: ৳850</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Technician FAQ</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Questions You Might Have</h2>
        </div>

        <div className="space-y-4">
          <div className="card-premium p-5 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">How do I get paid for completed jobs?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once you mark a job as completed and the customer confirms, your earnings (service amount minus the transparent platform commission) are immediately credited to your Technician Wallet. You can request a withdrawal anytime to your bKash, Nagad, or bank account.
            </p>
          </div>

          <div className="card-premium p-5 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">What documents are required for verification?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              You will need a valid National ID (NID) card, a clear portrait photo, your active Bangladeshi mobile phone number, and any electrical/technical certificates or trade course completion cards you hold.
            </p>
          </div>

          <div className="card-premium p-5 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Can I work part-time or choose my own hours?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Yes, absolutely! You can toggle your status between Available, Busy, Offline, or On Leave from your profile dashboard whenever you want. You are never penalized for declining jobs outside your working hours.
            </p>
          </div>

          <div className="card-premium p-5 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Which service areas are currently covered?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our on-site field hubs currently dispatch across Moulvibazar Sadar, Sreemangal, Kamalganj, Rajnagar, and Sylhet Division, with national expansion underway across all of Bangladesh.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl shadow-brand-500/20">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Take Control of Your Technical Career?
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto text-sm sm:text-base">
            Join hundreds of verified electricians, computer technicians, and security installers across Moulvibazar. Sign up in 3 minutes today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/technician/register"
              className="px-8 py-3.5 rounded-xl bg-white text-brand-700 font-bold text-base hover:bg-slate-50 transition shadow-md"
            >
              Join as a Technician
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3.5 rounded-xl bg-brand-700/60 hover:bg-brand-700 text-white font-semibold text-sm border border-brand-400/40 transition"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
