import { useMemo, useState } from 'react';
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
import { useLanguage } from '@/i18n/LanguageProvider';
import LanguagePicker from '@/pages/login/LanguagePicker';
import { loginTheme } from '@/pages/login/loginTheme';
import DeleteRecurringTaskModal from '@/pages/recurring-tasks/DeleteRecurringTaskModal';
import FocusReminderCard from '@/pages/recurring-tasks/FocusReminderCard';
import MasteryProfileHero, {
  MasteryStatsGrid,
} from '@/pages/recurring-tasks/MasteryProfileHero';
import { PlusIcon } from '@/pages/recurring-tasks/premium/TabIcons';
import RecurringTaskCard from '@/pages/recurring-tasks/RecurringTaskCard';
import RecurringTaskFormModal from '@/pages/recurring-tasks/RecurringTaskFormModal';
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

const heroSource = require('@/assets/images/recurring-hero-boxing.jpg');
const logoSource = require('@/assets/images/logo.png');

const MAX_TASKS_WITHOUT_SCROLL = 5;

function sortTasksForList(tasks: RecurringTask[]): RecurringTask[] {
  return sortTasksStable(tasks);
}

export default function RecurringTasksScreen() {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const heroHeight = Math.min(
    Math.max(Math.round(windowHeight * 0.21), 175),
    198,
  );
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [formModal, setFormModal] = useState<{
    visible: boolean;
    taskId: string | null;
  }>({ visible: false, taskId: null });
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    task: RecurringTask | null;
  }>({ visible: false, task: null });
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const tasksQuery = useQuery({
    queryKey: ['recurring-tasks'],
    queryFn: () => authApi.getRecurringTasks(),
    retry: shouldRetryApiQuery,
  });

  const progressQuery = useQuery({
    queryKey: ['recurring-task-progress'],
    queryFn: () => authApi.getRecurringTaskProgress(),
    retry: shouldRetryApiQuery,
  });

  const masteryLevelsQuery = useQuery({
    queryKey: ['mastery-levels'],
    queryFn: () => authApi.getMasteryLevels(),
    staleTime: 1000 * 60 * 30,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({
      recurringTaskId,
      status,
    }: {
      recurringTaskId: string;
      status: RecurringTaskStatus;
    }) =>
      authApi.updateRecurringTask({
        recurringTaskId,
        updateRecurringTaskRequest: { status },
      }),
    onMutate: async ({ recurringTaskId, status }) => {
      setUpdatingTaskId(recurringTaskId);
      await queryClient.cancelQueries({ queryKey: ['recurring-tasks'] });
      const previous = queryClient.getQueryData<RecurringTask[]>([
        'recurring-tasks',
      ]);

      queryClient.setQueryData<RecurringTask[]>(['recurring-tasks'], (old = []) =>
        old.map(task =>
          task.id === recurringTaskId ? { ...task, status } : task,
        ),
      );

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['recurring-tasks'], context.previous);
      }
    },
    onSettled: () => {
      setUpdatingTaskId(null);
      queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['recurring-task-progress'] });
    },
  });

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

  const progress = normalizeRecurringProgress(progressQuery.data);
  const displayProgress = progressPremiumLocked
    ? DEFAULT_RECURRING_PROGRESS
    : progress;
  const masteryLevels = masteryLevelsQuery.data ?? [];
  const tasksAreLoading = tasksQuery.isLoading && !tasksPremiumLocked;
  const tasksFailed = tasksQuery.isError && !tasksPremiumLocked;
  const progressIsLoading =
    progressQuery.isLoading && !progressQuery.data && !progressPremiumLocked;
  const canRenderBoard = tasksQuery.isSuccess || tasksPremiumLocked;

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

    setFormModal({ visible: true, taskId: null });
  }

  function openEditModal(taskId: string) {
    if (tasksPremiumLocked) {
      return;
    }

    setFormModal({ visible: true, taskId });
  }

  function closeFormModal() {
    setFormModal({ visible: false, taskId: null });
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

    updateTaskMutation.mutate({ recurringTaskId: taskId, status });
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
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <View style={styles.logoShell}>
                <Image source={logoSource} style={styles.logo} accessibilityIgnoresInvertColors />
              </View>
              <View style={styles.brandCopy}>
                <Text style={styles.brandName} numberOfLines={1}>
                  {t('header.brand')}
                </Text>
                <Text style={styles.brandTagline} numberOfLines={1}>
                  {t('login.brand.tagline')}
                </Text>
              </View>
            </View>
            <LanguagePicker variant="ghost" />
          </View>

          <View style={styles.heroContent}>
            {progressIsLoading ? (
              <View style={styles.loadingBlock}>
                <ActivityIndicator color={recurringTheme.accentBright} />
              </View>
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

          {!progressIsLoading ? (
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
          scrollEnabled={sortedTasks.length > MAX_TASKS_WITHOUT_SCROLL}
          bounces={sortedTasks.length > MAX_TASKS_WITHOUT_SCROLL}
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
              isUpdating={updatingTaskId === item.id}
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

      <RecurringTaskFormModal
        visible={formModal.visible}
        taskId={formModal.taskId}
        onClose={closeFormModal}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
          queryClient.invalidateQueries({ queryKey: ['recurring-task-progress'] });
        }}
      />

      <DeleteRecurringTaskModal
        visible={deleteModal.visible}
        taskTitle={deleteModal.task?.title ?? null}
        taskStatus={deleteModal.task?.status ?? null}
        isPending={deleteTaskMutation.isPending}
        errorMessage={deleteErrorMessage}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTask}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  brandRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoShell: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 44,
    height: 44,
  },
  brandCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  brandName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  brandTagline: {
    color: loginTheme.brandTagline,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
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
});
