import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';

export default function VoiceAssistant() {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'responded'>('idle');
  const [selectedLang, setSelectedLang] = useState('हिंदी');
  
  const languages = ['हिंदी', 'मराठी', 'తెలుగు', 'தமிழ்', 'English'];

  const handleMicPress = () => {
    setIsVisible(true);
    setStatus('listening');
    
    // Simulate flow
    setTimeout(() => {
      setStatus('processing');
      setTimeout(() => {
        setStatus('responded');
      }, 1500);
    }, 2000);
  };

  const close = () => {
    setIsVisible(false);
    setStatus('idle');
  };

  return (
    <>
      <TouchableOpacity 
        style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: '#1e40af', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 }}
        onPress={handleMicPress}
      >
        <Text style={{ fontSize: 24 }}>🗣️</Text>
      </TouchableOpacity>

      <Modal visible={isVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <TouchableOpacity style={{ position: 'absolute', top: 50, right: 20 }} onPress={close}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>X</Text>
          </TouchableOpacity>

          {status === 'listening' || status === 'processing' ? (
            <>
              <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: status === 'listening' ? '#ef4444' : '#1e40af', justifyContent: 'center', alignItems: 'center', marginBottom: 30 }}>
                {status === 'processing' ? <ActivityIndicator size="large" color="white" /> : <Text style={{ fontSize: 40 }}>🎙️</Text>}
              </View>
              <Text style={{ color: 'white', fontSize: 20, marginBottom: 20 }}>
                {status === 'listening' ? 'Listening... speak in your language' : 'Processing...'}
              </Text>
              
              {status === 'listening' && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                  {languages.map(lang => (
                    <TouchableOpacity 
                      key={lang} 
                      onPress={() => setSelectedLang(lang)}
                      style={{ backgroundColor: selectedLang === lang ? '#16a34a' : '#374151', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 }}
                    >
                      <Text style={{ color: 'white' }}>{lang}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          ) : status === 'responded' ? (
            <View style={{ width: '100%', backgroundColor: 'white', borderRadius: 12, padding: 20 }}>
              <View style={{ alignSelf: 'flex-end', backgroundColor: '#e5e7eb', padding: 12, borderRadius: 12, marginBottom: 15 }}>
                <Text style={{ fontSize: 16 }}>मेरा खसरा रिकॉर्ड दिखाओ</Text>
              </View>
              <View style={{ alignSelf: 'flex-start', backgroundColor: '#dbeafe', padding: 12, borderRadius: 12, marginBottom: 20 }}>
                <Text style={{ fontSize: 16, color: '#1e40af' }}>आपका खसरा रिकॉर्ड #45/12 यहाँ है। यह रिकॉर्ड verified है।</Text>
              </View>
              <TouchableOpacity onPress={close} style={{ backgroundColor: '#1e40af', padding: 15, borderRadius: 8, alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>View Record</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}
