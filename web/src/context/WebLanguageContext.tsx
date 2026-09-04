'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'hi' | 'en' | 'mr' | 'ta' | 'te' | 'bn';

export interface WebTranslations {
  // Navigation
  navLanguage: string;
  navLogin: string;
  navDashboard: string;
  navValidation: string;
  navDisputes: string;
  navScan: string;

  // Language Page
  langBadge: string;
  langTitle: string;
  langSubtitle: string;
  langAudioTitle: string;
  langAudioSub: string;
  langProceedBtn: string;

  // Login Page
  loginBadge: string;
  loginTitle: string;
  loginSub: string;
  loginRoleLabel: string;
  loginPhoneLabel: string;
  loginOtpSentTitle: string;
  loginOtpSentNotice: string;
  loginEnterOtpLabel: string;
  loginSendOtpBtn: string;
  loginVerifyOtpBtn: string;

  // Dashboard Page
  dashTitle: string;
  dashSub: string;
  dashTotalRecords: string;
  dashActiveDisputes: string;
  dashFraudAlerts: string;
  dashAiAccuracy: string;
  dashRecentMutations: string;
  dashQuickActions: string;

  // Validation Queue
  valTitle: string;
  valSub: string;
  valApproveBtn: string;
  valFlagBtn: string;

  // Dispute Map
  dispTitle: string;
  dispSub: string;
  dispScheduleHearing: string;

  // Scanner
  scanTitle: string;
  scanSub: string;
  scanUploadBtn: string;
}

const WEB_TRANSLATIONS: Record<LanguageCode, WebTranslations> = {
  hi: {
    navLanguage: '🌐 1. भाषा चुनें',
    navLogin: '🔐 2. प्रवेश व पंजीकरण',
    navDashboard: '📊 3. मुख्य डैशबोर्ड',
    navValidation: '✅ 5-स्तरीय सत्यापन',
    navDisputes: '🗺️ विवाद निवारण मानचित्र',
    navScan: '📷 ओसीआर व क्यूआर स्कैनर',

    langBadge: 'भाषा चयन पोर्टल • ACCESSIBLE SELECTION',
    langTitle: '🏛️ भूमिसेतु (BhumiSetu)',
    langSubtitle: 'नागरिक एवं प्रशासनिक पोर्टल हेतु अपनी भाषा चुनें',
    langAudioTitle: 'सुनकर भाषा चुनें (ऑडियो सहायता)',
    langAudioSub: 'निर्देश सुनने के लिए यहां क्लिक करें',
    langProceedBtn: 'आगे बढ़ें (प्रवेश पोर्टल) ➔',

    loginBadge: 'आधिकारिक राजस्व पोर्टल (Government Portal)',
    loginTitle: 'भूमिसेतु आधिकारिक प्रवेश पोर्टल',
    loginSub: 'राजस्व विभाग अधिकारी एवं नागरिक पोर्टल',
    loginRoleLabel: 'पदनाम / श्रेणी चुनें:',
    loginPhoneLabel: 'पंजीकृत मोबाइल नंबर (भारत +91):',
    loginOtpSentTitle: '📲 ओटीपी मोबाइल पर भेजा गया',
    loginOtpSentNotice: 'ओटीपी आपके पंजीकृत मोबाइल नंबर पर एसएमएस द्वारा भेजा गया है।',
    loginEnterOtpLabel: '6-अंकों का ओटीपी दर्ज करें:',
    loginSendOtpBtn: 'ओटीपी कोड प्राप्त करें 📩',
    loginVerifyOtpBtn: 'सत्यापित करें एवं डैशबोर्ड में प्रवेश करें ✅',

    dashTitle: 'भूमिसेतु मुख्य प्रशासनिक डैशबोर्ड',
    dashSub: 'डिजिटल भूमि अभिलेख एवं एआई सत्यापन स्थिति',
    dashTotalRecords: 'कुल पंजीकृत भूमि अभिलेख',
    dashActiveDisputes: 'सक्रिय सीमा विवाद',
    dashFraudAlerts: 'एआई द्वारा चिन्हित फर्जीवाड़े',
    dashAiAccuracy: 'एआई ओसीआर शुद्धता दर',
    dashRecentMutations: 'हाल के नामांतरण आवेदन (Dakhil-Kharij)',
    dashQuickActions: 'त्वरित कार्रवाई',

    valTitle: '5-स्तरीय स्वचालित भूमि सत्यापन सूची',
    valSub: 'राजस्व विभाग क्रॉस-रजिस्ट्री एवं एआई जोखिम समीक्षा',
    valApproveBtn: 'अभिलेख स्वीकृत करें ✅',
    valFlagBtn: 'जांच हेतु चिन्हित करें ⚠️',

    dispTitle: 'जीआईएस सीमा एवं विवाद निवारण मानचित्र',
    dispSub: 'पोस्ट-जीआईएस कैडस्ट्रल ओवरले व पटवारी सुनवाई',
    dispScheduleHearing: 'पटवारी सुनवाई शेड्यूल करें',

    scanTitle: 'स्मार्ट स्कैन: दस्तावेज ओसीआर व यूएलपीआईएन',
    scanSub: 'खसरा/खतौनी दस्तावेज एक्सट्रैक्शन',
    scanUploadBtn: 'दस्तावेज अपलोड करें 📤'
  },
  en: {
    navLanguage: '🌐 1. Select Language',
    navLogin: '🔐 2. Sign In Portal',
    navDashboard: '📊 3. Main Dashboard',
    navValidation: '✅ 5-Layer Validation',
    navDisputes: '🗺️ Dispute Resolver Map',
    navScan: '📷 OCR & QR Scanner',

    langBadge: 'Accessible Language Portal',
    langTitle: '🏛️ BhumiSetu Portal',
    langSubtitle: 'Please select your native regional language first',
    langAudioTitle: 'Listen Audio Instructions (Voice Help)',
    langAudioSub: 'Click here to hear step-by-step guidance',
    langProceedBtn: 'Proceed to Login Portal ➔',

    loginBadge: 'Official Government Portal',
    loginTitle: 'BhumiSetu Official Access Portal',
    loginSub: 'Revenue Department & Citizen Access System',
    loginRoleLabel: 'Select Official Designation / Role:',
    loginPhoneLabel: 'Registered Mobile Phone (India +91):',
    loginOtpSentTitle: '📲 OTP Sent via SMS',
    loginOtpSentNotice: 'An OTP has been dispatched to your mobile phone handset via SMS.',
    loginEnterOtpLabel: 'Enter 6-Digit SMS OTP Code:',
    loginSendOtpBtn: 'Send Login OTP Verification Code 📩',
    loginVerifyOtpBtn: 'Verify OTP & Access Portal ✅',

    dashTitle: 'BhumiSetu Official Revenue Dashboard',
    dashSub: 'Digital Land Record Digitization & Validation Overview',
    dashTotalRecords: 'Total Digitized Records',
    dashActiveDisputes: 'Active Boundary Disputes',
    dashFraudAlerts: 'AI Fraud Anomaly Alerts',
    dashAiAccuracy: 'AI Extraction Accuracy',
    dashRecentMutations: 'Recent Title Mutation Requests',
    dashQuickActions: 'Quick Management Actions',

    valTitle: '5-Layer Automated Record Validation Queue',
    valSub: 'Cross-registry verification & AI anomaly detection',
    valApproveBtn: 'Approve Title Record ✅',
    valFlagBtn: 'Flag for Audit ⚠️',

    dispTitle: 'PostGIS Cadastral Dispute Solver',
    dispSub: 'Spatial boundary overlap & hearing scheduler',
    dispScheduleHearing: 'Schedule Patwari Hearing',

    scanTitle: 'SmartScan: Document OCR & ULPIN Reader',
    scanSub: 'Extract land deed parameters automatically',
    scanUploadBtn: 'Upload Document 📤'
  },
  mr: {
    navLanguage: '🌐 १. भाषा निवडा',
    navLogin: '🔐 २. प्रवेश पोर्टल',
    navDashboard: '📊 ३. मुख्य डॅशबोर्ड',
    navValidation: '✅ ५-स्तरीय पडताळणी',
    navDisputes: '🗺️ विवाद निवारण नकाशा',
    navScan: '📷 ओसीआर व क्यूआर स्कॅनर',

    langBadge: 'सुलभ भाषा निवड पोर्टल',
    langTitle: '🏛️ भूमीसेतू (BhumiSetu)',
    langSubtitle: 'कृपया प्रथम तुमची मातृभाषा निवडा',
    langAudioTitle: 'ऐकून भाषा निवडा (व्हॉइस मदत)',
    langAudioSub: 'मार्गदर्शन ऐकण्यासाठी येथे क्लिक करा',
    langProceedBtn: 'पुढे जा (प्रवेश पोर्टल) ➔',

    loginBadge: 'शासकीय महसूल पोर्टल',
    loginTitle: 'भूमीसेतू अधिकृत प्रवेश पोर्टल',
    loginSub: 'महसूल विभाग अधिकारी व नागरिक पोर्टल',
    loginRoleLabel: 'पदनाम / श्रेणी निवडा:',
    loginPhoneLabel: 'नोंदणीकृत मोबाईल नंबर (भारत +91):',
    loginOtpSentTitle: '📲 ओटीपी मोबाईलवर पाठवला',
    loginOtpSentNotice: 'ओटीपी तुमच्या मोबाईलवर मेसेजद्वारे पाठवला आहे.',
    loginEnterOtpLabel: '६ अंकी ओटीपी टाका:',
    loginSendOtpBtn: 'ओटीपी मिळवा 📩',
    loginVerifyOtpBtn: 'सत्यापित करा आणि डॅशबोर्डवर जा ✅',

    dashTitle: 'भूमीसेतू महसूल विभाग डॅशबोर्ड',
    dashSub: 'जमीन अभिलेख डिजिटल पडताळणी स्थिती',
    dashTotalRecords: 'एकूण नोंदणीकृत अभिलेख',
    dashActiveDisputes: 'सक्रिय सीमा वाद',
    dashFraudAlerts: 'फसवणूक इशारे',
    dashAiAccuracy: 'एआय अचूकता दर',
    dashRecentMutations: 'नवीन फेरफार अर्ज',
    dashQuickActions: 'जलद कृती',

    valTitle: '५-स्तरीय स्वयंचलित पडताळणी यादी',
    valSub: 'महसूल विभाग क्रॉस-रजिस्ट्री तपासणी',
    valApproveBtn: 'अभिलेख मंजूर करा ✅',
    valFlagBtn: 'तपासणीसाठी चिन्हांकित करा ⚠️',

    dispTitle: 'जीआयएस सीमा व फेरफार वाद निवारण',
    dispSub: 'पटवारी सुनावणी नियोजक',
    dispScheduleHearing: 'सुनावणी वेळ निश्चित करा',

    scanTitle: 'स्मार्टस्कॅन: दस्तऐवज ओसीआर',
    scanSub: 'सातबारा व खरेदीखत माहिती निष्कर्षण',
    scanUploadBtn: 'कागदपत्र अपलोड करा 📤'
  },
  ta: {
    navLanguage: '🌐 1. மொழியைத் தேர்ந்தெடுக்கவும்',
    navLogin: '🔐 2. உள்நுழைவு',
    navDashboard: '📊 3. முகப்பு பலகை',
    navValidation: '✅ 5-அடுக்கு சரிபார்ப்பு',
    navDisputes: '🗺️ எல்லைச் சிக்கல் வரைபடம்',
    navScan: '📷 ஆவண ஸ்கேனர்',

    langBadge: 'எளிய மொழி போர்டல்',
    langTitle: '🏛️ பூமிசேது (BhumiSetu)',
    langSubtitle: 'முதலில் உங்கள் தாய்மொழியைத் தேர்ந்தெடுக்கவும்',
    langAudioTitle: 'குரல் வழிமுறை (ஒலி உதவி)',
    langAudioSub: 'வழிகாட்டலைக் கேட்க கிளிக் செய்யவும்',
    langProceedBtn: 'முன்னேறவும் (உள்நுழைவு) ➔',

    loginBadge: 'அரசு வருவாய்த்துறை போர்டல்',
    loginTitle: 'பூமிசேது அதிகாரப்பூர்வ உள்நுழைவு',
    loginSub: 'வருவாய்த்துறை மற்றும் குடிமக்கள் போர்டல்',
    loginRoleLabel: 'பதவியைத் தேர்ந்தெடுக்கவும்:',
    loginPhoneLabel: 'கைபேசி எண் (இந்தியா +91):',
    loginOtpSentTitle: '📲 OTP அனுப்பப்பட்டது',
    loginOtpSentNotice: 'OTP உங்கள் கைபேசிக்கு குறுஞ்செய்தியாக அனுப்பப்பட்டுள்ளது.',
    loginEnterOtpLabel: '6 இலக்க OTP ஐ உள்ளிடவும்:',
    loginSendOtpBtn: 'OTP பெறுக 📩',
    loginVerifyOtpBtn: 'சரிபார்த்து நுழையவும் ✅',

    dashTitle: 'பூமிசேது முதன்மை நிர்வாக பலகை',
    dashSub: 'நில ஆவணங்கள் மற்றும் சரிபார்ப்பு நிலை',
    dashTotalRecords: 'மொத்த நில ஆவணங்கள்',
    dashActiveDisputes: 'செயலில் உள்ள எல்லைச் சிக்கல்கள்',
    dashFraudAlerts: 'மோசடி எச்சரிக்கைகள்',
    dashAiAccuracy: 'AI துல்லிய விகிதம்',
    dashRecentMutations: 'சமீபத்திய பெயர் மாற்ற விண்ணப்பங்கள்',
    dashQuickActions: 'விரைவு நடவடிக்கைகள்',

    valTitle: '5-அடுக்கு தானியங்கி ஆவண சரிபார்ப்பு',
    valSub: 'அரசு பதிவேடுகள் சரிபார்ப்பு',
    valApproveBtn: 'ஆவணத்தை ஒப்புதல் செய் ✅',
    valFlagBtn: 'ஆய்வுக்கு அனுப்பு ⚠️',

    dispTitle: 'நில எல்லைச் சிக்கல் தீர்வு வரைபடம்',
    dispSub: 'கிராம நிர்வாக அலுவலர் விசாரணை',
    dispScheduleHearing: 'விசாரணை நேரம் ஒதுக்கு',

    scanTitle: 'ஸ்மார்ட்ஸ்கேன்: ஆவண OCR',
    scanSub: 'நிலப் பட்டா விவரங்கள் பிரித்தெடுத்தல்',
    scanUploadBtn: 'ஆவணத்தைப் பதிவேற்று 📤'
  },
  te: {
    navLanguage: '🌐 1. భాషను ఎంచుకోండి',
    navLogin: '🔐 2. లాగిన్ పోర్టల్',
    navDashboard: '📊 3. ప్రధాన డాష్‌బోర్డ్',
    navValidation: '✅ 5-అంచెల ధృవీకరణ',
    navDisputes: '🗺️ వివాద పరిష్కార మ్యాప్',
    navScan: '📷 OCR & QR స్కానర్',

    langBadge: 'సులభమైన భాషా పోర్టల్',
    langTitle: '🏛️ భూమిసేతు (BhumiSetu)',
    langSubtitle: 'దయచేసి మొదట మీ మాతృభాషను ఎంచుకోండి',
    langAudioTitle: 'వాయిస్ సహాయం (ఆడియో మార్గదర్శకత్వం)',
    langAudioSub: 'సూచనలు వినడానికి ఇక్కడ క్లిక్ చేయండి',
    langProceedBtn: 'ముందుకు సాగండి (లాగిన్) ➔',

    loginBadge: 'అధికారిక రెవెన్యూ పోర్టల్',
    loginTitle: 'భూమిసేతు అధికారిక లాగిన్',
    loginSub: 'రెవెన్యూ శాఖ & పౌరుల పోర్టల్',
    loginRoleLabel: 'హోదాను ఎంచుకోండి:',
    loginPhoneLabel: 'మొబైల్ సంఖ్య (భారత్ +91):',
    loginOtpSentTitle: '📲 OTP పంపబడింది',
    loginOtpSentNotice: 'మీ మొబైల్ సంఖ్యకు SMS ద్వారా OTP పంపబడింది.',
    loginEnterOtpLabel: '6 అంకెల OTP ని నమోదు చేయండి:',
    loginSendOtpBtn: 'OTP పొందండి 📩',
    loginVerifyOtpBtn: 'ధృవీకరించి ప్రవేశించండి ✅',

    dashTitle: 'భూమిసేతు ప్రధాన రెవెన్యూ డాష్‌బోర్డ్',
    dashSub: 'డిజిటల్ భూమి రికార్డులు & పరిశీలన',
    dashTotalRecords: 'మొత్తం రికార్డులు',
    dashActiveDisputes: 'సరిహద్దు వివాదాలు',
    dashFraudAlerts: 'మోసపూరిత హెచ్చరికలు',
    dashAiAccuracy: 'AI ఖచ్చితత్వం',
    dashRecentMutations: 'ఇటీవలి హక్కుల మార్పిడి దరఖాస్తులు',
    dashQuickActions: 'త్వరిత చర్యలు',

    valTitle: '5-అంచెల స్వయంచాలక రికార్డు ధృవీకరణ',
    valSub: 'ప్రభుత్వ రిజిస్ట్రీల పరిశీలన',
    valApproveBtn: 'రికార్డు ఆమోదించు ✅',
    valFlagBtn: 'పరిశీలనకు పంపు ⚠️',

    dispTitle: 'భూమి సరిహద్దు వివాద పరిష్కారం',
    dispSub: 'విచారణ సమయం కేటాయింపు',
    dispScheduleHearing: 'విచారణ షెడ్యూల్ చేయండి',

    scanTitle: 'స్మార్ట్‌స్కాన్: డాక్యుమెంట్ OCR',
    scanSub: 'భూమి పత్రాల వివరాల నమోదు',
    scanUploadBtn: 'పత్రం అప్‌లోడ్ చేయండి 📤'
  },
  bn: {
    navLanguage: '🌐 ১. ভাষা নির্বাচন',
    navLogin: '🔐 ২. সাইন ইন পোর্টাল',
    navDashboard: '📊 ৩. প্রধান ড্যাশবোর্ড',
    navValidation: '✅ ৫-স্তরীয় যাচাইকরণ',
    navDisputes: '🗺️ বিরোধ নিষ্পত্তি মানচিত্র',
    navScan: '📷 ওসিআর ও কিউআর স্ক্যানার',

    langBadge: 'সহজ ভাষা নির্বাচন পোর্টাল',
    langTitle: '🏛️ ভূমিসেতু (BhumiSetu)',
    langSubtitle: 'প্রথমে আপনার পছন্দের ভাষা নির্বাচন করুন',
    langAudioTitle: 'শুনে ভাষা নির্বাচন করুন (অডিও সহায়তা)',
    langAudioSub: 'নির্দেশ শুনতে এখানে ক্লিক করুন',
    langProceedBtn: 'এগিয়ে যান (লগ ইন পোর্টাল) ➔',

    loginBadge: 'সরকারি রাজস্ব পোর্টাল',
    loginTitle: 'ভূমিসেতু অফিশিয়াল লগ ইন',
    loginSub: 'রাজস্ব বিভাগ ও নাগরিক এক্সেস পোর্টাল',
    loginRoleLabel: 'পদবী নির্বাচন করুন:',
    loginPhoneLabel: 'নিবন্ধিত মোবাইল নম্বর (ভারত +91):',
    loginOtpSentTitle: '📲 ওটিপি পাঠানো হয়েছে',
    loginOtpSentNotice: 'আপনার মোবাইল নম্বরে এসএমএস এর মাধ্যমে ওটিপি পাঠানো হয়েছে।',
    loginEnterOtpLabel: '৬ সংখ্যার ওটিপি লিখুন:',
    loginSendOtpBtn: 'ওটিপি কোড পান 📩',
    loginVerifyOtpBtn: 'যাচাই করুন ও ড্যাশবোর্ডে যান ✅',

    dashTitle: 'ভূমিসেতু প্রধান রাজস্ব ড্যাশবোর্ড',
    dashSub: 'ডিজিটাল জমির রেকর্ড ও এআই যাচাইকরণ চিত্র',
    dashTotalRecords: 'মোট ডিজিটাল রেকর্ড',
    dashActiveDisputes: 'সক্রিয় সীমানা বিরোধ',
    dashFraudAlerts: 'জালিয়াতি স সতর্কবার্তা',
    dashAiAccuracy: 'এআই নির্ভুলতা হার',
    dashRecentMutations: 'সাম্প্রতিক নামজারি আবেদন',
    dashQuickActions: 'দ্রুত পদক্ষেপ',

    valTitle: '৫-স্তরীয় স্বয়ংক্রিয় রেকর্ড যাচাইকরণ',
    valSub: 'সরকারি তথ্যভান্ডার ও এআই পরীক্ষা',
    valApproveBtn: 'রেকর্ড অনুমোদন করুন ✅',
    valFlagBtn: 'পরীক্ষার জন্য চিহ্নিত করুন ⚠️',

    dispTitle: 'সীমানা বিরোধ ও মিউটেশন নিষ্পত্তিকারী',
    dispSub: 'তহশিলদার ও পাটোয়ারী শুনানি',
    dispScheduleHearing: 'শুনানির সময় নির্ধারণ করুন',

    scanTitle: 'স্মার্টস্ক্যান: দলিল ওসিআর',
    scanSub: 'জমির দলিলের তথ্য নিষ্কাশন',
    scanUploadBtn: 'নথি আপলোড করুন 📤'
  }
};

interface WebLanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: WebTranslations;
}

const WebLanguageContext = createContext<WebLanguageContextType>({
  lang: 'hi',
  setLang: () => {},
  t: WEB_TRANSLATIONS.hi,
});

export const WebLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageCode>('hi');

  useEffect(() => {
    const saved = localStorage.getItem('bhumisetu_web_lang') as LanguageCode;
    if (saved && WEB_TRANSLATIONS[saved]) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    localStorage.setItem('bhumisetu_web_lang', newLang);
  };

  const t = WEB_TRANSLATIONS[lang] || WEB_TRANSLATIONS.hi;

  return (
    <WebLanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </WebLanguageContext.Provider>
  );
};

export const useWebLanguage = () => useContext(WebLanguageContext);
