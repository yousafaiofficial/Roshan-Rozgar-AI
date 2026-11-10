'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Ear, Keyboard, Mic, MicOff, Phone, Play, Volume2 } from 'lucide-react';
import styles from './VoiceWorkerOnboarding.module.css';
import { apiCall } from './api';

const skills = ['Electrician', 'Plumber', 'AC Technician', 'Carpenter', 'Painter', 'Cleaner', 'Mechanic', 'Other Services'];
const steps = [
  { title: 'Aap ka naam', urdu: 'اپنا نام بولیں', instruction: 'Microphone dabayen aur apna poora naam bolain.' },
  { title: 'Phone aur password', urdu: 'فون اور پاس ورڈ', instruction: 'Barray buttons se phone number aur apna kam az kam 12 haroof ka password darj karain.' },
  { title: 'Shehar', urdu: 'شہر منتخب کریں', instruction: 'Islamabad ya Rawalpindi ka button dabayen.' },
  { title: 'Hunar', urdu: 'اپنا ہنر منتخب کریں', instruction: 'Apna bunyadi hunar aur mazeed hunar chunain.' },
  { title: 'Tasdeeq', urdu: 'معلومات کی تصدیق', instruction: 'Maloomat sunain, phir account bananay ka button dabayen.' },
];

type SpeechRecognitionEventLike = { results: ArrayLike<{ 0: { transcript: string } }> };
type SpeechRecognitionLike = { lang: string; interimResults: boolean; onresult: ((event: SpeechRecognitionEventLike) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; start: () => void; stop: () => void };
type RecognitionConstructor = new () => SpeechRecognitionLike;

function recognitionConstructor(): RecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined;
  const speechWindow = window as typeof window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
}

export default function VoiceWorkerOnboarding() {
  const [expanded, setExpanded] = useState(false), [step, setStep] = useState(0), [name, setName] = useState(''), [phone, setPhone] = useState('03'), [password, setPassword] = useState(''), [city, setCity] = useState(''), [skill, setSkill] = useState(''), [extraSkills, setExtraSkills] = useState<string[]>([]), [bio, setBio] = useState(''), [manualName, setManualName] = useState(false), [listening, setListening] = useState<'name' | 'bio' | null>(null), [message, setMessage] = useState(''), [submitting, setSubmitting] = useState(false), [complete, setComplete] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSupported = Boolean(recognitionConstructor());
  const audioSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = (text = steps[step].instruction) => {
    if (!audioSupported) { setMessage('Audio guidance is unavailable here. The same instruction is written below in Urdu and Roman Urdu.'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'ur-PK'; utterance.rate = 0.85; window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (expanded && audioSupported) speak(steps[step].instruction);
    return () => { recognitionRef.current?.stop(); if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, step]);

  const listen = (field: 'name' | 'bio') => {
    const Recognition = recognitionConstructor();
    if (!Recognition) { setManualName(true); setMessage('Is browser mein speech recognition nahin hai. Neechay baray manual controls istemal karain.'); return; }
    recognitionRef.current?.stop(); const recognition = new Recognition(); recognitionRef.current = recognition; recognition.lang = 'ur-PK'; recognition.interimResults = false;
    recognition.onresult = (event) => { const transcript = event.results[0][0].transcript.trim(); if (field === 'name') setName(transcript); else setBio((current) => `${current} ${transcript}`.trim()); setMessage(`Suna gaya: ${transcript}`); };
    recognition.onerror = () => setMessage('Awaaz samajh nahin aayi. Dobara koshish karain ya manual option istemal karain.'); recognition.onend = () => setListening(null); setListening(field); setMessage('Sun raha hai… ab bolain.'); recognition.start();
  };
  const stopListening = () => { recognitionRef.current?.stop(); recognitionRef.current = null; setListening(null); setMessage('Sunna band kar diya. Dobara koshish karain ya manual option istemal karain.'); };
  const appendDigit = (digit: string) => setPhone((value) => value.length < 11 ? value + digit : value);
  const removeDigit = () => setPhone((value) => value.length > 2 ? value.slice(0, -1) : value);
  const canContinue = [name.trim().length >= 2, phone.length === 11 && password.length >= 12, Boolean(city), Boolean(skill), true][step];
  const next = () => { if (!canContinue) { setMessage('Pehle is qadam ki zaroori maloomat mukammal karain.'); return; } setMessage(''); setStep((current) => Math.min(current + 1, steps.length - 1)); };

  const register = async () => {
    setSubmitting(true); setMessage('Account ban raha hai…');
    try {
      await apiCall('/api/auth/register', 'POST', { name: name.trim(), phone, password, role: 'worker', city, skill, extra_skills: extraSkills, bio, rate: 1000 });
      setComplete(true); setMessage('Worker account ban gaya. Login ke liye apna phone aur password yaad rakhein.'); speak('Mubarak ho. Aap ka worker account ban gaya hai.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Account could not be created'); } finally { setSubmitting(false); }
  };

  if (!expanded) return <section className={styles.invite} id="voice-onboarding" aria-labelledby="voice-title"><div><span className={styles.kicker}><Ear size={18}/> Voice-first worker signup</span><h2 id="voice-title">Bol kar apna worker profile banayein</h2><p>Urdu audio guidance, large buttons and speech input where your browser supports it.</p></div><button className={styles.start} onClick={() => setExpanded(true)}><Mic size={24}/> Shuru karain <span lang="ur" dir="rtl">شروع کریں</span></button></section>;

  return <section className={styles.onboarding} aria-labelledby="onboarding-title">
    <div className={styles.topline}><div><span className={styles.kicker}>Qadam {step + 1} / {steps.length}</span><h2 id="onboarding-title">{steps[step].title}</h2><p className={styles.urdu} lang="ur" dir="rtl">{steps[step].urdu}</p></div><button className={styles.listenGuide} onClick={() => speak()}><Volume2 size={22}/> Hidayat sunain</button></div>
    <div className={styles.progress} aria-label={`Step ${step + 1} of ${steps.length}`}><span style={{ width: `${((step + 1) / steps.length) * 100}%` }}/></div><p className={styles.instruction}>{steps[step].instruction}</p>
    {!speechSupported && <div className={styles.warning} role="status"><MicOff size={22}/><div><strong>Voice input is not available in this browser.</strong><span>Large manual controls remain available. Chrome-family support varies by device, language service and permission settings.</span></div></div>}
    {step === 0 && <div className={styles.voicePanel}><button className={`${styles.micButton} ${listening === 'name' ? styles.active : ''}`} onClick={() => listening === 'name' ? stopListening() : listen('name')}><Mic size={38}/><strong>{listening === 'name' ? 'Sunna band karain' : 'Naam bolain'}</strong><span lang="ur" dir="rtl">{listening === 'name' ? 'سننا بند کریں' : 'اپنا نام بولیں'}</span></button>{name && <div className={styles.heard}><Check size={22}/><span><small>Hum ne suna:</small><strong>{name}</strong></span></div>}<button className={styles.manualToggle} onClick={() => setManualName((value) => !value)}><Keyboard size={20}/> Manual fallback</button>{manualName && <label className={styles.largeField}>Naam / Name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Apna naam likhain"/></label>}</div>}
    {step === 1 && <div className={styles.numberGrid}><NumberPad label="Pakistani mobile number" value={phone} onDigit={appendDigit} onBack={removeDigit}/><label className={styles.passwordField}>Password (at least 12 characters)<input type="password" autoComplete="new-password" minLength={12} value={password} onChange={(event) => setPassword(event.target.value)} required/><span>Use a private password you can remember. Do not share it aloud.</span></label></div>}
    {step === 2 && <div className={styles.choiceGrid}>{['Islamabad', 'Rawalpindi'].map((item) => <button key={item} className={city === item ? styles.selected : ''} onClick={() => setCity(item)}>{city === item && <Check size={22}/>}<strong>{item}</strong></button>)}</div>}
    {step === 3 && <div><div className={styles.choiceGrid}>{skills.map((item) => <button key={item} className={skill === item ? styles.selected : ''} onClick={() => setSkill(item)}>{skill === item && <Check size={20}/>}<strong>{item}</strong></button>)}</div><h3 className={styles.subheading}>Mazeed hunar (optional)</h3><div className={styles.chips}>{skills.filter((item) => item !== skill).map((item) => <button key={item} className={extraSkills.includes(item) ? styles.selectedChip : ''} onClick={() => setExtraSkills((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])}>{item}</button>)}</div><button className={styles.bioButton} onClick={() => listen('bio')}><Mic size={20}/> Apne kaam ke baray mein bolain (optional)</button>{bio && <p className={styles.bioPreview}>{bio}</p>}</div>}
    {step === 4 && !complete && <div className={styles.summary}><SummaryRow label="Naam" value={name}/><SummaryRow label="Phone" value={phone}/><SummaryRow label="Shehar" value={city}/><SummaryRow label="Bunyadi hunar" value={skill}/><SummaryRow label="Mazeed hunar" value={extraSkills.join(', ') || 'Koi nahin'}/><button className={styles.playSummary} onClick={() => speak(`${name}. ${city}. ${skill}.`)}><Play size={20}/> Maloomat sunain</button></div>}
    {complete && <div className={styles.done} role="status"><Check size={42}/><h3>Account tayyar hai</h3><p lang="ur" dir="rtl">آپ کا ورکر اکاؤنٹ بن گیا ہے۔</p><button onClick={() => window.location.reload()}>Dashboard kholain</button></div>}
    {message && <p className={styles.message} role="status">{message}</p>}
    {!complete && <div className={styles.actions}><button className={styles.back} onClick={() => step ? setStep(step - 1) : setExpanded(false)}><ArrowLeft size={22}/> Wapas</button>{step < steps.length - 1 ? <button className={styles.next} onClick={next} disabled={!canContinue}>Agla qadam <ArrowRight size={22}/></button> : <button className={styles.next} onClick={register} disabled={submitting}>{submitting ? 'Ban raha hai…' : 'Worker account banayein'} <Check size={22}/></button>}</div>}
  </section>;
}

function NumberPad({ label, value, onDigit, onBack }: { label: string; value: string; onDigit: (digit: string) => void; onBack: () => void }) { return <div className={styles.pad}><div className={styles.padLabel}><Phone size={20}/><strong>{label}</strong><output aria-live="polite">{value || '—'}</output></div><div className={styles.digits}>{['1','2','3','4','5','6','7','8','9','0'].map((digit) => <button key={digit} onClick={() => onDigit(digit)} aria-label={`Add ${digit}`}>{digit}</button>)}<button className={styles.delete} onClick={onBack} aria-label={`Delete last ${label} digit`}>⌫</button></div></div>; }
function SummaryRow({ label, value }: { label: string; value: string }) { return <div><span>{label}</span><strong>{value}</strong></div>; }
