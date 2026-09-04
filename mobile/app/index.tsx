import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage, LanguageCode } from '../context/LanguageContext';

const LANGUAGES: { code: LanguageCode; name: string; englishName: string; prompt: string; flag: string }[] = [
  { code: 'hi', name: 'हिंदी', englishName: 'Hindi', prompt: 'अपनी भाषा चुनें', flag: '🇮🇳' },
  { code: 'en', name: 'English', englishName: 'English', prompt: 'Select Your Language', flag: '🌐' },
  { code: 'mr', name: 'मराठी', englishName: 'Marathi', prompt: 'आपली भाषा निवडा', flag: '🇮🇳' },
  { code: 'ta', name: 'தமிழ்', englishName: 'Tamil', prompt: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', englishName: 'Telugu', prompt: 'మీ భాషను ఎంచుకోండి', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', englishName: 'Bengali', prompt: 'আপনার ভাষা নির্বাচন করুন', flag: '🇮🇳' }
];

export default function LanguageSelectionFirstScreen() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  const handleSelectLang = (code: LanguageCode) => {
    setLang(code);
    router.push('/login');
  };

  const handleContinueToLogin = () => {
    // Navigates to Sign In / Registration Page (2nd Screen)
    router.push('/login');
  };


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Step Indicator Header */}
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{t.step1Badge}</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.logo}>🏛️ भूमिसेतु (BhumiSetu)</Text>
          <Text style={styles.title}>{t.step1Title}</Text>
          <Text style={styles.subtitle}>{t.step1Sub}</Text>
        </View>

        {/* Low-Bandwidth & Offline Resilience Badge */}
        <View style={styles.lowBandwidthBadge}>
          <Text style={styles.lowBandwidthText}>⚡ 2G / 3G Low-Bandwidth & Offline Ready</Text>
        </View>


        {/* Audio Speaker Prompt for Uneducated Users */}
        <TouchableOpacity 
          style={styles.speakerBanner} 
          onPress={() => alert(`🔊 ${t.step1VoiceTitle}: ${t.step1VoiceSub}`)}
        >
          <Text style={styles.speakerIcon}>🔊</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.speakerTitle}>{t.step1VoiceTitle}</Text>
            <Text style={styles.speakerSub}>{t.step1VoiceSub}</Text>
          </View>
        </TouchableOpacity>

        {/* Language Selection Grid */}
        <View style={styles.grid}>
          {LANGUAGES.map((item) => (
            <TouchableOpacity
              key={item.code}
              style={[
                styles.card,
                lang === item.code && styles.cardSelected
              ]}
              onPress={() => handleSelectLang(item.code)}
            >
              <Text style={styles.flag}>{item.flag}</Text>
              <Text style={[styles.langName, lang === item.code && styles.langNameSelected]}>
                {item.name}
              </Text>
              <Text style={styles.englishName}>{item.englishName}</Text>
              <Text style={styles.promptText}>{item.prompt}</Text>
              {lang === item.code && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Proceed Button -> Leads to Sign In / Register (Screen 2) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinueToLogin}>
          <Text style={styles.continueBtnText}>{t.step1ProceedBtn}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 20, paddingBottom: 100 },
  stepBadge: { alignSelf: 'center', backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 6, marginBottom: 8 },
  stepBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#3730a3' },
  header: { alignItems: 'center', marginBottom: 16 },
  logo: { fontSize: 24, fontWeight: 'bold', color: '#1e40af', marginBottom: 4 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center' },
  lowBandwidthBadge: { alignSelf: 'center', backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  lowBandwidthText: { fontSize: 10, fontWeight: '800', color: '#15803d' },
  speakerBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1.5, padding: 12, borderRadius: 14, marginBottom: 18, gap: 12 },

  speakerIcon: { fontSize: 24 },
  speakerTitle: { fontSize: 13, fontWeight: 'bold', color: '#1e40af' },
  speakerSub: { fontSize: 11, color: '#3b82f6', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderWidth: 2, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2, position: 'relative' },
  cardSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  flag: { fontSize: 28, marginBottom: 4 },
  langName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  langNameSelected: { color: '#1e40af' },
  englishName: { fontSize: 12, color: '#64748b', marginTop: 2 },
  promptText: { fontSize: 10, color: '#94a3b8', marginTop: 4, textAlign: 'center' },
  checkBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#2563eb', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  checkText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  continueBtn: { backgroundColor: '#1e40af', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  continueBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});
