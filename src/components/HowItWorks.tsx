import React from 'react';
import { AppLanguage } from '../types';
import { t } from '../data/translations';
import { Search, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';

interface HowItWorksProps {
  lang: AppLanguage;
  onExploreWorkers: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang, onExploreWorkers }) => {
  const steps = [
    {
      num: '01',
      icon: Search,
      title: 'Find a Professional',
      titleUr: 'قریبی کاریگر تلاش کریں',
      desc: 'Filter by trade, location across Islamabad and Rawalpindi, and check live availability and transparent starting rates.',
      descUr: 'اپنے شعبے اور علاقے کے مطابق دستیابی اور ریٹس دیکھ کر بہترین کاریگر منتخب کریں۔',
    },
    {
      num: '02',
      icon: MessageSquare,
      title: 'Discuss & Get Quotation',
      titleUr: 'آواز یا چیٹ میں بات چیت اور اجرت',
      desc: 'Send a voice note or message in Urdu/English. AI extracts the issue and the worker provides a clear price proposal.',
      descUr: 'اردو یا رومن اردو میں وائس نوٹ بھیجیں۔ کاریگر مناسب اجرت تجویز کرے گا۔',
    },
    {
      num: '03',
      icon: CheckCircle2,
      title: 'Book & Review Completed Work',
      titleUr: 'بکنگ کنفرم کریں اور جائزہ دیں',
      desc: 'Accept the quotation to lock in the worker. Once the service is finished satisfactorily, submit your verified review.',
      descUr: 'بکنگ کنفرم کریں۔ کام تسلی بخش مکمل ہونے کے بعد اپنی قیمتی رائے درج کریں۔',
    },
  ];

  return (
    <section className="py-16 bg-[#FFF9EC] border-b border-[#F2DDD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#FB6376] uppercase tracking-wider">
            {lang === 'ur' ? 'سادہ اور شفاف طریقہ کار' : 'Frictionless Experience'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#5D2A42] tracking-tight mt-1">
            {t(lang, 'howItWorksTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#886273] mt-2">
            {t(lang, 'howItWorksSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-[#F2DDD3] shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-extrabold text-[#5D2A42] tracking-wider px-2.5 py-1 bg-[#FFDCCC] rounded-lg">
                      STEP {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#5D2A42] text-[#FB6376] flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#5D2A42] mb-2">
                    {lang === 'ur' ? step.titleUr : step.title}
                  </h3>
                  <p className="text-xs text-[#886273] leading-relaxed">
                    {lang === 'ur' ? step.descUr : step.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#F2DDD3]/70 text-[11px] font-bold text-[#FB6376] flex items-center gap-1">
                  <span>Transparent &amp; Verified</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FB6376]" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={onExploreWorkers}
            className="px-6 py-3 bg-[#FB6376] hover:bg-[#ea4d62] text-white text-xs font-extrabold rounded-2xl shadow-sm transition-transform active:scale-95 cursor-pointer inline-flex items-center gap-2"
          >
            <span>Explore Islamabad &amp; Rawalpindi Workers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
