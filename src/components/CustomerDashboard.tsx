import React, { useState, useMemo } from 'react';
import { WorkerProfile, AppLanguage } from '../types';
import { TRADES, AREAS, t } from '../data/translations';
import {
  Search,
  MapPin,
  Star,
  SlidersHorizontal,
  Map,
  LayoutGrid,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpDown,
  Zap,
  Wrench,
  Wind,
  Hammer,
  Paintbrush,
  Cpu,
  Cog,
} from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';

interface CustomerDashboardProps {
  workers: WorkerProfile[];
  lang: AppLanguage;
  onSelectWorker: (worker: WorkerProfile) => void;
  onBookWorker: (worker: WorkerProfile) => void;
  initialTrade?: string;
  initialArea?: string;
  initialQuery?: string;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  workers,
  lang,
  onSelectWorker,
  onBookWorker,
  initialTrade = 'All',
  initialArea = 'All',
  initialQuery = '',
}) => {
  const [selectedTrade, setSelectedTrade] = useState<string>(initialTrade);
  const [selectedArea, setSelectedArea] = useState<string>(initialArea);
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Additional Filter State
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'experience' | 'price-asc' | 'price-desc'>('recommended');
  const [showFiltersModal, setShowFiltersModal] = useState<boolean>(false);

  // Filter & Sort
  const filteredWorkers = useMemo(() => {
    return workers
      .filter((w) => {
        if (selectedTrade !== 'All' && w.trade !== selectedTrade) return false;
        if (selectedArea !== 'All' && w.area !== selectedArea) return false;
        if (onlyAvailable && !w.is_available) return false;
        if (w.starting_price > maxPrice) return false;
        if (w.rating < minRating) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            w.name.toLowerCase().includes(q) ||
            w.trade.toLowerCase().includes(q) ||
            w.area.toLowerCase().includes(q) ||
            w.bio.toLowerCase().includes(q) ||
            w.skills.some((s) => s.toLowerCase().includes(q));
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'experience') return b.experience_years - a.experience_years;
        if (sortBy === 'price-asc') return a.starting_price - b.starting_price;
        if (sortBy === 'price-desc') return b.starting_price - a.starting_price;
        // Default: recommended (available first, then rating)
        if (a.is_available !== b.is_available) return a.is_available ? -1 : 1;
        return b.rating - a.rating;
      });
  }, [workers, selectedTrade, selectedArea, onlyAvailable, maxPrice, minRating, searchQuery, sortBy]);

  const getTradeIcon = (trade: string) => {
    switch (trade) {
      case 'Electrician':
        return <Zap className="w-4 h-4 text-[#FB6376]" />;
      case 'Plumber':
        return <Wrench className="w-4 h-4 text-[#FB6376]" />;
      case 'AC Technician':
        return <Wind className="w-4 h-4 text-[#FB6376]" />;
      case 'Carpenter':
        return <Hammer className="w-4 h-4 text-[#FB6376]" />;
      case 'Painter':
        return <Paintbrush className="w-4 h-4 text-[#FB6376]" />;
      case 'Appliance Repair':
        return <Cpu className="w-4 h-4 text-[#FB6376]" />;
      case 'Mechanic':
        return <Cog className="w-4 h-4 text-[#FB6376]" />;
      default:
        return <Wrench className="w-4 h-4 text-[#FB6376]" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Strip */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FB6376] uppercase tracking-wider">
            {lang === 'ur' ? 'مارکیٹ پلیس ڈسکوری' : 'Hyper-Local Marketplace'}
          </span>
          <h1 className="text-3xl font-extrabold text-[#5D2A42] tracking-tight mt-1">
            {t(lang, 'findWorkers')}
          </h1>
          <p className="text-xs sm:text-sm text-[#886273] mt-1">
            Compare trusted professionals, view real availability, negotiate rates, and hire confidently across Islamabad &amp; Rawalpindi.
          </p>
        </div>

        {/* View Mode Switcher (Grid vs Interactive Map) */}
        <div className="flex items-center gap-1 p-1 bg-[#FFDCCC]/60 border border-[#F2DDD3] rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-[#5D2A42] shadow-xs'
                : 'text-[#886273] hover:text-[#3A1B29]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grid Cards</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              viewMode === 'map'
                ? 'bg-white text-[#5D2A42] shadow-xs'
                : 'text-[#886273] hover:text-[#3A1B29]'
            }`}
          >
            <Map className="w-3.5 h-3.5 text-[#FB6376]" />
            <span>Twin Cities Map</span>
          </button>
        </div>
      </div>

      {/* Main Search & Control Filter Bar (Stripe / Linear style) */}
      <div className="bg-white rounded-3xl p-5 border border-[#F2DDD3] shadow-xs mb-8 space-y-4">
        {/* Row 1: Search Query + Sector + Sort + Available Switch */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Keyword Input */}
          <div className="relative md:col-span-5">
            <Search className="w-4 h-4 text-[#886273] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(lang, 'searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold bg-[#FFF9EC] border border-[#F2DDD3] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376] text-[#3A1B29]"
            />
          </div>

          {/* Area Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              aria-label="Filter Area"
              className="w-full px-3 py-2.5 text-xs font-semibold bg-[#FFF9EC] border border-[#F2DDD3] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376] text-[#3A1B29] cursor-pointer"
            >
              <option value="All">{t(lang, 'allLocations')}</option>
              {AREAS.filter((a) => a !== 'All').map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort by"
              className="w-full px-3 py-2.5 text-xs font-semibold bg-[#FFF9EC] border border-[#F2DDD3] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376] text-[#3A1B29] cursor-pointer"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* Available Now Toggle */}
          <div className="md:col-span-2 flex items-center justify-end">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#3A1B29] select-none">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-[#FB6376] focus:ring-[#FB6376] border-[#F2DDD3]"
              />
              <span>{t(lang, 'availableNow')} ({workers.filter((w) => w.is_available).length})</span>
            </label>
          </div>
        </div>

        {/* Row 2: Trade Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {TRADES.map((tItem) => {
            const isSelected = selectedTrade === tItem.id;
            return (
              <button
                key={tItem.id}
                onClick={() => setSelectedTrade(tItem.id)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition-colors cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#5D2A42] text-white shadow-xs'
                    : 'bg-[#FFF9EC] hover:bg-[#FFDCCC]/60 text-[#3A1B29] border border-[#F2DDD3]'
                }`}
              >
                {lang === 'ur'
                  ? tItem.labelUr
                  : lang === 'roman'
                  ? tItem.labelRoman
                  : tItem.labelEn}
              </button>
            );
          })}
        </div>

        {/* Row 3: Quick Price Slider & Filter Indicators */}
        <div className="pt-3 border-t border-[#F2DDD3] flex flex-wrap items-center justify-between gap-4 text-xs text-[#886273]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#3A1B29]">Max Visit Fee:</span>
              <span className="font-extrabold text-[#5D2A42] tabular-nums">PKR {maxPrice}</span>
              <input
                type="range"
                min="500"
                max="3000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-24 sm:w-32 accent-[#FB6376] cursor-pointer"
              />
            </div>

            <div className="hidden sm:flex items-center gap-2 border-l border-[#F2DDD3] pl-4">
              <span className="font-bold text-[#3A1B29]">Min Rating:</span>
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="px-2 py-1 text-xs bg-[#FFF9EC] border border-[#F2DDD3] text-[#3A1B29] rounded-lg"
              >
                <option value={0}>Any Rating</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.8}>4.8+ Stars</option>
              </select>
            </div>
          </div>

          <div className="font-semibold text-[#5D2A42]">
            Showing <strong>{filteredWorkers.length}</strong> verified tradespeople
          </div>
        </div>
      </div>

      {/* Main View: Leaflet Map or Grid Cards */}
      {viewMode === 'map' ? (
        <InteractiveMap
          workers={filteredWorkers}
          onSelectWorker={onSelectWorker}
          lang={lang}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => {
            const isAvail = worker.is_available;
            return (
              <div
                key={worker.id}
                className="bg-white rounded-3xl p-6 border border-[#F2DDD3] hover:border-[#FB6376] hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Avatar, Name, Trade */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Portrait Avatar */}
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-[#F2DDD3] shadow-xs shrink-0">
                      {worker.avatar_url ? (
                        <img
                          src={worker.avatar_url}
                          alt={worker.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#5D2A42] text-[#FB6376] flex items-center justify-center font-extrabold text-xl">
                          {worker.name.charAt(0)}
                        </div>
                      )}
                      <span
                        className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${
                          isAvail ? 'bg-[#FB6376]' : 'bg-[#886273]'
                        }`}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#FB6376] truncate">
                          {getTradeIcon(worker.trade)}
                          <span>{worker.trade}</span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                            isAvail
                              ? 'bg-[#FFDCCC] text-[#5D2A42]'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isAvail ? 'Available Now' : 'Busy on Job'}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-[#3A1B29] truncate mt-0.5 group-hover:text-[#5D2A42] transition-colors">
                        {worker.name}{' '}
                        {worker.name_ur && (
                          <span className="font-urdu text-xs font-bold text-[#FB6376]">
                            ({worker.name_ur})
                          </span>
                        )}
                      </h3>

                      <div className="text-xs text-[#886273] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#FB6376] shrink-0" />
                        <span className="truncate">{worker.area}, {worker.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Metadata Line (Zero-Pill discipline) */}
                  <div className="flex items-center gap-3 text-xs text-[#886273] pb-3 border-b border-[#F2DDD3]">
                    <span className="font-bold text-[#3A1B29] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#FB6376] text-[#FB6376]" />
                      <span className="tabular-nums">{worker.rating}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{worker.experience_years} yrs exp</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{worker.completed_jobs} completed</span>
                  </div>

                  {/* Bio statement */}
                  <p className="text-xs text-[#3A1B29]/80 line-clamp-2 my-3 leading-relaxed">
                    {lang === 'ur' && worker.bio_ur ? worker.bio_ur : worker.bio}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {worker.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-[#FFF9EC] text-[#3A1B29] px-2 py-0.5 rounded-md border border-[#F2DDD3] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {worker.skills.length > 3 && (
                      <span className="text-[10px] text-[#886273] px-1 py-0.5">
                        +{worker.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer: Starting Fee & Actions */}
                <div className="pt-3 border-t border-[#F2DDD3] flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-[#886273] font-semibold uppercase tracking-wider">
                      Starting Visit
                    </div>
                    <div className="text-base font-extrabold text-[#5D2A42] tabular-nums">
                      PKR {worker.starting_price}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectWorker(worker)}
                      className="px-3 py-2 text-xs font-bold text-[#3A1B29] bg-[#FFF9EC] hover:bg-[#FFDCCC]/50 rounded-xl border border-[#F2DDD3] transition-colors cursor-pointer"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => onBookWorker(worker)}
                      className="px-3.5 py-2 text-xs font-bold text-white bg-[#FB6376] hover:bg-[#ea4d62] rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredWorkers.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#F2DDD3] mt-4 p-8">
          <div className="w-12 h-12 rounded-full bg-[#FFDCCC] text-[#FB6376] flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#5D2A42]">No Workers Match Filters</h3>
          <p className="text-xs text-[#886273] mt-1 max-w-sm mx-auto">
            Try adjusting your area, category, or maximum price slider to discover professionals across Islamabad &amp; Rawalpindi.
          </p>
          <button
            onClick={() => {
              setSelectedTrade('All');
              setSelectedArea('All');
              setOnlyAvailable(false);
              setMaxPrice(3000);
              setMinRating(0);
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-[#5D2A42] text-[#FB6376] hover:text-white hover:bg-[#431D30] text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
