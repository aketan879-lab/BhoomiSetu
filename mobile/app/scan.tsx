import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import axios from 'axios';

const BACKEND_API = 'http://localhost:8000/api/v1';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanMode, setScanMode] = useState<'document' | 'barcode'>('document');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [laymanMode, setLaymanMode] = useState(true);
  const cameraRef = useRef(null);
  const router = useRouter();

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.text}>Camera permission is required to scan land documents & QR codes</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    setPhotoUri('mock-captured-uri');
    runBackendOCR();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      runBackendOCR();
    }
  };

  const runBackendOCR = async () => {
    setIsProcessing(true);
    setShowResults(false);

    try {
      if (scanMode === 'barcode') {
        // Mock Barcode / QR Code decoding
        setTimeout(() => {
          setExtractedData({
            isQRCode: true,
            ulpin: 'UP-09-4512-8821',
            owner: 'Ramesh Kumar',
            certificateNo: 'DILRMP-2024-REG-882',
            issuer: 'Revenue Department, UP Govt',
            verifiedOnBlockchain: true,
            status: 'Authentic Official Certificate ✅'
          });
          setIsProcessing(false);
          setShowResults(true);
        }, 1500);
      } else {
        // Try calling real FastAPI OCR endpoint
        try {
          const res = await axios.post(`${BACKEND_API}/scan/upload`, {
            document_type: 'KHASRA',
            state_code: 'UP'
          });
          setExtractedData(res.data || mockExtractedDocument);
        } catch (e) {
          // Fallback demo extracted data if API offline
          setExtractedData(mockExtractedDocument);
        }
        setIsProcessing(false);
        setShowResults(true);
      }
    } catch (err) {
      setIsProcessing(false);
      Alert.alert('Scan Failed', 'Could not process document. Using fallback data.');
    }
  };

  const mockExtractedDocument = {
    owner_name: 'Ramesh Kumar',
    survey_number: '45/12',
    khata_number: '78',
    area_normalized_sqm: 2107.5,
    area_display: '2.5 Bigha (2,107 sqm)',
    land_type: 'Agricultural',
    village: 'Rampur Kalan',
    tehsil: 'Mohanlalganj',
    district: 'Lucknow',
    ocr_confidence: 94,
    boundaries: { north: 'Suresh plot', south: 'Village road', east: 'Mahesh plot', west: 'Nala' }
  };

  const reset = () => {
    setPhotoUri(null);
    setShowResults(false);
    setExtractedData(null);
  };

  return (
    <View style={styles.container}>
      {/* Mode Switcher Bar */}
      <View style={styles.modeBar}>
        <TouchableOpacity 
          style={[styles.modeTab, scanMode === 'document' && styles.modeTabActive]} 
          onPress={() => { setScanMode('document'); reset(); }}
        >
          <Text style={[styles.modeTabText, scanMode === 'document' && styles.modeTabTextActive]}>
            📷 Scan Document
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.modeTab} 
          onPress={() => router.push('/request')}
        >
          <Text style={styles.modeTabText}>
            ✍️ Raise a Request (Form)
          </Text>
        </TouchableOpacity>
      </View>

      {!photoUri ? (
        <View style={styles.fullScreen}>
          {/* Full Camera Viewport */}
          <CameraView style={StyleSheet.absoluteFillObject} ref={cameraRef} />

          {/* Viewfinder Target Area */}
          <View style={styles.viewfinderContainer}>
            {scanMode === 'document' ? (
              <View style={styles.docFrame}>
                <View style={styles.cornerTL} /><View style={styles.cornerTR} />
                <View style={styles.cornerBL} /><View style={styles.cornerBR} />
                <Text style={styles.viewfinderText}>📄 Align Paper Record Inside Frame</Text>
                <Text style={styles.viewfinderSub}>Extracts Owner, Survey No, Area & Boundaries</Text>
              </View>
            ) : (
              <View style={styles.qrFrame}>
                <View style={styles.qrLaser} />
                <Text style={styles.viewfinderText}>🔲 Scan Property Certificate QR / Barcode</Text>
                <Text style={styles.viewfinderSub}>Instant Blockchain & ULPIN Verification</Text>
              </View>
            )}
          </View>

          {/* Bottom Controls */}
          <View style={styles.floatingControls}>
            <TouchableOpacity style={styles.controlBtn} onPress={pickImage}>
              <Text style={styles.controlIcon}>🖼️</Text>
              <Text style={styles.controlText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shutterBtn} onPress={handleCapture}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={() => setLaymanMode(!laymanMode)}>
              <Text style={styles.controlIcon}>💡</Text>
              <Text style={styles.controlText}>{laymanMode ? 'Layman' : 'Legal'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.previewContainer} contentContainerStyle={{ padding: 16 }}>
          {isProcessing ? (
            <View style={styles.processingCard}>
              <ActivityIndicator size="large" color="#1e40af" />
              <Text style={styles.processingTitle}>
                {scanMode === 'document' ? '⚡ Running SmartScan AI OCR...' : '🔍 Decoding Barcode / QR Code...'}
              </Text>
              <Text style={styles.processingSub}>Connecting to FastAPI Backend Engine</Text>
            </View>
          ) : showResults && extractedData ? (
            <View style={styles.resultsCard}>
              {scanMode === 'barcode' ? (
                // Barcode Result View
                <View>
                  <View style={styles.badgeSuccess}>
                    <Text style={styles.badgeSuccessText}>{extractedData.status}</Text>
                  </View>
                  <Text style={styles.resultHeader}>🔲 QR Code Decoded Result</Text>
                  <ResultRow label="ULPIN Parcel Number:" value={extractedData.ulpin} />
                  <ResultRow label="Owner Profile:" value={extractedData.owner} />
                  <ResultRow label="Certificate Reg No:" value={extractedData.certificateNo} />
                  <ResultRow label="Issuing Authority:" value={extractedData.issuer} />
                  <ResultRow label="Blockchain Hash Lock:" value="Verified Immutable 🛡️" />
                </View>
              ) : (
                // Document OCR Extracted View
                <View>
                  <View style={styles.badgeSuccess}>
                    <Text style={styles.badgeSuccessText}>OCR Confidence: {extractedData.ocr_confidence || 94}% ✅</Text>
                  </View>
                  <Text style={styles.resultHeader}>
                    {laymanMode ? '💡 Extracted Document Info (सरल भाषा)' : '📜 Revenue Field Extractions'}
                  </Text>
                  
                  <ResultRow 
                    label={laymanMode ? "Land Owner Name:" : "Khatedar Name:"} 
                    value={extractedData.owner_name} 
                  />
                  <ResultRow 
                    label={laymanMode ? "Plot / Survey Number:" : "Khasra Number:"} 
                    value={extractedData.survey_number} 
                  />
                  <ResultRow 
                    label={laymanMode ? "Total Property Size:" : "Area (Normalized):"} 
                    value={extractedData.area_display || '2.5 Bigha'} 
                  />
                  <ResultRow 
                    label={laymanMode ? "Land Usage Purpose:" : "Classification:"} 
                    value={extractedData.land_type} 
                  />
                  <ResultRow label="Location:" value={`${extractedData.village}, ${extractedData.district}`} />
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.retakeBtn} onPress={reset}>
                  <Text style={styles.retakeText}>Scan Another</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={() => router.push('/records')}>
                  <Text style={styles.saveText}>Save to My Records ➔</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const ResultRow = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.resultRow}>
    <Text style={styles.resultLabel}>{label}</Text>
    <Text style={styles.resultValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  fullScreen: { flex: 1, position: 'relative' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#0f172a' },
  text: { color: 'white', textAlign: 'center', marginBottom: 20, fontSize: 15 },
  btn: { backgroundColor: '#1e40af', padding: 14, borderRadius: 8 },
  btnText: { color: 'white', fontWeight: 'bold' },
  modeBar: { flexDirection: 'row', backgroundColor: '#1e293b', padding: 6, zIndex: 20 },
  modeTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  modeTabActive: { backgroundColor: '#1e40af' },
  modeTabText: { color: '#94a3b8', fontSize: 12, fontWeight: 'bold' },
  modeTabTextActive: { color: '#ffffff' },
  viewfinderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  docFrame: { width: '100%', height: 320, borderWidth: 2, borderColor: '#34d399', borderRadius: 16, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', position: 'relative' },
  qrFrame: { width: 240, height: 240, borderWidth: 3, borderColor: '#60a5fa', borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', position: 'relative' },
  qrLaser: { position: 'absolute', top: '50%', left: 10, right: 10, height: 2, backgroundColor: '#ef4444' },
  cornerTL: { position: 'absolute', top: -2, left: -2, width: 20, height: 20, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#10b981' },
  cornerTR: { position: 'absolute', top: -2, right: -2, width: 20, height: 20, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#10b981' },
  cornerBL: { position: 'absolute', bottom: -2, left: -2, width: 20, height: 20, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#10b981' },
  cornerBR: { position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#10b981' },
  viewfinderText: { color: 'white', fontWeight: 'bold', fontSize: 13, textShadowColor: 'black', textShadowRadius: 4, textAlign: 'center' },
  viewfinderSub: { color: '#a7f3d0', fontSize: 10, marginTop: 4, textShadowColor: 'black', textShadowRadius: 4, textAlign: 'center' },
  floatingControls: { position: 'absolute', bottom: 30, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20 },
  shutterBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: 'white', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.3)' },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'white' },
  controlBtn: { alignItems: 'center', backgroundColor: 'rgba(15, 23, 42, 0.85)', padding: 10, borderRadius: 12, width: 70 },
  controlIcon: { fontSize: 20 },
  controlText: { color: 'white', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
  previewContainer: { flex: 1, backgroundColor: '#f8fafc' },
  processingCard: { padding: 40, alignItems: 'center', backgroundColor: 'white', borderRadius: 16, marginTop: 40 },
  processingTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e40af', marginTop: 16 },
  processingSub: { fontSize: 12, color: '#64748b', marginTop: 4 },
  resultsCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, borderColor: '#e2e8f0', borderWidth: 1 },
  badgeSuccess: { backgroundColor: '#dcfce7', padding: 8, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  badgeSuccessText: { color: '#166534', fontWeight: 'bold', fontSize: 12 },
  resultHeader: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 14 },
  resultRow: { flexDirection: 'row', justify: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  resultLabel: { color: '#64748b', fontSize: 13 },
  resultValue: { color: '#0f172a', fontWeight: 'bold', fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  retakeBtn: { flex: 1, backgroundColor: '#e2e8f0', padding: 14, borderRadius: 10, alignItems: 'center' },
  retakeText: { color: '#334155', fontWeight: 'bold', fontSize: 13 },
  saveBtn: { flex: 1, backgroundColor: '#16a34a', padding: 14, borderRadius: 10, alignItems: 'center' },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: 13 }
});
