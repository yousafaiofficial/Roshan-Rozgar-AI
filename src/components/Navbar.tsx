import React, { useState } from 'react';
import { AppLanguage, UserRole, Customer, WorkerProfile } from '../types';
import { t } from '../data/translations';
import {
  RefreshCw,
  Mic,
  UserCheck,
  Shield,
  Menu,
  X,
  LogIn,
  Search,
  Sparkles,
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  onResetDemo: () => void;
  isResetting: boolean;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  currentUser: Customer | null;
  activeWorker: WorkerProfile | null;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  lang,
  setLang,
  onResetDemo,
  isResetting,
  onOpenAuth,
  currentUser,
  activeWorker,
  isLoggedIn,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isUrdu = lang === 'ur';

  return (
    <header className="sticky top-0 z-40 bg-[#5D2A42] backdrop-blur-md border-b border-[#431D30] transition-all">


      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setCurrentTab('landing')}
            className="text-left group flex items-center gap-3 cursor-pointer"
          >
            {/* Custom Logo Emblem */}
            <div className="w-10 h-10 rounded-xl bg-[#FB6376] text-white flex items-center justify-center font-extrabold shadow-sm group-hover:scale-105 transition-transform border border-[#FCB1A6]/40">
              <span className="text-xl">ر</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-[#FCB1A6] transition-colors">
                  Roshan Rozgar
                </span>
                <span className="text-base font-urdu font-bold text-[#FCB1A6]">
                  روشن روزگار
                </span>
              </div>
              <div className="text-[10px] text-[#FCB1A6]/80 font-medium tracking-wide hidden sm:block">
                Kaam Aasaan, Rozgar Roshan
              </div>
            </div>
          </button>
        </div>

        {/* Center Navigation Links (Linear/Stripe style) */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-white">
          <button
            onClick={() => {
              setUserRole('customer');
              setCurrentTab('discovery');
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
              currentTab === 'discovery'
                ? 'text-white border-b-2 border-[#FCB1A6]'
                : 'text-[#FCB1A6] hover:text-white'
            }`}
          >
            {t(lang, 'findWorkers')}
          </button>

          <button
            onClick={() => setCurrentTab('how-it-works')}
            className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
              currentTab === 'how-it-works'
                ? 'text-white border-b-2 border-[#FCB1A6]'
                : 'text-[#FCB1A6] hover:text-white'
            }`}
          >
            {t(lang, 'howItWorks')}
          </button>

          <button
            onClick={() => {
              setUserRole('worker');
              setCurrentTab('voice-onboard');
            }}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer py-1 ${
              currentTab === 'voice-onboard'
                ? 'text-white border-b-2 border-[#FCB1A6]'
                : 'text-[#FCB1A6] hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#FB6376]" />
            <span>{t(lang, 'becomeWorker')}</span>
          </button>

          <button
            onClick={() => {
              setUserRole('customer');
              setCurrentTab('customer-dashboard');
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer py-1 ${
              currentTab === 'customer-dashboard'
                ? 'text-white border-b-2 border-[#FCB1A6]'
                : 'text-[#FCB1A6] hover:text-white'
            }`}
          >
            Customer Hub
          </button>

          <button
            onClick={() => {
              setUserRole('worker');
              setCurrentTab('worker-dashboard');
            }}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer py-1 ${
              currentTab === 'worker-dashboard'
                ? 'text-white border-b-2 border-[#FCB1A6]'
                : 'text-[#FCB1A6] hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#FB6376]" />
            <span>Worker Console</span>
          </button>

          <button
            onClick={() => setCurrentTab('architecture')}
            className={`flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer py-1 ${
              currentTab === 'architecture'
                ? 'text-white border-b-2 border-[#FCB1A6]'
                : 'text-[#FCB1A6] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#886273]" />
            <span>PRD Matrix</span>
          </button>
        </nav>

        {/* Right Actions: Language Switcher, Role Selector, Auth CTA */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Demo Reset */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="hidden sm:flex items-center justify-center p-2 rounded-xl text-[#886273] hover:text-white hover:bg-[#431D30] transition-colors cursor-pointer"
            title="Reset Demo Data"
            aria-label="Reset Demo Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-[#FB6376]' : ''}`} />
          </button>

          {/* Language Selector */}
          <div className="flex items-center p-0.5 bg-[#431D30] border border-[#5D2A42] rounded-xl text-xs font-semibold">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#FB6376] text-white shadow-xs'
                  : 'text-[#FCB1A6] hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('roman')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                lang === 'roman'
                  ? 'bg-[#FB6376] text-white shadow-xs'
                  : 'text-[#FCB1A6] hover:text-white'
              }`}
            >
              Roman
            </button>
            <button
              onClick={() => setLang('ur')}
              className={`px-2 py-1 rounded-lg transition-colors font-urdu cursor-pointer ${
                lang === 'ur'
                  ? 'bg-white text-[#5D2A42] shadow-xs font-bold'
                  : 'text-[#FCB1A6] hover:text-white'
              }`}
            >
              اردو
            </button>
          </div>

          {/* Role Mode Pills */}
          <div className="hidden sm:flex items-center p-0.5 bg-[#431D30] border border-[#5D2A42] rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setUserRole('customer');
                setCurrentTab('discovery');
              }}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                userRole === 'customer'
                  ? 'bg-[#5D2A42] text-white shadow-xs'
                  : 'text-[#5D2A42] hover:text-[#FB6376]'
              }`}
            >
              {lang === 'ur' ? 'گاہک' : lang === 'roman' ? 'Gahak' : 'Customer'}
            </button>
            <button
              onClick={() => {
                setUserRole('worker');
                setCurrentTab('worker-dashboard');
              }}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                userRole === 'worker'
                  ? 'bg-[#5D2A42] text-white shadow-xs'
                  : 'text-[#5D2A42] hover:text-[#FB6376]'
              }`}
            >
              {lang === 'ur' ? 'کاریگر' : lang === 'roman' ? 'Karigar' : 'Worker'}
            </button>
          </div>

          {/* Login / Sign Up Action OR Active Logged-in Profile Badge */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() =>
                  setCurrentTab(userRole === 'worker' ? 'worker-dashboard' : 'customer-dashboard')
                }
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#431D30] border border-[#FB6376]/30 hover:bg-[#5D2A42] text-white transition-colors cursor-pointer"
                title={userRole === 'worker' ? 'Open Worker Business Console' : 'Open Customer Hub'}
              >
                <div className="w-6 h-6 rounded-lg bg-[#FB6376] text-white flex items-center justify-center text-xs font-extrabold overflow-hidden">
                  {userRole === 'worker' && activeWorker?.avatar_url ? (
                    <img src={activeWorker.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>
                      {userRole === 'worker'
                        ? activeWorker?.name.charAt(0) || 'W'
                        : currentUser?.name.charAt(0) || 'C'}
                    </span>
                  )}
                </div>
                <div className="text-left text-xs leading-tight">
                  <div className="font-bold text-white truncate max-w-[100px]">
                    {userRole === 'worker' ? activeWorker?.name : currentUser?.name}
                  </div>
                  <div className="text-[10px] text-[#FCB1A6] font-semibold">
                    {userRole === 'worker' ? 'Worker' : 'Customer'}
                  </div>
                </div>
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-xs font-semibold text-[#FCB1A6] hover:text-white rounded-xl hover:bg-[#431D30] transition-colors cursor-pointer"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-xs font-bold bg-[#431D30] hover:bg-[#5D2A42] text-white rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer border border-[#FB6376]/40"
              >
                {t(lang, 'login')}
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 text-xs font-bold bg-[#FB6376] hover:bg-[#ea4d62] text-white rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>{t(lang, 'signup')}</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-white hover:bg-[#431D30] transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#5D2A42] border-b border-[#431D30] px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#431D30]">
            <button
              onClick={() => {
                setUserRole('customer');
                setCurrentTab('discovery');
                setMobileMenuOpen(false);
              }}
              className={`py-2 text-xs font-bold rounded-xl text-center ${
                userRole === 'customer'
                  ? 'bg-[#FB6376] text-white'
                  : 'bg-[#431D30] text-[#FCB1A6]'
              }`}
            >
              Customer Mode
            </button>
            <button
              onClick={() => {
                setUserRole('worker');
                setCurrentTab('worker-dashboard');
                setMobileMenuOpen(false);
              }}
              className={`py-2 text-xs font-bold rounded-xl text-center ${
                userRole === 'worker'
                  ? 'bg-[#FB6376] text-white'
                  : 'bg-[#431D30] text-[#FCB1A6]'
              }`}
            >
              Worker Mode
            </button>
          </div>

          <div className="flex flex-col gap-2 text-xs font-bold text-white">
            <button
              onClick={() => {
                setCurrentTab('landing');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#431D30]"
            >
              Home (Landing)
            </button>
            <button
              onClick={() => {
                setCurrentTab('discovery');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#431D30]"
            >
              {t(lang, 'findWorkers')}
            </button>
            <button
              onClick={() => {
                setCurrentTab('how-it-works');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#431D30]"
            >
              {t(lang, 'howItWorks')}
            </button>
            <button
              onClick={() => {
                setCurrentTab('voice-onboard');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#431D30] text-[#FCB1A6]"
            >
              {t(lang, 'becomeWorker')} (Voice Onboard)
            </button>
            <button
              onClick={() => {
                setCurrentTab('customer-dashboard');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#431D30]"
            >
              Customer Hub
            </button>
            <button
              onClick={() => {
                setCurrentTab('worker-dashboard');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#431D30]"
            >
              Worker Business Console
            </button>
            <button
              onClick={() => {
                setCurrentTab('architecture');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-[#431D30]"
            >
              PRD &amp; Testing Matrix
            </button>
          </div>

          <div className="pt-3 border-t border-[#431D30]">
            {isLoggedIn ? (
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentTab(userRole === 'worker' ? 'worker-dashboard' : 'customer-dashboard');
                  }}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#431D30] border border-[#FB6376]/40 rounded-xl text-center"
                >
                  My Dashboard ({userRole === 'worker' ? activeWorker?.name : currentUser?.name})
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="py-2 px-3 text-xs font-bold text-[#FCB1A6] bg-[#431D30] border border-[#FB6376]/40 rounded-xl"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#431D30] border border-[#FB6376]/40 rounded-xl text-center"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('signup');
                  }}
                  className="flex-1 py-2 text-xs font-bold text-white bg-[#FB6376] hover:bg-[#ea4d62] rounded-xl text-center"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
