import React from 'react';
import { AppLanguage, UserRole } from '../types';
import { t } from '../data/translations';
import { RefreshCw, Mic, Sparkles, UserCheck, Shield } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userRole,
  setUserRole,
  lang,
  setLang,
  onResetDemo,
  isResetting,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFF9EC]/95 backdrop-blur-md border-b border-[#F2DDD3] transition-all">
      {/* Top Banner Notice */}
      <div className="bg-[#5D2A42] text-[#FFDCCC] px-4 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-[#FCB1A6] shrink-0">Roshan Rozgar</span>
          <span className="hidden sm:inline text-[#FFDCCC]/60">·</span>
          <span className="truncate">Islamabad & Rawalpindi Skilled Trades · AI Voice Onboarding & Local Discovery</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px]">
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[#FFDCCC]"
            title="Reset to fresh seeded workers and requests"
          >
            <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{t(lang, 'resetDemo')}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar complying with Section 2 Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('discovery')}
            className="text-left group flex items-baseline gap-2.5 cursor-pointer"
          >
            <span className="text-xl font-bold tracking-tight text-[#5D2A42] group-hover:text-[#FB6376] transition-colors">
              Roshan Rozgar
            </span>
            <span className="text-sm font-urdu font-semibold text-[#FB6376]">
              روشن روزگار
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#886273]">
          <button
            onClick={() => {
              setUserRole('customer');
              setCurrentTab('discovery');
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
              currentTab === 'discovery' && userRole === 'customer'
                ? 'text-[#5D2A42] font-semibold border-b-2 border-[#FB6376]'
                : 'hover:text-[#5D2A42]'
            }`}
          >
            {t(lang, 'findWorkers')}
          </button>

          <button
            onClick={() => {
              setUserRole('worker');
              setCurrentTab('voice-onboard');
            }}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
              currentTab === 'voice-onboard'
                ? 'text-[#5D2A42] font-semibold border-b-2 border-[#FB6376]'
                : 'hover:text-[#5D2A42]'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#FB6376]" />
            <span>{t(lang, 'becomeWorker')}</span>
          </button>

          <button
            onClick={() => {
              setUserRole('worker');
              setCurrentTab('worker-dashboard');
            }}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
              currentTab === 'worker-dashboard' && userRole === 'worker'
                ? 'text-[#5D2A42] font-semibold border-b-2 border-[#FB6376]'
                : 'hover:text-[#5D2A42]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#FB6376]" />
            <span>{t(lang, 'workerMode')}</span>
          </button>

          <button
            onClick={() => setCurrentTab('architecture')}
            className={`flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
              currentTab === 'architecture'
                ? 'text-[#5D2A42] font-semibold border-b-2 border-[#FB6376]'
                : 'hover:text-[#5D2A42]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#886273]" />
            <span>PRD & Testing</span>
          </button>
        </nav>

        {/* Zone 3: Role Switcher & Language Selector */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language Selector */}
          <div className="flex items-center p-0.5 bg-[#FFDCCC] rounded-lg text-xs font-medium">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                lang === 'en' ? 'bg-white text-[#5D2A42] shadow-xs font-semibold' : 'text-[#886273] hover:text-[#5D2A42]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('roman')}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                lang === 'roman' ? 'bg-white text-[#5D2A42] shadow-xs font-semibold' : 'text-[#886273] hover:text-[#5D2A42]'
              }`}
            >
              Roman
            </button>
            <button
              onClick={() => setLang('ur')}
              className={`px-2 py-1 rounded-md transition-colors font-urdu cursor-pointer ${
                lang === 'ur' ? 'bg-white text-[#5D2A42] shadow-xs font-bold' : 'text-[#886273] hover:text-[#5D2A42]'
              }`}
            >
              اردو
            </button>
          </div>

          {/* Quick Role Switcher */}
          <div className="flex items-center p-0.5 bg-[#FFDCCC] border border-[#F2DDD3] rounded-lg text-xs font-medium">
            <button
              onClick={() => {
                setUserRole('customer');
                setCurrentTab('discovery');
              }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                userRole === 'customer'
                  ? 'bg-[#5D2A42] text-white shadow-xs font-semibold'
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
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                userRole === 'worker'
                  ? 'bg-[#5D2A42] text-white shadow-xs font-semibold'
                  : 'text-[#5D2A42] hover:text-[#FB6376]'
              }`}
            >
              {lang === 'ur' ? 'کاریگر' : lang === 'roman' ? 'Karigar' : 'Worker'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
