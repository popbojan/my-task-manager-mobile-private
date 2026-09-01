import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { TaskPriority } from '@/api/generated';
import { authApi, authRequestInit } from '@/api/authClient';
import QueryProvider from '@/api/QueryProvider';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import MainTabBar, { type MainTab } from '@/navigation/MainTabBar';
import ProfileScreen from '@/pages/profile/ProfileScreen';
import ProgressScreen from '@/pages/progress/ProgressScreen';
import LoginScreen from '@/pages/login/LoginScreen';
import RecurringTaskFormModal from '@/pages/recurring-tasks/RecurringTaskFormModal';
import RecurringTasksScreen from '@/pages/recurring-tasks/RecurringTasksScreen';
import TaskFormModal from '@/pages/tasks/TaskFormModal';
import TasksScreen from '@/pages/tasks/TasksScreen';
import {
  defaultPriorityForCreateFilter,
  type TaskFilterId,
} from '@/pages/tasks/taskBoardConfig';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import CurrentUserBootstrap from '@/user/CurrentUserBootstrap';
import RevenueCatBootstrap from '@/revenuecat/RevenueCatBootstrap';
import SubscriptionBootstrap from '@/subscription/SubscriptionBootstrap';
import { SubscriptionSessionProvider } from '@/subscription/SubscriptionSessionProvider';
import { clearSubscriptionSessionQueries } from '@/subscription/clearSubscriptionSession';
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
  const [boardTaskForm, setBoardTaskForm] = useState<{
    visible: boolean;
    taskId: string | null;
    initialPriority: TaskPriority | null;
    session: number;
  }>({ visible: false, taskId: null, initialPriority: null, session: 0 });
  const [openProfileSubscription, setOpenProfileSubscription] = useState(false);

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

  function openBoardTaskForm(
    taskId: string | null,
    initialPriority: TaskPriority | null = null,
  ) {
    setBoardTaskForm(prev => ({
      visible: true,
      taskId,
      initialPriority: taskId ? null : initialPriority,
      session: prev.session + 1,
    }));
  }

  function closeBoardTaskForm() {
    setBoardTaskForm(prev => ({
      ...prev,
      visible: false,
      taskId: null,
      initialPriority: null,
    }));
  }

  function openBoardTaskCreate(activeFilter: TaskFilterId) {
    openBoardTaskForm(null, defaultPriorityForCreateFilter(activeFilter));
  }

  return (
    <View style={shellStyles.root}>
      <View style={shellStyles.content}>
        <View
          style={[
            shellStyles.tabPane,
            activeTab !== 'today' ? shellStyles.tabPaneHidden : null,
          ]}
        >
          <RecurringTasksScreen
            onOpenCreateTask={() => openTaskForm(null)}
            onOpenEditTask={openTaskForm}
            onOpenSubscription={() => {
              setOpenProfileSubscription(true);
              setActiveTab('profile');
            }}
          />
        </View>
        <View
          style={[
            shellStyles.tabPane,
            activeTab !== 'tasks' ? shellStyles.tabPaneHidden : null,
          ]}
        >
          <TasksScreen
            onOpenCreateTask={openBoardTaskCreate}
            onOpenEditTask={openBoardTaskForm}
          />
        </View>
        <View
          style={[
            shellStyles.tabPane,
            activeTab !== 'progress' ? shellStyles.tabPaneHidden : null,
          ]}
        >
          <ProgressScreen />
        </View>
        <View
          style={[
            shellStyles.tabPane,
            activeTab !== 'profile' ? shellStyles.tabPaneHidden : null,
          ]}
        >
          <ProfileScreen
            onGoToday={() => setActiveTab('today')}
            openSubscription={openProfileSubscription}
            onSubscriptionOpened={() => setOpenProfileSubscription(false)}
          />
        </View>
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
      {boardTaskForm.visible ? (
        <TaskFormModal
          key={`board-task-form-${boardTaskForm.session}`}
          taskId={boardTaskForm.taskId}
          initialPriority={boardTaskForm.initialPriority}
          onClose={closeBoardTaskForm}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
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
        const data = await authApi.refreshAccessToken(authRequestInit);
        clearRecurringSessionQueries(queryClient);
        clearSubscriptionSessionQueries(queryClient);
        setAccessToken(data.accessToken);
      } catch {
        clearRecurringSessionQueries(queryClient);
        clearSubscriptionSessionQueries(queryClient);
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
    <SubscriptionSessionProvider>
      <RevenueCatBootstrap />
      <CurrentUserBootstrap />
      <SubscriptionBootstrap />
      <MainAppShell />
    </SubscriptionSessionProvider>
  ) : (
    <>
      <RevenueCatBootstrap />
      <LoginScreen />
    </>
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
    position: 'relative',
  },
  tabPane: {
    ...StyleSheet.absoluteFill,
  },
  tabPaneHidden: {
    display: 'none',
  },
});
