import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { mockRecords, mockValidationReports } from '../../lib/mockData';

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [laymanMode, setLaymanMode] = useState(true);

  const record = mockRecords.find(r => r.id === id) || mockRecords[0];
  const report = mockValidationReports[id as string] || mockValidationReports['LR-UP-001'];

  const getStatusColor = (status: string) => {
    if (status === 'Verified' || status === 'Validated') return '#16a34a';
    if (status === 'Requires Manual Review' || status === 'Flagged') return '#f97316';
    if (status === 'Fail') return '#ef4444';
    return '#6b7280';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Layman Mode Bar */}
      <View style={styles.laymanBar}>
        <Text style={styles.laymanBarText}>
          {laymanMode ? '💡 Layman Explanations (सरल भाषा)' : '📜 Revenue Terms'}
        </Text>
        <Switch 
          value={laymanMode} 
          onValueChange={setLaymanMode}
          trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
          thumbColor={laymanMode ? '#1e40af' : '#9ca3af'}
        />
      </View>

      {/* Record Header */}
      <View style={styles.header}>
        <div>
          <Text style={styles.recordType}>
            {laymanMode ? 'Land Ownership Document' : `${record.recordType} Record`}
          </Text>
          <Text style={styles.recordSub}>DigiLocker Verified Profile • Ramesh Kumar</Text>
        </div>
        <View style={[styles.badge, { backgroundColor: getStatusColor(record.status) }]}>
          <Text style={styles.badgeText}>{record.status}</Text>
        </View>
      </View>

      {/* Record Details Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {laymanMode ? 'Document Details' : 'Revenue Record Details'}
        </Text>
        
        <DetailRow 
          label={laymanMode ? "Registered Owner Name" : "Khatedar / Owner"} 
          value={record.owner} 
        />
        {record.fatherName && (
          <DetailRow label={laymanMode ? "Father's Name" : "Father / Husband Name"} value={record.fatherName} />
        )}
        <DetailRow 
          label={laymanMode ? "Plot / Survey Number" : "Survey / Khasra No"} 
          value={record.khasraNo || record.surveyNo || '45/12'} 
        />
        <DetailRow 
          label={laymanMode ? "Total Property Size" : "Measured Extent"} 
          value={record.area} 
        />
        <DetailRow 
          label={laymanMode ? "Land Purpose / Type" : "Classification"} 
          value={record.landType} 
        />
        <DetailRow label="District & State" value={`${record.district}, ${record.state || 'UP'}`} />
        <DetailRow label="Tehsil / Block" value={record.tehsil || 'Mohanlalganj'} />
        <DetailRow label="Village / Ward" value={record.village || 'Rampur Kalan'} />
      </View>

      {/* Validation Report Card with Layman Explanations */}
      {report && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {laymanMode ? 'AI Validity & Integrity Checks' : '5-Layer AI Validation Report'}
          </Text>
          
          <View style={[styles.statusBanner, { backgroundColor: report.overallStatus === 'Requires Manual Review' ? '#fef08a' : '#dcfce7' }]}>
            <Text style={[styles.statusBannerText, { color: report.overallStatus === 'Requires Manual Review' ? '#854d0e' : '#166534' }]}>
              {report.overallStatus === 'Requires Manual Review' 
                ? (laymanMode ? '⚠️ Needs Government Officer Review' : '⚠️ REQUIRES MANUAL REVIEW')
                : (laymanMode ? '✅ Clean Title — No Issues Found' : '✅ VERIFIED & VALIDATED')}
            </Text>
          </View>

          {report.layers.map((layer, index) => (
            <View key={index} style={styles.layerRow}>
              <View style={styles.layerHeader}>
                <Text style={styles.layerName}>
                  {laymanMode ? getLaymanLayerName(layer.name) : layer.name}
                </Text>
                <Text style={styles.layerScore}>{layer.score}% {layer.status === 'Pass' ? '✅' : '⚠️'}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${layer.score}%`, backgroundColor: layer.status === 'Pass' ? '#16a34a' : '#f97316' }]} />
              </View>
              {laymanMode && (
                <Text style={styles.laymanLayerSub}>{getLaymanLayerSub(layer.name)}</Text>
              )}
              {layer.note && <Text style={styles.layerNote}>{layer.note}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Citizen Action Buttons (Request Verification / Download Certified Copy) */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#1e40af' }]} onPress={() => alert("Certified DigiLocker Land Document requested for download.")}>
          <Text style={styles.actionBtnText}>📥 Download DigiLocker Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#16a34a' }]} onPress={() => alert("Verification request sent to local Tehsildar office.")}>
          <Text style={styles.actionBtnText}>✍️ Request Revenue Verification</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const DetailRow = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

function getLaymanLayerName(layerName: string): string {
  if (layerName.includes('Format')) return '1. Document Format & Mandatory Details';
  if (layerName.includes('Cross-Database') || layerName.includes('Cross-DB')) return '2. Official State Portal Match (Bhulekh)';
  if (layerName.includes('Spatial') || layerName.includes('GIS')) return '3. Satellite & Map Boundary Match';
  if (layerName.includes('Title Chain')) return '4. Ownership History Continuity';
  if (layerName.includes('Anomaly') || layerName.includes('Fraud')) return '5. Fraud & Loan Risk Check';
  return layerName;
}

function getLaymanLayerSub(layerName: string): string {
  if (layerName.includes('Format')) return 'Verifies that all required names, numbers, and dates are present.';
  if (layerName.includes('Cross-Database') || layerName.includes('Cross-DB')) return 'Cross-references with state revenue department registry.';
  if (layerName.includes('Spatial') || layerName.includes('GIS')) return 'Checks satellite imagery to verify plot size and boundaries.';
  if (layerName.includes('Title Chain')) return 'Verifies that past land sales follow a continuous legal chain.';
  if (layerName.includes('Anomaly') || layerName.includes('Fraud')) return 'Checks for hidden bank loans, rapid transfers, or undervaluation.';
  return '';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  content: { padding: 16, paddingBottom: 40 },
  laymanBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#eff6ff', borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#bfdbfe' },
  laymanBarText: { fontSize: 12, fontWeight: 'bold', color: '#1e40af' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  recordType: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  recordSub: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 11 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1f2937', marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 6 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { color: '#6b7280', fontSize: 13, flex: 1 },
  detailValue: { color: '#111827', fontSize: 13, fontWeight: 'bold', flex: 1.5, textAlign: 'right' },
  statusBanner: { padding: 10, borderRadius: 8, marginBottom: 14, alignItems: 'center' },
  statusBannerText: { fontWeight: 'bold', fontSize: 12 },
  layerRow: { marginBottom: 14 },
  layerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  layerName: { color: '#374151', fontWeight: 'bold', fontSize: 12 },
  layerScore: { fontWeight: 'bold', fontSize: 12 },
  progressBarBg: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3 },
  progressBarFill: { height: 6, borderRadius: 3 },
  laymanLayerSub: { fontSize: 10, color: '#6b7280', marginTop: 3 },
  layerNote: { color: '#dc2626', fontSize: 11, marginTop: 4, fontWeight: '500' },
  actionContainer: { gap: 10, marginTop: 10 },
  actionBtn: { width: '100%', padding: 14, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 }
});
