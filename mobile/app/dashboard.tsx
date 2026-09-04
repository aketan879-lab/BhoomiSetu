import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = 'http://localhost:8000';

export default function DashboardScreen() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [laymanMode, setLaymanMode] = useState(true);
  const [digiLockerLinked, setDigiLockerLinked] = useState(true);
  const [bhulekhLinked, setBhulekhLinked] = useState(false);
  const [userRecords, setUserRecords] = useState<any[]>([]);
  const [latestStatus, setLatestStatus] = useState<'PENDING' | 'VALIDATED' | 'REJECTED'>('PENDING');

  // Poll live status from backend to update citizen
  const fetchLiveStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/records/`);
      if (res.ok) {
        const records = await res.json();
        if (records && records.length > 0) {
          // Filter records created by citizen Rakesh / USR-FARMER-01
          const userOnly = records.filter((item: any) => 
            item.digitized_by === 'USR-FARMER-01' || 
            (item.owner_name && item.owner_name.toLowerCase().includes('rakesh'))
          );

          setUserRecords(userOnly);

          if (userOnly.length > 0) {
            // Sort by updated_at or created_at descending so the most recently updated/actioned record comes FIRST
            const sorted = [...userOnly].sort((a: any, b: any) => {
              const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
              const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
              return timeB - timeA;
            });

            const latestRecord = sorted[0];
            if (latestRecord && latestRecord.validation_status) {
              setLatestStatus(latestRecord.validation_status as any);
            }
          } else {
            setLatestStatus('NONE' as any);
          }
        } else {
          setUserRecords([]);
          setLatestStatus('NONE' as any);
        }
      }
    } catch (e) {
      // Silent catch
    }
  };

  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const getLangBadgeName = () => {
    switch (lang) {
      case 'hi': return '🇮🇳 हिंदी (Hindi)';
      case 'en': return '🌐 English';
      case 'mr': return '🇮🇳 मराठी (Marathi)';
      case 'ta': return '🇮🇳 தமிழ் (Tamil)';
      case 'te': return '🇮🇳 తెలుగు (Telugu)';
      case 'bn': return '🇮🇳 বাংলা (Bengali)';
      default: return '🌐 English';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Step 3 Badge */}
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>{t.step3Badge}</Text>
        </View>

        {/* Header with Selected Language Indicator */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t.portalTitle}</Text>
            <Text style={styles.userScope}>{t.userBadge}</Text>
          </View>

          <TouchableOpacity style={styles.langBadgeBtn} onPress={() => router.push('/language')}>
            <Text style={styles.langBadgeText}>{getLangBadgeName()} ⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Layman Mode Toggle Banner */}
        <View style={styles.laymanToggleCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.laymanToggleTitle}>
              {laymanMode ? t.laymanActiveTitle : t.laymanLegalTitle}
            </Text>
            <Text style={styles.laymanToggleSub}>
              {laymanMode ? t.laymanActiveSub : t.laymanLegalSub}
            </Text>
          </View>
          <Switch 
            value={laymanMode} 
            onValueChange={setLaymanMode}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={laymanMode ? '#1e40af' : '#9ca3af'}
          />
        </View>

        {/* Government Account Linking (DigiLocker & State Portals) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t.linkedAccountsHeader}</Text>
          
          <View style={styles.accountRow}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountIcon}>🛡️</Text>
              <View>
                <Text style={styles.accountName}>DigiLocker Account</Text>
                <Text style={styles.accountSub}>
                  {digiLockerLinked ? 'Verified via Aadhaar (XXXX-XXXX-9012)' : 'Link to auto-import verified deeds'}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.linkBtn, digiLockerLinked && styles.linkedBtn]}
              onPress={() => setDigiLockerLinked(!digiLockerLinked)}
            >
              <Text style={[styles.linkBtnText, digiLockerLinked && styles.linkedBtnText]}>
                {digiLockerLinked ? 'Linked ✅' : 'Link Now'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.accountRow}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountIcon}>🏛️</Text>
              <View>
                <Text style={styles.accountName}>State Land Registry (Bhulekh)</Text>
                <Text style={styles.accountSub}>
                  {bhulekhLinked ? 'Connected to Revenue Records' : 'Sync state revenue profile'}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.linkBtn, bhulekhLinked && styles.linkedBtn]}
              onPress={() => setBhulekhLinked(!bhulekhLinked)}
            >
              <Text style={[styles.linkBtnText, bhulekhLinked && styles.linkedBtnText]}>
                {bhulekhLinked ? 'Linked ✅' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/request')}>
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionText}>Raise a Request</Text>
            <Text style={styles.actionSub}>Scan document or enter details manually</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/records')}>
            <Text style={styles.actionIcon}>📜</Text>
            <Text style={styles.actionText}>{t.myDocsBtn}</Text>
            <Text style={styles.actionSub}>{t.myDocsSub}</Text>
          </TouchableOpacity>
        </View>

        {/* My Scoped Properties Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t.myPropertiesHeader}</Text>
          
          <TouchableOpacity style={styles.propertyCard} onPress={() => router.push('/records')}>
            <View style={styles.propHeader}>
              <Text style={styles.propBadge}>{t.plot1Badge}</Text>
              <Text style={styles.statusVerified}>Verified ✅</Text>
            </View>
            <Text style={styles.propTitle}>{t.plot1Title}</Text>
            <Text style={styles.propDetail}>{t.plot1Area}</Text>
            {laymanMode && (
              <View style={styles.laymanTip}>
                <Text style={styles.laymanTipText}>{t.plot1Tip}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.propertyCard} onPress={() => router.push('/records')}>
            <View style={styles.propHeader}>
              <Text style={styles.propBadge}>{t.plot2Badge}</Text>
              <Text style={styles.statusVerified}>Verified ✅</Text>
            </View>
            <Text style={styles.propTitle}>{t.plot2Title}</Text>
            <Text style={styles.propDetail}>Joint Ownership • Harish Kumar</Text>
            {laymanMode && (
              <View style={styles.laymanTip}>
                <Text style={styles.laymanTipText}>{t.plot2Tip}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* My Requests & Mutation Status (LIVE ADMIN RESPONSE NOTIFICATION) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>{t.transferRequestsHeader}</Text>
          
          <View style={styles.requestRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.requestTitle}>{t.transferReqTitle}</Text>
              <Text style={styles.requestSub}>{t.transferReqSub}</Text>
            </View>
            {latestStatus === 'VALIDATED' ? (
              <Text style={[styles.statusPending, { backgroundColor: '#dcfce7', color: '#15803d' }]}>
                SOLVED ✅
              </Text>
            ) : latestStatus === 'REJECTED' ? (
              <Text style={[styles.statusPending, { backgroundColor: '#fee2e2', color: '#b91c1c' }]}>
                REJECTED ❌
              </Text>
            ) : (latestStatus as string) === 'NONE' ? (
              <Text style={[styles.statusPending, { backgroundColor: '#f3f4f6', color: '#6b7280' }]}>
                No Active Requests
              </Text>
            ) : (
              <Text style={styles.statusPending}>In Review 🕐</Text>
            )}
          </View>

          {/* LIVE CITIZEN DECISION NOTICE FROM TEHSILDAR ADMIN */}
          {latestStatus === 'VALIDATED' && (
            <View style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac', borderWidth: 1, padding: 12, borderRadius: 10, marginTop: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#14532d' }}>
                🎉 GOOD NEWS! Tehsildar Admin has APPROVED & SOLVED your land mutation request.
              </Text>
              <Text style={{ fontSize: 11, color: '#166534', marginTop: 4 }}>
                Dakhil-Kharij Title Entry completed in State Revenue Registry (Bhulekh).
              </Text>
            </View>
          )}

          {latestStatus === 'REJECTED' && (
            <View style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, padding: 12, borderRadius: 10, marginTop: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#991b1b' }}>
                ⚠️ ATTENTION: Tehsildar Admin reviewed your request and flagged a discrepancy.
              </Text>
              <Text style={{ fontSize: 11, color: '#b91c1c', marginTop: 4 }}>
                Your application was REJECTED. Please inspect document details or contact Tehsil office.
              </Text>
            </View>
          )}

          {(latestStatus as string) === 'NONE' && (
            <View style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb', borderWidth: 1, padding: 12, borderRadius: 10, marginTop: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#6b7280' }}>
                ℹ️ No active land digitization requests. Tap 'Raise a Request' above to submit your land details to Tehsildar Admin.
              </Text>
            </View>
          )}

          {latestStatus === 'PENDING' && laymanMode && (
            <View style={styles.laymanTip}>
              <Text style={styles.laymanTipText}>{t.transferReqTip}</Text>
            </View>
          )}

          {/* Real-time backend Sync Status Indicator */}
          <TouchableOpacity 
            style={[styles.primaryBtn, { marginTop: 12, backgroundColor: '#f3f4f6', paddingVertical: 10, borderWidth: 1, borderColor: '#e5e7eb' }]}
            onPress={fetchLiveStatus}
          >
            <Text style={{ color: '#4b5563', fontWeight: '800', fontSize: 12, textAlign: 'center' }}>
              🔄 Tap to Refresh Application Status
            </Text>
          </TouchableOpacity>
        </View>

        {/* Change Language / Logout Footer */}
        <View style={styles.footerNav}>
          <TouchableOpacity style={styles.footerBtn} onPress={() => router.push('/language')}>
            <Text style={styles.footerBtnText}>{t.changeLangBtn}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.footerBtn, { backgroundColor: '#fee2e2' }]} onPress={() => router.push('/login')}>
            <Text style={[styles.footerBtnText, { color: '#991b1b' }]}>{t.signOutBtn}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scroll: { padding: 16, paddingBottom: 40 },
  stepBadge: { alignSelf: 'center', backgroundColor: '#e0e7ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  stepBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#3730a3' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1e40af' },
  userScope: { fontSize: 11, color: '#4b5563', marginTop: 2 },
  langBadgeBtn: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  langBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#1e40af' },
  laymanToggleCard: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', borderWidth: 1, padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  laymanToggleTitle: { fontSize: 13, fontWeight: 'bold', color: '#1e40af' },
  laymanToggleSub: { fontSize: 11, color: '#3b82f6', marginTop: 2 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 16, borderColor: '#e5e7eb', borderWidth: 1, elevation: 1 },
  sectionHeader: { fontSize: 15, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  accountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  accountInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  accountIcon: { fontSize: 20 },
  accountName: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  accountSub: { fontSize: 11, color: '#6b7280', marginTop: 1 },
  linkBtn: { backgroundColor: '#1e40af', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  linkBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  linkedBtn: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#86efac' },
  linkedBtnText: { color: '#166534' },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionBtn: { flex: 1, backgroundColor: '#1e40af', padding: 14, borderRadius: 12, alignItems: 'center' },
  actionIcon: { fontSize: 24, marginBottom: 4 },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  actionSub: { color: '#93c5fd', fontSize: 10, marginTop: 2 },
  propertyCard: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 12, marginBottom: 10 },
  propHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  propBadge: { color: '#3730a3', fontSize: 11, fontWeight: 'bold', backgroundColor: '#e0e0ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusVerified: { color: '#16a34a', fontSize: 11, fontWeight: 'bold' },
  propTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginTop: 6 },
  propDetail: { fontSize: 12, color: '#4b5563', marginTop: 2 },
  requestRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestTitle: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  requestSub: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  statusPending: { color: '#d97706', fontSize: 11, fontWeight: 'bold', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  laymanTip: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', padding: 8, borderRadius: 6, marginTop: 8 },
  laymanTipText: { fontSize: 11, color: '#166534' },
  footerNav: { gap: 10, marginTop: 10 },
  footerBtn: { backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderWidth: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  footerBtnText: { fontSize: 13, fontWeight: 'bold', color: '#334155' },
  primaryBtn: { backgroundColor: '#15803d', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' }
});
