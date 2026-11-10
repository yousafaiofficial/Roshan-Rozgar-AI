import React, { useState, useEffect, useCallback } from 'react';
import { WorkerProfile, Customer, Booking, Review, AppLanguage, UserRole } from './types';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { ServiceCategories } from './components/ServiceCategories';
import { FeaturedWorkers } from './components/FeaturedWorkers';
import { TrustSection } from './components/TrustSection';
import { HowItWorks } from './components/HowItWorks';
import { Footer } from './components/Footer';
import { CustomerDashboard } from './components/CustomerDashboard';
import { CustomerDashboardView } from './components/CustomerDashboardView';
import { WorkerVoiceOnboarding } from './components/WorkerVoiceOnboarding';
import { WorkerDashboard } from './components/WorkerDashboard';
import { WorkerProfileModal } from './components/WorkerProfileModal';
import { VoiceNegotiationModal } from './components/VoiceNegotiationModal';
import { ReviewModal } from './components/ReviewModal';
import { PRDArchitectureView } from './components/PRDArchitectureView';
import { AuthModal } from './components/AuthModal';
import { t } from './data/translations';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Active Role and Navigation Tab
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [lang, setLang] = useState<AppLanguage>('en');

  // Currently Active Worker Profile (for worker dashboard mode)
  const [activeWorker, setActiveWorker] = useState<WorkerProfile | null>(null);

  // Currently Active Customer Profile (for customer portal)
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  // Discovery Search Filters passed from Hero or Categories
  const [searchFilter, setSearchFilter] = useState<{
    trade: string;
    area: string;
    query: string;
  }>({
    trade: 'All',
    area: 'All',
    query: '',
  });

  // Auth Modal State & Logged-in Session
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'login' | 'signup';
  }>({
    isOpen: false,
    mode: 'login',
  });

  // Modals state
  const [selectedWorkerForProfile, setSelectedWorkerForProfile] = useState<WorkerProfile | null>(null);
  const [selectedBookingForNegotiation, setSelectedBookingForNegotiation] = useState<Booking | null>(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch all live data from backend
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [workersRes, customersRes, bookingsRes] = await Promise.all([
        fetch('/api/workers'),
        fetch('/api/customers'),
        fetch('/api/bookings'),
      ]);

      const workersData = await workersRes.json();
      const customersData = await customersRes.json();
      const bookingsData = await bookingsRes.json();

      const workerList: WorkerProfile[] = workersData.workers || [];
      const custList: Customer[] = customersData.customers || [];
      setWorkers(workerList);
      setCustomers(custList);
      setBookings(bookingsData.bookings || []);

      if (custList.length > 0 && !activeCustomer) {
        setActiveCustomer(custList[0]);
      }

      if (workerList.length > 0 && !activeWorker) {
        setActiveWorker(workerList[0]);
      } else if (activeWorker) {
        const updated = workerList.find((w) => w.id === activeWorker.id);
        if (updated) setActiveWorker(updated);
      }

      // Fetch reviews for active worker or first worker
      const targetWorkerId = activeWorker ? activeWorker.id : workerList[0]?.id;
      if (targetWorkerId) {
        const revRes = await fetch(`/api/reviews/${targetWorkerId}`);
        const revData = await revRes.json();
        setReviews(revData.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      showToast('Could not reach backend API server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeWorker, activeCustomer]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Reset Demo to fresh state
  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Demo data successfully reset to initial PRD seed state.');
        await loadAllData();
      }
    } catch (err) {
      console.error('Error resetting demo:', err);
      showToast('Error resetting demo data.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Update Worker Availability (TC-01, TC-02, TC-04)
  const handleUpdateAvailability = async (workerId: string, isAvailable: boolean): Promise<boolean> => {
    try {
      const res = await fetch(`/api/workers/${workerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: isAvailable }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          isAvailable
            ? 'Status changed to Available (دستیاب).'
            : 'Status changed to Busy on Job (مصروف).'
        );
        await loadAllData();
        return true;
      } else {
        showToast(data.error || 'Cannot update availability.', 'error');
        return false;
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
      return false;
    }
  };

  // Propose price quotation or counteroffer (TC-06, TC-07)
  const handleProposePrice = async (bookingId: string, price: number, note?: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/negotiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_role: userRole,
          price,
          note,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Quotation submitted: PKR ${price}`);
        await loadAllData();
        if (selectedBookingForNegotiation?.id === bookingId) {
          setSelectedBookingForNegotiation(data.booking);
        }
      }
    } catch (err) {
      console.error('Error proposing price:', err);
      showToast('Error submitting quotation.', 'error');
    }
  };

  // Confirm booking with agreed price (TC-08)
  const handleConfirmBooking = async (
    bookingId: string,
    finalPrice: number
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ final_price: finalPrice }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Booking Confirmed! Agreed rate: PKR ${finalPrice}`);
        await loadAllData();
        if (selectedBookingForNegotiation?.id === bookingId) {
          setSelectedBookingForNegotiation(data.booking);
        }
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Confirmation error' };
    }
  };

  // Update Booking Status (Pending -> Confirmed -> In Progress -> Completed)
  const handleUpdateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Job status updated to ${status}.`);
        await loadAllData();

        if (status === 'Completed') {
          setSelectedBookingForReview(data.booking);
        }
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      showToast('Error updating booking status.', 'error');
    }
  };

  // Submit verified review (TC-10, TC-11)
  const handleSubmitReview = async (reviewData: {
    booking_id: string;
    customer_id: string;
    rating: number;
    review_text: string;
    categories: {
      work_quality: number;
      punctuality: number;
      communication: number;
      professionalism: number;
    };
    ai_summary?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Thank you! Your verified review has been published.');
        await loadAllData();
        return true;
      } else {
        showToast(data.error || 'Review submission failed.', 'error');
        return false;
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      return false;
    }
  };

  // Quick book worker from Discovery or Landing Card
  const handleBookWorker = async (worker: WorkerProfile) => {
    try {
      const customer = activeCustomer || customers[0] || {
        id: 'c-1',
        name: 'Zohair Malik',
        phone: '0300-8881234',
        area: 'F-10',
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_id: worker.id,
          customer_id: customer.id,
          service: `${worker.trade} Inspection & Service`,
          description: `Assalam o Alaikum, mujhe ${worker.area} mein aap ki zaroorat hai.`,
          urgency: 'Today',
          area: customer.area,
          proposed_price: worker.starting_price,
        }),
      });

      const data = await res.json();
      if (data.success && data.booking) {
        await loadAllData();
        setSelectedBookingForNegotiation(data.booking);
        showToast(`Request sent to ${worker.name}. Voice negotiation room opened!`);
      }
    } catch (err) {
      console.error('Error creating booking request:', err);
      showToast('Failed to create booking request.', 'error');
    }
  };

  // Handle Search from Landing Hero
  const handleHeroSearch = (trade: string, area: string, query: string) => {
    setSearchFilter({ trade, area, query });
    setUserRole('customer');
    setCurrentTab('discovery');
  };

  // Handle Successful Login or Signup
  const handleLoginSuccess = (user: Customer | WorkerProfile, role: UserRole) => {
    setIsLoggedIn(true);
    setUserRole(role);

    if (role === 'worker') {
      const w = user as WorkerProfile;
      setActiveWorker(w);
      setWorkers((prev) => {
        if (!prev.some((item) => item.id === w.id)) {
          return [w, ...prev];
        }
        return prev;
      });
      setCurrentTab('worker-dashboard');
      showToast(`Welcome, ${w.name}! Logged into Worker Console.`);
    } else {
      const c = user as Customer;
      setActiveCustomer(c);
      setCustomers((prev) => {
        if (!prev.some((item) => item.id === c.id)) {
          return [c, ...prev];
        }
        return prev;
      });
      setCurrentTab('customer-dashboard');
      showToast(`Welcome, ${c.name}! Logged into Customer Hub.`);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentTab('landing');
    showToast('You have been logged out.');
  };

  // Handle Category selection from Landing Service Categories or Footer
  const handleSelectCategory = (tradeId: string) => {
    setSearchFilter({ trade: tradeId, area: 'All', query: '' });
    setUserRole('customer');
    setCurrentTab('discovery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Sector / Area selection from Footer
  const handleSelectArea = (areaName: string) => {
    setSearchFilter({ trade: 'All', area: areaName, query: '' });
    setUserRole('customer');
    setCurrentTab('discovery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Navigation from Footer with role & user context protection + smooth scroll
  const handleFooterNavigate = (tab: string) => {
    if (tab === 'customer-dashboard') {
      if (!activeCustomer && customers.length > 0) {
        setActiveCustomer(customers[0]);
      }
      setUserRole('customer');
    } else if (tab === 'worker-dashboard') {
      if (!activeWorker && workers.length > 0) {
        setActiveWorker(workers[0]);
      }
      setUserRole('worker');
    } else if (tab === 'voice-onboard') {
      setUserRole('worker');
    } else if (tab === 'discovery' || tab === 'landing' || tab === 'how-it-works') {
      setUserRole('customer');
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const availableWorkersCount = workers.filter((w) => w.is_available).length;

  return (
    <div
      dir={lang === 'ur' ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[#FFF9EC] text-[#3A1B29] flex flex-col ${
        lang === 'ur' ? 'font-urdu' : 'font-sans'
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold bg-white border border-[#F2DDD3] text-[#3A1B29] animate-in slide-in-from-top-2">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#FB6376]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Elevated Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userRole={userRole}
        setUserRole={setUserRole}
        lang={lang}
        setLang={setLang}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        currentUser={activeCustomer}
        activeWorker={activeWorker}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {loading && workers.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#5D2A42] border-t-transparent animate-spin mb-3" />
            <p className="text-xs text-[#886273] font-medium">
              Loading Roshan Rozgar Twin Cities Marketplace...
            </p>
          </div>
        ) : (
          <>
            {/* Landing Page Experience (Default) */}
            {currentTab === 'landing' && (
              <div className="space-y-0">
                <LandingHero
                  lang={lang}
                  onSearch={handleHeroSearch}
                  onNavigateToVoiceOnboard={() => {
                    setUserRole('worker');
                    setCurrentTab('voice-onboard');
                  }}
                  availableCount={availableWorkersCount}
                />

                <ServiceCategories
                  lang={lang}
                  onSelectCategory={handleSelectCategory}
                />

                <FeaturedWorkers
                  workers={workers}
                  lang={lang}
                  onSelectWorker={(worker) => setSelectedWorkerForProfile(worker)}
                  onBookWorker={handleBookWorker}
                  onViewAllWorkers={() => {
                    setSearchFilter({ trade: 'All', area: 'All', query: '' });
                    setCurrentTab('discovery');
                  }}
                />

                <TrustSection lang={lang} />

                <HowItWorks
                  lang={lang}
                  onExploreWorkers={() => {
                    setSearchFilter({ trade: 'All', area: 'All', query: '' });
                    setCurrentTab('discovery');
                  }}
                />
              </div>
            )}

            {/* Marketplace Discovery Page */}
            {currentTab === 'discovery' && (
              <CustomerDashboard
                workers={workers}
                lang={lang}
                onSelectWorker={(worker) => setSelectedWorkerForProfile(worker)}
                onBookWorker={handleBookWorker}
                initialTrade={searchFilter.trade}
                initialArea={searchFilter.area}
                initialQuery={searchFilter.query}
              />
            )}

            {/* How It Works & Transparency Tab */}
            {currentTab === 'how-it-works' && (
              <div className="space-y-0">
                <HowItWorks
                  lang={lang}
                  onExploreWorkers={() => {
                    setSearchFilter({ trade: 'All', area: 'All', query: '' });
                    setCurrentTab('discovery');
                  }}
                />
                <TrustSection lang={lang} />
              </div>
            )}

            {/* AI Voice Onboarding for Skilled Workers */}
            {currentTab === 'voice-onboard' && (
              <WorkerVoiceOnboarding
                lang={lang}
                onWorkerCreated={(newWorker) => {
                  setWorkers((prev) => [newWorker, ...prev]);
                  setActiveWorker(newWorker);
                  showToast(`Profile created for ${newWorker.name}!`);
                }}
                onNavigateToDashboard={() => {
                  setUserRole('worker');
                  setCurrentTab('worker-dashboard');
                }}
              />
            )}

            {/* Customer Dashboard Hub */}
            {currentTab === 'customer-dashboard' && activeCustomer && (
              <CustomerDashboardView
                customer={activeCustomer}
                allCustomers={customers}
                onSwitchCustomer={(c) => setActiveCustomer(c)}
                bookings={bookings}
                workers={workers}
                lang={lang}
                onOpenNegotiation={(b) => setSelectedBookingForNegotiation(b)}
                onOpenReviewModal={(b) => setSelectedBookingForReview(b)}
                onNavigateToDiscovery={() => setCurrentTab('discovery')}
              />
            )}

            {/* Worker Business Console */}
            {currentTab === 'worker-dashboard' && activeWorker && (
              <WorkerDashboard
                currentWorker={activeWorker}
                allWorkers={workers}
                onSelectWorkerProfile={(w) => setActiveWorker(w)}
                bookings={bookings}
                reviews={reviews}
                lang={lang}
                onUpdateAvailability={handleUpdateAvailability}
                onProposePrice={handleProposePrice}
                onUpdateBookingStatus={handleUpdateBookingStatus}
                onOpenNegotiation={(b) => setSelectedBookingForNegotiation(b)}
              />
            )}

            {/* PRD & Hackathon Testing Matrix */}
            {currentTab === 'architecture' && (
              <PRDArchitectureView
                lang={lang}
                onNavigateToTab={(tab) => setCurrentTab(tab)}
              />
            )}
          </>
        )}
      </main>

      {/* Worker Profile Detail Modal */}
      {selectedWorkerForProfile && (
        <WorkerProfileModal
          worker={selectedWorkerForProfile}
          reviews={reviews}
          onClose={() => setSelectedWorkerForProfile(null)}
          onBookNow={handleBookWorker}
          lang={lang}
        />
      )}

      {/* Voice Negotiation & Quotation Modal */}
      {selectedBookingForNegotiation && (
        <VoiceNegotiationModal
          booking={selectedBookingForNegotiation}
          onClose={() => setSelectedBookingForNegotiation(null)}
          lang={lang}
          currentRole={userRole}
          onProposePrice={handleProposePrice}
          onConfirmBooking={handleConfirmBooking}
          onRefreshBookings={loadAllData}
        />
      )}

      {/* Customer Review Modal */}
      {selectedBookingForReview && (
        <ReviewModal
          booking={selectedBookingForReview}
          onClose={() => setSelectedBookingForReview(null)}
          lang={lang}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* Interactive Login & Sign Up Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal((prev) => ({ ...prev, isOpen: false }))}
        initialMode={authModal.mode}
        lang={lang}
        customers={customers}
        workers={workers}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Complete Professional Marketplace Footer */}
      <Footer
        lang={lang}
        onNavigate={handleFooterNavigate}
        onSelectCategory={handleSelectCategory}
        onSelectArea={handleSelectArea}
      />
    </div>
  );
}
