import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import QueryProvider from '@/api/QueryProvider';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import MainTabBar, { type MainTab } from '@/navigation/MainTabBar';
import TabPlaceholderScreen from '@/pages/home/TabPlaceholderScreen';
import LoginScreen from '@/pages/login/LoginScreen';
import RecurringTaskFormModal from '@/pages/recurring-tasks/RecurringTaskFormModal';
import RecurringTasksScreen from '@/pages/recurring-tasks/RecurringTasksScreen';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import CurrentUserBootstrap from '@/user/CurrentUserBootstrap';
import { clearRecurringSessionQueries } from '@/recurring/recurringQueryKeys';
import { ApiEnvironmentProvider } from '@/config/ApiEnvironmentProvider';

function MainAppShell() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<MainTab>('today');
  const [taskForm, setTaskForm] = useState<{
    visible: boolean;
    taskId: string | null;
    session: number;
  }>({ visible: false, taskId: null, session: 0 });

  function openTaskForm(taskId: string | null) {
    setTaskForm(prev => ({
      visible: true,
      taskId,
      session: prev.session + 1,
    }));
  }

  function closeTaskForm() {
    setTaskForm(prev => ({ ...prev, visible: false, taskId: null }));
  }

  return (
    <View style={shellStyles.root}>
      <View style={shellStyles.content}>
        {activeTab === 'today' ? (
          <RecurringTasksScreen
            onOpenCreateTask={() => openTaskForm(null)}
            onOpenEditTask={openTaskForm}
          />
        ) : null}
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
      {taskForm.visible ? (
        <RecurringTaskFormModal
          key={`task-form-${taskForm.session}`}
          taskId={taskForm.taskId}
          onClose={closeTaskForm}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['recurring-task-progress'] });
          }}
        />
      ) : null}
    </View>
  );
}

function AppContent() {
  const { accessToken, setAccessToken, isAuthReady, setIsAuthReady } = useAuth();
  const queryClient = useQueryClient();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;

    async function refreshSession() {
      try {
        const data = await authApi.refreshAccessToken();
        clearRecurringSessionQueries(queryClient);
        setAccessToken(data.accessToken);
      } catch {
        clearRecurringSessionQueries(queryClient);
        setAccessToken(null);
      } finally {
        setIsAuthReady(true);
      }
    }

    refreshSession();
  }, [queryClient, setAccessToken, setIsAuthReady]);

  if (!isAuthReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={recurringTheme.accent} />
      </View>
    );
  }

  return accessToken ? (
    <>
      <CurrentUserBootstrap />
      <MainAppShell />
    </>
  ) : (
    <LoginScreen />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ApiEnvironmentProvider>
        <AuthProvider>
          <LanguageProvider>
            <QueryProvider>
              <AppContent />
            </QueryProvider>
          </LanguageProvider>
        </AuthProvider>
      </ApiEnvironmentProvider>
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
