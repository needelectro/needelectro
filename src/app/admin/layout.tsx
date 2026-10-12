'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { isStaffOrAdmin, hasPermission, AdminPermission } from '@/lib/permissions';
import { prefetchFastData } from '@/lib/fastFetch';

const ROUTE_PREFETCH_MAP: Record<string, string> = {
  '/admin/dashboard': '/api/v1/admin/stats',
  '/admin/products': '/api/v1/products',
  '/admin/categories': '/api/v1/admin/categories',
  '/admin/orders': '/api/v1/orders',
  '/admin/customers': '/api/v1/admin/customers',
  '/admin/services': '/api/v1/services',
  '/admin/technicians': '/api/v1/admin/technicians',
  '/admin/jobs': '/api/v1/admin/jobs',
  '/admin/digital-solutions': '/api/v1/admin/leads?type=digital',
  '/admin/erp-leads': '/api/v1/admin/leads?type=erp',
  '/admin/reviews': '/api/v1/admin/reviews',
  '/admin/cms': '/api/v1/admin/cms',
  '/admin/notifications': '/api/v1/admin/notifications',
  '/admin/support': '/api/v1/admin/support',
  '/admin/recycle-bin': '/api/v1/admin/recycle-bin',
  '/admin/audit-logs': '/api/v1/admin/audit-logs',
};
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  CreditCard,
  CalendarCheck,
  Zap,
  Wrench,
  Briefcase,
  Code2,
  Building,
  Star,
  Tag,
  FileText,
  Bell,
  LifeBuoy,
  BarChart3,
  ShieldCheck,
  GraduationCap,
  Store,
  Settings,
  History,
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  LogOut,
  Building2,
  ChevronDown,
  Loader2,
  RotateCcw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: AdminPermission;
  badge?: string;
  category?: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  // Core
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard:view' },
  
  // Commerce & Products
  { href: '/admin/products', label: 'Products', icon: Package, permission: 'products:read', category: 'Catalog & Store' },
  { href: '/admin/categories', label: 'Categories', icon: Layers, permission: 'products:read', category: 'Catalog & Store' },
  { href: '/admin/inventory', label: 'Inventory & Stock', icon: Boxes, permission: 'inventory:read', category: 'Catalog & Store' },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, permission: 'orders:read', category: 'Catalog & Store' },
  { href: '/admin/customers', label: 'Customers', icon: Users, permission: 'customers:read', category: 'Catalog & Store' },
  { href: '/admin/sellers', label: 'Merchant Sellers', icon: Store, permission: 'products:read', category: 'Catalog & Store' },
  { href: '/admin/warranties', label: 'Warranties & Claims', icon: ShieldCheck, permission: 'orders:read', category: 'Catalog & Store' },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard, permission: 'finance:read', category: 'Catalog & Store' },
  { href: '/admin/emi', label: 'EMI Management', icon: CalendarCheck, permission: 'finance:emi', category: 'Catalog & Store' },

  // Services & Workforce
  { href: '/admin/services', label: 'Electrical Services', icon: Zap, permission: 'services:read', category: 'Workforce Marketplace' },
  { href: '/admin/technicians', label: 'Technicians', icon: Wrench, permission: 'technicians:read', category: 'Workforce Marketplace' },
  { href: '/admin/jobs', label: 'Job Management', icon: Briefcase, permission: 'jobs:read', category: 'Workforce Marketplace' },
  { href: '/admin/training', label: 'Training Academy', icon: GraduationCap, permission: 'technicians:read', category: 'Workforce Marketplace' },

  // Digital Solutions & ERP
  { href: '/admin/digital-solutions', label: 'Digital Solutions', icon: Code2, permission: 'leads:read', category: 'Enterprise Leads' },
  { href: '/admin/erp-leads', label: 'ERP Leads', icon: Building, permission: 'leads:read', category: 'Enterprise Leads' },

  // Marketing & Feedback
  { href: '/admin/reviews', label: 'Reviews', icon: Star, permission: 'reviews:read', category: 'Content & Engagement' },
  { href: '/admin/promotions', label: 'Promotions', icon: Tag, permission: 'products:write', category: 'Content & Engagement' },
  { href: '/admin/cms', label: 'Content CMS', icon: FileText, permission: 'cms:read', category: 'Content & Engagement' },
  { href: '/admin/seo', label: 'SEO Management', icon: Search, permission: 'settings:write', category: 'Content & Engagement' },

  // Operations & Intelligence
  { href: '/admin/notifications', label: 'Notifications', icon: Bell, permission: 'notifications:read', category: 'Operations & Insights' },
  { href: '/admin/support', label: 'Support Tickets', icon: LifeBuoy, permission: 'support:read', category: 'Operations & Insights' },
  { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3, permission: 'reports:view', category: 'Operations & Insights' },
  { href: '/admin/branches', label: 'Branches', icon: Building2, permission: 'settings:write', category: 'Operations & Insights' },
  { href: '/admin/staff', label: 'Staff & Roles', icon: ShieldCheck, permission: 'staff:manage', category: 'Operations & Insights' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, permission: 'settings:write', category: 'Operations & Insights' },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: History, permission: 'audit:read', category: 'Operations & Insights' },
  { href: '/admin/recycle-bin', label: 'Recycle Bin & Recovery', icon: RotateCcw, permission: 'audit:read', category: 'Operations & Insights' },
];

const BRANCHES = [
  'Moulvibazar Headquarters',
  'Sreemangal Regional Branch',
  'Sylhet Central Hub',
  'Dhaka Enterprise Center',
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/v1/admin/notifications');
        if (res.ok) {
          const data = await res.json();
          setUnreadNotifications(data.unreadCount || 0);
        }
      } catch {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Idle background prefetch once per session
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      prefetchFastData([
        '/api/v1/products',
        '/api/v1/services',
        '/api/v1/orders',
        '/api/v1/admin/categories',
      ]);
    }, 1500);
    return () => clearTimeout(timer);
  }, [user?.id]);

  useEffect(() => {
    if (!globalSearch.trim() || globalSearch.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/v1/admin/search?q=${encodeURIComponent(globalSearch.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setShowSearchResults(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [globalSearch]);

  useEffect(() => {
    if (isLoginPage) return;

    if (!isLoading) {
      if (!user) {
        router.replace('/admin/login?redirect=' + encodeURIComponent(pathname || '/admin/dashboard'));
      } else if (!isStaffOrAdmin(user)) {
        router.replace('/admin/login?error=unauthorized');
      }
    }
  }, [user, isLoading, pathname, router, isLoginPage]);

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    router.push(`/admin/products?search=${encodeURIComponent(globalSearch.trim())}`);
    setShowSearchResults(false);
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-xs text-slate-400 font-medium">Verifying administrator session...</p>
      </div>
    );
  }

  if (!user || !isStaffOrAdmin(user)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        <p className="text-xs text-slate-400 font-medium">Redirecting to admin login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-900 flex flex-col antialiased">
      {/* 1. TOP GLOBAL NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              title="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
              <div className="p-1 rounded-xl bg-slate-900 flex items-center justify-center shadow-xs">
                <Image
                  src="/brand/needelectro-icon.png"
                  alt="NEED ELECTRO"
                  width={32}
                  height={32}
                  className="w-7 h-7 object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-black text-sm text-slate-950 tracking-tight leading-none group-hover:text-brand-600 transition-colors">
                  NEED ELECTRO
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
                  Operations Console
                </span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition ml-2"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Center: Global Search Bar with Live Overlay */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <form onSubmit={handleGlobalSearch} className="w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowSearchResults(true); }}
                placeholder="Search across orders, SKUs, phones, jobs, customers..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
              {isSearching && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </form>

            {/* Live Autocomplete Overlay */}
            {showSearchResults && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Search Matches ({searchResults.length})</span>
                  <button onClick={() => setShowSearchResults(false)} className="text-slate-400 hover:text-slate-700">Close</button>
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No matching records found.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {searchResults.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.link}
                        onClick={() => { setShowSearchResults(false); setGlobalSearch(''); }}
                        className="p-3 flex items-start justify-between gap-3 hover:bg-slate-50 transition block"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                              {item.type}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{item.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 self-center" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Branch Selector, Quick Actions, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Branch Selector */}
            <div className="relative hidden xl:block">
              <button
                onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
              >
                <Building2 className="w-3.5 h-3.5 text-brand-500" />
                <span className="max-w-[160px] truncate">{selectedBranch}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {branchDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Select Active Branch
                  </div>
                  {BRANCHES.map((b) => (
                    <button
                      key={b}
                      onClick={() => { setSelectedBranch(b); setBranchDropdownOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-xs font-medium transition flex items-center justify-between ${
                        selectedBranch === b ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="truncate">{b}</span>
                      {selectedBranch === b && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setQuickActionOpen(!quickActionOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white text-xs font-bold shadow-xs active:scale-95 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quick Action</span>
              </button>

              {quickActionOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50">
                  <Link
                    href="/admin/products?action=new"
                    onClick={() => setQuickActionOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Package className="w-3.5 h-3.5 text-brand-500" /> New Product
                  </Link>
                  <Link
                    href="/admin/services?action=new"
                    onClick={() => setQuickActionOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> New Service
                  </Link>
                  <Link
                    href="/admin/inventory?action=adjust"
                    onClick={() => setQuickActionOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Boxes className="w-3.5 h-3.5 text-sky-500" /> Stock Adjustment
                  </Link>
                  <Link
                    href="/admin/staff?action=invite"
                    onClick={() => setQuickActionOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium border-t border-slate-100"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Add Staff Member
                  </Link>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <Link
              href="/admin/notifications"
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition relative"
              title={unreadNotifications > 0 ? `${unreadNotifications} Unread Notifications` : "Notifications"}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black rounded-full px-1.5 py-0.2 min-w-[18px] text-center shadow-xs">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </Link>

            {/* Profile & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center font-black text-xs text-white shadow-xs">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{user.name}</span>
                <span className="text-[10px] font-extrabold text-brand-600 uppercase">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition ml-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden lg:flex flex-col shrink-0 bg-white border-r border-slate-200/80 transition-all duration-300 ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin">
            {Array.from(new Set(SIDEBAR_ITEMS.map((item) => item.category || 'General'))).map((category) => {
              const items = SIDEBAR_ITEMS.filter((item) => (item.category || 'General') === category);
              const allowedItems = items.filter((item) => !item.permission || hasPermission(user, item.permission));
              if (!allowedItems.length) return null;

              return (
                <div key={category} className="space-y-1">
                  {!sidebarCollapsed && (
                    <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                      {category}
                    </div>
                  )}

                  {allowedItems.map(({ href, label, icon: Icon, badge }) => {
                    const isActive = pathname === href || pathname?.startsWith(href + '/');

                    return (
                      <Link
                        key={href}
                        href={href}
                        title={sidebarCollapsed ? label : undefined}
                        onMouseEnter={() => {
                          if (ROUTE_PREFETCH_MAP[href]) {
                            prefetchFastData([ROUTE_PREFETCH_MAP[href]]);
                          }
                        }}
                        className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-brand-500 text-white shadow-xs shadow-brand-500/20'
                            : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                        } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 group-hover:scale-105'}`} />
                        {!sidebarCollapsed && <span className="truncate">{label}</span>}
                        {!sidebarCollapsed && badge && (
                          <span className="ml-auto px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-red-100 text-red-700">
                            {badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer info */}
          {!sidebarCollapsed && (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 m-2 rounded-2xl text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <ShieldAlert className="w-3.5 h-3.5 text-brand-600" />
                V1 Enterprise
              </span>
              <span className="text-[10px] text-slate-400">Asia/Dhaka</span>
            </div>
          )}
        </aside>

        {/* MOBILE SLIDE-OVER SIDEBAR */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 bg-white flex flex-col h-full shadow-2xl z-10 py-4 px-4 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <span className="font-black text-sm text-slate-900">Operations Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {SIDEBAR_ITEMS.filter((item) => !item.permission || hasPermission(user, item.permission)).map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || pathname?.startsWith(href + '/');
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      onTouchStart={() => {
                        if (ROUTE_PREFETCH_MAP[href]) {
                          prefetchFastData([ROUTE_PREFETCH_MAP[href]]);
                        }
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                        isActive ? 'bg-brand-500 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MAIN ADMIN WORKSPACE */}
        <main className="flex-1 overflow-y-auto min-w-0 bg-[#F4F6F8]">
          {children}
        </main>
      </div>
    </div>
  );
}
