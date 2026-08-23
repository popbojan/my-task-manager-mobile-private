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
import { TaskStatus, type Task } from '@/api/generated';
import { authApi } from '@/api/authClient';
import { useAuth } from '@/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageProvider';
import AppBrandHeader from '@/components/AppBrandHeader';
import { PlusIcon } from '@/pages/recurring-tasks/premium/TabIcons';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import DeleteTaskModal from '@/pages/tasks/DeleteTaskModal';
import TaskCard from '@/pages/tasks/TaskCard';
import TaskFilterChips from '@/pages/tasks/TaskFilterChips';
import TaskPrioritySectionHeader from '@/pages/tasks/TaskPrioritySectionHeader';
import {
  buildInitialTaskOrder,
  buildTaskListItems,
  filterTasksByPriority,
  syncTaskOrderIds,
  type TaskFilterId,
} from '@/pages/tasks/taskBoardConfig';
import { shouldRetryApiQuery } from '@/utils/apiError';

const heroSource = require('@/assets/images/recurring-hero-boxing.jpg');

function patchTaskInCache(
  tasks: Task[],
  taskId: string,
  patch: Partial<Task>,
): Task[] {
  return tasks.map(task => (task.id === taskId ? { ...task, ...patch } : task));
}

type TasksScreenProps = {
  onOpenCreateTask: (activeFilter: TaskFilterId) => void;
  onOpenEditTask: (taskId: string) => void;
};

function tasksQueryKey(accessToken: string | null) {
  return ['tasks', accessToken] as const;
}

export default function TasksScreen({
  onOpenCreateTask,
  onOpenEditTask,
}: TasksScreenProps) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const heroHeight = Math.min(
    Math.max(Math.round(windowHeight * 0.21), 175),
    198,
  );
  const { t } = useLanguage();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<TaskFilterId>('all');
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    task: Task | null;
  }>({ visible: false, task: null });
  const [taskOrderIds, setTaskOrderIds] = useState<string[]>([]);
  const statusTargetsRef = useRef(new Map<string, TaskStatus>());
  const statusSyncRunningRef = useRef(new Set<string>());
  const previousFilterRef = useRef<TaskFilterId>(activeFilter);

  const tasksQuery = useQuery({
    queryKey: tasksQueryKey(accessToken),
    queryFn: () => authApi.getTasks(),
    enabled: !!accessToken,
    retry: shouldRetryApiQuery,
  });

  function patchTaskStatus(taskId: string, status: TaskStatus) {
    queryClient.setQueryData<Task[]>(tasksQueryKey(accessToken), (old = []) =>
      patchTaskInCache(old, taskId, { status }),
    );
    queryClient.setQueryData<Task>(['task', taskId], old =>
      old ? { ...old, status } : old,
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
          const updated = await authApi.updateTask({
            taskId,
            updateTaskRequest: { status },
          });
          patchTaskStatus(taskId, updated.status);
          queryClient.setQueryData<Task>(['task', taskId], updated);

          if (statusTargetsRef.current.get(taskId) === status) {
            statusTargetsRef.current.delete(taskId);
          }
        } catch {
          statusTargetsRef.current.delete(taskId);
          await queryClient.invalidateQueries({ queryKey: tasksQueryKey(accessToken) });
          break;
        }
      }
    } finally {
      statusSyncRunningRef.current.delete(taskId);
    }
  }

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => authApi.deleteTask({ taskId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey(accessToken) });
      closeDeleteModal();
    },
  });

  const displayTasks = tasksQuery.data ?? [];
  const filteredByPriority = useMemo(
    () => filterTasksByPriority(displayTasks, activeFilter),
    [activeFilter, displayTasks],
  );

  useEffect(() => {
    if (previousFilterRef.current !== activeFilter) {
      previousFilterRef.current = activeFilter;
      setTaskOrderIds(buildInitialTaskOrder(filteredByPriority, activeFilter));
      return;
    }

    setTaskOrderIds(previousOrder => {
      const nextOrder = syncTaskOrderIds(
        previousOrder,
        filteredByPriority,
        activeFilter,
      );

      if (
        nextOrder.length === previousOrder.length &&
        nextOrder.every((id, index) => id === previousOrder[index])
      ) {
        return previousOrder;
      }

      return nextOrder;
    });
  }, [activeFilter, filteredByPriority]);

  const listItems = useMemo(
    () => buildTaskListItems(filteredByPriority, taskOrderIds, activeFilter),
    [activeFilter, filteredByPriority, taskOrderIds],
  );

  const hasVisibleTasks = listItems.some(item => item.kind === 'task');

  const deleteErrorMessage = deleteTaskMutation.isError
    ? t('tasks.deleteError')
    : null;

  function openDeleteModal(task: Task) {
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

  function handleStatusChange(taskId: string, status: TaskStatus) {
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
        <View style={styles.heroLeftScrim} />
        <View style={styles.heroBottomFadeLight} />
        <View style={styles.heroBottomFadeMid} />
        <View style={styles.heroBottomFadeDeep} />

        <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
          <AppBrandHeader />

          <View style={styles.heroFooter}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('tasks.sectionTitle')}</Text>
              <View style={styles.sectionHeaderRight}>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{filteredByPriority.length}</Text>
                </View>
                <Pressable
                  style={styles.addFab}
                  accessibilityLabel={t('tasks.addTask')}
                  onPress={() => onOpenCreateTask(activeFilter)}
                >
                  <PlusIcon size={14} color="#fff" />
                </Pressable>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        <View style={styles.bodyFixed}>
          <TaskFilterChips
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {tasksQuery.isLoading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={recurringTheme.accentBright} />
              <Text style={styles.loadingText}>{t('tasks.loading')}</Text>
            </View>
          ) : null}

          {tasksQuery.isError ? (
            <Text style={styles.errorText}>{t('tasks.error')}</Text>
          ) : null}
        </View>

        <FlatList
          data={tasksQuery.isSuccess ? listItems : []}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => {
            const previousItem = index > 0 ? listItems[index - 1] : null;

            if (item.kind === 'section') {
              const isFirst = !listItems
                .slice(0, index)
                .some(listItem => listItem.kind === 'section');

              return (
                <TaskPrioritySectionHeader
                  priority={item.priority}
                  isFirst={isFirst}
                />
              );
            }

            return (
              <>
                {previousItem?.kind === 'task' ? <TaskSeparator /> : null}
                <TaskCard
                  task={item.task}
                  onEdit={onOpenEditTask}
                  onDelete={openDeleteModal}
                  onStatusChange={handleStatusChange}
                />
              </>
            );
          }}
          style={styles.taskList}
          contentContainerStyle={
            !hasVisibleTasks && !tasksQuery.isLoading
              ? styles.taskListContentEmpty
              : styles.taskListContent
          }
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          ListEmptyComponent={
            tasksQuery.isLoading
              ? undefined
              : () => (
                  <Text style={styles.emptyText}>
                    {activeFilter === 'all'
                      ? t('tasks.noTasks')
                      : t('tasks.noTasksFiltered')}
                  </Text>
                )
          }
          keyboardShouldPersistTaps="handled"
        />
      </View>

      <DeleteTaskModal
        visible={deleteModal.visible}
        taskTitle={deleteModal.task?.title ?? null}
        isPending={deleteTaskMutation.isPending}
        errorMessage={deleteErrorMessage}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteTask}
      />
    </View>
  );
}

function TaskSeparator() {
  return <View style={styles.taskSeparator} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: recurringTheme.pageBg,
    direction: 'ltr',
  },
  hero: {
    overflow: 'hidden',
    backgroundColor: recurringTheme.pageBg,
  },
  heroImage: {
    position: 'absolute',
    top: -8,
    right: -56,
    width: '118%',
    height: '115%',
    opacity: 0.72,
  },
  heroLeftScrim: {
    position: 'absolute',
    top: 44,
    left: 0,
    bottom: 0,
    width: '56%',
    backgroundColor: 'rgba(6, 9, 8, 0.22)',
  },
  heroBottomFadeLight: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 52,
    height: 48,
    backgroundColor: 'rgba(6, 9, 8, 0.16)',
  },
  heroBottomFadeMid: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 28,
    height: 40,
    backgroundColor: 'rgba(6, 9, 8, 0.36)',
  },
  heroBottomFadeDeep: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 36,
    backgroundColor: recurringTheme.pageBg,
  },
  heroSafeArea: {
    flex: 1,
    gap: 4,
  },
  heroFooter: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  body: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 16,
    gap: 5,
    paddingBottom: 4,
  },
  bodyFixed: {
    gap: 5,
    flexShrink: 0,
    paddingTop: 6,
  },
  taskList: {
    flex: 1,
    minHeight: 0,
  },
  taskListContent: {
    paddingBottom: 2,
  },
  taskListContentEmpty: {
    flexGrow: 1,
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
  taskSeparator: {
    height: 5,
  },
  loadingBlock: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
  },
  errorText: {
    color: recurringTheme.fireRedBright,
    fontSize: 13,
    textAlign: 'center',
  },
  emptyText: {
    color: recurringTheme.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
