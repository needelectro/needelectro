'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import {
  User, Mail, Phone, MapPin, ShieldCheck, Lock, Calendar,
  Building, Clock, Sparkles, Plus, Trash2, Edit3, Save, Check,
  AlertCircle, Eye, EyeOff, CheckCircle2, ChevronRight, LogOut,
  ShoppingBag, Wrench, Shield, LifeBuoy, LayoutDashboard, X,
  PhoneCall, ExternalLink, Globe
} from 'lucide-react';
import { BANGLADESH_DISTRICTS } from '@/lib/data/districts';

interface AddressItem {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  area: string;
  addressLine: string;
  landmark?: string | null;
  isDefault: boolean;
  createdAt: string;
}

const BANGLADESH_DIVISIONS = [
  'Sylhet',
  'Dhaka',
  'Chattogram',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
];

interface CustomerProfileViewProps {
  onTabChange?: (tab: string) => void;
  isStandalonePage?: boolean;
}

export default function CustomerProfileView({
  onTabChange,
  isStandalonePage = true,
}: CustomerProfileViewProps) {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();

  // Mode: View vs Edit
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Form States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternativePhone, setAlternativePhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('PREFER_NOT_TO_SAY');
  const [language, setLanguage] = useState('English');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Address States
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMsg, setAddressMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    recipientName: '',
    phone: '',
    division: 'Sylhet',
    district: 'Moulvibazar',
    upazila: 'Moulvibazar Sadar',
    area: '',
    addressLine: '',
    landmark: '',
    isDefault: false,
  });

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load Initial Data
  useEffect(() => {
    if (!user) {
      if (isStandalonePage) {
        router.push('/customer/login?redirect=/customer/profile');
      }
      return;
    }

    if (user.role === 'TECHNICIAN') {
      router.replace('/technician/dashboard');
      return;
    }

    setName(user.name || '');
    setPhone(user.phone || '');
    setAvatarUrl(user.avatarUrl || '');

    if (user.customerProfile) {
      setAlternativePhone(user.customerProfile.alternativePhone || '');
      if (user.customerProfile.addresses) {
        setAddresses(user.customerProfile.addresses as AddressItem[]);
      }
    }

    loadFreshProfileData();
  }, [user]);

  const loadFreshProfileData = async () => {
    try {
      const [meRes, addrRes] = await Promise.all([
        fetch('/api/v1/auth/me'),
        fetch('/api/v1/customer/addresses'),
      ]);

      if (meRes.ok) {
        const d = await meRes.json();
        if (d.user) {
          setName(d.user.name || '');
          setPhone(d.user.phone || '');
          setAvatarUrl(d.user.avatarUrl || '');
          if (d.user.customerProfile?.alternativePhone) {
            setAlternativePhone(d.user.customerProfile.alternativePhone);
          }
          if (d.user.customerProfile?.addresses) {
            setAddresses(d.user.customerProfile.addresses);
          }
        }
      }

      if (addrRes.ok) {
        const d = await addrRes.json();
        if (d.addresses) setAddresses(d.addresses);
      }
    } catch {
      // Background catch
    }
  };

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);

    try {
      const res = await fetch('/api/v1/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim() || null,
          alternativePhone: alternativePhone.trim() || null,
          avatarUrl: avatarUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      setProfileMsg({ type: 'success', text: 'Personal details updated successfully.' });
      setIsEditingProfile(false);
      await refreshUser();
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Error saving profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
      setAlternativePhone(user.customerProfile?.alternativePhone || '');
    }
    setIsEditingProfile(false);
    setProfileMsg(null);
  };

  // Add Address Handler
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressMsg(null);

    try {
      const res = await fetch('/api/v1/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save address.');

      setAddresses((prev) => {
        if (addressForm.isDefault) {
          return [data.address, ...prev.map((a) => ({ ...a, isDefault: false }))];
        }
        return [data.address, ...prev];
      });

      setShowAddressForm(false);
      setAddressForm({
        label: 'Home',
        recipientName: '',
        phone: '',
        division: 'Sylhet',
        district: 'Moulvibazar',
        upazila: 'Moulvibazar Sadar',
        area: '',
        addressLine: '',
        landmark: '',
        isDefault: false,
      });

      setAddressMsg({ type: 'success', text: 'Address saved to your profile.' });
      setTimeout(() => setAddressMsg(null), 4000);
    } catch (err: any) {
      setAddressMsg({ type: 'error', text: err.message || 'Failed to add address.' });
    } finally {
      setAddressSaving(false);
    }
  };

  // Toggle Default Address Handler
  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch('/api/v1/customer/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId: id, isDefault: true }),
      });
      if (res.ok) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === id }))
        );
      }
    } catch {
      // Error handled silently
    }
  };

  // Delete Address Handler
  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      const res = await fetch(`/api/v1/customer/addresses?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      // Error handled silently
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setPasswordSaving(true);
    setPasswordMsg(null);

    try {
      const res = await fetch('/api/v1/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password.');

      setPasswordMsg({ type: 'success', text: 'Password successfully updated.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 5000);
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Password change failed.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.push('/customer/login');
  };

  if (!user) return null;

  // Format account creation date
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      })
    : '2026';


  const renderWorkspaceCards = () => (
    <>
          {profileMsg && (
            <div
              className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 border shadow-xs animate-in fade-in ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-red-50 text-red-900 border-red-200'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          {/* ═══ SECTION C: PERSONAL INFORMATION CARD ═══ */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                  <User className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    Personal Information
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your authenticated legal details and customer contact profile
                  </p>
                </div>
              </div>

              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>

            {/* VIEW MODE */}
            {!isEditingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Full Legal Name
                  </span>
                  <p className="text-sm font-black text-slate-900">{user.name}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Registered Email Address
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Primary Phone (Bangladesh)
                  </span>
                  <p className="text-sm font-bold text-slate-900 font-mono">
                    {phone ? `+88 ${phone}` : 'No phone registered yet'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Alternative Emergency Phone
                  </span>
                  <p className="text-sm font-bold text-slate-900 font-mono">
                    {alternativePhone || 'None specified'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Preferred Communication Language
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {language}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Account Status
                  </span>
                  <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Active &amp; In Good Standing
                  </p>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleSaveProfile} className="space-y-5 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      minLength={2}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-semibold text-slate-900 transition outline-none"
                      placeholder="Your full legal name"
                    />
                  </div>

                  {/* Email (Readonly Security) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address (Protected)
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-2.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Verified Account
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Permanently linked to your account. Contact customer desk to update.
                    </p>
                  </div>

                  {/* Primary Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Primary Phone (Bangladesh) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 font-mono">
                        +88
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-semibold text-slate-900 transition outline-none font-mono"
                        placeholder="017XX XXXXXX"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Used for order delivery verification and technician service dispatch SMS.
                    </p>
                  </div>

                  {/* Alternative Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Alternative Emergency Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={alternativePhone}
                      onChange={(e) => setAlternativePhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-semibold text-slate-900 transition outline-none font-mono"
                      placeholder="e.g. 018XX XXXXXX"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Secondary contact in case primary telephone is busy or out of coverage.
                    </p>
                  </div>

                  {/* Preferred Language */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Communication Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-semibold bg-white text-slate-900 outline-none"
                    >
                      <option value="English">English (Official)</option>
                      <option value="বাংলা">বাংলা (Bengali)</option>
                    </select>
                  </div>

                  {/* Profile Avatar Image URL */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Profile Avatar Image URL (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-semibold text-slate-900 transition outline-none"
                        placeholder="https://example.com/avatar.jpg"
                      />
                      {avatarUrl && (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                          <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={profileSaving}
                    className="btn-secondary text-xs py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="btn-primary text-xs py-2 px-6 flex items-center gap-2 shadow-xs"
                  >
                    {profileSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ═══ SECTION D: SAVED DELIVERY ADDRESSES CARD ═══ */}
          <div id="saved-addresses" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    Delivery &amp; Service Locations
                  </h3>
                  <p className="text-xs text-slate-500">
                    Saved addresses for expedited marketplace checkout and technician booking
                  </p>
                </div>
              </div>

              {!showAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-600" /> Add Address
                </button>
              )}
            </div>

            {addressMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                  addressMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {addressMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                {addressMsg.text}
              </div>
            )}

            {/* INLINE ADDRESS FORM */}
            {showAddressForm && (
              <form
                onSubmit={handleAddAddress}
                className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4 animate-in fade-in"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <p className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Add New Bangladesh Address
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Address Label
                    </label>
                    <select
                      value={addressForm.label}
                      onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none"
                    >
                      <option value="Home">Home (Residential)</option>
                      <option value="Office">Office / Workplace</option>
                      <option value="Workshop">Workshop / Business</option>
                      <option value="Other">Other Location</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.recipientName}
                      onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none"
                      placeholder="Receiver's name"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none font-mono"
                      placeholder="017XX XXXXXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Division *
                    </label>
                    <select
                      value={addressForm.division}
                      onChange={(e) => setAddressForm({ ...addressForm, division: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none"
                    >
                      {BANGLADESH_DIVISIONS.map((div) => (
                        <option key={div} value={div}>
                          {div} Division
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      District *
                    </label>
                    <select
                      value={addressForm.district}
                      onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none"
                    >
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name} ({d.nameBn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Upazila / Thana *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.upazila}
                      onChange={(e) => setAddressForm({ ...addressForm, upazila: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none"
                      placeholder="e.g. Moulvibazar Sadar, Gulshan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Area / Neighborhood / Ward *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.area}
                      onChange={(e) => setAddressForm({ ...addressForm, area: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none"
                      placeholder="e.g. Kusumbag Point, Shamsernagar Rd"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nearest Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={addressForm.landmark}
                      onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none"
                      placeholder="e.g. Opp. Central Mosque, Near Model College"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Street Address / Holding &amp; Flat Details *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.addressLine}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none"
                    placeholder="House number, Holding No, Flat / Apartment No, Road name"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                      className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <span>Set as primary default address for bookings and delivery</span>
                  </label>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addressSaving}
                      className="btn-primary text-xs py-1.5 px-4 shadow-xs"
                    >
                      {addressSaving ? 'Saving...' : 'Save Location'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ADDRESS CARDS LIST */}
            {addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-10 text-slate-500 text-xs space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="font-medium">No delivery addresses saved in your customer profile yet.</p>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="btn-secondary text-xs py-2 px-4 shadow-xs"
                >
                  + Add Your First Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      addr.isDefault
                        ? 'border-brand-500/70 bg-brand-50/20 shadow-xs ring-1 ring-brand-500/10'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white shadow-xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                            {addr.label}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Check className="w-3 h-3" /> Default
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-[10px] font-bold text-slate-500 hover:text-brand-600 transition px-2 py-0.5 rounded hover:bg-slate-50"
                            >
                              Make Default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-slate-400 hover:text-red-600 transition p-1"
                            title="Delete Address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <p className="text-sm font-black text-slate-900">{addr.recipientName}</p>
                        <p className="text-xs text-slate-600 leading-relaxed">{addr.addressLine}</p>
                        <p className="text-xs text-slate-500 font-medium">
                          {addr.area}, {addr.upazila}, {addr.district} ({addr.division})
                        </p>
                        {addr.landmark && (
                          <p className="text-[11px] text-slate-400 italic">
                            Landmark: {addr.landmark}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-700 flex items-center gap-1">
                        📞 {addr.phone}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══ SECTION E: ACCOUNT SECURITY CARD ═══ */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-7 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Lock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  Account Security &amp; Credentials
                </h3>
                <p className="text-xs text-slate-500">
                  Update your account password and review authentication safety
                </p>
              </div>
            </div>

            {passwordMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Current Account Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full pr-10 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-semibold text-slate-900 transition outline-none"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    New Secure Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pr-10 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-semibold text-slate-900 transition outline-none"
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs font-semibold text-slate-900 transition outline-none"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-2 shadow-xs"
                >
                  {passwordSaving ? 'Updating Password...' : 'Change Password'}
                </button>
              </div>
            </form>

            {/* Session Status & Sign Out Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Web Session · Authorized as Customer</span>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto border border-red-200/60"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out of Account
              </button>
            </div>
          </div>
    </>
  );

  if (!isStandalonePage) {
    return (
      <div className="space-y-6">
        {/* ═══ HORIZONTAL PROFILE OVERVIEW CARD (Embedded) ═══ */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-slate-100 shadow-md shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white text-2xl font-black">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">{user.name}</h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Customer
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                    Active Account
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-1 text-xs text-slate-600">
                  <span>Member Since: <strong className="text-slate-900">{memberSince}</strong></span>
                  <span>·</span>
                  <span>Saved Addresses: <strong className="text-brand-600">{addresses.length}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/customer/profile"
                className="text-xs font-bold text-slate-600 hover:text-brand-600 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Full Profile Page
              </Link>
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleCancelEdit}
                  className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Cancel Editing
                </button>
              )}
            </div>
          </div>
        </div>

        {renderWorkspaceCards()}
      </div>
    );
  }

  // Standalone Full Layout (e.g. /customer/profile)
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-6">
      {/* ═══ SECTION A: BREADCRUMB & PAGE HEADER ═══ */}
      <div className="space-y-2">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand-600 transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/customer/dashboard" className="hover:text-brand-600 transition">
            My Account
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Profile</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                My Profile
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Customer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your personal information, saved delivery locations, and account security
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Cancel Editing
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ RESPONSIVE TWO-COLUMN LAYOUT (Sidebar + Main Workspace) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ═══ LEFT SIDEBAR (Cols 1-4) ═══ */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-5">
          {/* ═══ SECTION B: PROFILE OVERVIEW CARD ═══ */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 text-center space-y-4 relative overflow-hidden">
            {/* Ambient subtle top brand glow */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-500 via-brand-600 to-indigo-600" />

            {/* Customer Avatar */}
            <div className="relative mx-auto w-20 h-20 rounded-3xl overflow-hidden border-2 border-slate-100 shadow-md group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white text-2xl font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name & Identity */}
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900 leading-tight">
                {user.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate">
                {user.email}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Email Verified
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  Active Account
                </span>
              </div>
            </div>

            {/* Quick Metrics / Registration Badge */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100/80">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Member Since</span>
                <span className="text-xs font-black text-slate-800">{memberSince}</span>
              </div>
              <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100/80">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Saved Addresses</span>
                <span className="text-xs font-black text-brand-600">{addresses.length}</span>
              </div>
            </div>
          </div>

          {/* ═══ SECTION F: ACCOUNT NAVIGATION ═══ */}
          <nav className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden divide-y divide-slate-100">
            {[
              {
                href: '/customer/dashboard',
                label: 'Dashboard Overview',
                icon: LayoutDashboard,
                action: () => (onTabChange ? onTabChange('overview') : router.push('/customer/dashboard')),
              },
              {
                href: '/customer/dashboard?tab=orders',
                label: 'My Orders',
                icon: ShoppingBag,
                action: () => (onTabChange ? onTabChange('orders') : router.push('/customer/dashboard?tab=orders')),
              },
              {
                href: '/customer/dashboard?tab=bookings',
                label: 'Service Bookings',
                icon: Wrench,
                action: () => (onTabChange ? onTabChange('bookings') : router.push('/customer/dashboard?tab=bookings')),
              },
              {
                href: '/customer/dashboard?tab=warranty',
                label: 'Digital Warranty',
                icon: Shield,
                action: () => (onTabChange ? onTabChange('warranty') : router.push('/customer/dashboard?tab=warranty')),
              },
              {
                href: '/customer/dashboard?tab=support',
                label: 'Support Tickets',
                icon: LifeBuoy,
                action: () => (onTabChange ? onTabChange('support') : router.push('/customer/dashboard?tab=support')),
              },
              {
                href: '#saved-addresses',
                label: 'Saved Addresses',
                icon: MapPin,
                action: () => {
                  const el = document.getElementById('saved-addresses');
                  el?.scrollIntoView({ behavior: 'smooth' });
                },
              },
              {
                href: '/customer/profile',
                label: 'My Profile',
                icon: User,
                active: true,
                action: () => (onTabChange ? onTabChange('profile') : null),
              },
            ].map(({ href, label, icon: Icon, active, action }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition text-left ${
                  active
                    ? 'text-brand-600 bg-brand-50/60 font-black'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-brand-600'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </nav>

          {/* Quick Help Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-brand-400 text-xs font-bold">
              <PhoneCall className="w-4 h-4" />
              <span>Customer Help Desk</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Need assistance with an active booking, warranty claim, or account security?
            </p>
            <div className="pt-1">
              <a
                href="tel:01733983752"
                className="inline-flex items-center gap-1.5 text-xs font-black text-brand-300 hover:text-brand-200 transition"
              >
                📞 01733 983752 (24/7 Support)
              </a>
              <a
                href="mailto:needelectro23@gmail.com"
                className="text-[11px] text-slate-400 block hover:text-white transition"
              >
                ✉ needelectro23@gmail.com
              </a>
            </div>
          </div>
        </aside>

        {/* ═══ MAIN WORKSPACE (Cols 5-12) ═══ */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-6 min-w-0">
          {renderWorkspaceCards()}
        </main>
      </div>
    </div>
  );
}
