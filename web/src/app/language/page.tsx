'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Volume2, ArrowRight, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'hi', name: 'हिंदी', englishName: 'Hindi', prompt: 'अपनी भाषा चुनें', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi', prompt: 'आपली भाषा निवडा', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', prompt: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', prompt: 'మీ భాషను ఎంచుకోండి', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', prompt: 'আপনার ভাষা নির্বাচন করুন', flag: '🇮🇳' },
  { code: 'en', name: 'English', englishName: 'English', prompt: 'Select Your Language', flag: '🌐' }
];

export default function LanguagePage() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState('hi');

  const playAudioPrompt = () => {
    alert("Audio Instruction: अपनी भाषा चुनने के लिए कार्ड पर क्लिक करें और 'आगे बढ़ें' बटन दबाएं।");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
          <Globe size={16} /> Accessible Language Selection / भाषा चयन
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">🏛️ BhumiSetu (भूमिसेतु)</h1>
        <p className="text-gray-600 text-sm max-w-lg mx-auto">
          Designed for all citizens including uneducated & semi-literate users. Please select your native regional language first.
        </p>
      </div>

      {/* Audio Prompt Card for Uneducated Users */}
      <div 
        onClick={playAudioPrompt}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Volume2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-blue-950 text-base">सुनकर भाषा चुनें (Listen Instructions)</h3>
            <p className="text-blue-700 text-xs">Click to hear step-by-step guidance in regional Indian languages</p>
          </div>
        </div>
        <span className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold">Play Audio 🔊</span>
      </div>

      {/* Language Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {LANGUAGES.map((lang) => (
          <div
            key={lang.code}
            onClick={() => setSelectedLang(lang.code)}
            className={`relative p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col items-center text-center shadow-sm ${
              selectedLang === lang.code
                ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="text-3xl mb-2">{lang.flag}</span>
            <span className={`text-xl font-bold ${selectedLang === lang.code ? 'text-blue-900' : 'text-gray-900'}`}>
              {lang.name}
            </span>
            <span className="text-xs text-gray-500 font-medium">{lang.englishName}</span>
            <span className="text-[11px] text-gray-400 mt-2 italic">{lang.prompt}</span>

            {selectedLang === lang.code && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                <Check size={14} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <div className="pt-4 text-center">
        <button
          onClick={() => router.push('/login')}
          className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition inline-flex items-center justify-center gap-3"
        >
          आगे बढ़ें / Proceed to Login <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
