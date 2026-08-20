import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { authApi } from '@/api/authClient';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import HomePlaceholder from '@/pages/home/HomePlaceholder';
import LoginScreen from '@/pages/login/LoginScreen';

function AppContent() {
  const { accessToken, setAccessToken, isAuthReady, setIsAuthReady } = useAuth();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;

    async function refreshSession() {
      try {
        const data = await authApi.refreshAccessToken();
        setAccessToken(data.accessToken);
      } catch {
        setAccessToken(null);
      } finally {
        setIsAuthReady(true);
      }
    }

    refreshSession();
  }, [setAccessToken, setIsAuthReady]);

  if (!isAuthReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1b4332" />
      </View>
    );
  }

  return accessToken ? <HomePlaceholder /> : <LoginScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1208',
  },
});
