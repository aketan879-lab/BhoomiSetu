import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

const BACKEND_URL = 'http://localhost:8000';

export default function RecordsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const [laymanMode, setLaymanMode] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = ['All', 'Validated ✅', 'Pending 🕐', 'Rejected ❌'];

  const fetchLiveRecords = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/records/`);
      if (res.ok) {
        const liveItems = await res.json();
        if (liveItems && liveItems.length > 0) {
          // Filter records created by citizen Rakesh / USR-FARMER-01
          const userItems = liveItems.filter((item: any) => 
            item.digitized_by === 'USR-FARMER-01' || 
            (item.owner_name && item.owner_name.toLowerCase().includes('rakesh'))
          );

          // Deduplicate by khasra_number or id, keeping the most recently updated item
          const uniqueMap = new Map<string, any>();
          for (const item of userItems) {
            const key = item.khasra_number || item.id;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, item);
            } else {
              const existing = uniqueMap.get(key);
              const timeExisting = new Date(existing.updated_at || existing.created_at || 0).getTime();
              const timeItem = new Date(item.updated_at || item.created_at || 0).getTime();
              if (timeItem > timeExisting) {
                uniqueMap.set(key, item);
              }
            }
          }

          const uniqueItems = Array.from(uniqueMap.values());

          const liveMapped = uniqueItems.map((item: any) => {
            const mappedStatus = 
              item.validation_status === 'VALIDATED' ? 'Validated' :
              item.validation_status === 'REJECTED' ? 'Rejected' : 'Pending';
            
            return {
              id: item.id,
              recordType: item.land_type || item.record_type || 'SALE DEED',
              laymanType: 'Land Digitization Request',
              owner: item.owner_name || 'Rakesh Kumar',
              khasraNo: item.khasra_number || item.survey_number || 'N/A',
              area: `${item.area_value || 2.0} ${item.area_unit || 'BIGHA'}`,
              village: item.village || 'Rampur Kalan',
              district: item.district || 'Lucknow',
              state: item.state_code || 'UP',
              status: mappedStatus,
              laymanExplanation: mappedStatus === 'Validated' 
                ? 'Approved & Verified by Tehsildar Admin in State Revenue books.'
                : mappedStatus === 'Rejected'
                ? 'Rejected by Tehsildar Admin. Please check details or contact Tehsil office.'
                : 'Your request to digitize/transfer land ownership is currently under review by Tehsildar Admin.'
            };
          });

          setRecords(liveMapped);
        } else {
          setRecords([]);
        }
      }
    } catch (e) {
      console.log('Error fetching live records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRecords();
    const interval = setInterval(fetchLiveRecords, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredRecords = records.filter(record => {
    if (filter === 'All') return true;
    if (filter.includes('Validated') && record.status === 'Validated') return true;
    if (filter.includes('Pending') && record.status === 'Pending') return true;
    if (filter.includes('Rejected') && record.status === 'Rejected') return true;
    return false;
  });

  const getStatusColor = (status: string) => {
    if (status === 'Validated') return '#16a34a';
    if (status === 'Rejected') return '#dc2626';
    if (status === 'Pending') return '#d97706';
    return '#6b7280';
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/record/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeText}>{laymanMode ? item.laymanType : item.recordType}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.ownerText}>{item.owner}</Text>
      
      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>Khasra #: {item.khasraNo}</Text>
        <Text style={styles.detailText}>•</Text>
        <Text style={styles.detailText}>{item.area}</Text>
      </View>
      
      <Text style={styles.locationText}>{item.village}, {item.district} ({item.state})</Text>

      {laymanMode && (
        <View style={styles.laymanTip}>
          <Text style={styles.laymanTipText}>💡 {item.laymanExplanation}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Scope Header */}
      <View style={styles.scopeHeader}>
        <Text style={styles.scopeTitle}>My Land Records ({records.length})</Text>
        <Text style={styles.scopeSub}>Showing requests raised under citizen profile (Rakesh Kumar)</Text>
      </View>

      {/* Layman Mode Toggle */}
      <View style={styles.laymanBar}>
        <Text style={styles.laymanBarText}>
          {laymanMode ? '💡 Layman Descriptions (सरल भाषा)' : '📜 Official Revenue Terms'}
        </Text>
        <Switch 
          value={laymanMode} 
          onValueChange={setLaymanMode}
          trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
          thumbColor={laymanMode ? '#1e40af' : '#9ca3af'}
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              onPress={() => setFilter(item)}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1e40af" />
          <Text style={styles.loadingText}>Loading your land records...</Text>
        </View>
      ) : filteredRecords.length > 0 ? (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyTitle}>No Requests Found</Text>
          <Text style={styles.emptySub}>
            No land record requests found for this filter. Tap 'Raise a Request' on the homepage to submit your land details.
          </Text>
          <TouchableOpacity 
            style={styles.raiseBtn} 
            onPress={() => router.push('/request')}
          >
            <Text style={styles.raiseBtnText}>📝 Raise a Request Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  scopeHeader: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  scopeTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e40af' },
  scopeSub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  laymanBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#eff6ff', borderBottomWidth: 1, borderBottomColor: '#bfdbfe' },
  laymanBarText: { fontSize: 12, fontWeight: 'bold', color: '#1e40af' },
  filterContainer: { paddingVertical: 10, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 8 },
  filterChipActive: { backgroundColor: '#dbeafe', borderColor: '#1e40af', borderWidth: 1 },
  filterText: { color: '#4b5563', fontWeight: '500', fontSize: 12 },
  filterTextActive: { color: '#1e40af', fontWeight: 'bold' },
  listContent: { padding: 16 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  typeBadge: { backgroundColor: '#e0e7ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  typeText: { fontSize: 11, color: '#3730a3', fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 11, color: '#fff', fontWeight: 'bold' },
  ownerText: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 6 },
  detailsRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  detailText: { color: '#4b5563', fontSize: 13 },
  locationText: { color: '#6b7280', fontSize: 12 },
  laymanTip: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', padding: 8, borderRadius: 6, marginTop: 8 },
  laymanTipText: { fontSize: 11, color: '#166534' },
  loadingBox: { padding: 40, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 12, fontWeight: '700', color: '#1e40af' },
  emptyState: { padding: 30, alignItems: 'center', backgroundColor: '#ffffff', margin: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', gap: 8 },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  emptySub: { fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 18 },
  raiseBtn: { backgroundColor: '#15803d', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
  raiseBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' }
});
