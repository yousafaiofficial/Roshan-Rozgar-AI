import React, { useState } from 'react';
import { AppLanguage } from '../types';
import { ShieldCheck, Phone, CheckCircle2, X, HelpCircle, FileText } from 'lucide-react';

interface FooterProps {
  lang: AppLanguage;
  onNavigate: (tab: string) => void;
  onSelectCategory: (trade: string) => void;
  onSelectArea: (area: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  lang,
  onNavigate,
  onSelectCategory,
  onSelectArea,
}) => {
  const [activeModal, setActiveModal] = useState<'support' | 'safety' | 'terms' | null>(null);

  const SECTORS = [
    'G-9',
    'F-10',
    'I-8',
    'I-10',
    'Blue Area',
    'Bhara Kahu',
    'Saddar',
    'Satellite Town',
    'Bahria Town',
  ];

  return (
    <footer className="bg-[#5D2A42] text-[#FFF9EC] border-t border-[#FB6376]/30 pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#FB6376]/20">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-3 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FB6376] text-[#5D2A42] flex items-center justify-center font-extrabold text-xl shadow-xs group-hover:scale-105 transition-transform">
                ر
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-[#FCB1A6] transition-colors">
                  Roshan Rozgar
                </span>
                <span className="text-sm font-urdu font-bold text-[#FB6376] ml-2">
                  روشن روزگار
                </span>
              </div>
            </button>

            <p className="text-xs text-[#FFDCCC]/80 max-w-sm leading-relaxed">
              Pakistan&apos;s hyper-local AI-powered marketplace empowering skilled trade workers
              through voice onboarding, transparent price negotiations, and conflict-free bookings across Islamabad &amp; Rawalpindi.
            </p>

            <div className="text-xs text-[#FCB1A6] flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FB6376]" />
                <span>Verified CNIC &amp; In-Person Skills Testing</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FB6376]" />
                <span>Islamabad &amp; Rawalpindi Helpline: (051) 889-ROZGAR</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FB6376] uppercase tracking-wider">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs text-[#FFDCCC]/80">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('discovery')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  Find a Worker
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('voice-onboard')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  Become a Worker (Voice)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('customer-dashboard')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  Customer Hub
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('worker-dashboard')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  Worker Business Console
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('architecture')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  PRD &amp; Test Suite
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FB6376] uppercase tracking-wider">
              Skilled Trades
            </h4>
            <ul className="space-y-2 text-xs text-[#FFDCCC]/80">
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('Electrician')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  Electricians (وائرنگ و یو پی ایس)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('Plumber')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  Plumbers (پلمبر و موٹر)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('AC Technician')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  AC Technicians (اے سی سروس و گیس)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('Carpenter')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  Carpenters (کارپینٹر و تالے)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('Painter')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  Painters (رنگ و روغن)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onSelectCategory('Appliance Repair')}
                  className="hover:text-white transition-colors cursor-pointer text-left py-0.5"
                >
                  Appliance Repair (سامان مرمت)
                </button>
              </li>
            </ul>
          </div>

          {/* Coverage Areas & Interactive Filter Chips */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FB6376] uppercase tracking-wider">
              Twin Cities Sectors
            </h4>
            <p className="text-[11px] text-[#FFDCCC]/70">
              Click any sector to filter available local workers:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SECTORS.map((sector) => (
                <button
                  key={sector}
                  type="button"
                  onClick={() => onSelectArea(sector)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white/10 hover:bg-[#FB6376] hover:text-white text-[#FFDCCC] rounded-lg transition-colors cursor-pointer"
                >
                  {sector}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-[#FB6376]/20">
              <h5 className="text-[11px] font-bold text-[#FCB1A6] uppercase tracking-wider mb-1.5">
                Support &amp; Trust
              </h5>
              <div className="flex flex-col gap-1 text-xs text-[#FFDCCC]/80">
                <button
                  type="button"
                  onClick={() => setActiveModal('support')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Contact Support &amp; Helpline
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('safety')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Safety &amp; Verified CNIC
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('terms')}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  Fair Price Guarantee &amp; Terms
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#FFDCCC]/60">
          <div>
            &copy; 2026 Roshan Rozgar (روشن روزگار). All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <span>Crafted with pride for Pakistan&apos;s skilled trade workforce</span>
            <span className="text-[#FB6376]">🇵🇰</span>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {activeModal === 'support' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-[#3A1B29] max-w-md w-full rounded-3xl p-6 shadow-2xl border border-[#F2DDD3] animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2DDD3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#5D2A42] text-[#FB6376] flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#5D2A42]">Roshan Rozgar Support</h3>
                  <div className="text-[11px] text-[#886273]">Islamabad &amp; Rawalpindi Desk</div>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 bg-[#FFF9EC] rounded-xl border border-[#F2DDD3]">
                <div className="font-bold text-[#5D2A42] mb-0.5">Direct Helpline</div>
                <div className="font-mono text-sm font-extrabold text-[#FB6376]">(051) 889-ROZGAR (7694)</div>
                <div className="text-[11px] text-[#886273]">Open Monday - Saturday: 8:00 AM - 10:00 PM</div>
              </div>
              <div className="p-3 bg-[#FFF9EC] rounded-xl border border-[#F2DDD3]">
                <div className="font-bold text-[#5D2A42] mb-0.5">WhatsApp Assistance</div>
                <div className="font-mono text-sm font-extrabold text-[#FB6376]">0300-888-7694</div>
                <div className="text-[11px] text-[#886273]">Send voice messages or audio notes in Urdu</div>
              </div>
              <div className="p-3 bg-[#FFF9EC] rounded-xl border border-[#F2DDD3]">
                <div className="font-bold text-[#5D2A42] mb-0.5">Twin Cities Field Office</div>
                <div className="text-[11px] text-[#3A1B29]">Sector G-9/4 Commercial Area &amp; Saddar Rawalpindi Hub</div>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-[#FB6376] hover:bg-[#5D2A42] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* Safety Modal */}
      {activeModal === 'safety' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-[#3A1B29] max-w-md w-full rounded-3xl p-6 shadow-2xl border border-[#F2DDD3] animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2DDD3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#5D2A42] text-[#FB6376] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#5D2A42]">Safety &amp; Verification</h3>
                  <div className="text-[11px] text-[#886273]">How we verify every tradesperson</div>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FB6376] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#5D2A42]">NADRA CNIC Verification:</strong> Every worker submits biometric identification before accepting job requests.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FB6376] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#5D2A42]">Twin Cities Skill Audits:</strong> Electricians and AC technicians are verified for wiring codes, UPS safety, and gas handling.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#FB6376] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#5D2A42]">Real Customer Reviews:</strong> Only customers with completed bookings can submit reviews with AI sentiment validation.
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-[#FB6376] hover:bg-[#5D2A42] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white text-[#3A1B29] max-w-md w-full rounded-3xl p-6 shadow-2xl border border-[#F2DDD3] animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2DDD3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#5D2A42] text-[#FB6376] flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#5D2A42]">Fair Rate Guarantee</h3>
                  <div className="text-[11px] text-[#886273]">Transparent marketplace policy</div>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-2.5 text-xs text-[#3A1B29]">
              <p>
                <strong>1. No Hidden Surcharges:</strong> The quotation agreed upon in the voice negotiation room is the final rate for the agreed scope of work.
              </p>
              <p>
                <strong>2. Conflict-Free Booking:</strong> A confirmed worker is guaranteed available for your slot without double-booking.
              </p>
              <p>
                <strong>3. Direct Worker Payment:</strong> Cash or online bank transfer directly to the worker upon satisfactory inspection.
              </p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-[#FB6376] hover:bg-[#5D2A42] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Close Terms
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
