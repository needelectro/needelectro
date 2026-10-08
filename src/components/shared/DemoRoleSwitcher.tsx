'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { ShieldCheck, UserCheck, Wrench, ChevronDown, Check, LogOut } from 'lucide-react';

export default function DemoRoleSwitcher() {
  const { user, quickLogin, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-slate-900/90 text-white px-3.5 py-2 rounded-full shadow-lg border border-slate-700/80 hover:bg-slate-800 transition-all text-xs font-medium backdrop-blur-md"
          title="Quick Switch Persona for Testing"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            {user ? (
              <span className="flex items-center gap-1.5">
                <span className="text-slate-400">Role:</span>
                <span className="font-semibold text-brand-400">{user.role}</span>
              </span>
            ) : (
              'Test Role Switcher'
            )}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute bottom-12 right-0 w-72 bg-slate-900 border border-slate-700 text-white rounded-2xl p-3 shadow-2xl space-y-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95">
            <div className="px-2 py-1 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Quick Persona Switcher
            </div>

            <button
              onClick={() => {
                quickLogin('CUSTOMER');
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-800 text-xs transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold">Customer</div>
                  <div className="text-[10px] text-slate-400">Tanvir Rahman (Kusumbag)</div>
                </div>
              </div>
              {user?.role === 'CUSTOMER' && <Check className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => {
                quickLogin('TECHNICIAN');
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-800 text-xs transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4 text-brand-400" />
                <div>
                  <div className="font-semibold">Verified Technician</div>
                  <div className="text-[10px] text-slate-400">Md. Abul Kalam (Master Electrician)</div>
                </div>
              </div>
              {user?.role === 'TECHNICIAN' && <Check className="w-4 h-4 text-brand-400" />}
            </button>

            <button
              onClick={() => {
                quickLogin('ADMIN');
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-800 text-xs transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-semibold">Super Admin</div>
                  <div className="text-[10px] text-slate-400">Operations, Verifications &amp; ERP</div>
                </div>
              </div>
              {user?.role === 'SUPER_ADMIN' && <Check className="w-4 h-4 text-amber-400" />}
            </button>

            {user && (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left hover:bg-red-950/50 text-red-400 text-xs transition-colors border-t border-slate-800 mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out (Browse as Guest)</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
