import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { TaskPriority } from '@/api/generated';
import { refreshAccessSession } from '@/auth/refreshAccessSession';
import { useSessionRefreshOnForeground } from '@/auth/useSessionRefreshOnForeground';
import QueryProvider from '@/api/QueryProvider';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import MainTabBar, { type MainTab } from '@/navigation/MainTabBar';
import ProfileScreen from '@/pages/profile/ProfileScreen';
import HistoryDayDetailModal from '@/pages/history/HistoryDayDetailModal';
import HistoryScreen, {
  type HistoryDayDetailPayload,
} from '@/pages/history/HistoryScreen';
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
import AppLaunchView from '@/components/AppLaunchView';
import CurrentUserBootstrap from '@/user/CurrentUserBootstrap';
import RevenueCatBootstrap from '@/revenuecat/RevenueCatBootstrap';
import SubscriptionBootstrap from '@/subscription/SubscriptionBootstrap';
import { SubscriptionSessionProvider } from '@/subscription/SubscriptionSessionProvider';
import { useSubscriptionAccess } from '@/subscription/useSubscriptionAccess';
import {
  recurringTaskProgressQueryKey,
  recurringTasksQueryKey,
} from '@/recurring/recurringQueryKeys';
import { shouldBlockRecurringPremiumInteraction } from '@/recurring/recurringPremiumGate';
import { isApiPremiumRequiredError } from '@/utils/apiError';
import { ApiEnvironmentProvider } from '@/config/ApiEnvironmentProvider';
import OnboardingModal from '@/onboarding/OnboardingModal';
import PersonalIntroModal from '@/onboarding/PersonalIntroModal';
import {
  EMPTY_PERSONAL_INTRO_DRAFT,
  type PersonalIntroDraft,
} from '@/onboarding/personalIntroDraft';
import { useOnboardingVisibility } from '@/onboarding/useOnboardingVisibility';
import { usePersonalIntroVisibility } from '@/onboarding/usePersonalIntroVisibility';
import { useCurrentUser } from '@/user/useCurrentUser';

function MainAppShell() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const currentUserQuery = useCurrentUser();
  const subscriptionQuery = useSubscriptionAccess();
  const hasPremiumAccess = subscriptionQuery.data?.hasPremiumAccess ?? false;
  const subscriptionReady =
    !subscriptionQuery.isLoading && subscriptionQuery.isFetched;
  const onboarding = useOnboardingVisibility({
    user: currentUserQuery.data,
    userLoaded: currentUserQuery.isSuccess,
  });
  const personalIntro = usePersonalIntroVisibility({
    user: currentUserQuery.data,
    userLoaded: currentUserQuery.isSuccess,
  });
  const [introPhase, setIntroPhase] = useState<'personal' | 'onboarding'>('personal');
  const [personalIntroDraft, setPersonalIntroDraft] = useState<PersonalIntroDraft>(
    EMPTY_PERSONAL_INTRO_DRAFT,
  );
  const userId = currentUserQuery.data?.id;

  useEffect(() => {
    setIntroPhase('personal');
    setPersonalIntroDraft(EMPTY_PERSONAL_INTRO_DRAFT);
  }, [userId]);

  const userSessionPending = !currentUserQuery.isFetched;
  const introStoragePending =
    currentUserQuery.isSuccess && !onboarding.manualOpen && !personalIntro.isReady;
  const onboardingStoragePending =
    currentUserQuery.isSuccess && !onboarding.manualOpen && !onboarding.isReady;

  const showPersonalIntro =
    personalIntro.isReady &&
    currentUserQuery.isSuccess &&
    !onboarding.manualOpen &&
    personalIntro.autoVisible &&
    introPhase === 'personal';

  const showOnboarding =
    onboarding.isReady &&
    currentUserQuery.isSuccess &&
    onboarding.visible &&
    !showPersonalIntro;

  const showBackToPersonalIntro =
    showOnboarding &&
    onboarding.autoVisible &&
    !onboarding.manualOpen &&
    personalIntro.autoVisible &&
    introPhase === 'onboarding';

  const hideMainShell =
    userSessionPending ||
    introStoragePending ||
    onboardingStoragePending ||
    showPersonalIntro ||
    (showOnboarding && onboarding.autoVisible && !onboarding.manualOpen);

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
  const [historyDayModal, setHistoryDayModal] = useState<{
    visible: boolean;
    session: number;
    payload: HistoryDayDetailPayload | null;
  }>({ visible: false, session: 0, payload: null });

  function openTaskForm(taskId: string | null) {
    const tasksError = queryClient.getQueryState(
      recurringTasksQueryKey(accessToken),
    )?.error;
    const progressError = queryClient.getQueryState(
      recurringTaskProgressQueryKey(accessToken),
    )?.error;
    const isPremiumPreview =
      (tasksError !== undefined && isApiPremiumRequiredError(tasksError)) ||
      (progressError !== undefined && isApiPremiumRequiredError(progressError));

    if (
      shouldBlockRecurringPremiumInteraction({
        hasPremiumAccess,
        isPremiumPreview,
        subscriptionReady,
      })
    ) {
      return;
    }

    setTaskForm(prev => ({
      visible: true,
      taskId,
      session: prev.session + 1,
    }));
  }

  function closeTaskForm() {
    setTaskForm(prev => ({ ...prev, visible: false, taskId: null }));
  }

  function openHistoryDayDetail(payload: HistoryDayDetailPayload) {
    setHistoryDayModal(prev => ({
      visible: true,
      session: prev.session + 1,
      payload,
    }));
  }

  function closeHistoryDayDetail() {
    setHistoryDayModal(prev => ({ ...prev, visible: false, payload: null }));
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

  async function dismissOnboarding() {
    if (onboarding.manualOpen) {
      onboarding.close();
      return;
    }

    await onboarding.dismiss();
    await personalIntro.dismiss();
    setIntroPhase('personal');
    setActiveTab('today');
  }

  async function continueFromPersonalIntro() {
    await personalIntro.dismiss();
    setIntroPhase('onboarding');
  }

  function backToPersonalIntro() {
    setPersonalIntroDraft(current => ({ ...current, stepIndex: 0 }));
    setIntroPhase('personal');
  }

  async function completeOnboarding() {
    if (onboarding.manualOpen) {
      onboarding.close();
      setActiveTab('today');
      return;
    }

    await onboarding.dismiss();
    await personalIntro.dismiss();
    setIntroPhase('personal');
    setActiveTab('today');
  }

  return (
    <View style={shellStyles.root}>
      {hideMainShell && !showPersonalIntro && !showOnboarding ? (
        <AppLaunchView />
      ) : !hideMainShell ? (
        <>
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
                activeTab !== 'history' ? shellStyles.tabPaneHidden : null,
              ]}
            >
              <HistoryScreen
                isActive={activeTab === 'history'}
                onOpenDayDetail={openHistoryDayDetail}
                onOpenSubscription={() => {
                  setOpenProfileSubscription(true);
                  setActiveTab('profile');
                }}
              />
            </View>
            <View
              style={[
                shellStyles.tabPane,
                activeTab !== 'progress' ? shellStyles.tabPaneHidden : null,
              ]}
            >
              <ProgressScreen
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
                activeTab !== 'profile' ? shellStyles.tabPaneHidden : null,
              ]}
            >
              <ProfileScreen
                onGoToday={() => setActiveTab('today')}
                openSubscription={openProfileSubscription}
                onSubscriptionOpened={() => setOpenProfileSubscription(false)}
                onOpenIntroduction={onboarding.open}
              />
            </View>
          </View>
          <MainTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      ) : (
        <View style={shellStyles.introBackdrop} />
      )}
      {taskForm.visible ? (
        <RecurringTaskFormModal
          key={`task-form-${taskForm.session}`}
          taskId={taskForm.taskId}
          onClose={closeTaskForm}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
            queryClient.invalidateQueries({ queryKey: ['recurring-task-progress'] });
            queryClient.invalidateQueries({ queryKey: ['history'] });
          }}
        />
      ) : null}
      {historyDayModal.visible && historyDayModal.payload ? (
        <HistoryDayDetailModal
          key={`history-day-${historyDayModal.session}`}
          date={historyDayModal.payload.date}
          dayOfMonth={historyDayModal.payload.dayOfMonth}
          entry={historyDayModal.payload.entry}
          isToday={historyDayModal.payload.isToday}
          onClose={closeHistoryDayDetail}
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
      {showPersonalIntro ? (
        <PersonalIntroModal
          visible={showPersonalIntro}
          draft={personalIntroDraft}
          onDraftChange={setPersonalIntroDraft}
          onContinueToOnboarding={continueFromPersonalIntro}
        />
      ) : null}
      {showOnboarding ? (
        <OnboardingModal
          visible={showOnboarding}
          hasPremiumAccess={hasPremiumAccess}
          showBackToPersonalIntro={showBackToPersonalIntro}
          onBackToPersonalIntro={backToPersonalIntro}
          onClose={() => {
            void dismissOnboarding();
          }}
          onComplete={() => {
            void completeOnboarding();
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

    void refreshAccessSession({ queryClient, setAccessToken }).finally(() => {
      setIsAuthReady(true);
    });
  }, [queryClient, setAccessToken, setIsAuthReady]);

  useSessionRefreshOnForeground(!!accessToken);

  if (!isAuthReady) {
    return <AppLaunchView />;
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

const shellStyles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
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
  introBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: recurringTheme.pageBg,
  },
});
