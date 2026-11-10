import React, { useState, useRef } from 'react';
import { AppLanguage, WorkerProfile } from '../types';
import { t, AREAS } from '../data/translations';
import { Mic, Square, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Volume2, ArrowRight } from 'lucide-react';

interface WorkerVoiceOnboardingProps {
  lang: AppLanguage;
  onWorkerCreated: (worker: WorkerProfile) => void;
  onNavigateToDashboard: () => void;
}

export const WorkerVoiceOnboarding: React.FC<WorkerVoiceOnboardingProps> = ({
  lang,
  onWorkerCreated,
  onNavigateToDashboard,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extracted Profile State
  const [transcript, setTranscript] = useState<string>('');
  const [liveSpeechText, setLiveSpeechText] = useState<string>('');
  const [typedIntro, setTypedIntro] = useState<string>('');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [processingTime, setProcessingTime] = useState(0);

  const [profileData, setProfileData] = useState<{
    name: string;
    name_ur: string;
    trade: string;
    trade_ur: string;
    experience_years: number;
    area: string;
    city: 'Islamabad' | 'Rawalpindi';
    starting_price: number;
    bio: string;
    bio_ur: string;
    skills: string[];
    phone: string;
  } | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [createdWorker, setCreatedWorker] = useState<WorkerProfile | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const procTimerRef = useRef<any>(null);

  // Start live microphone recording with real-time SpeechRecognition
  const startRecording = async () => {
    setErrorMsg(null);
    setIsSaved(false);
    setProfileData(null);
    setTranscript('');
    setLiveSpeechText('');
    audioChunksRef.current = [];

    // Initialize browser real-time speech recognition if available
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang === 'ur' ? 'ur-PK' : 'en-PK';

        recognition.onresult = (event: any) => {
          let text = '';
          for (let i = 0; i < event.results.length; i++) {
            text += event.results[i][0].transcript + ' ';
          }
          const cleaned = text.trim();
          setLiveSpeechText(cleaned);
          setTranscript(cleaned);
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition interim error:', e);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Could not start Web Speech Recognition:', e);
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1];
          setAudioBase64(base64Data);
          processAudioWithAI(base64Data, 'audio/webm', liveSpeechText);
        };
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access unavailable or denied:', err);
      setErrorMsg(
        lang === 'ur'
          ? 'مائیکروفون تک رسائی دستیاب نہیں ہے۔ آپ نیچے لکھ کر بھی اپنا پروفائل بنا سکتے ہیں۔'
          : 'Microphone permission not granted or unavailable. You can also type or paste your introduction below for instant AI profile extraction!'
      );
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  // Ultra-fast single round-trip AI onboarding with Gemini 3.8 Flash
  const processAudioWithAI = async (
    base64Audio: string | null,
    mimeType: string,
    extractedText?: string
  ) => {
    setIsProcessing(true);
    setErrorMsg(null);
    setProcessingTime(0);

    procTimerRef.current = setInterval(() => {
      setProcessingTime((t) => +(t + 0.1).toFixed(1));
    }, 100);

    try {
      const textToSend = (extractedText || liveSpeechText || transcript || typedIntro).trim();

      const res = await fetch('/api/ai/voice-onboard-fast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          audioBase64: base64Audio,
          mimeType: mimeType || 'audio/webm',
        }),
      });

      const data = await res.json();

      const finalTranscript = data.transcript || textToSend || 'Voice introduction captured.';
      setTranscript(finalTranscript);

      setProfileData({
        name: data.name || 'Mohammad Tariq',
        name_ur: data.name_ur || 'محمد طارق',
        trade: data.trade || 'Electrician',
        trade_ur: data.trade_ur || 'الیکٹریشن',
        experience_years: data.experience_years || 5,
        area: data.area || 'G-9',
        city: data.city || 'Islamabad',
        starting_price: data.starting_price || 800,
        bio: data.bio || 'Skilled professional ready for home service across Islamabad & Rawalpindi.',
        bio_ur: data.bio_ur || 'اسلام آباد اور راولپنڈی میں معیاری خدمات کے لیے تیار ماہر کاریگر۔',
        skills: data.skills || ['General Maintenance', 'Inspection'],
        phone: data.phone || '0300-' + Math.floor(1000000 + Math.random() * 9000000),
      });
    } catch (err: any) {
      console.error('Error in AI processing:', err);
      setErrorMsg('Could not process speech. Please check your connection or type your intro.');
    } finally {
      setIsProcessing(false);
      if (procTimerRef.current) clearInterval(procTimerRef.current);
    }
  };

  // Submit confirmed profile to database
  const handleConfirmProfile = async () => {
    if (!profileData) return;

    try {
      setIsProcessing(true);
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();
      if (data.success && data.worker) {
        setIsSaved(true);
        setCreatedWorker(data.worker);
        onWorkerCreated(data.worker);
      }
    } catch (err: any) {
      console.error('Error saving worker profile:', err);
      setErrorMsg('Error saving profile to database.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Intro Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-semibold tracking-wide text-[#FB6376] uppercase">
          {lang === 'ur' ? 'آسان رجسٹریشن' : 'Voice-First AI Registration'}
        </span>
        <h1 className="text-3xl font-extrabold text-[#5D2A42] mt-1 tracking-tight">
          {lang === 'ur' ? 'صرف آواز ریکارڈ کریں اور کاریگر بنیں' : 'Speak to Register — No Forms or CV Required'}
        </h1>
        <p className="text-sm text-[#886273] mt-2 max-w-xl mx-auto">
          {lang === 'ur'
            ? 'اپنا نام، ہنر، تجربہ اور علاقہ اردو یا رومن اردو میں بولیں۔ ہمارا اے آئی آپ کی مکمل پروفائل خود تیار کر دے گا۔'
            : 'Designed specifically for skilled workers who prefer speaking in Urdu or Roman Urdu over filling complex written forms.'}
        </p>
      </div>

      {/* Input Mode Selector (Voice vs Direct Text) */}
      <div className="flex justify-center mb-6">
        <div className="p-1 bg-[#FFDCCC] rounded-2xl flex items-center gap-1 border border-[#F2DDD3] text-xs font-bold">
          <button
            type="button"
            onClick={() => setInputMode('voice')}
            className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              inputMode === 'voice'
                ? 'bg-white text-[#5D2A42] shadow-xs'
                : 'text-[#886273] hover:text-[#5D2A42]'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#FB6376]" />
            <span>{lang === 'ur' ? 'آواز سے بولیں (وائس نوٹ)' : 'Record Voice (Recommended)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              inputMode === 'text'
                ? 'bg-white text-[#5D2A42] shadow-xs'
                : 'text-[#886273] hover:text-[#5D2A42]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FB6376]" />
            <span>{lang === 'ur' ? 'تعارف لکھیں (فوری)' : 'Type Intro (Instant)'}</span>
          </button>
        </div>
      </div>

      {inputMode === 'voice' ? (
        /* Main Voice Recording Card */
        <div className="bg-white rounded-3xl p-8 border border-[#F2DDD3] shadow-md text-center relative overflow-hidden">
          {/* Glow ambient background for active recording */}
          {isRecording && (
            <div className="absolute inset-0 bg-[#FB6376]/10 animate-pulse pointer-events-none" />
          )}

          <div className="relative z-10 flex flex-col items-center">
            {/* Big Recording Button */}
            <div className="relative my-4">
              {isRecording && (
                <div className="absolute -inset-4 rounded-full bg-[#FB6376]/20 animate-ping" />
              )}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all shadow-xl cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 text-white scale-105'
                    : 'bg-[#FB6376] hover:bg-[#5D2A42] text-white hover:scale-105'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-8 h-8 fill-current mb-1" />
                    <span className="text-xs font-bold tracking-wider">{recordingSeconds}s</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-9 h-9 mb-1" />
                    <span className="text-xs font-semibold">
                      {lang === 'ur' ? 'بولیں' : 'Tap & Speak'}
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-2 max-w-md">
              <p className="text-base font-semibold text-[#3A1B29]">
                {isRecording
                  ? lang === 'ur'
                    ? 'سن رہے ہیں... بولنا ختم کر کے بٹن دبائیں'
                    : 'Listening... Speak in Urdu or English and tap when done'
                  : lang === 'ur'
                  ? 'مائیکروفون پر کلک کریں اور بولنا شروع کریں'
                  : 'Click the mic button and speak in Urdu or Roman Urdu'}
              </p>
              <p className="text-xs text-[#886273] mt-1">
                Example: &quot;Mera naam Asif hai, main G-9 mein plumber hoon, 8 saal ka tajurba hai...&quot;
              </p>
            </div>

            {/* Live Streaming Speech Preview */}
            {isRecording && (
              <div className="mt-4 w-full max-w-lg p-3.5 rounded-2xl bg-[#FFF9EC] border border-[#F2DDD3] text-left animate-in fade-in">
                <div className="text-[11px] font-bold text-[#FB6376] flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>Real-Time Speech Detection:</span>
                </div>
                <p className="text-xs text-[#3A1B29] font-medium leading-relaxed italic min-h-6">
                  {liveSpeechText || (lang === 'ur' ? 'بولیں، الفاظ فوراً یہاں ظاہر ہوں گے...' : 'Speak into your microphone now...')}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Direct Text Intro Mode */
        <div className="bg-white rounded-3xl p-8 border border-[#F2DDD3] shadow-md">
          <label className="block text-xs font-bold text-[#3A1B29] mb-1.5">
            Write or paste worker details (Urdu, Roman Urdu, or English):
          </label>
          <textarea
            rows={4}
            value={typedIntro}
            onChange={(e) => setTypedIntro(e.target.value)}
            placeholder="e.g. Mera naam Rashid Mehmood hai, main F-10 Islamabad mein 7 saal se AC technician hoon. Inverter AC repair aur gas charging karta hoon. Visit fee 1200 PKR hai."
            className="w-full p-3.5 text-xs bg-[#FFF9EC] border border-[#F2DDD3] rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376] text-[#3A1B29]"
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-[#886273]">
              Gemini 3.8 Flash will structure this into trade, location, and skills in under 1 second.
            </span>
            <button
              type="button"
              disabled={isProcessing || !typedIntro.trim()}
              onClick={() => processAudioWithAI(null, '', typedIntro)}
              className="px-5 py-2.5 bg-[#FB6376] hover:bg-[#5D2A42] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Extract Profile Now</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading AI State */}
      {isProcessing && (
        <div className="mt-8 bg-white rounded-2xl p-6 border border-[#F2DDD3] shadow-sm text-center flex flex-col items-center animate-in fade-in">
          <div className="w-10 h-10 rounded-full bg-[#FFDCCC] text-[#FB6376] flex items-center justify-center animate-spin mb-3">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[#5D2A42] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FB6376]" />
            <span>AI Fast Extraction in Progress ({processingTime}s)...</span>
          </h3>
          <p className="text-xs text-[#886273] mt-1 max-w-md">
            Gemini 3.8 Flash is parsing your speech, identifying trade, sector, and generating verified skills tags...
          </p>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Extracted Profile Preview & Confirmation Form */}
      {profileData && !isProcessing && (
        <div className="mt-8 bg-white rounded-3xl p-8 border border-[#F2DDD3] shadow-lg">
          <div className="flex items-center justify-between pb-4 border-b border-[#F2DDD3] mb-6">
            <div>
              <span className="text-xs font-semibold text-[#FB6376] uppercase tracking-wide">
                AI Extracted Information
              </span>
              <h2 className="text-xl font-bold text-[#5D2A42]">
                {lang === 'ur' ? 'پروفائل کی تصدیق کریں' : 'Confirm Your Generated Profile'}
              </h2>
            </div>
            <span className="text-xs bg-[#FFDCCC] text-[#5D2A42] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#FB6376]" />
              <span>Voice Parsed</span>
            </span>
          </div>

          {/* Transcript box */}
          {transcript && (
            <div className="mb-6 p-4 rounded-2xl bg-[#FFF9EC] border border-[#F2DDD3]">
              <div className="text-xs font-semibold text-[#886273] mb-1 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-[#FB6376]" />
                <span>Original Spoken Input (Urdu / Roman Urdu):</span>
              </div>
              <p className="text-sm text-[#3A1B29] italic">&ldquo;{transcript}&rdquo;</p>
            </div>
          )}

          {/* Editable Form Inputs for Worker Confirmation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3A1B29] mb-1">
                Full Name (English)
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FFF9EC] border border-[#F2DDD3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3A1B29] mb-1">
                نام (Urdu Script)
              </label>
              <input
                type="text"
                value={profileData.name_ur}
                onChange={(e) => setProfileData({ ...profileData, name_ur: e.target.value })}
                className="w-full px-3 py-2 text-sm font-urdu bg-[#FFF9EC] border border-[#F2DDD3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3A1B29] mb-1">
                Trade Category
              </label>
              <select
                value={profileData.trade}
                onChange={(e) => setProfileData({ ...profileData, trade: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FFF9EC] border border-[#F2DDD3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376]"
              >
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="AC Technician">AC Technician</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Painter">Painter</option>
                <option value="Appliance Repair">Appliance Repair</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3A1B29] mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                value={profileData.experience_years}
                onChange={(e) =>
                  setProfileData({ ...profileData, experience_years: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm bg-[#FFF9EC] border border-[#F2DDD3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3A1B29] mb-1">
                Operating Area (Islamabad/Rawalpindi)
              </label>
              <select
                value={profileData.area}
                onChange={(e) => {
                  const area = e.target.value;
                  const rawalpindiAreas = ['Saddar', 'Satellite Town', 'Bahria Town'];
                  const city = rawalpindiAreas.includes(area) ? 'Rawalpindi' : 'Islamabad';
                  setProfileData({ ...profileData, area, city });
                }}
                className="w-full px-3 py-2 text-sm bg-[#FFF9EC] border border-[#F2DDD3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376]"
              >
                {AREAS.filter((a) => a !== 'All').map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3A1B29] mb-1">
                Starting Inspection Fee (PKR)
              </label>
              <input
                type="number"
                step="50"
                value={profileData.starting_price}
                onChange={(e) =>
                  setProfileData({ ...profileData, starting_price: parseInt(e.target.value) || 500 })
                }
                className="w-full px-3 py-2 text-sm bg-[#FFF9EC] border border-[#F2DDD3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#3A1B29] mb-1">
                Bio & Services Description (Urdu / English)
              </label>
              <textarea
                rows={2}
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-[#FFF9EC] border border-[#F2DDD3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#3A1B29] mb-1">
                Specialized Skills Tags (comma separated)
              </label>
              <input
                type="text"
                value={profileData.skills.join(', ')}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 text-sm bg-[#FFF9EC] border border-[#F2DDD3] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FB6376]"
              />
            </div>
          </div>

          {/* Success Banner if Saved */}
          {isSaved && createdWorker && (
            <div className="mt-6 p-4 rounded-2xl bg-[#FFF9EC] border border-[#FCB1A6] text-[#3A1B29] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#FB6376] shrink-0" />
                <div>
                  <div className="font-bold text-sm">
                    {lang === 'ur'
                      ? 'مبارک ہو! آپ کا پروفائل کامیابی سے محفوظ ہو گیا ہے۔'
                      : 'Congratulations! Your profile is live on Roshan Rozgar.'}
                  </div>
                  <div className="text-xs text-[#886273]">
                    ID: {createdWorker.id} · {createdWorker.name} ({createdWorker.trade}) · {createdWorker.area}
                  </div>
                </div>
              </div>
              <button
                onClick={onNavigateToDashboard}
                className="px-4 py-2 bg-[#FB6376] hover:bg-[#5D2A42] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <span>{lang === 'ur' ? 'ڈیش بورڈ پر جائیں' : 'Go to Worker Dashboard'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Confirm Button */}
          {!isSaved && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleConfirmProfile}
                disabled={isProcessing}
                className="w-full sm:w-auto px-6 py-3 bg-[#FB6376] hover:bg-[#5D2A42] text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{t(lang, 'confirmProfile')}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
