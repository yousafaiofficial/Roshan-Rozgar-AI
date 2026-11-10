import React, { useState } from 'react';
import { WorkerProfile, Booking, Review, AppLanguage } from '../types';
import { t } from '../data/translations';
import {
  CheckCircle2,
  Clock,
  Star,
  DollarSign,
  AlertTriangle,
  Play,
  Volume2,
  ArrowRight,
  UserCheck,
  Send,
  Sparkles,
  PhoneCall,
  Check,
  Briefcase,
  Sliders,
  TrendingUp,
  Edit3,
  Calendar,
} from 'lucide-react';

interface WorkerDashboardProps {
  currentWorker: WorkerProfile;
  allWorkers: WorkerProfile[];
  onSelectWorkerProfile: (worker: WorkerProfile) => void;
  bookings: Booking[];
  reviews: Review[];
  lang: AppLanguage;
  onUpdateAvailability: (workerId: string, isAvailable: boolean) => Promise<boolean>;
  onProposePrice: (bookingId: string, price: number, note?: string) => Promise<void>;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  onOpenNegotiation: (booking: Booking) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  currentWorker,
  allWorkers,
  onSelectWorkerProfile,
  bookings,
  reviews,
  lang,
  onUpdateAvailability,
  onProposePrice,
  onUpdateBookingStatus,
  onOpenNegotiation,
}) => {
  const [toggleLoading, setToggleLoading] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'requests' | 'active' | 'completed' | 'profile'>('requests');

  // Quote input state for incoming requests
  const [quoteInputs, setQuoteInputs] = useState<Record<string, number>>({});

  // Worker's specific bookings and reviews
  const workerBookings = bookings.filter((b) => b.worker_id === currentWorker.id);
  const pendingBookings = workerBookings.filter((b) => b.status === 'Pending');
  const activeBookings = workerBookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'In Progress'
  );
  const completedBookings = workerBookings.filter((b) => b.status === 'Completed');
  const workerReviews = reviews.filter((r) => r.worker_id === currentWorker.id);

  // Actual Verified Earnings from completed jobs
  const totalVerifiedEarnings = completedBookings.reduce(
    (sum, b) => sum + (b.agreed_price || b.proposed_price || 0),
    0
  );

  // Profile completion score
  const profileCompletion = Math.min(
    100,
    (currentWorker.name ? 25 : 0) +
      (currentWorker.trade ? 25 : 0) +
      (currentWorker.skills.length >= 3 ? 25 : 15) +
      (currentWorker.bio ? 25 : 10)
  );

  // Toggle Availability
  const handleToggleAvailability = async (newVal: boolean) => {
    setStatusNotice(null);
    setToggleLoading(true);
    try {
      const ok = await onUpdateAvailability(currentWorker.id, newVal);
      if (!ok) {
        setStatusNotice(
          lang === 'ur'
            ? 'آپ کے پاس جاری کام موجود ہے، اس لیے دستیابی تبدیل نہیں کی جا سکتی۔'
            : 'Cannot set Available while having an active confirmed booking in progress.'
        );
      }
    } finally {
      setToggleLoading(false);
    }
  };

  // Submit quotation for a pending request
  const handleSubmitQuote = async (booking: Booking) => {
    const price = quoteInputs[booking.id] || booking.proposed_price || currentWorker.starting_price;
    await onProposePrice(booking.id, price, `Proposed rate for ${booking.service}: PKR ${price}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Worker Business Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F2DDD3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-18 h-18 rounded-2xl overflow-hidden bg-slate-100 border-2 border-[#5D2A42] shadow-sm shrink-0">
            {currentWorker.avatar_url ? (
              <img
                src={currentWorker.avatar_url}
                alt={currentWorker.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[#5D2A42] text-[#FB6376] flex items-center justify-center font-extrabold text-2xl">
                {currentWorker.name.charAt(0)}
              </div>
            )}
            <span
              className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                currentWorker.is_available ? 'bg-[#FB6376]' : 'bg-[#886273]'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#5D2A42]">{currentWorker.name}</h1>
              {currentWorker.name_ur && (
                <span className="font-urdu text-base font-bold text-[#FB6376]">
                  ({currentWorker.name_ur})
                </span>
              )}
            </div>
            <div className="text-xs text-[#886273] flex flex-wrap items-center gap-2 mt-1">
              <span className="font-bold text-[#FB6376]">{currentWorker.trade}</span>
              <span aria-hidden="true">·</span>
              <span>{currentWorker.area}, {currentWorker.city}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{currentWorker.phone}</span>
            </div>
          </div>
        </div>

        {/* Switch Worker Dropdown & Availability Switch */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="text-xs">
            <label className="block text-[11px] font-bold text-[#886273] mb-1">
              Switch Test Worker Account:
            </label>
            <select
              value={currentWorker.id}
              onChange={(e) => {
                const found = allWorkers.find((w) => w.id === e.target.value);
                if (found) onSelectWorkerProfile(found);
              }}
              className="px-3 py-2 text-xs font-semibold bg-[#FFF9EC] border border-[#F2DDD3] text-[#3A1B29] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB6376] cursor-pointer"
            >
              {allWorkers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.trade} - {w.area})
                </option>
              ))}
            </select>
          </div>

          {/* Availability Toggle Switch */}
          <div className="pt-2 sm:pt-0 sm:pl-4 sm:border-l sm:border-[#F2DDD3] flex flex-col items-start sm:items-end">
            <span className="text-[11px] font-bold text-[#886273] mb-1">
              {t(lang, 'myAvailability')}
            </span>
            <button
              disabled={toggleLoading}
              onClick={() => handleToggleAvailability(!currentWorker.is_available)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2 ${
                currentWorker.is_available
                  ? 'bg-[#5D2A42] text-white hover:bg-[#431D30]'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  currentWorker.is_available ? 'bg-[#FB6376]' : 'bg-slate-500'
                }`}
              />
              <span>
                {currentWorker.is_available ? t(lang, 'availableNow') : t(lang, 'busyOnJob')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Notice Message */}
      {statusNotice && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* KPI Overview Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#F2DDD3] shadow-xs">
          <div className="text-xs font-bold text-[#886273] uppercase tracking-wider">
            Verified Earnings
          </div>
          <div className="text-2xl font-extrabold text-[#5D2A42] tabular-nums mt-1">
            PKR {totalVerifiedEarnings}
          </div>
          <div className="text-[11px] text-[#FB6376] font-semibold mt-1">
            From {completedBookings.length} completed jobs
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#F2DDD3] shadow-xs">
          <div className="text-xs font-bold text-[#886273] uppercase tracking-wider">
            Customer Rating
          </div>
          <div className="text-2xl font-extrabold text-[#FB6376] tabular-nums mt-1 flex items-center gap-1">
            <Star className="w-5 h-5 fill-[#FB6376] text-[#FB6376]" />
            <span>{currentWorker.rating}</span>
          </div>
          <div className="text-[11px] text-[#886273] mt-1">
            {workerReviews.length} verified reviews
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#F2DDD3] shadow-xs">
          <div className="text-xs font-bold text-[#886273] uppercase tracking-wider">
            Profile Strength
          </div>
          <div className="text-2xl font-extrabold text-[#3A1B29] tabular-nums mt-1">
            {profileCompletion}%
          </div>
          <div className="w-full bg-[#FFDCCC] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#FB6376] h-full rounded-full transition-all"
              style={{ width: `${profileCompletion}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#F2DDD3] shadow-xs">
          <div className="text-xs font-bold text-[#886273] uppercase tracking-wider">
            Pending Inquiries
          </div>
          <div className="text-2xl font-extrabold text-[#5D2A42] tabular-nums mt-1">
            {pendingBookings.length}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            {pendingBookings.length > 0 ? 'Awaiting your quote' : 'All responded'}
          </div>
        </div>
      </div>

      {/* Main Layout: Navigation Tabs & Section Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar Navigation */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-4 border border-[#F2DDD3] shadow-xs space-y-1">
          <button
            onClick={() => setSidebarTab('requests')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
              sidebarTab === 'requests'
                ? 'bg-[#5D2A42] text-white shadow-xs'
                : 'text-[#3A1B29] hover:bg-[#FFDCCC]/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FB6376]" />
              <span>Incoming Requests</span>
            </div>
            {pendingBookings.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#FB6376] text-white font-extrabold">
                {pendingBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSidebarTab('active')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
              sidebarTab === 'active'
                ? 'bg-[#5D2A42] text-white shadow-xs'
                : 'text-[#3A1B29] hover:bg-[#FFDCCC]/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#FB6376]" />
              <span>Active Bookings</span>
            </div>
            {activeBookings.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#FFDCCC] text-[#5D2A42] font-extrabold">
                {activeBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setSidebarTab('completed')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
              sidebarTab === 'completed'
                ? 'bg-[#5D2A42] text-white shadow-xs'
                : 'text-[#3A1B29] hover:bg-[#FFDCCC]/60'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FB6376]" />
              <span>Completed Jobs ({completedBookings.length})</span>
            </div>
          </button>

          <button
            onClick={() => setSidebarTab('profile')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              sidebarTab === 'profile'
                ? 'bg-[#5D2A42] text-white shadow-xs'
                : 'text-[#3A1B29] hover:bg-[#FFDCCC]/60'
            }`}
          >
            <Edit3 className="w-4 h-4 text-[#FB6376]" />
            <span>Profile &amp; Base Rates</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          {/* Tab 1: Incoming Job Requests */}
          {sidebarTab === 'requests' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F2DDD3] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#F2DDD3]">
                <div>
                  <h2 className="text-base font-extrabold text-[#5D2A42]">
                    Pending Customer Quotation Requests ({pendingBookings.length})
                  </h2>
                  <p className="text-xs text-[#886273] mt-0.5">
                    Listen to customer audio description, propose your rate, and discuss terms.
                  </p>
                </div>
              </div>

              {pendingBookings.length === 0 ? (
                <div className="text-center py-12 text-[#886273] text-xs">
                  No new pending requests right now. As households in {currentWorker.area} request services, they will appear here.
                </div>
              ) : (
                pendingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 rounded-2xl bg-[#FFF9EC] border border-[#F2DDD3] hover:border-[#FB6376] transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-extrabold text-[#3A1B29]">{booking.customer_name}</div>
                        <div className="text-xs text-[#886273] flex items-center gap-2 mt-0.5">
                          <span>{booking.area}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#FB6376] font-bold">{booking.urgency}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[11px]">{booking.customer_phone}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#FFDCCC] text-[#5D2A42]">
                        Pending Quotation
                      </span>
                    </div>

                    <div className="text-xs text-[#3A1B29] bg-white p-3.5 rounded-xl border border-[#F2DDD3]">
                      <div className="font-bold text-[#5D2A42] mb-1">{booking.service}</div>
                      <p className="italic text-[#886273]">&ldquo;{booking.description}&rdquo;</p>
                    </div>

                    {/* Quotation Input Controls */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative flex-1 max-w-xs">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#886273]">
                          PKR
                        </span>
                        <input
                          type="number"
                          placeholder={String(booking.proposed_price || currentWorker.starting_price)}
                          value={quoteInputs[booking.id] || ''}
                          onChange={(e) =>
                            setQuoteInputs({ ...quoteInputs, [booking.id]: parseInt(e.target.value) || 0 })
                          }
                          className="w-full pl-12 pr-3 py-2 text-xs font-bold bg-white border border-[#F2DDD3] text-[#3A1B29] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FB6376]"
                        />
                      </div>

                      <button
                        onClick={() => handleSubmitQuote(booking)}
                        className="px-4 py-2 bg-[#FB6376] hover:bg-[#ea4d62] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        Submit Quote
                      </button>

                      <button
                        onClick={() => onOpenNegotiation(booking)}
                        className="px-3.5 py-2 bg-[#FFDCCC]/60 hover:bg-[#FFDCCC] text-[#5D2A42] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#FB6376]" />
                        <span>Voice Chat</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 2: Active Bookings */}
          {sidebarTab === 'active' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F2DDD3] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-[#F2DDD3]">
                <div>
                  <h2 className="text-base font-extrabold text-[#5D2A42]">
                    Confirmed &amp; Ongoing Engagements ({activeBookings.length})
                  </h2>
                  <p className="text-xs text-[#886273] mt-0.5">
                    Your availability is automatically locked to busy while executing confirmed jobs.
                  </p>
                </div>
              </div>

              {activeBookings.length === 0 ? (
                <div className="text-center py-12 text-[#886273] text-xs">
                  No active jobs right now. When you accept a quotation, it will lock into active progress here.
                </div>
              ) : (
                activeBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 rounded-2xl bg-[#FFF9EC] border border-[#FB6376]/30 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-extrabold text-[#3A1B29]">{booking.customer_name}</div>
                        <div className="text-xs text-[#886273] flex items-center gap-2 mt-0.5">
                          <span>{booking.area}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[11px]">{booking.customer_phone}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-[#5D2A42] text-[#FB6376]">
                          {booking.status}
                        </span>
                        <div className="text-xs font-extrabold text-[#5D2A42] tabular-nums mt-1">
                          Agreed: PKR {booking.agreed_price || booking.proposed_price}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-[#3A1B29] bg-white p-3 rounded-xl border border-[#F2DDD3]">
                      <div className="font-bold text-[#5D2A42]">{booking.service}</div>
                      <p className="text-[#886273] mt-0.5">{booking.description}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {booking.status === 'Confirmed' && (
                        <button
                          onClick={() => onUpdateBookingStatus(booking.id, 'In Progress')}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          Start Work
                        </button>
                      )}

                      <button
                        onClick={() => onUpdateBookingStatus(booking.id, 'Completed')}
                        className="px-4 py-2 bg-[#FB6376] hover:bg-[#ea4d62] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Complete Job</span>
                      </button>

                      <button
                        onClick={() => onOpenNegotiation(booking)}
                        className="px-3.5 py-2 bg-white border border-[#F2DDD3] hover:bg-[#FFF9EC] text-[#3A1B29] text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Chat &amp; Notes
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Completed Jobs */}
          {sidebarTab === 'completed' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F2DDD3] shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-[#5D2A42] pb-4 border-b border-[#F2DDD3]">
                Completed Jobs History &amp; Customer Reviews ({completedBookings.length})
              </h2>

              <div className="space-y-3">
                {completedBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-[#FFF9EC] border border-[#F2DDD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#3A1B29]">{b.service}</div>
                      <div className="text-[#886273] mt-0.5">
                        Client: {b.customer_name} · {b.area} · Finished on {new Date(b.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-[#5D2A42] tabular-nums">
                        PKR {b.agreed_price || b.proposed_price}
                      </div>
                      <span className="text-[10px] font-bold text-[#FB6376]">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Profile Settings */}
          {sidebarTab === 'profile' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F2DDD3] shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-[#5D2A42] pb-4 border-b border-[#F2DDD3]">
                Worker Profile &amp; Service Settings
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#3A1B29] mb-1">Full Name</label>
                  <input
                    type="text"
                    disabled
                    value={currentWorker.name}
                    className="w-full px-3 py-2 bg-[#FFF9EC] border border-[#F2DDD3] text-[#3A1B29] rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#3A1B29] mb-1">Trade Category</label>
                  <input
                    type="text"
                    disabled
                    value={currentWorker.trade}
                    className="w-full px-3 py-2 bg-[#FFF9EC] border border-[#F2DDD3] text-[#3A1B29] rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#3A1B29] mb-1">Base Inspection Fee (PKR)</label>
                  <input
                    type="number"
                    value={currentWorker.starting_price}
                    className="w-full px-3 py-2 bg-white border border-[#F2DDD3] rounded-xl font-bold text-[#5D2A42]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#3A1B29] mb-1">Sector / Area</label>
                  <input
                    type="text"
                    disabled
                    value={currentWorker.area}
                    className="w-full px-3 py-2 bg-[#FFF9EC] border border-[#F2DDD3] text-[#3A1B29] rounded-xl font-semibold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
