import React, { createContext, useContext, useState } from 'react';

export type LanguageCode = 'hi' | 'en' | 'mr' | 'ta' | 'te' | 'bn';

export interface Translations {
  step1Badge: string;
  step1Title: string;
  step1Sub: string;
  step1VoiceTitle: string;
  step1VoiceSub: string;
  step1ProceedBtn: string;
  
  step2Badge: string;
  loginTab: string;
  registerTab: string;
  roleChoose: string;
  roleFarmer: string;
  roleHomeowner: string;
  roleShopkeeper: string;
  phoneLabel: string;
  getOtpBtn: string;
  verifyOtpBtn: string;
  enterOtpLabel: string;
  smsSentNotice: string;
  smsReceivedAlert: string;
  fullNameLabel: string;
  stateLabel: string;
  aadhaarLabel: string;
  registerOtpBtn: string;
  completeRegisterBtn: string;
  hasAccountLink: string;
  noAccountLink: string;
  quickDemoHeader: string;

  step3Badge: string;
  portalTitle: string;
  userBadge: string;
  laymanActiveTitle: string;
  laymanActiveSub: string;
  laymanLegalTitle: string;
  laymanLegalSub: string;
  linkedAccountsHeader: string;
  scanDocBtn: string;
  scanDocSub: string;
  myDocsBtn: string;
  myDocsSub: string;
  myPropertiesHeader: string;
  plot1Title: string;
  plot1Badge: string;
  plot1Area: string;
  plot1Tip: string;
  plot2Title: string;
  plot2Badge: string;
  plot2Tip: string;
  transferRequestsHeader: string;
  transferReqTitle: string;
  transferReqSub: string;
  transferReqTip: string;
  changeLangBtn: string;
  signOutBtn: string;
}

const TRANSLATIONS: Record<LanguageCode, Translations> = {
  hi: {
    step1Badge: 'चरण 1 • 🌐 भाषा का चयन (LANGUAGE SELECTION)',
    step1Title: 'अपनी भाषा का चयन करें',
    step1Sub: 'अपनी पसंदीदा भाषा में भूमिसेतु का उपयोग करें',
    step1VoiceTitle: 'सुनकर भाषा चुनें (ऑडियो सहायता)',
    step1VoiceSub: 'निर्देश सुनने के लिए यहां टैप करें',
    step1ProceedBtn: 'आगे बढ़ें (साइन इन व पंजीकरण) ➔',
    
    step2Badge: 'चरण 2 • 🔐 साइन इन एवं पंजीकरण (AUTH PORTAL)',
    loginTab: '🔐 साइन इन (Sign In)',
    registerTab: '📝 नया पंजीकरण (Register)',
    roleChoose: 'अपनी श्रेणी चुनें (Select Profile):',
    roleFarmer: '🌾 किसान (Farmer)',
    roleHomeowner: '🏡 मकान मालिक (Homeowner)',
    roleShopkeeper: '🏪 दुकानदार (Shopkeeper)',
    phoneLabel: 'मोबाइल नंबर दर्ज करें (10 अंक):',
    getOtpBtn: 'OTP कोड प्राप्त करें (Get SMS OTP) 📩',
    verifyOtpBtn: 'OTP सत्यापित करें और लॉगिन करें ✅',
    enterOtpLabel: '6-अंकों का OTP कोड दर्ज करें:',
    smsSentNotice: '📩 OTP आपके मोबाइल नंबर पर SMS द्वारा भेज दिया गया है। कृपया अपने फोन का मैसेज देखें।',
    smsReceivedAlert: '📩 एसएमएस प्राप्त:',
    fullNameLabel: 'पूरा नाम:',
    stateLabel: 'राज्य:',
    aadhaarLabel: 'आधार नंबर (वैकल्पिक eKYC):',
    registerOtpBtn: 'पंजीकरण OTP प्राप्त करें 📩',
    completeRegisterBtn: 'पंजीकरण पूर्ण करें और प्रवेश करें ✅',
    hasAccountLink: 'पहले से खाता है? साइन इन करें ➔',
    noAccountLink: 'खाता नहीं है? नया पंजीकरण करें ➔',
    quickDemoHeader: '⚡ त्वरित परीक्षण लॉगिन (Quick Demo):',

    step3Badge: 'चरण 3 • 🏛️ भूमिसेतु नागरिक डैशबोर्ड',
    portalTitle: 'भूमिसेतु (BhumiSetu)',
    userBadge: 'नागरिक पोर्टल • रमेश कुमार (किसान 🌾)',
    laymanActiveTitle: '💡 सरल भाषा (Layman Mode) सक्रिय',
    laymanActiveSub: 'राजस्व विभाग के कठिन शब्दों को सरल बोलचाल में समझाया गया है',
    laymanLegalTitle: '📜 आधिकारिक राजस्व शब्द (Legal Terms) सक्रिय',
    laymanLegalSub: 'खसरा, खतौनी, दाखिल-खारिज और अधिकार अभिलेख प्रदर्शित',
    linkedAccountsHeader: '🔗 जुड़े हुए सरकारी खाते (Linked Portals)',
    scanDocBtn: '📷 दस्तावेज़ स्कैन करें',
    scanDocSub: 'कैमरा व क्यूआर स्कैनर',
    myDocsBtn: '📜 मेरे भूमि दस्तावेज़',
    myDocsSub: 'डिजीलॉकर प्रमाणित प्रति',
    myPropertiesHeader: '🏠 मेरे पंजीकृत भूखंड (2)',
    plot1Title: 'कृषि भूमि भूखंड — रामपुर कलां',
    plot1Badge: 'खसरा #45/12 (Field Plot #45/12)',
    plot1Area: 'क्षेत्रफल: ~0.5 एकड़ (2.5 बीघा / 2,107 वर्गमी)',
    plot1Tip: '💡 खसरा (Khasra) आपकी जमीन के भूखंड का सरकारी पहचान नंबर है।',
    plot2Title: 'पैतृक भूमि हिस्सा (संयुक्त स्वामित्व)',
    plot2Badge: 'खतौनी #78 (Ownership Certificate #78)',
    plot2Tip: '💡 खतौनी (Khatauni) सरकारी रजिस्टर में आपके भूमि मालिकाना हक का प्रमाण है।',
    transferRequestsHeader: '📑 मेरे नाम नामांतरण आवेदन (Mutation)',
    transferReqTitle: 'दाखिल-खारिज / नामांतरण आवेदन #MUT-99',
    transferReqSub: '15 फरवरी 2026 को प्रस्तुत • तहसीलदार सत्यापन जारी',
    transferReqTip: '💡 दाखिल-खारिज (Mutation) जमीन खरीद/बिक्री के बाद नए मालिक का नाम दर्ज करने की प्रक्रिया है।',
    changeLangBtn: '🌐 भाषा बदलें (Change Language)',
    signOutBtn: '🔒 लॉग आउट (Sign Out)'
  },
  en: {
    step1Badge: 'STEP 1 OF 3 • 🌐 LANGUAGE SELECTION',
    step1Title: 'Select Your Preferred Language',
    step1Sub: 'Use BhumiSetu in your native regional language',
    step1VoiceTitle: 'Listen Voice Instructions (Audio Help)',
    step1VoiceSub: 'Tap here to hear step-by-step audio prompt',
    step1ProceedBtn: 'Proceed to Sign In & Registration ➔',

    step2Badge: 'STEP 2 OF 3 • 🔐 SIGN IN & REGISTRATION',
    loginTab: '🔐 Sign In',
    registerTab: '📝 Register',
    roleChoose: 'Select Your Citizen Profile Type:',
    roleFarmer: '🌾 Farmer',
    roleHomeowner: '🏡 Homeowner',
    roleShopkeeper: '🏪 Shopkeeper',
    phoneLabel: 'Enter Mobile Phone Number (10 Digits):',
    getOtpBtn: 'Get SMS OTP Verification Code 📩',
    verifyOtpBtn: 'Verify OTP & Log In ✅',
    enterOtpLabel: 'Enter 6-Digit OTP Code:',
    smsSentNotice: '📩 OTP has been sent via SMS to your mobile phone. Please check your SMS inbox.',
    smsReceivedAlert: '📩 SMS RECEIVED:',
    fullNameLabel: 'Full Name:',
    stateLabel: 'State / Union Territory:',
    aadhaarLabel: 'Aadhaar Number (Optional eKYC):',
    registerOtpBtn: 'Send Registration OTP 📩',
    completeRegisterBtn: 'Complete Registration & Access App ✅',
    hasAccountLink: 'Already have an account? Sign In ➔',
    noAccountLink: "Don't have an account? Register Now ➔",
    quickDemoHeader: '⚡ Quick Demo Instant Sign-In:',

    step3Badge: 'STEP 3 OF 3 • 🏛️ BHUMISETU CITIZEN DASHBOARD',
    portalTitle: 'BhumiSetu Citizen Portal',
    userBadge: 'Citizen Portal • Ramesh Kumar (Farmer 🌾)',
    laymanActiveTitle: '💡 Layman Mode (Simple Language) Active',
    laymanActiveSub: 'Complex legal revenue terms are explained in simple everyday language',
    laymanLegalTitle: '📜 Official Revenue Department Terms Active',
    laymanLegalSub: 'Displaying official Khasra, Khatauni, and Mutation terminology',
    linkedAccountsHeader: '🔗 Linked Government Portals',
    scanDocBtn: '📷 Scan Document',
    scanDocSub: 'Full Camera & QR Scanner',
    myDocsBtn: '📜 My Land Records',
    myDocsSub: 'DigiLocker Certified Copy',
    myPropertiesHeader: '🏠 My Registered Land Parcels (2)',
    plot1Title: 'Agricultural Plot — Rampur Kalan',
    plot1Badge: 'Field Plot survey #45/12 (Khasra)',
    plot1Area: 'Area: ~0.5 Acres (2.5 Bigha / 2,107 sqm)',
    plot1Tip: '💡 Khasra is the specific survey plot number assigned to your agricultural land.',
    plot2Title: 'Ancestral Property Share (Joint Ownership)',
    plot2Badge: 'Ownership Register #78 (Khatauni)',
    plot2Tip: '💡 Khatauni is the official record of rights certifying your land title ownership.',
    transferRequestsHeader: '📑 My Ownership Mutation Requests',
    transferReqTitle: 'Land Ownership Transfer Application #MUT-99',
    transferReqSub: 'Submitted 15 Feb 2026 • Under Tehsildar Verification',
    transferReqTip: '💡 Mutation (Dakhil-Kharij) updates revenue records when land title changes hands.',
    changeLangBtn: '🌐 Change Language Settings',
    signOutBtn: '🔒 Sign Out / Logout'
  },
  mr: {
    step1Badge: 'टप्पा १ • 🌐 भाषा निवड (LANGUAGE SELECTION)',
    step1Title: 'आपली भाषा निवडा',
    step1Sub: 'भूमिसेतूचा वापर तुमच्या मातृभाषेत करा',
    step1VoiceTitle: 'ऐकून भाषा निवडा (व्हॉइस मदत)',
    step1VoiceSub: 'ऑडिओ ऐकण्यासाठी येथे टॅप करा',
    step1ProceedBtn: 'पुढे जा (साइन इन आणि नोंदणी) ➔',

    step2Badge: 'टप्पा २ • 🔐 साइन इन व नोंदणी',
    loginTab: '🔐 साइन इन (Sign In)',
    registerTab: '📝 नवीन नोंदणी (Register)',
    roleChoose: 'तुमची श्रेणी निवडा:',
    roleFarmer: '🌾 शेतकरी (Farmer)',
    roleHomeowner: '🏡 घरमालक (Homeowner)',
    roleShopkeeper: '🏪 दुकानदार (Shopkeeper)',
    phoneLabel: 'मोबाईल नंबर टाका (१० अंक):',
    getOtpBtn: 'OTP मिळवा 📩',
    verifyOtpBtn: 'OTP सत्यापित करा आणि लॉगिन करा ✅',
    enterOtpLabel: '६ अंकी OTP कोड प्रविष्ट करा:',
    smsSentNotice: '📩 तुमच्या मोबाईल नंबरवर SMS द्वारे OTP पाठवला गेला आहे. कृपया फोनचा SMS तपासा.',
    smsReceivedAlert: '📩 मेसेज प्राप्त:',
    fullNameLabel: 'पूर्ण नाव:',
    stateLabel: 'राज्य:',
    aadhaarLabel: 'आधार क्रमांक (पर्यायी):',
    registerOtpBtn: 'नोंदणी OTP मिळवा 📩',
    completeRegisterBtn: 'नोंदणी पूर्ण करा आणि प्रवेश करा ✅',
    hasAccountLink: 'आधीच खाते आहे? साइन इन करा ➔',
    noAccountLink: 'खाते नाही? नवीन नोंदणी करा ➔',
    quickDemoHeader: '⚡ जलद डेमो लॉगिन:',

    step3Badge: 'टप्पा ३ • 🏛️ भूमिसेतू नागरिक डॅशबोर्ड',
    portalTitle: 'भूमीसेतू (BhumiSetu)',
    userBadge: 'नागरिक पोर्टल • रमेश कुमार (शेतकरी 🌾)',
    laymanActiveTitle: '💡 सोपी भाषा (Layman Mode) सक्रिय',
    laymanActiveSub: 'कठीण महसूल शब्द सोप्या रोजच्या भाषेत स्पष्ट केले आहेत',
    laymanLegalTitle: '📜 अधिकृत महसूल शब्द सक्रिय',
    laymanLegalSub: 'सातबारा, फेरफार आणि खाते उतारे दाखवत आहे',
    linkedAccountsHeader: '🔗 जोडलेली शासकीय खाती (Linked Portals)',
    scanDocBtn: '📷 कागदपत्र स्कॅन करा',
    scanDocSub: 'कॅमेरा व क्यूआर स्कॅनर',
    myDocsBtn: '📜 माझे जमिनीचे कागदपत्रे',
    myDocsSub: 'डिजीलॉक प्रमाणित प्रत',
    myPropertiesHeader: '🏠 माझ्या नोंदणीकृत जमिनी (२)',
    plot1Title: 'शेती जमीन — रामपूर कलान',
    plot1Badge: 'गट नंबर #४५/१२ (Khasra Plot)',
    plot1Area: 'क्षेत्रफळ: ~०.५ एकर (२.५ बीघा)',
    plot1Tip: '💡 गट नंबर (Khasra) हा तुमच्या जमिनीचा अधिकृत सर्वे क्रमांक आहे.',
    plot2Title: 'वडिलोपार्जित जमीन हिस्सा (संयुक्त मालकी)',
    plot2Badge: 'सातबारा / ८-अ #७८ (Khatauni)',
    plot2Tip: '💡 सातबारा (Khatauni) हा मालकी हक्काचा मुख्य महसुली पुरावा आहे.',
    transferRequestsHeader: '📑 माझे फेरफार अर्ज (Mutation Requests)',
    transferReqTitle: 'फेरफार अर्ज क्रमांक #MUT-99',
    transferReqSub: '१५ फेब्रुवारी २०२६ रोजी सादर • तहसील पडताळणी सुरू',
    transferReqTip: '💡 फेरफार (Mutation) म्हणजे जमीन खरेदी-विक्रीनंतर नावात बदल करण्याची प्रक्रिया.',
    changeLangBtn: '🌐 भाषा बदला (Change Language)',
    signOutBtn: '🔒 बाहेर पडा (Sign Out)'
  },
  ta: {
    step1Badge: 'படி 1 • 🌐 மொழியைத் தேர்ந்தெடுக்கவும்',
    step1Title: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    step1Sub: 'உங்கள் சொந்த மொழியில் பூமிசேதுவை பயன்படுத்தவும்',
    step1VoiceTitle: 'குரல் வழிமுறை (ஒலி உதவி)',
    step1VoiceSub: 'வழிகாட்டலைக் கேட்க இங்கே தட்டவும்',
    step1ProceedBtn: 'முன்னேறவும் (உள்நுழைவு மற்றும் பதிவு) ➔',

    step2Badge: 'படி 2 • 🔐 உள்நுழைவு மற்றும் பதிவு',
    loginTab: '🔐 உள்நுழைவு (Sign In)',
    registerTab: '📝 புதிய பதிவு (Register)',
    roleChoose: 'உங்கள் சுயவிவர வகையைத் தேர்ந்தெடுக்கவும்:',
    roleFarmer: '🌾 விவசாயி (Farmer)',
    roleHomeowner: '🏡 வீட்டு உரிமையாளர் (Homeowner)',
    roleShopkeeper: '🏪 கடைக்காரர் (Shopkeeper)',
    phoneLabel: 'கைபேசி எண்ணை உள்ளிடவும் (10 இலக்கங்கள்):',
    getOtpBtn: 'OTP பெறுக 📩',
    verifyOtpBtn: 'OTP சரிபார்த்து உள்நுழைக ✅',
    enterOtpLabel: '6 இலக்க OTP குறியீட்டை உள்ளிடவும்:',
    smsSentNotice: '📩 உங்கள் கைபேசி எண்ணிற்கு SMS மூலம் OTP அனுப்பப்பட்டுள்ளது. உங்கள் குறுஞ்செய்திகளைச் சரிபார்க்கவும்.',
    smsReceivedAlert: '📩 குறுஞ்செய்தி பெறப்பட்டது:',
    fullNameLabel: 'முழு பெயர்:',
    stateLabel: 'மாநிலம்:',
    aadhaarLabel: 'ஆதார் எண் (விருப்பத்தேர்வு):',
    registerOtpBtn: 'பதிவு OTP பெறுக 📩',
    completeRegisterBtn: 'பதிவை முடித்து நுழையவும் ✅',
    hasAccountLink: 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழையவும் ➔',
    noAccountLink: 'கணக்கு இல்லையா? பதிவு செய்யவும் ➔',
    quickDemoHeader: '⚡ விரைவு சோதனை உள்நுழைவு:',

    step3Badge: 'படி 3 • 🏛️ பூமிசேது குடிமக்கள் போர்டல்',
    portalTitle: 'பூமிசேது (BhumiSetu)',
    userBadge: 'குடிமக்கள் போர்டல் • ரமேஷ் குமார் (விவசாயி 🌾)',
    laymanActiveTitle: '💡 எளிய மொழி முறை செயலில் உள்ளது',
    laymanActiveSub: 'கடினமான வருவாய் சொற்கள் எளிய தமிழில் விளக்கப்பட்டுள்ளன',
    laymanLegalTitle: '📜 அதிகாரப்பூர்வ வருவாய் சொற்கள் செயலில் உள்ளன',
    laymanLegalSub: 'பட்டா, சிட்டா மற்றும் பிறழ்வு சொற்கள்',
    linkedAccountsHeader: '🔗 இணைக்கப்பட்ட அரசு கணக்குகள்',
    scanDocBtn: '📷 ஆவணத்தை ஸ்கேன் செய்',
    scanDocSub: 'கேமரா & QR ஸ்கேனர்',
    myDocsBtn: '📜 என் நில ஆவணங்கள்',
    myDocsSub: 'டிஜிலாக்கர் சான்றளிக்கப்பட்ட பிரதி',
    myPropertiesHeader: '🏠 எனது பதிவு செய்யப்பட்ட நிலங்கள் (2)',
    plot1Title: 'விவசாய நிலம் — ராம்பூர் கலான்',
    plot1Badge: 'சர்வே எண் #45/12 (Khasra)',
    plot1Area: 'பரப்பளவு: ~0.5 ஏக்ர (2.5 பிகா)',
    plot1Tip: '💡 சர்வே எண் (Khasra) என்பது நிலத்திற்கு அரசு ஒதுக்கிய எண்.',
    plot2Title: 'பூர்வீக நிலப் பங்கு (கூட்டு உரிமை)',
    plot2Badge: 'பட்டா எண் #78 (Khatauni)',
    plot2Tip: '💡 பட்டா (Khatauni) என்பது நில உரிமைக்கான அரசு சான்று.',
    transferRequestsHeader: '📑 எனது உரிமை மாற்ற விண்ணப்பங்கள்',
    transferReqTitle: 'நில பிறழ்வு விண்ணப்பம் #MUT-99',
    transferReqSub: '15 பிப்ரவரி 2026 சமர்ப்பிக்கப்பட்டது • வட்டாட்சியர் சரிபார்ப்பு',
    transferReqTip: '💡 பெயர் மாற்றம் (Mutation) நிலப் பரிமாற்றத்திற்குப் பின் பெயரைப் புதுப்பிக்கும் முறை.',
    changeLangBtn: '🌐 மொழியை மாற்றவும் (Change Language)',
    signOutBtn: '🔒 வெளியேறு (Sign Out)'
  },
  te: {
    step1Badge: 'దశ 1 • 🌐 భాషను ఎంచుకోండి',
    step1Title: 'మీ భాషను ఎంచుకోండి',
    step1Sub: 'మీ మాతృభాషలో భూమిసేతును ఉపయోగించండి',
    step1VoiceTitle: 'వాయిస్ సహాయం (ఆడియో మార్గదర్శకత్వం)',
    step1VoiceSub: 'సూచనలు వినడానికి ఇక్కడ నొక్కండి',
    step1ProceedBtn: 'ముందుకు సాగండి (సైన్ ఇన్ / రిజిస్టర్) ➔',

    step2Badge: 'దశ 2 • 🔐 సైన్ ఇన్ & నమోదు',
    loginTab: '🔐 సైన్ ఇన్ (Sign In)',
    registerTab: '📝 కొత్త నమోదు (Register)',
    roleChoose: 'మీ రకాన్ని ఎంచుకోండి:',
    roleFarmer: '🌾 రైతు (Farmer)',
    roleHomeowner: '🏡 ఇంటి యజమాని (Homeowner)',
    roleShopkeeper: '🏪 దుకాణదారుడు (Shopkeeper)',
    phoneLabel: 'మొబైల్ సంఖ్య నమోదు చేయండి (10 అంకెలు):',
    getOtpBtn: 'OTP పొందండి 📩',
    verifyOtpBtn: 'OTP ధృవీకరించి లాగిన్ అవ్వండి ✅',
    enterOtpLabel: '6 అంకెల OTP ని నమోదు చేయండి:',
    smsSentNotice: '📩 మీ మొబైల్ సంఖ్యకు SMS ద్వారా OTP పంపబడింది. దయచేసి మీ ఫోన్ ఇన్బాక్స్ తనిఖీ చేయండి.',
    smsReceivedAlert: '📩 SMS అందినది:',
    fullNameLabel: 'పూర్తి పేరు:',
    stateLabel: 'రాష్ట్రం:',
    aadhaarLabel: 'ఆధార్ సంఖ్య (ఐచ్ఛికం):',
    registerOtpBtn: 'నమోదు OTP పొందండి 📩',
    completeRegisterBtn: 'నమోదు పూర్తి చేసి ప్రవేశించండి ✅',
    hasAccountLink: 'ఇప్పటికే ఖాతా ఉందా? సైన్ ఇన్ చేయండి ➔',
    noAccountLink: 'ఖాతా లేదా? ఇప్పుడు నమోదు చేయండి ➔',
    quickDemoHeader: '⚡ త్వరిత డెమో లాగిన్:',

    step3Badge: 'దశ 3 • 🏛️ భూమిసేతు పౌరుల డాష్‌బోర్డ్',
    portalTitle: 'భూమిసేతు (BhumiSetu)',
    userBadge: 'పౌరుల పోర్టల్ • రమేష్ కుమార్ (రైతు 🌾)',
    laymanActiveTitle: '💡 సులభమైన భాషా విధానం క్రియాశీలంగా ఉంది',
    laymanActiveSub: 'సంక్లిష్టమైన రెవెన్యూ పదాలు రోజువారీ తెలుగులో వివరించబడ్డాయి',
    laymanLegalTitle: '📜 అధికారిక రెవెన్యూ పదాలు క్రియాశీలంగా ఉన్నాయి',
    laymanLegalSub: 'ఖస్రా, ఖాతావుని మరియు మ్యుటేషన్ పదాలు ప్రదర్శించబడుతున్నాయి',
    linkedAccountsHeader: '🔗 అనుసంధానించబడిన ప్రభుత్వ ఖాతాలు',
    scanDocBtn: '📷 పత్రాన్ని స్కాన్ చేయండి',
    scanDocSub: 'కెమెరా & QR స్కానర్',
    myDocsBtn: '📜 నా భూమి పత్రాలు',
    myDocsSub: 'డిజిలాకర్ ధృవీకరించిన ప్రతి',
    myPropertiesHeader: '🏠 నా నమోదిత భూములు (2)',
    plot1Title: 'వ్యవసాయ భూమి — రాంపూర్ కలాన్',
    plot1Badge: 'సర్వే నంబర్ #45/12 (Khasra)',
    plot1Area: 'వైశాల్యం: ~0.5 ఎకరాలు (2.5 బీఘా)',
    plot1Tip: '💡 సర్వే నంబర్ (Khasra) మీ భూమి యొక్క ప్రభుత్వ గురింపు సంఖ్య.',
    plot2Title: 'పిత్రార్జిత భూమి భాగం (ఉమ్మడి యాజమాన్యం)',
    plot2Badge: 'పట్టాదార్ పాస్‌బుక్ #78 (Khatauni)',
    plot2Tip: '💡 పట్టా (Khatauni) భూమి హక్కులకు ప్రభుత్వ ధృవీకరణ పత్రం.',
    transferRequestsHeader: '📑 నా హక్కుల మార్పిడి దరఖాస్తులు (Mutation)',
    transferReqTitle: 'మ్యుటేషన్ అప్లికేషన్ నంబర్ #MUT-99',
    transferReqSub: '15 ఫిబ్రవరి 2026న దాఖలు • తహశీల్దార్ పరిశీలనలో ఉంది',
    transferReqTip: '💡 మ్యుటేషన్ అంటే భూమి కొనుగోలు తర్వాత కొత్త యజమాని పేరును నమోదు చేసే ప్రక్రియ.',
    changeLangBtn: '🌐 భాషను మార్చండి (Change Language)',
    signOutBtn: '🔒 లాగ్ అవుట్ (Sign Out)'
  },
  bn: {
    step1Badge: 'ধাপ ১ • 🌐 ভাষা নির্বাচন (LANGUAGE SELECTION)',
    step1Title: 'আপনার পছন্দের ভাষা নির্বাচন করুন',
    step1Sub: 'আপনার মাতৃভাষায় ভূমিসেতু ব্যবহার করুন',
    step1VoiceTitle: 'শুনে ভাষা নির্বাচন করুন (অডিও সহায়তা)',
    step1VoiceSub: 'নির্দেশ শুনতে এখানে ট্যাপ করুন',
    step1ProceedBtn: 'এগিয়ে যান (সাইন ইন ও পঞ্জীকরণ) ➔',

    step2Badge: 'ধাপ ২ • 🔐 সাইন ইন ও পঞ্জীকরণ',
    loginTab: '🔐 সাইন ইন (Sign In)',
    registerTab: '📝 নতুন পঞ্জীকরণ (Register)',
    roleChoose: 'আপনার ভূমিকা বেছে নিন:',
    roleFarmer: '🌾 কৃষক (Farmer)',
    roleHomeowner: '🏡 বাড়িওয়ালা (Homeowner)',
    roleShopkeeper: '🏪 দোকানদার (Shopkeeper)',
    phoneLabel: 'মোবাইল নম্বর লিখুন (১০ সংখ্যা):',
    getOtpBtn: 'OTP কোড পান 📩',
    verifyOtpBtn: 'OTP যাচাই করুন ও লগ ইন করুন ✅',
    enterOtpLabel: '৬ সংখ্যার OTP কোড লিখুন:',
    smsSentNotice: '📩 আপনার মোবাইল নম্বরে এসএমএস এর মাধ্যমে ওটিপি পাঠানো হয়েছে। আপনার ফোন মেসেজ চেক করুন।',
    smsReceivedAlert: '📩 এসএমএস প্রাপ্তি:',
    fullNameLabel: 'সম্পূর্ণ নাম:',
    stateLabel: 'রাজ্য:',
    aadhaarLabel: 'আধারের নম্বর (ঐচ্ছিক):',
    registerOtpBtn: 'পঞ্জীকরণ OTP পান 📩',
    completeRegisterBtn: 'পঞ্জীকরণ সম্পন্ন করুন ও প্রবেশ করুন ✅',
    hasAccountLink: 'ইতিমধ্যেই অ্যাকাউন্ট আছে? সাইন ইন করুন ➔',
    noAccountLink: 'অ্যাকাউন্ট নেই? নতুন পঞ্জীকরণ করুন ➔',
    quickDemoHeader: '⚡ দ্রুত ডেমো লগ ইন:',

    step3Badge: 'ধাপ ৩ • 🏛️ ভূমিসেতু নাগরিক ড্যাশবোর্ড',
    portalTitle: 'ভূমিসেতু (BhumiSetu)',
    userBadge: 'নাগরিক পোর্টাল • রমেশ কুমার (কৃষক 🌾)',
    laymanActiveTitle: '💡 সহজ ভাষা (Layman Mode) সক্রিয়',
    laymanActiveSub: 'কঠিন আইনি শব্দগুলো সহজ ভাষায় ব্যাখ্যা করা হয়েছে',
    laymanLegalTitle: '📜 সরকারি রাজস্ব শব্দমালা সক্রিয়',
    laymanLegalSub: 'খতিয়ান, দাগ নম্বর ও মিউটেশন পরিভাষা প্রদর্শিত',
    linkedAccountsHeader: '🔗 সংযুক্ত সরকারি পোর্টাল',
    scanDocBtn: '📷 নথি স্ক্যান করুন',
    scanDocSub: 'ক্যামেরা ও কিউআর স্ক্যানার',
    myDocsBtn: '📜 আমার জমির নথি',
    myDocsSub: 'ডিজিটাল লকার সার্টিফাইড কপি',
    myPropertiesHeader: '🏠 আমার নিবন্ধিত জমি (২)',
    plot1Title: 'কৃষি জমি — রামপুর কালান',
    plot1Badge: 'দাগ নম্বর #৪৫/১২ (Khasra)',
    plot1Area: 'ক্ষেত্রফল: ~০.৫ একর (২.৫ বিঘা)',
    plot1Tip: '💡 দাগ নম্বর (Khasra) হলো আপনার জমির সরকারি সার্ভে নম্বর।',
    plot2Title: 'পৈতৃক জমির অংশ (যৌথ মালিকানা)',
    plot2Badge: 'খতিয়ান নম্বর #৭৮ (Khatauni)',
    plot2Tip: '💡 খতিয়ান (Khatauni) হলো সরকারি রেকর্ডে আপনার জমির মালিকানার প্রমাণ।',
    transferRequestsHeader: '📑 আমার নামজারি আবেদন (Mutation)',
    transferReqTitle: 'নামজারি / মিউটেশন আবেদন #MUT-99',
    transferReqSub: '১৫ ফেব্রুয়ারি ২০২৬ দাখিলকৃত • তহশিলদার যাচাইকরণ প্রক্রিয়াধীন',
    transferReqTip: '💡 নামজারি (Mutation) হলো জমি হস্তান্তরের পর নতুন মালিকের নাম নথিভুক্ত করা।',
    changeLangBtn: '🌐 ভাষা পরিবর্তন করুন (Change Language)',
    signOutBtn: '🔒 লগ আউট করুন (Sign Out)'
  }
};

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'hi',
  setLang: () => {},
  t: TRANSLATIONS.hi,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageCode>('hi');

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.hi;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
