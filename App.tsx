import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { authApi } from '@/api/authClient';
import QueryProvider from '@/api/QueryProvider';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import MainTabBar, { type MainTab } from '@/navigation/MainTabBar';
import TabPlaceholderScreen from '@/pages/home/TabPlaceholderScreen';
import LoginScreen from '@/pages/login/LoginScreen';
import RecurringTasksScreen from '@/pages/recurring-tasks/RecurringTasksScreen';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

function MainAppShell() {
  const [activeTab, setActiveTab] = useState<MainTab>('today');

  return (
    <View style={shellStyles.root}>
      <View style={shellStyles.content}>
        {activeTab === 'today' ? <RecurringTasksScreen /> : null}
        {activeTab === 'tasks' ? (
          <TabPlaceholderScreen tab="tasks" onGoToday={() => setActiveTab('today')} />
        ) : null}
        {activeTab === 'progress' ? (
          <TabPlaceholderScreen
            tab="progress"
            onGoToday={() => setActiveTab('today')}
          />
        ) : null}
        {activeTab === 'profile' ? (
          <TabPlaceholderScreen
            tab="profile"
            onGoToday={() => setActiveTab('today')}
          />
        ) : null}
      </View>
      <MainTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

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
        <ActivityIndicator size="large" color={recurringTheme.accent} />
      </View>
    );
  }

  return accessToken ? <MainAppShell /> : <LoginScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LanguageProvider>
          <QueryProvider>
            <AppContent />
          </QueryProvider>
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
    backgroundColor: recurringTheme.pageBg,
  },
});

const shellStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: recurringTheme.pageBg,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
});
