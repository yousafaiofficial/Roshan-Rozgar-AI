import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { TRADES, AREAS, t } from '../data/translations';
import {
  Search,
  MapPin,
  Sparkles,
  ShieldCheck,
  Star,
  CheckCircle,
  ArrowRight,
  Zap,
  Wrench,
  Wind,
  Mic,
} from 'lucide-react';

interface LandingHeroProps {
  lang: AppLanguage;
  onSearch: (trade: string, area: string, query: string) => void;
  onNavigateToVoiceOnboard: () => void;
  availableCount: number;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  lang,
  onSearch,
  onNavigateToVoiceOnboard,
  availableCount,
}) => {
  const [selectedTrade, setSelectedTrade] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(selectedTrade, selectedArea, query);
  };

  const isUrdu = lang === 'ur';

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 border-b border-[#F2DDD3] bg-[#FFF9EC]">
      {/* Subtle Warm Pink/Peach Decorative Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FB6376]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FCB1A6]/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Search Bar */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Availability Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFDCCC]/60 border border-[#FB6376]/20 text-xs font-semibold text-[#5D2A42]">
              <span className="w-2 h-2 rounded-full bg-[#FB6376] animate-pulse" />
              <span>
                {availableCount} Verified Pros Available Right Now in Islamabad &amp; Rawalpindi
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#5D2A42] tracking-tight leading-[1.15]">
              {isUrdu ? (
                <span className="font-urdu leading-normal">
                  پاکستان کا ہنر۔ <br />
                  <span className="text-[#FB6376]">آپ کا محلہ۔</span>
                </span>
              ) : (
                <>
                  Pakistan&apos;s Skills. <br />
                  <span className="text-[#FB6376]">Your Neighbourhood.</span>
                </>
              )}
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-[#3A1B29]/80 leading-relaxed max-w-xl">
              {t(lang, 'heroSubheadline')}
            </p>

            {/* Prominent Search Bar (Airbnb / Linear style) */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl shadow-xl border border-[#F2DDD3] max-w-2xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
                {/* Profession / Issue Search */}
                <div className="sm:col-span-5 relative">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#886273] px-2 mb-0.5">
                    What service?
                  </div>
                  <div className="flex items-center">
                    <Search className="w-4 h-4 text-[#886273] ml-2 shrink-0" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. Electrician, UPS, Leak..."
                      className="w-full px-2 py-1.5 text-xs text-[#3A1B29] font-semibold bg-transparent focus:outline-none placeholder:text-[#886273]/70"
                    />
                  </div>
                </div>

                {/* Location / Area Dropdown */}
                <div className="sm:col-span-4 border-t sm:border-t-0 sm:border-l border-[#F2DDD3] sm:pl-3 pt-2 sm:pt-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#886273] px-1 mb-0.5">
                    Where?
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-[#FB6376] shrink-0" />
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full px-1.5 py-1.5 text-xs text-[#3A1B29] font-semibold bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Islamabad &amp; Rwp</option>
                      {AREAS.filter((a) => a !== 'All').map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Distinctive Bubblegum Pink Search CTA Button */}
                <div className="sm:col-span-3 pt-2 sm:pt-0">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-[#FB6376] hover:bg-[#ea4d62] text-white font-extrabold text-xs rounded-xl sm:rounded-2xl shadow-sm transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-4 h-4 stroke-[2.5]" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Voice Onboarding & Quick Category Shortcuts */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <span className="font-semibold text-[#886273]">Popular:</span>
              {['Electrician', 'Plumber', 'AC Technician', 'Carpenter'].map((tName) => (
                <button
                  key={tName}
                  type="button"
                  onClick={() => onSearch(tName, 'All', '')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#F2DDD3] hover:border-[#FB6376] text-[#3A1B29] font-medium transition-colors cursor-pointer"
                >
                  {tName}
                </button>
              ))}

              <button
                type="button"
                onClick={onNavigateToVoiceOnboard}
                className="inline-flex items-center gap-1.5 font-bold text-[#FB6376] hover:text-[#5D2A42] hover:underline ml-2 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice Register as a Worker &rarr;</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Real Photography Asset with Floating Trust Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Decorative Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3]">
                <img
                  src="/src/assets/images/hero_pakistani_electrician_1794290182363.jpg"
                  alt="Pakistani skilled trade electrician at work in an Islamabad residential building"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#5D2A42]/80 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Scrim Badge */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-xs font-semibold text-[#FCB1A6] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Skilled Tradesperson</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    Mohammad Tariq · 12 Yrs Experience in G-9 Islamabad
                  </div>
                </div>
              </div>

              {/* Floating Trust Card 1: Fast Arrival */}
              <div className="absolute -top-4 -left-4 sm:-top-5 sm:-left-5 bg-white p-3 sm:p-3.5 rounded-2xl shadow-xl border border-[#F2DDD3] flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFDCCC] text-[#5D2A42] flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 fill-current text-[#FB6376]" />
                </div>
                <div>
                  <div className="text-[10px] text-[#886273] font-semibold uppercase tracking-wider">
                    Twin Cities Response
                  </div>
                  <div className="text-xs font-bold text-[#5D2A42]">
                    &lt; 45 Mins Average Arrival
                  </div>
                </div>
              </div>

              {/* Floating Trust Card 2: Transparent PKR Quotes */}
              <div className="absolute -bottom-5 -right-3 sm:-bottom-5 sm:-right-4 bg-[#5D2A42] text-white p-3.5 rounded-2xl shadow-xl border border-[#FB6376]/40 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FB6376] text-white flex items-center justify-center font-extrabold text-sm">
                  PKR
                </div>
                <div>
                  <div className="text-[10px] text-[#FCB1A6] font-semibold uppercase tracking-wider">
                    Transparent Pricing
                  </div>
                  <div className="text-xs font-bold text-white">
                    Agreed Before Work Starts
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
