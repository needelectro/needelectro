'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Search, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  Calendar, 
  Clock, 
  GraduationCap, 
  ArrowRight,
  QrCode
} from 'lucide-react';

export default function VerifyCertificatePage() {
  const [certInput, setCertInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certInput.trim()) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      setResult(null);

      const res = await fetch(`/api/v1/certificates?cert=${encodeURIComponent(certInput.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.found) {
        setErrorMsg(data.message || 'No official NEED ELECTRO certificate found for this identifier.');
        return;
      }

      setResult(data.certificate);
    } catch {
      setErrorMsg('Network error while verifying credential. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Official Credential Verification Portal
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Verify NEED ELECTRO Graduate Certificate
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Authenticate training credentials, technician certifications, and technical competence records issued by the NEED ELECTRO Skills Academy &amp; Amdads Group Standards Council.
        </p>
      </div>

      {/* Lookup Card - Glassmorphism */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/80 shadow-glass space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Enter Certificate ID / Credential Number
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. NE-CERT-2026-0104"
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                className="w-full text-sm pl-11 pr-4 py-3 rounded-2xl border border-slate-200/80 bg-white/90 focus:outline-brand-500 shadow-2xs uppercase tracking-wider font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !certInput.trim()}
              className="btn-primary text-xs py-3 px-8 flex items-center justify-center gap-2 shadow-glass-glow disabled:opacity-50 shrink-0"
            >
              {loading ? 'Verifying...' : 'Validate Credential'}
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Tip: Try testing with credential ID <button type="button" onClick={() => setCertInput('NE-CERT-2026-0104')} className="text-brand-600 underline font-mono">NE-CERT-2026-0104</button>
          </p>
        </form>

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <p className="font-bold">Credential Not Found</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Success Certificate Display */}
        {result && (
          <div className="mt-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white to-sky-500/10 border-2 border-emerald-500/30 space-y-6 animate-in slide-in-from-bottom-4 shadow-xl">
            {/* Top Verified Seal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-emerald-500/20 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 text-[10px] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    OFFICIALLY VALIDATED &amp; AUTHENTIC
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1">
                    {result.studentName}
                  </h3>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-emerald-500/20 sm:pl-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Certificate Number</span>
                <span className="font-mono text-sm font-black text-slate-900 tracking-wider">
                  {result.certificateNumber}
                </span>
              </div>
            </div>

            {/* Certificate Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="glass-card p-4 rounded-2xl bg-white/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-brand-600" />
                  Program Completed
                </span>
                <p className="font-bold text-slate-900 text-sm">{result.courseTitle}</p>
                <p className="text-[11px] text-slate-500">{result.courseCategory} Engineering</p>
              </div>

              <div className="glass-card p-4 rounded-2xl bg-white/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-brand-600" />
                  Practical Duration
                </span>
                <p className="font-bold text-slate-900 text-sm">{result.duration}</p>
                <p className="text-[11px] text-slate-500">Supervised Laboratory Practicum</p>
              </div>

              <div className="glass-card p-4 rounded-2xl bg-white/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  Date of Certification
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {result.issueDate ? new Date(result.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified 2026'}
                </p>
                <p className="text-[11px] text-slate-500">Moulvibazar Assessment Center</p>
              </div>

              <div className="glass-card p-4 rounded-2xl bg-white/70 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-brand-600" />
                  Faculty Assessor
                </span>
                <p className="font-bold text-slate-900 text-sm">{result.instructor}</p>
                <p className="text-[11px] text-slate-500">{result.accreditedBy}</p>
              </div>
            </div>

            {/* Official Notes / Verification Statement */}
            {result.notes && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950">
                <p className="font-bold mb-0.5">Academic Record &amp; Technical Standing:</p>
                <p className="text-slate-700 leading-relaxed">{result.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Link to Academy */}
      <div className="text-center pt-4">
        <Link href="/training" className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700">
          Want to become a certified electrical or technological engineer? Explore Training Academy
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
