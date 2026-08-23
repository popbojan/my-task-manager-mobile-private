import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TaskStatus, type Task } from '@/api/generated';
import { useLanguage } from '@/i18n/LanguageProvider';
import { EditIcon, TrashIcon } from '@/pages/recurring-tasks/premium/TabIcons';
import PremiumSurface from '@/pages/recurring-tasks/premium/PremiumSurface';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import { getNextTaskStatus } from '@/pages/tasks/taskBoardConfig';
import {
  formatTaskDateTime,
  getDeadlineBadge,
  getTaskDisplayDate,
  type DeadlineBadgeKind,
} from '@/pages/tasks/taskDeadlineUtils';

type TaskCardProps = {
  task: Task;
  onEdit: (taskId: string) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isUpdating?: boolean;
};

function TaskStatusCircle({
  status,
}: {
  status: TaskStatus;
}) {
  const isDone = status === TaskStatus.Done;
  const isInProgress = status === TaskStatus.InProgress;
  const isReview = status === TaskStatus.Review;

  if (isDone) {
    return (
      <View style={styles.checkboxDoneFull}>
        <Text style={styles.checkmarkDone}>✓</Text>
      </View>
    );
  }

  if (isReview) {
    return (
      <View style={styles.checkboxOuterReview}>
        <Text style={styles.reviewEye}>👁</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.checkboxOuter,
        isInProgress && styles.checkboxOuterProgress,
      ]}
    >
      <View style={[styles.checkbox, isInProgress && styles.checkboxProgress]} />
    </View>
  );
}

function TaskStatusIndicator({
  status,
  label,
  onPress,
  disabled,
}: {
  status: TaskStatus;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const isDone = status === TaskStatus.Done;
  const isInProgress = status === TaskStatus.InProgress;
  const isReview = status === TaskStatus.Review;

  return (
    <Pressable
      style={({ pressed }) => [styles.statusColumn, pressed && styles.pressed]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
    >
      <TaskStatusCircle status={status} />
      <Text
        style={[
          styles.statusLabel,
          isInProgress && styles.statusLabelProgress,
          isReview && styles.statusLabelReview,
          isDone && styles.statusLabelDone,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function DeadlineBadge({ kind }: { kind: DeadlineBadgeKind }) {
  const { t } = useLanguage();
  const overdue = kind === 'overdue';

  return (
    <View style={[styles.badge, overdue ? styles.badgeOverdue : styles.badgeWeek]}>
      <Text style={[styles.badgeText, overdue ? styles.badgeTextOverdue : styles.badgeTextWeek]}>
        {overdue ? t('tasks.deadline.overdue') : t('tasks.deadline.thisWeek')}
      </Text>
    </View>
  );
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isUpdating = false,
}: TaskCardProps) {
  const { t, language } = useLanguage();
  const isDone = task.status === TaskStatus.Done;
  const isInProgress = task.status === TaskStatus.InProgress;
  const isReview = task.status === TaskStatus.Review;
  const deadlineBadge = getDeadlineBadge(task.deadline);
  const displayDate = formatTaskDateTime(getTaskDisplayDate(task), language);
  const cardAccent = isDone
    ? 'success'
    : isInProgress
      ? 'gold'
      : isReview
        ? 'review'
        : 'none';

  const statusLabelKey =
    task.status === TaskStatus.Todo
      ? 'tasks.status.todo'
      : task.status === TaskStatus.InProgress
        ? 'tasks.status.inProgress'
        : task.status === TaskStatus.Review
          ? 'tasks.status.review'
          : 'tasks.status.done';

  function handleToggleStatus() {
    if (isUpdating) {
      return;
    }

    onStatusChange(task.id, getNextTaskStatus(task.status));
  }

  return (
    <PremiumSurface
      accent={cardAccent}
      compact={!isDone}
      padding={8}
      radius={12}
      style={
        isDone
          ? styles.doneShell
          : isInProgress
            ? styles.progressShell
            : isReview
              ? styles.reviewShell
              : undefined
      }
    >
      <View style={styles.row}>
        <TaskStatusIndicator
          status={task.status}
          label={t(statusLabelKey)}
          onPress={handleToggleStatus}
          disabled={isUpdating}
        />

        <View style={styles.content}>
          <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={2}>
            {task.title}
          </Text>
          <View style={styles.metaRow}>
            {deadlineBadge ? <DeadlineBadge kind={deadlineBadge} /> : null}
            <Text
              style={[
                styles.dateText,
                deadlineBadge === 'overdue' && styles.dateTextOverdue,
                deadlineBadge === 'thisWeek' && styles.dateTextWeek,
              ]}
              numberOfLines={1}
            >
              {displayDate}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            accessibilityLabel={t('tasks.edit')}
            onPress={() => onEdit(task.id)}
            disabled={isUpdating}
          >
            <EditIcon size={14} />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            accessibilityLabel={t('tasks.delete')}
            onPress={() => onDelete(task)}
            disabled={isUpdating}
          >
            <TrashIcon size={14} />
          </Pressable>
        </View>
      </View>
    </PremiumSurface>
  );
}

export default memo(TaskCard);

const styles = StyleSheet.create({
  doneShell: {
    backgroundColor: 'rgba(82, 183, 136, 0.12)',
    shadowOpacity: 0.42,
    shadowRadius: 16,
    elevation: 6,
  },
  progressShell: {
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 1,
  },
  reviewShell: {
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    direction: 'ltr',
  },
  statusColumn: {
    width: 48,
    flexShrink: 0,
    alignItems: 'center',
    gap: 5,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  checkboxOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(82, 183, 136, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(82, 183, 136, 0.22)',
  },
  checkboxOuterProgress: {
    backgroundColor: 'rgba(212, 168, 67, 0.12)',
    borderColor: 'rgba(212, 168, 67, 0.32)',
    shadowColor: recurringTheme.gold,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  checkboxOuterReview: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.42)',
    shadowColor: '#A855F7',
    shadowOpacity: 0.22,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: recurringTheme.accentBright,
    backgroundColor: 'transparent',
  },
  checkboxProgress: {
    borderWidth: 0,
    backgroundColor: recurringTheme.goldBright,
  },
  checkboxDoneFull: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.accentBright,
    borderWidth: 2,
    borderColor: '#b7f7d8',
    shadowColor: recurringTheme.accentBright,
    shadowOpacity: 0.72,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  checkmarkDone: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 16,
    marginTop: -1,
  },
  reviewEye: {
    fontSize: 13,
    lineHeight: 15,
  },
  statusLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: recurringTheme.textMuted,
    textAlign: 'center',
  },
  statusLabelProgress: {
    color: recurringTheme.goldBright,
  },
  statusLabelReview: {
    color: '#C084FC',
  },
  statusLabelDone: {
    color: recurringTheme.accentBright,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  title: {
    ...premiumType.taskTitle,
    color: recurringTheme.textPrimary,
    fontSize: 16,
    lineHeight: 20,
  },
  titleDone: {
    color: recurringTheme.textSecondary,
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeOverdue: {
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  badgeWeek: {
    backgroundColor: recurringTheme.goldSoft,
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeTextOverdue: {
    color: '#F87171',
  },
  badgeTextWeek: {
    color: recurringTheme.goldBright,
  },
  dateText: {
    color: recurringTheme.textMuted,
    fontSize: 11,
    fontWeight: '500',
    flexShrink: 1,
  },
  dateTextOverdue: {
    color: '#F87171',
  },
  dateTextWeek: {
    color: recurringTheme.goldBright,
  },
  actions: {
    flexDirection: 'row',
    gap: 2,
    flexShrink: 0,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
});
