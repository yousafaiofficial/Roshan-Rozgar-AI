import React, { useState } from 'react';
import { Booking, AppLanguage } from '../types';
import { t } from '../data/translations';
import {
  X,
  Star,
  Sparkles,
  CheckCircle,
  Volume2,
  Mic,
  AlertCircle,
  Check,
} from 'lucide-react';

interface ReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
  lang: AppLanguage;
  onSubmitReview: (reviewData: {
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
  }) => Promise<boolean>;
}

const SAMPLE_REVIEW_VOICES = [
  {
    label: 'Punctual & Skilled (5 Stars - F-10)',
    text: 'Tariq bhai bohot waqt ke paband niklay. Aadhe ghante mein F-10 pohanch gaye aur short circuit foran theek kardi. Paisay bhi bilkul munasib liye.',
  },
  {
    label: 'Excellent Leak Fix (5 Stars - Saddar)',
    text: 'Asif bhai ne 10 minute mein motor ki leakage dhoond kar theek kar di. Kaam bohot safai se kiya aur bartao nihayat shaista tha.',
  },
  {
    label: 'Good Work & Courteous (4 Stars - Bhara Kahu)',
    text: 'AC ki jet service achi ki, thora waqt ziyada laga magar cooling ab pehle se behtar hai. Kaam pasand aya.',
  },
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  onClose,
  lang,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<{
    categories: {
      work_quality: number;
      punctuality: number;
      communication: number;
      professionalism: number;
    };
    ai_summary: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!booking) return null;

  // Run AI Review Intelligence
  const handleAnalyzeReview = async (text: string) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/analyze-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.categories) {
        setAiAnalysis({
          categories: data.categories,
          ai_summary: data.ai_summary || 'Verified quality service.',
        });
        if (data.overall_rating) {
          setRating(data.overall_rating);
        }
      }
    } catch (err) {
      console.error('Error analyzing review:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (sample: (typeof SAMPLE_REVIEW_VOICES)[0]) => {
    setReviewText(sample.text);
    handleAnalyzeReview(sample.text);
  };

  const handleSubmit = async () => {
    if (!reviewText.trim()) {
      setErrorMsg('Please write or select a review note.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const categories = aiAnalysis?.categories || {
      work_quality: rating,
      punctuality: rating,
      communication: rating,
      professionalism: rating,
    };

    const success = await onSubmitReview({
      booking_id: booking.id,
      customer_id: booking.customer_id,
      rating,
      review_text: reviewText,
      categories,
      ai_summary: aiAnalysis?.ai_summary,
    });

    setIsSubmitting(false);
    if (success) {
      onClose();
    } else {
      setErrorMsg('Failed to submit review. Booking may already have been reviewed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#F2DDD3] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#5D2A42] text-white p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#FCB1A6] uppercase tracking-wider">
              {lang === 'ur' ? 'رائے اور ریٹنگ' : 'Feedback & Ratings'}
            </div>
            <h2 className="text-base font-bold mt-0.5">
              Review {booking.worker_name} ({booking.worker_trade})
            </h2>
            <div className="text-xs text-[#FFDCCC]">
              Job: {booking.service} · Agreed: PKR {booking.agreed_price || booking.proposed_price}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Rating Stars */}
          <div className="text-center">
            <span className="text-xs font-semibold text-[#886273] block mb-2">
              Overall Work Satisfaction
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-[#FB6376] text-[#FB6376]'
                        : 'fill-slate-200 text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-bold text-[#3A1B29] mt-1">
              {rating === 5
                ? 'Exceptional Service (بہترین کام)'
                : rating === 4
                ? 'Very Good (بہت اچھا)'
                : rating === 3
                ? 'Satisfactory (تسلی بخش)'
                : 'Needs Improvement'}
            </div>
          </div>

          {/* Quick Voice Review Samples */}
          <div className="p-3 bg-[#FFF9EC] rounded-xl border border-[#F2DDD3] text-xs">
            <div className="text-[#886273] font-semibold mb-1 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-[#FB6376]" />
              <span>Tap a pre-recorded Urdu voice review to analyze:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_REVIEW_VOICES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(sample)}
                  className="px-2.5 py-1 bg-white hover:bg-[#FFDCCC] text-[#3A1B29] rounded-md border border-[#F2DDD3] text-[11px] transition-colors cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Review Text Area */}
          <div>
            <label className="block text-xs font-semibold text-[#3A1B29] mb-1">
              Customer Comments (Urdu, Roman Urdu, or English)
            </label>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              onBlur={() => handleAnalyzeReview(reviewText)}
              placeholder="Aap ka tajurba kaisa raha? Kaam ka mayar aur waqt kaisa tha?..."
              className="w-full px-3 py-2 text-xs bg-[#FFF9EC] border border-[#F2DDD3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376]"
            />
          </div>

          {/* AI Analysis Result */}
          {isAnalyzing && (
            <div className="p-3 bg-[#FFDCCC] rounded-xl text-xs text-[#5D2A42] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FB6376] animate-spin" />
              <span>AI is analyzing sentiment, punctuality, and work quality...</span>
            </div>
          )}

          {aiAnalysis && !isAnalyzing && (
            <div className="p-3.5 bg-[#FFF9EC] border border-[#F2DDD3] rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#5D2A42]">
                <Sparkles className="w-3.5 h-3.5 text-[#FB6376]" />
                <span>AI Review Intelligence Breakdown:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#886273]">
                <div>Quality: ★ {aiAnalysis.categories.work_quality}/5</div>
                <div>Punctuality: ★ {aiAnalysis.categories.punctuality}/5</div>
                <div>Communication: ★ {aiAnalysis.categories.communication}/5</div>
                <div>Professionalism: ★ {aiAnalysis.categories.professionalism}/5</div>
              </div>
              <div className="pt-1.5 border-t border-[#F2DDD3] text-[11px] text-[#5D2A42] font-medium">
                Summary: &ldquo;{aiAnalysis.ai_summary}&rdquo;
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reviewText.trim()}
            className="w-full py-3 bg-[#FB6376] hover:bg-[#5D2A42] text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Submit Verified Customer Review</span>
          </button>
        </div>
      </div>
    </div>
  );
};
