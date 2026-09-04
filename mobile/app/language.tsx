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

export default function LanguageScreen() {
  const router = useRouter();
  const { lang, setLang, t } = useLanguage();

  const handleSelectLang = (code: LanguageCode) => {
    setLang(code);
  };

  const handleContinue = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏛️ भूमिसेतु (BhumiSetu)</Text>
          <Text style={styles.title}>{t.step1Title}</Text>
          <Text style={styles.subtitle}>{t.step1Sub}</Text>
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

      {/* Bottom Save & Return Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>भाषा लागू करें / Save & Return ➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 20, paddingBottom: 100 },
  header: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  logo: { fontSize: 24, fontWeight: 'bold', color: '#1e40af', marginBottom: 6 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center' },
  speakerBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1.5, padding: 12, borderRadius: 14, marginBottom: 20, gap: 12 },
  speakerIcon: { fontSize: 24 },
  speakerTitle: { fontSize: 13, fontWeight: 'bold', color: '#1e40af' },
  speakerSub: { fontSize: 11, color: '#3b82f6', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderWidth: 2, borderRadius: 16, padding: 16, alignItems: 'center', elevation: 2, position: 'relative' },
  cardSelected: { borderColor: '#2563eb', backgroundColor: '#f0f6ff' },
  flag: { fontSize: 28, marginBottom: 6 },
  langName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  langNameSelected: { color: '#1e40af' },
  englishName: { fontSize: 12, color: '#64748b', marginTop: 2 },
  promptText: { fontSize: 10, color: '#94a3b8', marginTop: 6, textAlign: 'center' },
  checkBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#2563eb', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  checkText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', padding: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  continueBtn: { backgroundColor: '#1e40af', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  continueBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});
