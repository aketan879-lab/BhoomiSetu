'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Volume2, ArrowRight, Check } from 'lucide-react';
import { useWebLanguage, LanguageCode } from '../context/WebLanguageContext';

const LANGUAGES: { code: LanguageCode; name: string; englishName: string; prompt: string; flag: string }[] = [
  { code: 'hi', name: 'हिंदी', englishName: 'Hindi', prompt: 'अपनी भाषा चुनें', flag: '🇮🇳' },
  { code: 'en', name: 'English', englishName: 'English', prompt: 'Select Your Language', flag: '🌐' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi', prompt: 'आपली भाषा निवडा', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', prompt: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', prompt: 'మీ భాషను ఎంచుకోండి', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', prompt: 'আপনার ভাষা নির্বাচন করুন', flag: '🇮🇳' }
];

export default function LanguageFirstPage() {
  const router = useRouter();
  const { lang, setLang, t } = useWebLanguage();

  const handleSelectLanguage = (code: LanguageCode) => {
    setLang(code);
    router.push('/login');
  };

  const playAudioPrompt = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = `${t.langTitle}. ${t.langSubtitle}. ${t.langAudioSub}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : lang === 'ta' ? 'ta-IN' : lang === 'te' ? 'te-IN' : lang === 'bn' ? 'bn-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`🔊 Audio Instructions (${lang.toUpperCase()}): ${t.langAudioSub}`);
    }
  };

  const handleProceedToLogin = () => {
    router.push('/login');
  };


  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Step Badge */}
      <div className="text-center">
        <span className="inline-block bg-blue-100 text-blue-900 text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider">
          STEP 1 OF 3 • {t.langBadge}
        </span>
      </div>

      {/* Main Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-blue-900 tracking-tight">{t.langTitle}</h1>
        <p className="text-gray-600 text-sm sm:text-base font-medium max-w-xl mx-auto">
          {t.langSubtitle}
        </p>
      </div>

      {/* Audio Voice Guidance Banner for Uneducated / Semi-literate users */}
      <div 
        onClick={playAudioPrompt}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Volume2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-blue-950 text-base">{t.langAudioTitle}</h3>
            <p className="text-blue-700 text-xs">{t.langAudioSub}</p>
          </div>
        </div>
        <span className="text-xs bg-blue-600 text-white px-3.5 py-2 rounded-xl font-bold hover:bg-blue-700 transition">
          Play Audio 🔊
        </span>
      </div>

      {/* Regional Language Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {LANGUAGES.map((item) => (
          <div
            key={item.code}
            onClick={() => handleSelectLanguage(item.code)}
            className={`relative p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col items-center text-center shadow-sm ${
              lang === item.code
                ? 'border-blue-600 bg-blue-50/90 shadow-md ring-2 ring-blue-500/20'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="text-4xl mb-2">{item.flag}</span>
            <span className={`text-xl font-extrabold ${lang === item.code ? 'text-blue-900' : 'text-gray-900'}`}>
              {item.name}
            </span>
            <span className="text-xs text-gray-500 font-medium">{item.englishName}</span>
            <span className="text-[11px] text-gray-400 mt-2 italic">{item.prompt}</span>

            {lang === item.code && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow">
                <Check size={14} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Proceed Button -> Navigates to Login */}
      <div className="pt-6 text-center">
        <button
          onClick={handleProceedToLogin}
          className="w-full sm:w-auto px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition inline-flex items-center justify-center gap-3"
        >
          {t.langProceedBtn}
        </button>
      </div>
    </div>
  );
}
