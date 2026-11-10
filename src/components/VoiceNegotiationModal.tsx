import React, { useState, useEffect, useRef } from 'react';
import { Booking, Message, WorkerProfile, AppLanguage, Customer } from '../types';
import { t } from '../data/translations';
import {
  X,
  Mic,
  Square,
  Send,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Volume2,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface VoiceNegotiationModalProps {
  booking: Booking | null;
  onClose: () => void;
  lang: AppLanguage;
  currentRole: 'customer' | 'worker';
  onProposePrice: (bookingId: string, price: number, note?: string) => Promise<void>;
  onConfirmBooking: (bookingId: string, finalPrice: number) => Promise<{ success: boolean; error?: string }>;
  onRefreshBookings: () => void;
}

const SAMPLE_CUSTOMER_VOICES = [
  {
    label: 'AC Cooling Problem (Today - Bhara Kahu)',
    text: 'Bhara Kahu mein AC se pani tapak raha hai aur cooling bilkul nahi ho rahi, baraye meherbani aaj hi aa jayein.',
  },
  {
    label: 'Main Breaker Trip (Emergency - F-10)',
    text: 'F-10 Islamabad mein ghar ka main breaker bar bar trip ho raha hai, emergency checking ki zaroorat hai.',
  },
  {
    label: 'Water Pump Leak (Within 24 Hours - Saddar)',
    text: 'Saddar Rawalpindi mein pani ki motor ka pipe leak ho gaya hai, dhaar nikal rahi hai kal subah tak aa jayein.',
  },
];

export const VoiceNegotiationModal: React.FC<VoiceNegotiationModalProps> = ({
  booking,
  onClose,
  lang,
  currentRole,
  onProposePrice,
  onConfirmBooking,
  onRefreshBookings,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiJobAnalysis, setAiJobAnalysis] = useState<{
    service?: string;
    problem?: string;
    urgency?: string;
    estimated_cost_pkr?: number;
  } | null>(null);

  const [counterPriceInput, setCounterPriceInput] = useState<string>('');
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages for current booking
  useEffect(() => {
    if (!booking) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages/${booking.id}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [booking]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!booking) return null;

  // Send message
  const handleSendMessage = async (textToSend?: string, isVoice = false) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          sender_id: currentRole === 'worker' ? booking.worker_id : booking.customer_id,
          sender_role: currentRole,
          sender_name: currentRole === 'worker' ? booking.worker_name : booking.customer_name,
          transcript: text,
          is_voice: isVoice,
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInputText('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Simulate or Live Voice recording
  const handleStartVoice = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleStopVoice = async (sampleOverride?: string) => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const voiceNote = sampleOverride || 'Ghar mein bijli ka switchboard kharab hai, kirpa kar k jaldi tashreef layein.';
    handleSendMessage(voiceNote, true);

    // AI Job Understanding (AI-03)
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/extract-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: voiceNote }),
      });
      const parsed = await res.json();
      setAiJobAnalysis(parsed);
    } catch (err) {
      console.error('AI extraction error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Price Proposal or Counteroffer
  const handleSendPriceQuote = async (price: number) => {
    await onProposePrice(booking.id, price);
    setCounterPriceInput('');
    onRefreshBookings();
  };

  // Confirm Booking
  const handleConfirm = async (price: number) => {
    setConfirmError(null);
    const res = await onConfirmBooking(booking.id, price);
    if (res.success) {
      setConfirmSuccess(true);
      onRefreshBookings();
    } else {
      setConfirmError(res.error || 'Failed to confirm booking.');
    }
  };

  const currentProposedPrice = booking.counter_price || booking.proposed_price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#F2DDD3] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Strip */}
        <div className="bg-[#5D2A42] text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#FCB1A6]">
                {booking.status === 'Confirmed' ? 'Confirmed Booking' : 'Voice Negotiation & Quotation'}
              </span>
              <span className="text-xs bg-white/15 text-[#FFDCCC] px-2 py-0.5 rounded-full">
                {booking.urgency}
              </span>
            </div>
            <h2 className="text-lg font-bold mt-0.5">
              {booking.service}
            </h2>
            <div className="text-xs text-[#FFDCCC]/90 flex items-center gap-2 mt-0.5">
              <span>Worker: <strong>{booking.worker_name}</strong> ({booking.worker_trade})</span>
              <span aria-hidden="true">·</span>
              <span>Customer: <strong>{booking.customer_name}</strong></span>
              <span aria-hidden="true">·</span>
              <span>{booking.area}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Job Summary Badge (if extracted) */}
        {aiJobAnalysis && (
          <div className="bg-[#FFF9EC] px-4 py-2.5 border-b border-[#F2DDD3] flex items-center justify-between text-xs text-[#3A1B29]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FB6376] shrink-0" />
              <span>
                <strong>AI Extracted Problem:</strong> {aiJobAnalysis.problem} ({aiJobAnalysis.urgency})
              </span>
            </div>
            {aiJobAnalysis.estimated_cost_pkr && (
              <span className="font-bold text-[#5D2A42]">
                Est: PKR {aiJobAnalysis.estimated_cost_pkr}
              </span>
            )}
          </div>
        )}

        {/* Negotiation Status & Price Agreement Bar */}
        <div className="bg-[#FFF9EC] px-4 py-3 border-b border-[#F2DDD3] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#886273] font-medium">Current Quotation:</span>
            <span className="text-base font-extrabold text-[#5D2A42] tabular-nums">
              PKR {currentProposedPrice}
            </span>
            {booking.counter_price ? (
              <span className="text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-amber-200">
                Customer Counteroffer
              </span>
            ) : (
              <span className="text-[#5D2A42] bg-[#FFDCCC] px-1.5 py-0.5 rounded text-[10px] font-semibold">
                Worker Quote
              </span>
            )}
          </div>

          {/* Quotation Acceptance or Counteroffer Actions */}
          {booking.status === 'Pending' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleConfirm(currentProposedPrice)}
                className="px-3.5 py-1.5 bg-[#FB6376] hover:bg-[#5D2A42] text-white font-semibold rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Accept PKR {currentProposedPrice}</span>
              </button>
            </div>
          )}

          {booking.status === 'Confirmed' && (
            <div className="flex items-center gap-1.5 text-[#FB6376] font-bold">
              <CheckCircle className="w-4 h-4 text-[#FB6376]" />
              <span>Confirmed at PKR {booking.agreed_price}</span>
            </div>
          )}
        </div>

        {/* Error notification if confirmation fails (e.g. Worker is Busy) */}
        {confirmError && (
          <div className="m-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong>Booking Conflict:</strong> {confirmError}
            </div>
          </div>
        )}

        {/* Success notification when confirmed */}
        {confirmSuccess && (
          <div className="m-3 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <strong>Job Confirmed!</strong> Worker is now engaged. Their availability has been updated to Busy.
            </div>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
          {messages.map((msg) => {
            const isMe =
              (currentRole === 'worker' && msg.sender_role === 'worker') ||
              (currentRole === 'customer' && msg.sender_role === 'customer');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="text-[10px] text-slate-400 mb-0.5 px-1">
                  {msg.sender_name} ({msg.sender_role})
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                    isMe
                      ? 'bg-[#5D2A42] text-white rounded-br-xs'
                      : 'bg-[#FFF9EC] text-[#3A1B29] rounded-bl-xs border border-[#F2DDD3]'
                  }`}
                >
                  {msg.is_voice && (
                    <div className="flex items-center gap-1.5 mb-1 text-[#FCB1A6] font-semibold text-[11px]">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Voice Note</span>
                    </div>
                  )}
                  <p className="leading-relaxed">{msg.transcript}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Sample Customer Spoken Audio Chips */}
        {currentRole === 'customer' && booking.status === 'Pending' && (
          <div className="px-4 py-2 bg-[#FFF9EC] border-t border-[#F2DDD3] text-[11px]">
            <div className="text-[#886273] font-semibold mb-1 flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-[#FB6376]" />
              <span>Tap sample voice note to send:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_CUSTOMER_VOICES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStopVoice(sample.text)}
                  className="px-2.5 py-1 bg-white hover:bg-[#FFDCCC] text-[#3A1B29] rounded-md border border-[#F2DDD3] text-[10px] transition-colors cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar / Voice Recorder */}
        <div className="p-3 bg-white border-t border-[#F2DDD3]">
          {booking.status === 'Pending' && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] text-[#886273] font-semibold">Propose Counter Quote:</span>
              <div className="relative w-32">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#886273]">
                  PKR
                </span>
                <input
                  type="number"
                  placeholder="Offer"
                  value={counterPriceInput}
                  onChange={(e) => setCounterPriceInput(e.target.value)}
                  className="w-full pl-9 pr-2 py-1 text-xs bg-[#FFF9EC] border border-[#F2DDD3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FB6376]"
                />
              </div>
              <button
                disabled={!counterPriceInput}
                onClick={() => handleSendPriceQuote(parseInt(counterPriceInput))}
                className="px-2.5 py-1 text-xs font-semibold bg-[#FFDCCC] text-[#5D2A42] hover:bg-[#FCB1A6] rounded-lg disabled:opacity-50 cursor-pointer transition-colors"
              >
                Send Counter Offer
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Voice record trigger */}
            <button
              onClick={isRecording ? () => handleStopVoice() : handleStartVoice}
              className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-[#FFDCCC] hover:bg-[#FCB1A6] text-[#5D2A42]'
              }`}
              title={isRecording ? 'Stop Recording' : 'Record Spoken Voice Message'}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span className="text-[10px] font-bold">{recordingSeconds}s</span>
                </>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={lang === 'ur' ? 'پیغام لکھیں یا وائس بٹن دبائیں...' : 'Type message in Urdu/English or record voice note...'}
              className="flex-1 px-3 py-2 text-xs bg-[#FFF9EC] border border-[#F2DDD3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376]"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim()}
              className="p-2.5 bg-[#FB6376] hover:bg-[#5D2A42] text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
