import React, { useState } from 'react';
import { WorkerProfile, Review, AppLanguage } from '../types';
import { t } from '../data/translations';
import {
  X,
  Star,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Sparkles,
  Zap,
  Wrench,
  Wind,
  Hammer,
  Paintbrush,
  Cpu,
  Check,
  CalendarCheck,
} from 'lucide-react';

interface WorkerProfileModalProps {
  worker: WorkerProfile | null;
  reviews: Review[];
  onClose: () => void;
  onBookNow: (worker: WorkerProfile) => void;
  lang: AppLanguage;
}

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({
  worker,
  reviews,
  onClose,
  onBookNow,
  lang,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string>('Morning (9 AM - 12 PM)');

  if (!worker) return null;

  const workerReviews = reviews.filter((r) => r.worker_id === worker.id);
  const isAvail = worker.is_available;

  const sampleSlots = [
    'Morning (9 AM - 12 PM)',
    'Afternoon (1 PM - 4 PM)',
    'Evening (5 PM - 8 PM)',
    'Emergency Immediate (Within 1 Hr)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#F2DDD3] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Strip with Cover Photo Accent */}
        <div className="bg-[#5D2A42] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            {/* Portrait Avatar */}
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border-2 border-[#FB6376] shadow-md shrink-0">
              {worker.avatar_url ? (
                <img
                  src={worker.avatar_url}
                  alt={worker.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-extrabold text-3xl text-[#FB6376]">
                  {worker.name.charAt(0)}
                </div>
              )}
              <span
                className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  isAvail ? 'bg-[#FB6376]' : 'bg-[#886273]'
                }`}
              />
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#FB6376] uppercase tracking-wider">
                  {worker.trade}
                </span>
                <span className="text-[10px] bg-[#431D30] text-[#FCB1A6] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#FB6376]" />
                  <span>Verified Pro</span>
                </span>
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight mt-0.5 flex items-baseline gap-2">
                <span>{worker.name}</span>
                {worker.name_ur && (
                  <span className="font-urdu text-base text-[#FCB1A6]">
                    ({worker.name_ur})
                  </span>
                )}
              </h2>

              <div className="text-xs text-[#FFDCCC]/90 flex flex-wrap items-center gap-3 mt-1 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FB6376]" />
                  <span>{worker.area}, {worker.city}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{worker.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metrics Row (Zero-Pill format) */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[#FFF9EC] rounded-2xl border border-[#F2DDD3] text-center">
            <div>
              <div className="text-[11px] text-[#886273] font-bold uppercase tracking-wider">Rating</div>
              <div className="text-xl font-extrabold text-[#5D2A42] flex items-center justify-center gap-1 mt-0.5">
                <Star className="w-4 h-4 fill-[#FB6376] text-[#FB6376]" />
                <span className="tabular-nums">{worker.rating}</span>
              </div>
              <div className="text-[10px] text-[#886273]">({workerReviews.length} reviews)</div>
            </div>
            <div className="border-x border-[#F2DDD3]">
              <div className="text-[11px] text-[#886273] font-bold uppercase tracking-wider">Experience</div>
              <div className="text-xl font-extrabold text-[#5D2A42] tabular-nums mt-0.5">
                {worker.experience_years} yrs
              </div>
              <div className="text-[10px] text-[#886273]">In Twin Cities</div>
            </div>
            <div>
              <div className="text-[11px] text-[#886273] font-bold uppercase tracking-wider">Completed</div>
              <div className="text-xl font-extrabold text-[#FB6376] tabular-nums mt-0.5">
                {worker.completed_jobs}
              </div>
              <div className="text-[10px] text-[#886273]">Confirmed Jobs</div>
            </div>
          </div>

          {/* Current Engagement Status Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFDCCC]/60 border border-[#FB6376]/20 text-xs">
            <span className="text-[#5D2A42] font-semibold">Current Booking Availability:</span>
            <span
              className={`font-extrabold flex items-center gap-1.5 ${
                worker.is_available ? 'text-[#5D2A42]' : 'text-slate-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  worker.is_available ? 'bg-[#FB6376]' : 'bg-slate-400'
                }`}
              />
              <span>{worker.is_available ? 'Available Now (دستیاب)' : 'Busy on Job (مصروف)'}</span>
            </span>
          </div>

          {/* About & Practical Experience */}
          <div>
            <h3 className="text-xs font-bold text-[#886273] uppercase tracking-wider mb-2">
              About &amp; Trade Background
            </h3>
            <p className="text-xs sm:text-sm text-[#3A1B29] leading-relaxed">
              {worker.bio}
            </p>
            {worker.bio_ur && (
              <p className="text-xs sm:text-sm font-urdu text-[#5D2A42] mt-2 bg-[#FFF9EC] p-3 rounded-2xl border border-[#F2DDD3]">
                {worker.bio_ur}
              </p>
            )}
          </div>

          {/* Skills & Services */}
          <div>
            <h3 className="text-xs font-bold text-[#886273] uppercase tracking-wider mb-2">
              Services &amp; Specializations
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {worker.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 text-xs bg-[#FFF9EC] text-[#3A1B29] font-semibold rounded-xl border border-[#F2DDD3]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Time Slot Selection */}
          <div>
            <h3 className="text-xs font-bold text-[#886273] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-[#FB6376]" />
              <span>Preferred Visiting Window</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {sampleSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2.5 rounded-xl border text-left font-semibold transition-colors cursor-pointer ${
                    selectedSlot === slot
                      ? 'bg-[#FFDCCC] border-[#FB6376] text-[#5D2A42]'
                      : 'bg-white border-[#F2DDD3] text-[#3A1B29] hover:bg-[#FFF9EC]'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div>
            <h3 className="text-xs font-bold text-[#886273] uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Customer Reviews ({workerReviews.length})</span>
              <span className="text-[#886273] font-normal">Verified Completed Jobs</span>
            </h3>

            {workerReviews.length === 0 ? (
              <div className="text-xs text-[#886273] italic py-3">
                No customer reviews yet. Verified reviews unlock as completed jobs finish.
              </div>
            ) : (
              <div className="space-y-3">
                {workerReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#FFF9EC] border border-[#F2DDD3] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#3A1B29]">{rev.customer_name}</span>
                      <div className="flex items-center text-[#FB6376] font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#FB6376] text-[#FB6376] mr-1" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-[#3A1B29]/80 italic">&ldquo;{rev.review_text}&rdquo;</p>
                    {rev.ai_summary && (
                      <div className="text-[11px] bg-[#FFDCCC] text-[#5D2A42] p-2.5 rounded-xl font-medium flex items-center gap-1.5 border border-[#FB6376]/20">
                        <Sparkles className="w-3 h-3 text-[#FB6376] shrink-0" />
                        <span>AI Review Highlight: {rev.ai_summary}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-5 bg-white border-t border-[#F2DDD3] flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] text-[#886273] font-bold uppercase tracking-wider">
              Starting Visit / Inspection
            </div>
            <div className="text-xl font-extrabold text-[#5D2A42] tabular-nums">
              PKR {worker.starting_price}
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onBookNow(worker);
            }}
            className="px-6 py-3 bg-[#FB6376] hover:bg-[#ea4d62] text-white text-xs font-extrabold rounded-2xl shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            {t(lang, 'bookNow')} &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
