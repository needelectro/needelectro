'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  ShieldCheck, 
  Star, 
  MapPin, 
  CheckCircle2, 
  Calendar, 
  Award, 
  PhoneCall, 
  Search, 
  Filter,
  ArrowRight,
  Zap,
  Briefcase
} from 'lucide-react';

interface Technician {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  experienceYears?: number;
  skills: string[];
  specializations?: string;
  serviceAreas?: string;
  verificationStatus: string;
  availableStatus: string;
  ratingOverall: number;
  totalCompletedJobs: number;
  totalReviews: number;
}

const SAMPLE_TECHNICIANS: Technician[] = [
  {
    id: 'tech_01',
    name: 'Rafiqul Islam',
    experienceYears: 7,
    skills: ['House Wiring', 'Industrial Distribution', 'Switchboard Setup', 'DB Box Balancing'],
    specializations: 'Residential & Commercial Electrical Systems',
    serviceAreas: 'Moulvibazar Sadar, Kusumbag, Berirchar, Sreemangal',
    verificationStatus: 'VERIFIED',
    availableStatus: 'AVAILABLE',
    ratingOverall: 4.9,
    totalCompletedJobs: 142,
    totalReviews: 89,
    bio: 'Lead certified electrician with 7+ years of experience in modern residential wiring, safe earthing, and industrial load testing.'
  },
  {
    id: 'tech_02',
    name: 'Tanvir Ahmed',
    experienceYears: 5,
    skills: ['CCTV Installation', 'IP Camera Configuration', 'DVR/NVR Networking', 'Access Control'],
    specializations: 'Surveillance & Smart Security Automation',
    serviceAreas: 'Moulvibazar Sadar, Kamalganj, Rajnagar',
    verificationStatus: 'VERIFIED',
    availableStatus: 'AVAILABLE',
    ratingOverall: 4.85,
    totalCompletedJobs: 98,
    totalReviews: 64,
    bio: 'Certified security systems technician specializing in multi-channel HD CCTV, remote viewing setups, and commercial surveillance.'
  },
  {
    id: 'tech_03',
    name: 'Kawsar Mahmud',
    experienceYears: 6,
    skills: ['Solar IPS/UPS Setup', 'Inverter Servicing', 'Battery Bank Testing', 'Emergency Backup'],
    specializations: 'Clean Energy & Power Backup Engineering',
    serviceAreas: 'Moulvibazar Sadar, Sreemangal, Kulaura',
    verificationStatus: 'VERIFIED',
    availableStatus: 'AVAILABLE',
    ratingOverall: 4.95,
    totalCompletedJobs: 116,
    totalReviews: 78,
    bio: 'Expert in pure sine wave IPS installation, solar charge controller calibration, and battery maintenance for homes and offices.'
  },
  {
    id: 'tech_04',
    name: 'Mahbubur Rahman',
    experienceYears: 4,
    skills: ['Laptop Hardware Repair', 'Desktop Assembly', 'OS Recovery', 'Network Cabling'],
    specializations: 'Computer Diagnostics & Micro-Soldering',
    serviceAreas: 'Moulvibazar Sadar, Kusumbag, Shamshernagar',
    verificationStatus: 'VERIFIED',
    availableStatus: 'AVAILABLE',
    ratingOverall: 4.8,
    totalCompletedJobs: 87,
    totalReviews: 52,
    bio: 'Hardware technician focusing on motherboard troubleshooting, screen and keyboard replacement, and high-speed office LAN setup.'
  }
];

const SKILL_FILTERS = [
  'All Skills',
  'House Wiring',
  'CCTV Installation',
  'Solar IPS/UPS Setup',
  'Laptop Hardware Repair',
  'Switchboard Setup'
];

export default function TechnicianDirectoryPage() {
  const [technicians, setTechnicians] = useState<Technician[]>(SAMPLE_TECHNICIANS);
  const [selectedSkill, setSelectedSkill] = useState('All Skills');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Attempt to fetch from real API if active
    fetch('/api/v1/technicians')
      .then(res => res.json())
      .then(data => {
        if (data.technicians && data.technicians.length > 0) {
          setTechnicians(data.technicians);
        }
      })
      .catch(() => {
        // Fallback to sample data if database empty
      });
  }, []);

  const filteredTechnicians = technicians.filter(tech => {
    const matchesSkill = selectedSkill === 'All Skills' || 
      tech.skills.some(s => s.toLowerCase().includes(selectedSkill.toLowerCase()));
    const matchesQuery = !searchQuery || 
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tech.specializations && tech.specializations.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tech.serviceAreas && tech.serviceAreas.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSkill && matchesQuery;
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section - Glass Dark */}
        <div className="glass-card-dark rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/20 rounded-full blur-[110px] pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-300 text-xs font-semibold border border-white/20">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              Verified Technician Network
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              NEED ELECTRO Verified Field Technicians
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every technician in our network undergoes rigorous government NID validation, background screening, trade qualification checks, and safety standard training. Book trusted service directly or request dispatch.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/booking"
                className="btn-primary px-6 py-3 text-sm flex items-center gap-2 shadow-lg shadow-brand-500/30"
              >
                Book a Technician Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/become-a-technician"
                className="inline-flex items-center justify-center font-semibold px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md text-sm transition shadow-xs"
              >
                <Wrench className="w-4 h-4 text-brand-400 mr-2" />
                Join as a Technician
              </Link>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar - Frosted Glass */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, area, or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Quick Count Badge */}
            <div className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-900 font-bold">{filteredTechnicians.length}</span> Verified Technicians
            </div>
          </div>

          {/* Skill Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {SKILL_FILTERS.map((skill) => (
              <button
                key={skill}
                onClick={() => setSelectedSkill(skill)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  selectedSkill === skill
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Technician Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTechnicians.map((tech) => (
            <div
              key={tech.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center font-black text-xl shadow-md shadow-brand-500/20">
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">
                          {tech.name}
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          VERIFIED
                        </span>
                      </div>
                      <p className="text-xs text-brand-600 font-medium">
                        {tech.specializations || 'Electrical & Tech Specialist'}
                      </p>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200/60">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{tech.ratingOverall}</span>
                    <span className="text-slate-400 font-normal">({tech.totalReviews})</span>
                  </div>
                </div>

                {tech.bio && (
                  <p className="text-xs text-slate-600 mt-3.5 line-clamp-2 leading-relaxed">
                    {tech.bio}
                  </p>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 py-3 border-y border-slate-100 text-center">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-medium">Experience</span>
                    <strong className="text-slate-900 text-xs font-bold">{tech.experienceYears}+ Years</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-medium">Jobs Done</span>
                    <strong className="text-slate-900 text-xs font-bold">{tech.totalCompletedJobs} Completed</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-medium">Status</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Ready
                    </span>
                  </div>
                </div>

                {/* Skills Chips */}
                <div className="mt-3.5 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Core Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tech.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Service Areas */}
                {tech.serviceAreas && (
                  <div className="flex items-start gap-1.5 mt-3 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{tech.serviceAreas}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <Link
                  href={`/booking?tech=${tech.id}`}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition text-center shadow-xs"
                >
                  Book This Technician
                </Link>
                <a
                  href="tel:01733983752"
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                  title="Direct Dispatch Line"
                >
                  <PhoneCall className="w-4 h-4 text-brand-600" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-slate-900">
              Are you an experienced electrician or IT technician in Sylhet Division?
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              Join NEED ELECTRO's verified field network. Get guaranteed fair payouts, work equipment access, and grow your career with Amdads Group.
            </p>
          </div>
          <Link
            href="/become-a-technician"
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center gap-2 shrink-0 shadow-md"
          >
            <Briefcase className="w-4 h-4 text-brand-400" />
            Apply For Verification
          </Link>
        </div>

      </div>
    </div>
  );
}
