import React, { useState } from 'react';
import { Customer, Booking, WorkerProfile, AppLanguage } from '../types';
import { t } from '../data/translations';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Star,
  ArrowRight,
  User,
  Phone,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface CustomerDashboardViewProps {
  customer: Customer;
  allCustomers: Customer[];
  onSwitchCustomer: (c: Customer) => void;
  bookings: Booking[];
  workers: WorkerProfile[];
  lang: AppLanguage;
  onOpenNegotiation: (b: Booking) => void;
  onOpenReviewModal: (b: Booking) => void;
  onNavigateToDiscovery: () => void;
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({
  customer,
  allCustomers,
  onSwitchCustomer,
  bookings,
  workers,
  lang,
  onOpenNegotiation,
  onOpenReviewModal,
  onNavigateToDiscovery,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  // Filter bookings for this customer
  const customerBookings = bookings.filter((b) => b.customer_id === customer.id);
  const pendingQuotes = customerBookings.filter((b) => b.status === 'Pending');
  const upcomingBookings = customerBookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'In Progress'
  );
  const completedBookings = customerBookings.filter((b) => b.status === 'Completed');

  const filteredList = customerBookings.filter((b) => {
    if (activeTab === 'pending') return b.status === 'Pending';
    if (activeTab === 'confirmed') return b.status === 'Confirmed' || b.status === 'In Progress';
    if (activeTab === 'completed') return b.status === 'Completed';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F2DDD3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#5D2A42] text-[#FB6376] flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0">
            {customer.name.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold text-[#FB6376] uppercase tracking-wider">
              Customer Portal · Twin Cities
            </div>
            <h1 className="text-2xl font-extrabold text-[#5D2A42] mt-0.5">
              Welcome back, {customer.name}
            </h1>
            <div className="text-xs text-[#886273] flex items-center gap-2 mt-1">
              <span>{customer.area}, {customer.city}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{customer.phone}</span>
            </div>
          </div>
        </div>

        {/* Switch Customer Profile (For ease of evaluation) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="text-xs">
            <label className="block text-[11px] font-bold text-[#886273] mb-1">
              Switch Customer Account:
            </label>
            <select
              value={customer.id}
              onChange={(e) => {
                const found = allCustomers.find((c) => c.id === e.target.value);
                if (found) onSwitchCustomer(found);
              }}
              className="px-3 py-2 text-xs font-semibold bg-[#FFF9EC] border border-[#F2DDD3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376] text-[#3A1B29]"
            >
              {allCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.area})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onNavigateToDiscovery}
            className="px-4 py-2 bg-[#FB6376] hover:bg-[#ea4d62] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-end sm:self-auto"
          >
            Find New Worker
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#F2DDD3] shadow-xs">
          <div className="text-xs font-bold text-[#886273] uppercase tracking-wider">
            Pending Quotations
          </div>
          <div className="text-2xl font-extrabold text-[#5D2A42] mt-1 tabular-nums">
            {pendingQuotes.length}
          </div>
          <div className="text-[11px] text-[#FB6376] font-semibold mt-1">
            Awaiting your response
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#F2DDD3] shadow-xs">
          <div className="text-xs font-bold text-[#886273] uppercase tracking-wider">
            Active / Upcoming
          </div>
          <div className="text-2xl font-extrabold text-[#FB6376] mt-1 tabular-nums">
            {upcomingBookings.length}
          </div>
          <div className="text-[11px] text-[#886273] mt-1">
            Confirmed with professionals
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#F2DDD3] shadow-xs">
          <div className="text-xs font-bold text-[#886273] uppercase tracking-wider">
            Completed Services
          </div>
          <div className="text-2xl font-extrabold text-[#3A1B29] mt-1 tabular-nums">
            {completedBookings.length}
          </div>
          <div className="text-[11px] text-[#886273] mt-1">
            Finished jobs in Islamabad
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#F2DDD3] shadow-xs">
          <div className="text-xs font-bold text-[#886273] uppercase tracking-wider">
            Total Bookings
          </div>
          <div className="text-2xl font-extrabold text-[#5D2A42] mt-1 tabular-nums">
            {customerBookings.length}
          </div>
          <div className="text-[11px] text-[#886273] mt-1">
            Lifetime requests
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#F2DDD3] pb-3 text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#5D2A42] text-white'
              : 'text-[#886273] hover:text-[#3A1B29]'
          }`}
        >
          All Requests ({customerBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-[#5D2A42] text-white'
              : 'text-[#886273] hover:text-[#3A1B29]'
          }`}
        >
          Pending Quotes ({pendingQuotes.length})
        </button>
        <button
          onClick={() => setActiveTab('confirmed')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'confirmed'
              ? 'bg-[#5D2A42] text-white'
              : 'text-[#886273] hover:text-[#3A1B29]'
          }`}
        >
          Active Jobs ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-[#5D2A42] text-white'
              : 'text-[#886273] hover:text-[#3A1B29]'
          }`}
        >
          History &amp; Reviews ({completedBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#F2DDD3]">
            <Calendar className="w-10 h-10 text-[#886273] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#3A1B29]">No Bookings in this View</h3>
            <p className="text-xs text-[#886273] mt-1 max-w-sm mx-auto">
              You haven&apos;t placed any service requests under this category yet.
            </p>
            <button
              onClick={onNavigateToDiscovery}
              className="mt-4 px-4 py-2 bg-[#FB6376] hover:bg-[#ea4d62] text-white text-xs font-bold rounded-xl"
            >
              Browse Nearby Workers
            </button>
          </div>
        ) : (
          filteredList.map((booking) => {
            const isConfirmed = booking.status === 'Confirmed' || booking.status === 'In Progress';
            const isCompleted = booking.status === 'Completed';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-6 border border-[#F2DDD3] hover:border-[#FB6376] transition-colors shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        booking.status === 'Confirmed'
                          ? 'bg-[#FFDCCC] text-[#5D2A42]'
                          : booking.status === 'Completed'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-xs text-[#886273]">
                      Created {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                    <span aria-hidden="true" className="text-[#886273]">·</span>
                    <span className="text-xs font-semibold text-[#FB6376]">{booking.urgency}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#3A1B29]">
                    {booking.service}
                  </h3>

                  <p className="text-xs text-[#886273] max-w-xl italic">
                    &ldquo;{booking.description}&rdquo;
                  </p>

                  <div className="text-xs font-semibold text-[#5D2A42] flex items-center gap-3 pt-1">
                    <span>
                      Worker: <strong>{booking.worker_name}</strong> ({booking.worker_trade})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Area: {booking.area}</span>
                  </div>
                </div>

                {/* Right side: Agreed Price & Action CTAs */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#F2DDD3]">
                  <div>
                    <div className="text-[10px] font-bold text-[#886273] uppercase tracking-wider">
                      {isConfirmed || isCompleted ? 'Agreed Fee' : 'Quotation'}
                    </div>
                    <div className="text-lg font-extrabold text-[#5D2A42] tabular-nums">
                      PKR {booking.agreed_price || booking.proposed_price}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenNegotiation(booking)}
                      className="px-3.5 py-2 text-xs font-bold text-[#5D2A42] bg-[#FFDCCC]/60 hover:bg-[#FFDCCC] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#FB6376]" />
                      <span>{booking.status === 'Pending' ? 'Negotiate & Accept' : 'Messages'}</span>
                    </button>

                    {isCompleted && (
                      <button
                        onClick={() => onOpenReviewModal(booking)}
                        className="px-3.5 py-2 text-xs font-bold text-white bg-[#FB6376] hover:bg-[#ea4d62] rounded-xl transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5 fill-white" />
                        <span>Leave Review</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
