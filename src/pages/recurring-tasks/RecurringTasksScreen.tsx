import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  RecurringTaskStatus,
  type RecurringTask,
} from '@/api/generated';
import { authApi } from '@/api/authClient';
import { useAuth } from '@/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageProvider';
import AppBrandHeader from '@/components/AppBrandHeader';
import AllTasksCompleteCelebration from '@/pages/recurring-tasks/AllTasksCompleteCelebration';
import DeleteRecurringTaskModal from '@/pages/recurring-tasks/DeleteRecurringTaskModal';
import FocusReminderCard from '@/pages/recurring-tasks/FocusReminderCard';
import MasteryProfileHero, {
  MasteryStatsGrid,
} from '@/pages/recurring-tasks/MasteryProfileHero';
import { PlusIcon } from '@/pages/recurring-tasks/premium/TabIcons';
import RecurringTaskCard from '@/pages/recurring-tasks/RecurringTaskCard';
import { sortTasksStable } from '@/pages/recurring-tasks/recurringBoardConfig';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import TodaySummaryCard from '@/pages/recurring-tasks/TodaySummaryCard';
import {
  isApiConflictError,
  isApiPremiumRequiredError,
  shouldRetryApiQuery,
} from '@/utils/apiError';
import {
  DEFAULT_RECURRING_PROGRESS,
  normalizeRecurringProgress,
} from '@/utils/recurringProgress';
import {
  recurringTaskProgressQueryKey,
  recurringTasksQueryKey,
} from '@/recurring/recurringQueryKeys';

const heroSource = require('@/assets/images/recurring-hero-boxing.jpg');

function sortTasksForList(tasks: RecurringTask[]): RecurringTask[] {
  return sortTasksStable(tasks);
}

type RecurringTasksScreenProps = {
  onOpenCreateTask: () => void;
  onOpenEditTask: (taskId: string) => void;
};

export default function RecurringTasksScreen({
  onOpenCreateTask,
  onOpenEditTask,
}: RecurringTasksScreenProps) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const heroHeight = Math.min(
    Math.max(Math.round(windowHeight * 0.21), 175),
    198,
  );
  const { t } = useLanguage();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    task: RecurringTask | null;
  }>({ visible: false, task: null });
  const [listViewportHeight, setListViewportHeight] = useState(0);
  const [listContentHeight, setListContentHeight] = useState(0);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const statusTargetsRef = useRef(new Map<string, RecurringTaskStatus>());
  const statusSyncRunningRef = useRef(new Set<string>());
  const wasAllCompleteRef = useRef(false);
  const isInitialCompleteCheckRef = useRef(true);

  const tasksQuery = useQuery({
    queryKey: recurringTasksQueryKey(accessToken),
    queryFn: () => authApi.getRecurringTasks(),
    enabled: !!accessToken,
    retry: shouldRetryApiQuery,
  });

  const progressQuery = useQuery({
    queryKey: recurringTaskProgressQueryKey(accessToken),
    queryFn: () => authApi.getRecurringTaskProgress(),
    enabled: !!accessToken,
    retry: shouldRetryApiQuery,
  });

  const masteryLevelsQuery = useQuery({
    queryKey: ['mastery-levels'],
    queryFn: () => authApi.getMasteryLevels(),
    staleTime: 1000 * 60 * 30,
  });

  function patchTaskStatus(taskId: string, status: RecurringTaskStatus) {
    queryClient.setQueryData<RecurringTask[]>(
      recurringTasksQueryKey(accessToken),
      (old = []) =>
        old.map(task => (task.id === taskId ? { ...task, status } : task)),
    );
  }

  async function drainStatusSync(taskId: string) {
    if (statusSyncRunningRef.current.has(taskId)) {
      return;
    }

    statusSyncRunningRef.current.add(taskId);

    try {
      while (statusTargetsRef.current.has(taskId)) {
        const status = statusTargetsRef.current.get(taskId)!;

        try {
          const updated = await authApi.updateRecurringTask({
            recurringTaskId: taskId,
            updateRecurringTaskRequest: { status },
          });
          patchTaskStatus(taskId, updated.status);

          if (statusTargetsRef.current.get(taskId) === status) {
            statusTargetsRef.current.delete(taskId);
          }
        } catch {
          statusTargetsRef.current.delete(taskId);
          await queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
          break;
        }
      }
    } finally {
      statusSyncRunningRef.current.delete(taskId);
      queryClient.invalidateQueries({ queryKey: ['recurring-task-progress'] });
    }
  }

  const deleteTaskMutation = useMutation({
    mutationFn: (recurringTaskId: string) =>
      authApi.deleteRecurringTask({ recurringTaskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-task-progress'] });
      closeDeleteModal();
    },
  });

  const tasksPremiumLocked =
    tasksQuery.isError && isApiPremiumRequiredError(tasksQuery.error);
  const progressPremiumLocked =
    progressQuery.isError && isApiPremiumRequiredError(progressQuery.error);
  const isPremiumPreview = tasksPremiumLocked || progressPremiumLocked;

  const displayTasks = tasksQuery.data ?? [];
  const sortedTasks = useMemo(
    () => sortTasksForList(displayTasks),
    [displayTasks],
  );
  const doneTasks = displayTasks.filter(
    task => task.status === RecurringTaskStatus.Done,
  ).length;
  const dailyTaskCount = displayTasks.length;
  const allDailyTasksComplete =
    dailyTaskCount > 0 && doneTasks === dailyTaskCount;

  const displayProgress = isPremiumPreview
    ? DEFAULT_RECURRING_PROGRESS
    : normalizeRecurringProgress(progressQuery.data);
  const masteryLevels = masteryLevelsQuery.data ?? [];
  const tasksAreLoading = tasksQuery.isLoading && !tasksPremiumLocked;
  const tasksFailed = tasksQuery.isError && !tasksPremiumLocked;
  const progressIsLoading = progressQuery.isPending && !progressPremiumLocked;
  const progressFailed =
    progressQuery.isError && !progressPremiumLocked && !progressQuery.data;
  const canRenderBoard = tasksQuery.isSuccess || tasksPremiumLocked;
  const listScrollEnabled =
    listViewportHeight === 0 || listContentHeight > listViewportHeight + 1;

  useEffect(() => {
    if (isInitialCompleteCheckRef.current) {
      isInitialCompleteCheckRef.current = false;
      wasAllCompleteRef.current = allDailyTasksComplete;
      return;
    }

    if (allDailyTasksComplete && dailyTaskCount > 0 && !wasAllCompleteRef.current) {
      setCelebrationVisible(true);
    }

    wasAllCompleteRef.current = allDailyTasksComplete;
  }, [allDailyTasksComplete, dailyTaskCount]);

  const deleteErrorMessage = useMemo(() => {
    if (!deleteTaskMutation.isError) {
      return null;
    }

    if (isApiConflictError(deleteTaskMutation.error)) {
      return t('recurring.deleteErrorDoneColumn', {
        column: t('recurring.status.done'),
      });
    }

    return t('recurring.deleteError');
  }, [deleteTaskMutation.error, deleteTaskMutation.isError, t]);

  function openCreateModal() {
    if (tasksPremiumLocked) {
      return;
    }

    onOpenCreateTask();
  }

  function openEditModal(taskId: string) {
    if (tasksPremiumLocked) {
      return;
    }

    onOpenEditTask(taskId);
  }

  function openDeleteModal(task: RecurringTask) {
    if (tasksPremiumLocked) {
      return;
    }

    setDeleteModal({ visible: true, task });
  }

  function closeDeleteModal() {
    setDeleteModal({ visible: false, task: null });
    deleteTaskMutation.reset();
  }

  function confirmDeleteTask() {
    if (!deleteModal.task || deleteTaskMutation.isPending) {
      return;
    }

    deleteTaskMutation.mutate(deleteModal.task.id);
  }

  function handleStatusChange(taskId: string, status: RecurringTaskStatus) {
    if (tasksPremiumLocked) {
      return;
    }

    patchTaskStatus(taskId, status);
    statusTargetsRef.current.set(taskId, status);
    void drainStatusSync(taskId);
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.hero, { height: heroHeight, width: windowWidth }]}>
        <Image
          source={heroSource}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.heroOverlayTop} />
        <View style={styles.heroVignetteLeft} />
        <View style={styles.heroVignetteRight} />
        <View style={styles.heroSpotlight} />
        <View style={styles.heroOverlayBottom} />

        <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
          <AppBrandHeader />

          <View style={styles.heroContent}>
            {progressIsLoading ? (
              <View style={styles.loadingBlock}>
                <ActivityIndicator color={recurringTheme.accentBright} />
              </View>
            ) : progressFailed ? (
              <Text style={styles.heroErrorText}>{t('recurring.progressError')}</Text>
            ) : (
              <MasteryProfileHero
                progress={displayProgress}
                levels={masteryLevels}
              />
            )}
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        <View style={styles.bodyFixed}>
          {tasksPremiumLocked ? (
            <View style={styles.premiumNotice}>
              <Text style={styles.premiumNoticeText}>
                {t('recurring.premiumRequired')}
              </Text>
            </View>
          ) : null}

          {progressFailed ? (
            <Text style={styles.errorText}>{t('recurring.progressError')}</Text>
          ) : null}

          {!progressIsLoading && !progressFailed ? (
            <MasteryStatsGrid progress={displayProgress} />
          ) : null}

          {canRenderBoard ? (
            <TodaySummaryCard
              totalTasks={dailyTaskCount}
              doneTasks={doneTasks}
              allComplete={allDailyTasksComplete}
            />
          ) : null}

          {canRenderBoard ? (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t('recurring.tasks.sectionTitle')}
              </Text>
              <View style={styles.sectionHeaderRight}>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{dailyTaskCount}</Text>
                </View>
                {!tasksPremiumLocked ? (
                  <Pressable
                    style={styles.addFab}
                    accessibilityLabel={t('recurring.addTaskDaily')}
                    onPress={openCreateModal}
                  >
                    <PlusIcon size={14} color="#fff" />
                  </Pressable>
                ) : null}
              </View>
            </View>
          ) : null}

          {tasksAreLoading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={recurringTheme.accentBright} />
            </View>
          ) : null}

          {tasksFailed ? (
            <Text style={styles.errorText}>{t('recurring.error')}</Text>
          ) : null}
        </View>

        <FlatList
          data={canRenderBoard ? sortedTasks : []}
          keyExtractor={item => item.id}
          style={styles.taskList}
          contentContainerStyle={styles.taskListContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={listScrollEnabled}
          bounces={listScrollEnabled}
          nestedScrollEnabled
          onLayout={event => {
            setListViewportHeight(event.nativeEvent.layout.height);
          }}
          onContentSizeChange={(_, height) => {
            setListContentHeight(height);
          }}
          ListEmptyComponent={
            tasksAreLoading || !canRenderBoard
              ? undefined
              : () => (
                  <Text style={styles.emptyText}>{t('recurring.noTasks')}</Text>
                )
          }
          renderItem={({ item }) => (
            <RecurringTaskCard
              task={item}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onStatusChange={handleStatusChange}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.taskSeparator} />}
        />

        {canRenderBoard ? (
          <FocusReminderCard
            allTasksComplete={allDailyTasksComplete}
            hasTasks={dailyTaskCount > 0}
          />
        ) : null}
      </View>

      <DeleteRecurringTaskModal
        visible={deleteModal.visible}
        taskTitle={deleteModal.task?.title ?? null}
        taskStatus={deleteModal.task?.status ?? null}
        isPending={deleteTaskMutation.isPending}
        errorMessage={deleteErrorMessage}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTask}
      />

      <AllTasksCompleteCelebration
        visible={celebrationVisible}
        onDismiss={() => setCelebrationVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: recurringTheme.pageBg,
  },
  hero: {
    overflow: 'hidden',
    backgroundColor: '#0a0a0c',
  },
  heroImage: {
    ...StyleSheet.absoluteFill,
  },
  heroOverlayTop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 6, 5, 0.5)',
  },
  heroVignetteLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '32%',
    backgroundColor: recurringTheme.vignette,
    opacity: 0.4,
  },
  heroVignetteRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '32%',
    backgroundColor: recurringTheme.vignette,
    opacity: 0.4,
  },
  heroSpotlight: {
    position: 'absolute',
    top: '6%',
    left: '18%',
    right: '18%',
    height: '58%',
    backgroundColor: 'rgba(82, 183, 136, 0.07)',
    borderRadius: 999,
  },
  heroOverlayBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: 'rgba(6, 9, 8, 0.96)',
  },
  heroSafeArea: {
    flex: 1,
    gap: 4,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  body: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 5,
    paddingBottom: 4,
  },
  bodyFixed: {
    gap: 5,
  },
  taskList: {
    flex: 1,
    minHeight: 0,
  },
  taskListContent: {
    flexGrow: 1,
    paddingBottom: 2,
  },
  taskSeparator: {
    height: 5,
  },
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  premiumNotice: {
    borderRadius: 12,
    padding: 10,
    backgroundColor: recurringTheme.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  premiumNoticeText: {
    color: recurringTheme.goldBright,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...premiumType.overline,
    color: recurringTheme.accentBright,
    fontSize: 10,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionBadge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.surfaceInset,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  sectionBadgeText: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  addFab: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.accentDark,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    shadowColor: recurringTheme.accent,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  emptyText: {
    color: recurringTheme.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  errorText: {
    color: recurringTheme.fireRedBright,
    fontSize: 13,
    textAlign: 'center',
  },
  heroErrorText: {
    color: recurringTheme.fireRedBright,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
