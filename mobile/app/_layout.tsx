import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../context/LanguageContext';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <StatusBar style="light" backgroundColor="#1e40af" />
        <Stack
          initialRouteName="index"
          screenOptions={{
            headerStyle: { backgroundColor: '#1e40af' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen name="index" options={{ title: '🌐 1. भाषा चुनें / Choose Language' }} />
          <Stack.Screen name="login" options={{ title: '🔐 2. साइन इन व पंजीकरण / Sign In' }} />
          <Stack.Screen name="dashboard" options={{ title: '🏛️ 3. भूमिसेतु मुख्य पृष्ठ / Main Dashboard' }} />
          <Stack.Screen name="language" options={{ title: '🌐 भाषा चुनें / Select Language' }} />
          <Stack.Screen name="scan" options={{ title: '📷 Document & QR Scanner' }} />
          <Stack.Screen name="records" options={{ title: '📜 My Scoped Land Records' }} />
          <Stack.Screen name="record/[id]" options={{ title: '📑 Land Record Details' }} />
        </Stack>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
