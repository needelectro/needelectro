'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  BookOpen, 
  Clock, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  Search, 
  X, 
  Send, 
  Briefcase,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function TrainingPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCourse, setActiveCourse] = useState<any | null>(null);
  
  // Application form modal state
  const [applyingCourse, setApplyingCourse] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    nidNumber: '',
    education: '',
    address: '',
    experienceLevel: 'BEGINNER',
    motivation: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const url = `/api/v1/training${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.courses) {
        setCourses(data.courses);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingCourse) return;

    try {
      setSubmitting(true);
      setErrorMessage(null);
      const res = await fetch('/api/v1/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: applyingCourse.id,
          ...formData,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to submit application');
        return;
      }
      setSuccessMessage(data.message);
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        nidNumber: '',
        education: '',
        address: '',
        experienceLevel: 'BEGINNER',
        motivation: '',
      });
    } catch {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* 1. HERO BANNER - GLASS DARK */}
      <div className="glass-card-dark text-white rounded-3xl p-6 sm:p-10 md:p-14 relative overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-500/30 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-sky-400/20 blur-[110px] rounded-full pointer-events-none" />
        
        <div className="max-w-3xl relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-brand-300 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-brand-400" />
            NEED ELECTRO Academy &bull; Amdads Group Skills Center
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Professional Engineering Training &amp; Guaranteed Technician Onboarding
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Bridging technical education with real market employment. Hands-on laboratory training in Moulvibazar for electrical wiring, CCTV surveillance, laptop chip-level repair, and solar IPS installations. High-performing graduates are directly onboarded into our verified technician marketplace.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 w-full sm:w-auto">
            <a href="#courses" className="btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-2 shadow-glass-glow w-full sm:w-auto">
              Explore Available Courses
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <Link href="/verify-certificate" className="btn-secondary text-xs py-2.5 px-5 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20 w-full sm:w-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verify Graduate Certificate
            </Link>
          </div>
        </div>
      </div>

      {/* 2. STATS & WHY TRAIN WITH NEED ELECTRO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 rounded-2xl border border-white/80 text-center space-y-1 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">80+ Hours</p>
          <p className="text-[11px] text-slate-500 font-medium">Hands-on Lab Training</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/80 text-center space-y-1 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">Official Certificate</p>
          <p className="text-[11px] text-slate-500 font-medium">QR Verified Credential</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/80 text-center space-y-1 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center mx-auto mb-2">
            <Briefcase className="w-5 h-5" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">Direct Jobs</p>
          <p className="text-[11px] text-slate-500 font-medium">Technician Marketplace</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-white/80 text-center space-y-1 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">Amdads Group</p>
          <p className="text-[11px] text-slate-500 font-medium">Moulvibazar Lab Facility</p>
        </div>
      </div>

      {/* 3. COURSE CATALOG SECTION */}
      <section id="courses" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Curated Engineering Programs</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Available Academy Programs</h2>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Programs' },
              { id: 'electrical', label: 'Electrical Wiring' },
              { id: 'cctv', label: 'CCTV & Security' },
              { id: 'computer', label: 'Hardware & Chips' },
              { id: 'solar', label: 'Solar & IPS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all border ${
                  selectedCategory === tab.id
                    ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                    : 'bg-white/70 backdrop-blur-md text-slate-700 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card h-72 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Courses Found</h3>
            <p className="text-xs text-slate-500 mt-1">Please check back soon or select another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => {
              let syllabusArr: any[] = [];
              try {
                syllabusArr = JSON.parse(course.syllabus);
              } catch {}

              return (
                <div
                  key={course.id}
                  className="card-premium p-6 rounded-3xl flex flex-col justify-between group space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50/80 border border-brand-200/60 px-2.5 py-0.5 rounded-full">
                          {course.category}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-2 group-hover:text-brand-600 transition-colors">
                          {course.title}
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-extrabold text-slate-900">
                          {course.fee > 0 ? `৳${course.fee.toLocaleString()}` : 'Free / Subsidized'}
                        </span>
                        <p className="text-[10px] text-slate-400 font-medium">All inclusive</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {course.shortDescription}
                    </p>

                    {/* Metadata pills */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50/60 p-3 rounded-2xl border border-white/60">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        <span>{course.durationWeeks} Weeks ({course.totalHours} Hours)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Certificate Included</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 text-slate-500 truncate">
                        <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                        <span>Instructor: {course.instructorName}</span>
                      </div>
                    </div>

                    {/* Syllabus preview */}
                    {syllabusArr.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-brand-600" />
                          Key Syllabus Modules:
                        </p>
                        <div className="space-y-1">
                          {syllabusArr.slice(0, 3).map((mod: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span className="truncate">{mod.title}</span>
                            </div>
                          ))}
                          {syllabusArr.length > 3 && (
                            <p className="text-[10px] text-brand-600 font-semibold pl-5">
                              + {syllabusArr.length - 3} more technical modules
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => {
                        setApplyingCourse(course);
                        setSuccessMessage(null);
                        setErrorMessage(null);
                      }}
                      className="btn-primary flex-1 text-xs py-2.5 shadow-glass-glow"
                    >
                      Apply for Admission
                    </button>
                    <button
                      onClick={() => setActiveCourse(activeCourse?.id === course.id ? null : course)}
                      className="btn-secondary text-xs py-2.5 px-4"
                    >
                      {activeCourse?.id === course.id ? 'Hide Details' : 'View Syllabus'}
                    </button>
                  </div>

                  {/* Expanding full description */}
                  {activeCourse?.id === course.id && (
                    <div className="p-4 rounded-2xl bg-white/90 border border-white space-y-3 animate-in fade-in text-xs">
                      <p className="text-slate-700 leading-relaxed">{course.fullDescription}</p>
                      <div className="text-[11px] space-y-1 text-slate-600">
                        <p><strong className="text-slate-900">Prerequisites:</strong> {course.prerequisites || 'None'}</p>
                        <p><strong className="text-slate-900">Career Outcome:</strong> {course.careerOutcomes}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. ADMISSION APPLICATION MODAL */}
      {applyingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card bg-white/95 max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-white space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setApplyingCourse(null)}
              className="absolute top-5 right-5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                Academy Enrollment
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                Apply for: {applyingCourse.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Fee: {applyingCourse.fee > 0 ? `৳${applyingCourse.fee.toLocaleString()}` : 'Free'} &bull; Duration: {applyingCourse.durationWeeks} Weeks
              </p>
            </div>

            {successMessage ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Application Submitted!</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{successMessage}</p>
                <button
                  onClick={() => setApplyingCourse(null)}
                  className="btn-primary text-xs py-2 px-6 mt-2"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Md. Hasan Ali"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white/80 focus:outline-brand-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="017xxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white/80 focus:outline-brand-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      placeholder="hasan@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white/80 focus:outline-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">NID / Birth Certificate</label>
                    <input
                      type="text"
                      placeholder="NID or Smart Card ID"
                      value={formData.nidNumber}
                      onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white/80 focus:outline-brand-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Educational Background *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SSC / HSC / Diploma"
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white/80 focus:outline-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Present Address / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Kusumbag, Moulvibazar Sadar"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white/80 focus:outline-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Current Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white/80 focus:outline-brand-500"
                  >
                    <option value="BEGINNER">Beginner (No Prior Experience)</option>
                    <option value="INTERMEDIATE">Intermediate (Self-Taught / Helper)</option>
                    <option value="WORKING_TECHNICIAN">Practicing Technician (Seeking Official Certification)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Why do you want to join this program?</label>
                  <textarea
                    rows={2}
                    placeholder="Career goals or employment interests..."
                    value={formData.motivation}
                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white/80 focus:outline-brand-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setApplyingCourse(null)}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs py-2 px-5 flex items-center gap-2 shadow-glass-glow disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
