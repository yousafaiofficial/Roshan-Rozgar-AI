import React from 'react';
import { AppLanguage } from '../types';
import { t } from '../data/translations';
import { ShieldCheck, DollarSign, Star, CalendarCheck, CheckCircle2 } from 'lucide-react';

interface TrustSectionProps {
  lang: AppLanguage;
}

export const TrustSection: React.FC<TrustSectionProps> = ({ lang }) => {
  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Verified Local Professionals',
      titleUr: 'تصدیق شدہ مقامی کاریگر',
      desc: 'Independent tradespeople vetted for practical experience and authentic neighbourhood presence in Islamabad & Rawalpindi.',
      descUr: 'اسلام آباد اور راولپنڈی میں عملی تجربے اور ساکھ کی بنیاد پر تصدیق شدہ کاریگر۔',
    },
    {
      icon: DollarSign,
      title: 'Transparent Quotations',
      titleUr: 'شفاف اور طے شدہ اجرت',
      desc: 'Inspect rates upfront, negotiate service prices over voice or chat, and confirm agreed PKR pricing before any work starts.',
      descUr: 'کام شروع ہونے سے پہلے اجرت پر بات چیت اور تحریری تصدیق۔ کوئی پوشیدہ اخراجات نہیں۔',
    },
    {
      icon: Star,
      title: 'Genuine Customer Reviews',
      titleUr: 'اصلی اور مصدقہ جائزے',
      desc: 'Only customers who have finished a confirmed job can leave reviews, analyzed by AI for quality, punctuality, and ethics.',
      descUr: 'صرف مکمل کام کے بعد حقیقی صارفین کے جائزے، جن کا اے آئی معیار کی بنیاد پر تجزیہ کرتا ہے۔',
    },
    {
      icon: CalendarCheck,
      title: 'Conflict-Free Booking',
      titleUr: 'بروقت اور آسان بکنگ',
      desc: 'Real-time availability prevents double-booking. When a worker accepts your job, their status locks to ensure dedicated focus.',
      descUr: 'ایک وقت میں ایک کام۔ بکنگ کنفرم ہونے کے بعد کاریگر صرف آپ کے کام پر توجہ دیتا ہے۔',
    },
  ];

  return (
    <section className="py-16 bg-[#5D2A42] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#FB6376] uppercase tracking-wider">
            {lang === 'ur' ? 'روشن روزگار کا وعدہ' : 'Safety, Integrity & Transparency'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
            {t(lang, 'trustTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#FCB1A6] mt-2">
            {t(lang, 'trustSub')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FB6376] text-white flex items-center justify-center font-bold mb-4 shadow-sm">
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">
                  {lang === 'ur' ? pillar.titleUr : pillar.title}
                </h3>
                <p className="text-xs text-[#FFDCCC]/80 leading-relaxed">
                  {lang === 'ur' ? pillar.descUr : pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
