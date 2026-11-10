import React from 'react';
import { WorkerProfile, AppLanguage } from '../types';
import { t } from '../data/translations';
import { Star, MapPin, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';

interface FeaturedWorkersProps {
  workers: WorkerProfile[];
  lang: AppLanguage;
  onSelectWorker: (worker: WorkerProfile) => void;
  onBookWorker: (worker: WorkerProfile) => void;
  onViewAllWorkers: () => void;
}

export const FeaturedWorkers: React.FC<FeaturedWorkersProps> = ({
  workers,
  lang,
  onSelectWorker,
  onBookWorker,
  onViewAllWorkers,
}) => {
  // Show top 6 workers
  const featured = workers.slice(0, 6);

  return (
    <section className="py-16 bg-white border-b border-[#F2DDD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-[#FB6376] uppercase tracking-wider">
              {lang === 'ur' ? 'نمایاں کاریگر' : 'Neighbourhood Talent'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#5D2A42] tracking-tight mt-1">
              {t(lang, 'featuredWorkersTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[#886273] mt-1">
              {t(lang, 'featuredWorkersSub')}
            </p>
          </div>

          <button
            onClick={onViewAllWorkers}
            className="self-start md:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-[#FB6376] hover:text-[#5D2A42] hover:underline cursor-pointer"
          >
            <span>View All {workers.length} Professionals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Featured Worker Cards Grid (Linear/Airbnb aesthetic) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((worker) => {
            const isAvail = worker.is_available;
            return (
              <div
                key={worker.id}
                className="bg-[#FFF9EC] rounded-3xl p-6 border border-[#F2DDD3] hover:border-[#FB6376] hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Portrait & Identity Row */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Portrait Avatar */}
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-sm shrink-0">
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
                      {/* Availability status dot */}
                      <span
                        className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${
                          isAvail ? 'bg-[#FB6376]' : 'bg-[#886273]'
                        }`}
                        title={isAvail ? 'Available' : 'Busy'}
                      />
                    </div>

                    {/* Name & Trade info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#FB6376] truncate">
                          {worker.trade}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAvail
                              ? 'bg-[#FFDCCC] text-[#5D2A42]'
                              : 'bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          {isAvail ? 'Available Now' : 'Busy on Job'}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-[#3A1B29] truncate mt-0.5 group-hover:text-[#5D2A42] transition-colors">
                        {worker.name}
                      </h3>

                      <div className="text-xs text-[#886273] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#FB6376] shrink-0" />
                        <span className="truncate">{worker.area}, {worker.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Metadata Line (Linear Zero-Pill) */}
                  <div className="flex items-center gap-3 text-xs text-[#886273] pb-3 border-b border-[#F2DDD3]">
                    <span className="font-bold text-[#3A1B29] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#FB6376] text-[#FB6376]" />
                      <span className="tabular-nums">{worker.rating}</span>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{worker.experience_years} yrs exp</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{worker.completed_jobs} jobs done</span>
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
                        className="text-[10px] bg-white text-[#3A1B29] px-2 py-0.5 rounded-md border border-[#F2DDD3] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
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
                      className="px-3 py-2 text-xs font-bold text-[#3A1B29] bg-white hover:bg-[#FFDCCC]/40 rounded-xl border border-[#F2DDD3] transition-colors cursor-pointer"
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
      </div>
    </section>
  );
};
