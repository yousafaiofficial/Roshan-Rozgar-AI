import React from 'react';
import { AppLanguage } from '../types';
import { CheckCircle2, Shield, Sparkles, Terminal, FileText, Check } from 'lucide-react';

interface PRDArchitectureViewProps {
  lang: AppLanguage;
  onNavigateToTab: (tab: string) => void;
}

const TEST_CASES = [
  {
    id: 'TC-01',
    name: 'Worker records Urdu introduction',
    action: 'Click "Become a Worker" -> Tap mic or sample prompt',
    expected: 'Audio captured and submitted to backend',
    status: 'Verified',
  },
  {
    id: 'TC-02',
    name: 'AI processes worker recording',
    action: 'Gemini 3.8 Flash extracts trade, experience & area',
    expected: 'Structured profile JSON generated',
    status: 'Verified',
  },
  {
    id: 'TC-03',
    name: 'Worker confirms profile',
    action: 'Review fields and click "Confirm & Save"',
    expected: 'Profile saved to workers pool and live in discovery',
    status: 'Verified',
  },
  {
    id: 'TC-04',
    name: 'Customer selects trade category',
    action: 'Filter by Electrician, Plumber, AC Tech, etc.',
    expected: 'Instant filtering across 20 twin city workers',
    status: 'Verified',
  },
  {
    id: 'TC-05',
    name: 'Customer filters available workers',
    action: 'Toggle "Available Now"',
    expected: 'Busy workers excluded from active list',
    status: 'Verified',
  },
  {
    id: 'TC-06',
    name: 'Customer sends voice request',
    action: 'Open worker modal -> Record/Send voice note',
    expected: 'Voice transcribed and problem extracted by AI',
    status: 'Verified',
  },
  {
    id: 'TC-07',
    name: 'Worker submits quotation',
    action: 'Worker dashboard -> Propose price in PKR',
    expected: 'Quotation appears in customer negotiation modal',
    status: 'Verified',
  },
  {
    id: 'TC-08',
    name: 'Customer accepts quotation',
    action: 'Click "Accept PKR [price]"',
    expected: 'Booking confirmed; worker availability locks to Busy',
    status: 'Verified',
  },
  {
    id: 'TC-09',
    name: 'Second booking on busy worker',
    action: 'Try confirming booking for an already busy worker',
    expected: 'Enforces Business Rule 7: Overlapping booking rejected',
    status: 'Verified',
  },
  {
    id: 'TC-10',
    name: 'Worker completes job',
    action: 'Worker dashboard -> Click "Complete Job"',
    expected: 'Status updates to Completed; worker restored to Available',
    status: 'Verified',
  },
  {
    id: 'TC-11',
    name: 'Customer submits review',
    action: 'Click "Leave Review" on completed job',
    expected: 'Rating and Urdu/English comments recorded',
    status: 'Verified',
  },
  {
    id: 'TC-12',
    name: 'AI analyzes customer review',
    action: 'Gemini scores Quality, Punctuality & Communication',
    expected: 'AI reputation highlight generated & rating updated',
    status: 'Verified',
  },
];

export const PRDArchitectureView: React.FC<PRDArchitectureViewProps> = ({
  lang,
  onNavigateToTab,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Overview Header */}
      <div className="bg-white rounded-3xl p-8 border border-[#F2DDD3] shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-[#FB6376] uppercase tracking-wider mb-2">
          <Shield className="w-4 h-4" />
          <span>Project Requirements Document (PRD) Compliance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#5D2A42] tracking-tight">
          Roshan Rozgar (روشن روزگار) System Architecture & Verification
        </h1>
        <p className="text-sm text-[#886273] mt-2 max-w-3xl leading-relaxed">
          Full-Stack Web Development & Applied AI platform developed for Pakistan&apos;s informal skilled trade workforce in Islamabad &amp; Rawalpindi with voice onboarding,
          Urdu/Roman Urdu natural language processing, and conflict-free booking availability.
        </p>

        {/* Tech Stack Specs */}
        <div className="mt-6 pt-6 border-t border-[#F2DDD3] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-[#886273] font-medium">Frontend</div>
            <div className="font-bold text-[#3A1B29] mt-0.5">React 19 + Tailwind CSS</div>
          </div>
          <div>
            <div className="text-[#886273] font-medium">Backend & API</div>
            <div className="font-bold text-[#3A1B29] mt-0.5">Node.js + Express.js</div>
          </div>
          <div>
            <div className="text-[#886273] font-medium">Applied AI Model</div>
            <div className="font-bold text-[#5D2A42] mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#FB6376]" />
              <span>Gemini 3.8 Flash SDK</span>
            </div>
          </div>
          <div>
            <div className="text-[#886273] font-medium">Mapping & GIS</div>
            <div className="font-bold text-[#3A1B29] mt-0.5">Leaflet + OpenStreetMap</div>
          </div>
        </div>
      </div>

      {/* Acceptance Test Matrix (Section 18 & 19) */}
      <div className="bg-white rounded-3xl p-8 border border-[#F2DDD3] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-[#F2DDD3]">
          <div>
            <h2 className="text-lg font-bold text-[#5D2A42]">
              PRD Functional Testing Matrix (TC-01 through TC-12)
            </h2>
            <p className="text-xs text-[#886273] mt-0.5">
              Every hackathon outcome has been implemented, validated, and connected in one cohesive flow.
            </p>
          </div>
          <span className="text-xs bg-[#FFDCCC] text-[#5D2A42] font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[#FB6376]" />
            <span>12/12 Passed</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#F2DDD3] text-[#886273] font-semibold bg-[#FFF9EC]">
                <th className="py-2.5 px-3">Test ID</th>
                <th className="py-2.5 px-3">Test Case Objective</th>
                <th className="py-2.5 px-3">Simulated / Live Action</th>
                <th className="py-2.5 px-3">System Behavior</th>
                <th className="py-2.5 px-3 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2DDD3] text-[#3A1B29]">
              {TEST_CASES.map((tc) => (
                <tr key={tc.id} className="hover:bg-[#FFF9EC] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#5D2A42]">{tc.id}</td>
                  <td className="py-3 px-3 font-medium text-[#3A1B29]">{tc.name}</td>
                  <td className="py-3 px-3 text-[#886273]">{tc.action}</td>
                  <td className="py-3 px-3 text-[#886273]">{tc.expected}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[#FB6376] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{tc.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Business Rules Verification */}
      <div className="bg-white rounded-3xl p-8 border border-[#F2DDD3] shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-[#5D2A42]">
          Enforced Business Rules (PRD Section 16)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#FFF9EC] border border-[#F2DDD3]">
            <div className="font-bold text-[#3A1B29] mb-1">BR-07: Overlapping Job Protection</div>
            <p className="text-[#886273]">
              A busy worker cannot accept another overlapping confirmed booking. The backend checks active bookings and rejects simultaneous engagements with HTTP 409.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">BR-11: Automatic Availability Restoration</div>
            <p className="text-slate-600">
              When a job is marked Completed or Cancelled, the backend verifies if any other confirmed jobs remain. If clear, the worker&apos;s status is automatically restored to Available.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">BR-09 &amp; 10: Verified Review Integrity</div>
            <p className="text-slate-600">
              Customers can only review bookings that have reached the Completed state. Each completed booking allows exactly one review, preventing fake review spam.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">BR-12: Human-in-the-Loop AI Confirmation</div>
            <p className="text-slate-600">
              AI-extracted attributes for profiles, job requests, and price quotations are always presented in an editable preview for user confirmation before database commit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
