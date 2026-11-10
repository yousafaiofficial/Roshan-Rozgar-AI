import React from 'react';
import { AppLanguage } from '../types';
import { TRADES, TradeCategory } from '../data/translations';
import {
  Zap,
  Wrench,
  Wind,
  Hammer,
  Cog,
  Paintbrush,
  Sparkles,
  Cpu,
  ArrowUpRight,
} from 'lucide-react';

interface ServiceCategoriesProps {
  lang: AppLanguage;
  onSelectCategory: (tradeId: string) => void;
}

export const ServiceCategories: React.FC<ServiceCategoriesProps> = ({
  lang,
  onSelectCategory,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-[#FB6376] group-hover:text-white transition-colors" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-[#FB6376] group-hover:text-white transition-colors" />;
      case 'Wind':
        return <Wind className="w-5 h-5 text-[#FB6376] group-hover:text-white transition-colors" />;
      case 'Hammer':
        return <Hammer className="w-5 h-5 text-[#FB6376] group-hover:text-white transition-colors" />;
      case 'Cog':
        return <Cog className="w-5 h-5 text-[#FB6376] group-hover:text-white transition-colors" />;
      case 'Paintbrush':
        return <Paintbrush className="w-5 h-5 text-[#FB6376] group-hover:text-white transition-colors" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#FB6376] group-hover:text-white transition-colors" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-[#FB6376] group-hover:text-white transition-colors" />;
      default:
        return <Wrench className="w-5 h-5 text-[#FB6376] group-hover:text-white transition-colors" />;
    }
  };

  // 8 Specific requested trade categories
  const categoriesToDisplay = TRADES.filter((t) => t.id !== 'All');

  return (
    <section className="py-16 bg-[#FFF9EC] border-b border-[#F2DDD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-[#FB6376] uppercase tracking-wider">
              {lang === 'ur' ? 'ماہر خدمات' : 'Verified Trade Services'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#5D2A42] tracking-tight mt-1">
              {lang === 'ur' ? 'گھریلو خدمات کے تمام شعبہ جات' : 'Skilled Trades for Every Household Need'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#886273] max-w-md">
            Directly connect with certified independent tradespeople in your Islamabad or Rawalpindi sector.
          </p>
        </div>

        {/* 8 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categoriesToDisplay.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="text-left bg-white rounded-2xl p-5 border border-[#F2DDD3] hover:border-[#FB6376] hover:shadow-lg transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFDCCC]/60 group-hover:bg-[#FB6376] transition-colors flex items-center justify-center shrink-0">
                    {getIcon(cat.icon)}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#886273] group-hover:text-[#5D2A42] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>

                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-base font-bold text-[#3A1B29] group-hover:text-[#5D2A42] transition-colors">
                    {cat.labelEn}
                  </h3>
                  {cat.labelUr && (
                    <span className="font-urdu text-xs font-semibold text-[#FB6376]">
                      ({cat.labelUr})
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#886273] leading-relaxed mb-3">
                  {lang === 'ur' ? cat.descUr : cat.descEn}
                </p>
              </div>

              {/* Popular Service Chips */}
              <div className="pt-3 border-t border-[#F2DDD3]/70 flex flex-wrap gap-1">
                {cat.popularServices.slice(0, 2).map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-[#FFF9EC] text-[#3A1B29] border border-[#F2DDD3] px-2 py-0.5 rounded-md font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
