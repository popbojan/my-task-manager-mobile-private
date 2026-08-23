import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import {
  filterTasksByPriority,
  orderTasksByIds,
  sortTasksStable,
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
  onOpenCreateTask: () => void;
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
    Math.max(Math.round(windowHeight * 0.17), 132),
    156,
  );
  const { t } = useLanguage();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<TaskFilterId>('all');
  const [deleteModal, setDeleteModal] = useState<{
    visible: boolean;
    task: Task | null;
  }>({ visible: false, task: null });
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [taskOrderIds, setTaskOrderIds] = useState<string[]>([]);
  const previousFilterRef = useRef<TaskFilterId>(activeFilter);

  const tasksQuery = useQuery({
    queryKey: tasksQueryKey(accessToken),
    queryFn: () => authApi.getTasks(),
    enabled: !!accessToken,
    retry: shouldRetryApiQuery,
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      status,
    }: {
      taskId: string;
      status: TaskStatus;
    }) =>
      authApi.updateTask({
        taskId,
        updateTaskRequest: { status },
      }),
    onMutate: async ({ taskId, status }) => {
      setUpdatingTaskId(taskId);
      await queryClient.cancelQueries({ queryKey: tasksQueryKey(accessToken) });
      const previous = queryClient.getQueryData<Task[]>(tasksQueryKey(accessToken));

      queryClient.setQueryData<Task[]>(tasksQueryKey(accessToken), (old = []) =>
        patchTaskInCache(old, taskId, { status }),
      );

      return { previous };
    },
    onSuccess: (updatedTask, { taskId }) => {
      queryClient.setQueryData<Task[]>(tasksQueryKey(accessToken), (old = []) =>
        patchTaskInCache(old, taskId, { status: updatedTask.status }),
      );
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(tasksQueryKey(accessToken), context.previous);
      }
    },
    onSettled: () => {
      setUpdatingTaskId(null);
    },
  });

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
      setTaskOrderIds(sortTasksStable(filteredByPriority).map(task => task.id));
      return;
    }

    setTaskOrderIds(previousOrder => {
      const nextOrder = syncTaskOrderIds(previousOrder, filteredByPriority);

      if (
        nextOrder.length === previousOrder.length &&
        nextOrder.every((id, index) => id === previousOrder[index])
      ) {
        return previousOrder;
      }

      return nextOrder;
    });
  }, [activeFilter, filteredByPriority]);

  const filteredTasks = useMemo(
    () => orderTasksByIds(filteredByPriority, taskOrderIds),
    [filteredByPriority, taskOrderIds],
  );

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

  const handleStatusChange = useCallback(
    (taskId: string, status: TaskStatus) => {
      updateTaskMutation.mutate({ taskId, status });
    },
    [updateTaskMutation],
  );

  const renderTaskItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskCard
        task={item}
        onEdit={onOpenEditTask}
        onDelete={openDeleteModal}
        onStatusChange={handleStatusChange}
        isUpdating={updatingTaskId === item.id}
      />
    ),
    [handleStatusChange, onOpenEditTask, updatingTaskId],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.listHeader}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('tasks.sectionTitle')}</Text>
          <View style={styles.sectionHeaderRight}>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{displayTasks.length}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.addButtonPressed,
              ]}
              accessibilityLabel={t('tasks.addTask')}
              onPress={onOpenCreateTask}
            >
              <PlusIcon size={16} color="#fff" />
            </Pressable>
          </View>
        </View>

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
    ),
    [
      activeFilter,
      displayTasks.length,
      onOpenCreateTask,
      t,
      tasksQuery.isError,
      tasksQuery.isLoading,
    ],
  );

  const listEmpty = useMemo(() => {
    if (tasksQuery.isLoading) {
      return undefined;
    }

    return (
      <Text style={styles.emptyText}>
        {activeFilter === 'all' ? t('tasks.noTasks') : t('tasks.noTasksFiltered')}
      </Text>
    );
  }, [activeFilter, t, tasksQuery.isLoading]);

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
        </SafeAreaView>
      </View>

      <FlatList
        data={tasksQuery.isSuccess ? filteredTasks : []}
        keyExtractor={item => item.id}
        extraData={updatingTaskId}
        renderItem={renderTaskItem}
        style={styles.taskList}
        contentContainerStyle={[
          styles.taskListContent,
          filteredTasks.length === 0 && !tasksQuery.isLoading
            ? styles.taskListContentEmpty
            : null,
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={TaskSeparator}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        keyboardShouldPersistTaps="handled"
      />

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
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  taskList: {
    flex: 1,
    minHeight: 0,
  },
  taskListContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  taskListContentEmpty: {
    flexGrow: 1,
  },
  listHeader: {
    direction: 'ltr',
    gap: 10,
    paddingTop: 4,
    paddingBottom: 8,
    marginHorizontal: -16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionTitle: {
    ...premiumType.sectionTitle,
    color: recurringTheme.accentBright,
    flex: 1,
    fontSize: 14,
    letterSpacing: 2,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.accentDark,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.accentBright,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    shadowColor: recurringTheme.accentBright,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  addButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.92,
  },
  taskSeparator: {
    height: 8,
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
    paddingHorizontal: 16,
  },
  emptyText: {
    color: recurringTheme.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
