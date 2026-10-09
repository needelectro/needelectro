'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Wrench, Upload, CheckCircle2, ChevronRight, Zap,
  User, MapPin, Phone, Mail, FileText, Star, Shield
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

const SKILLS_LIST = [
  'House Wiring', 'Industrial Wiring', 'Panel Installation', 'Circuit Breakers',
  'AC Installation', 'Fan / Light Installation', 'CCTV Installation', 'DVR/NVR Setup',
  'Computer Repair', 'Laptop Repair', 'Network Setup', 'WiFi Configuration',
  'IPS / Inverter Setup', 'Solar Setup', 'Smart Home', 'Emergency Response',
];

const AREA_OPTIONS = [
  'Moulvibazar Sadar', 'Sreemangal', 'Kamalganj', 'Rajnagar', 'Kulaura', 'Barlekha', 'Juri',
];

export default function TechnicianRegisterPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<'profile' | 'skills' | 'docs' | 'done'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    bio: '',
    nidNumber: '',
    experience: '1',
    phone: '',
    address: '',
    selectedSkills: [] as string[],
    serviceAreas: ['Moulvibazar Sadar'] as string[],
    hourlyRate: '',
  });

  const toggleSkill = (skill: string) => {
    setForm((p) => ({
      ...p,
      selectedSkills: p.selectedSkills.includes(skill)
        ? p.selectedSkills.filter((s) => s !== skill)
        : [...p.selectedSkills, skill],
    }));
  };

  const toggleArea = (area: string) => {
    setForm((p) => ({
      ...p,
      serviceAreas: p.serviceAreas.includes(area)
        ? p.serviceAreas.filter((a) => a !== area)
        : [...p.serviceAreas, area],
    }));
  };

  const handleSubmit = async () => {
    if (!user) { router.push('/auth/register?role=TECHNICIAN'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: form.bio,
          nidNumber: form.nidNumber,
          yearsOfExperience: parseInt(form.experience),
          phone: form.phone,
          address: form.address,
          skills: form.selectedSkills,
          serviceAreas: form.serviceAreas,
          hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep('done');
      } else {
        setError(data.error || 'Submission failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-brand-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold">Become a Technician</span>
        </nav>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950">Join as a Technician</h1>
        <p className="text-sm text-slate-500">
          Apply to become a verified NEED ELECTRO technician and start earning from local jobs.
        </p>
      </div>

      {/* Benefits Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-3xl p-5 text-white grid grid-cols-3 gap-3 text-center text-xs">
        {[
          { icon: '💰', label: 'Earn per job', sub: 'Competitive rates' },
          { icon: '📲', label: 'App-based jobs', sub: 'See & accept nearby' },
          { icon: '🏅', label: 'Build reputation', sub: 'Verified badge' },
        ].map((b) => (
          <div key={b.label} className="space-y-1">
            <span className="text-2xl">{b.icon}</span>
            <p className="font-black">{b.label}</p>
            <p className="text-brand-200 text-[10px]">{b.sub}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      {step !== 'done' && (
        <div className="flex items-center gap-2 text-[11px] font-bold">
          {[
            { key: 'profile', label: 'Basic Info' },
            { key: 'skills', label: 'Skills & Areas' },
            { key: 'docs', label: 'Verification' },
          ].map((s, i) => {
            const steps = ['profile', 'skills', 'docs'];
            const isActive = step === s.key;
            const isDone = steps.indexOf(step as string) > i;
            return (
              <React.Fragment key={s.key}>
                <div className={`flex items-center gap-1.5 ${isActive ? 'text-brand-600' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 ${isActive ? 'bg-brand-500 text-white' : isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < 2 && <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* DONE */}
      {step === 'done' && (
        <div className="text-center py-10 space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-950">Application Submitted!</h2>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Thank you for applying. Our team will review your application and verify your documents 
              within <strong>2–3 business days</strong>. You&apos;ll receive a call to confirm your status.
            </p>
          </div>
          <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-xs text-brand-800 max-w-sm mx-auto">
            <p className="font-bold mb-1">What happens next?</p>
            <ol className="text-left space-y-1 list-decimal list-inside">
              <li>NEED ELECTRO team reviews your profile</li>
              <li>Document verification call (within 3 days)</li>
              <li>Verification badge granted upon approval</li>
              <li>You start receiving job requests in your area</li>
            </ol>
          </div>
          <Link href="/technician/dashboard" className="btn-primary text-xs py-3 px-6">
            Go to Technician Dashboard
          </Link>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">{error}</div>
      )}

      {/* STEP 1: Profile */}
      {step === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Basic Information</h2>
          </div>

          {!user && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-2">
              <p className="font-bold">Create an account first</p>
              <p>You need a NEED ELECTRO account to apply as a technician.</p>
              <Link href="/auth/register" className="text-brand-600 font-bold hover:underline">Register Now →</Link>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Contact Phone *</label>
              <input type="tel" required value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="01XXXXXXXXX"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Years of Experience *</label>
              <select value={form.experience}
                onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'].map((y) => (
                  <option key={y} value={y}>{y} year{y !== '1' ? 's' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Home / Work Address *</label>
            <input type="text" required value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              placeholder="Your address in Moulvibazar"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">NID / National ID Number *</label>
            <input type="text" required value={form.nidNumber}
              onChange={(e) => setForm((p) => ({ ...p, nidNumber: e.target.value }))}
              placeholder="Your national ID number"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Professional Bio</label>
            <textarea
              rows={3} value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Briefly describe your expertise, experience, and why customers should choose you..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Hourly Rate (৳) — Optional</label>
            <input type="number" value={form.hourlyRate}
              onChange={(e) => setForm((p) => ({ ...p, hourlyRate: e.target.value }))}
              placeholder="e.g. 300 (leave blank for quote-based)"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none" />
          </div>

          <button
            onClick={() => setStep('skills')}
            disabled={!form.phone || !form.address || !form.nidNumber}
            className="btn-primary w-full py-3 text-xs"
          >
            Continue to Skills
          </button>
        </div>
      )}

      {/* STEP 2: Skills */}
      {step === 'skills' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Skills &amp; Service Areas</h2>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700">Select Your Skills (choose all that apply) *</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS_LIST.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition ${
                    form.selectedSkills.includes(skill)
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'border-slate-300 text-slate-700 hover:border-brand-400 bg-white'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {form.selectedSkills.length > 0 && (
              <p className="text-[10px] text-emerald-600 font-semibold">{form.selectedSkills.length} skill(s) selected</p>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700">Service Areas (select all you can cover)</label>
            <div className="flex flex-wrap gap-2">
              {AREA_OPTIONS.map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition ${
                    form.serviceAreas.includes(area)
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'border-slate-300 text-slate-700 hover:border-emerald-400 bg-white'
                  }`}
                >
                  <MapPin className="inline w-2.5 h-2.5 mr-1" />
                  {area}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('profile')} className="btn-secondary text-xs py-2.5 flex-1">Back</button>
            <button
              onClick={() => setStep('docs')}
              disabled={form.selectedSkills.length === 0}
              className="btn-primary text-xs py-2.5 flex-1"
            >
              Continue to Verification
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Docs */}
      {step === 'docs' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Verification Documents</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
              <p className="font-bold text-slate-800">Required Documents</p>
              <ul className="space-y-1.5 text-slate-600">
                {[
                  '✅ National ID Card (NID) — Front and Back',
                  '✅ One recent passport-sized photo',
                  '✅ Any relevant technical certificate (optional but preferred)',
                  '✅ Professional reference or previous work photos (optional)',
                ].map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2 hover:border-brand-400 transition cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700">Document Upload</p>
              <p className="text-slate-400">Upload feature available after account verification via phone call.</p>
              <p className="text-slate-500">Our team will guide you through the document submission process.</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-800 font-medium space-y-1">
              <p className="font-bold">📞 Verification Call</p>
              <p>After submitting this form, our team will call you within 3 business days to complete verification and collect your documents securely.</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-0.5 w-4 h-4 accent-brand-500" required />
              <span className="text-slate-600">
                I confirm that all information I have provided is accurate and I agree to the{' '}
                <Link href="/policies/technician" className="text-brand-600 font-bold hover:underline">Technician Terms &amp; Code of Conduct</Link>.
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep('skills')} className="btn-secondary text-xs py-2.5 flex-1">Back</button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary text-xs py-2.5 flex-1"
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
