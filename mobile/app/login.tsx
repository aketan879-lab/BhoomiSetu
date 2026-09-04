import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = 'http://localhost:8000';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  // Citizen Credentials state (pre-filled with Rakesh / 1234567890)
  const [username, setUsername] = useState('Rakesh');
  const [password, setPassword] = useState('1234567890');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Citizen Login via Backend API
  const handleLogin = async () => {
    setErrorMessage('');
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.detail || 'Invalid username or password.');
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push('/dashboard');
    } catch (err: any) {
      setLoading(false);
      // Offline fallback
      router.push('/dashboard');
    }
  };

  const fillRakeshCreds = () => {
    setUsername('Rakesh');
    setPassword('1234567890');
    setErrorMessage('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Step Indicator Header */}
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{t.step2Badge}</Text>
      </View>

      {/* Top Title Banner */}
      <View style={styles.header}>
        <Text style={styles.logo}>🏛️ {t.portalTitle}</Text>
        <Text style={styles.subTitle}>🌾 Citizen & Farmer Mobile App</Text>
      </View>

      {/* Audio Prompt Guidance for semi-literate users */}
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

      {/* Citizen Credentials Box */}
      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>🔑 CITIZEN LOGIN CREDENTIALS</Text>
        
        <TouchableOpacity style={styles.credCard} onPress={fillRakeshCreds}>
          <Text style={styles.credLabel}>🌾 Registered Citizen User (Rakesh)</Text>
          <Text style={styles.credDetail}>Username: Rakesh</Text>
          <Text style={styles.credDetail}>Password: 1234567890</Text>
        </TouchableOpacity>
      </View>

      {/* Error Banner */}
      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
        </View>
      ) : null}

      {/* CITIZEN LOGIN FORM */}
      <View style={styles.card}>
        <Text style={styles.cardHeaderTitle}>Citizen Sign In / नागरिक प्रवेश</Text>

        <Text style={styles.label}>Username / उपयोगकर्ता नाम</Text>
        <TextInput 
          style={styles.input} 
          value={username} 
          onChangeText={setUsername}
          placeholder="e.g. Rakesh"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password / पासवर्ड</Text>
        <TextInput 
          style={styles.input} 
          value={password} 
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <TouchableOpacity 
          style={[styles.primaryBtn, loading && styles.btnDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.primaryBtnText}>Sign In / प्रवेश करें 🌾</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  stepBadge: {
    alignSelf: 'center',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  stepBadgeText: {
    color: '#1e40af',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0f172a',
  },
  subTitle: {
    fontSize: 13,
    color: '#15803d',
    marginTop: 2,
    fontWeight: '800',
  },
  speakerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  speakerIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  speakerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  speakerSub: {
    fontSize: 11,
    color: '#2563eb',
    marginTop: 2,
  },
  demoBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  credCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 8,
    padding: 10,
  },
  credLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#14532d',
    marginBottom: 4,
  },
  credDetail: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#334155',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 14,
  },
  primaryBtn: {
    backgroundColor: '#166534',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 12,
    fontWeight: '700',
  },
});
