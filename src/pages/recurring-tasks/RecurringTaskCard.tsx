import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RecurringTask } from '@/api/generated/models/RecurringTask';
import { RecurringTaskStatus } from '@/api/generated';
import { useLanguage } from '@/i18n/LanguageProvider';
import { FireIcon } from '@/pages/recurring-tasks/premium/PremiumIcons';
import { EditIcon, TrashIcon } from '@/pages/recurring-tasks/premium/TabIcons';
import PremiumSurface from '@/pages/recurring-tasks/premium/PremiumSurface';
import { getNextStatus } from '@/pages/recurring-tasks/recurringBoardConfig';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type RecurringTaskCardProps = {
  task: RecurringTask;
  onEdit: (taskId: string) => void;
  onDelete: (task: RecurringTask) => void;
  onStatusChange: (taskId: string, status: RecurringTaskStatus) => void;
};

function TaskCheckboxVisual({
  isDone,
  isInProgress,
}: {
  isDone: boolean;
  isInProgress: boolean;
}) {
  if (isDone) {
    return (
      <View style={styles.checkboxDoneFull}>
        <Text style={styles.checkmarkDone}>✓</Text>
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

function RecurringStatusIndicator({
  status,
  label,
}: {
  status: RecurringTaskStatus;
  label: string;
}) {
  const isDone = status === RecurringTaskStatus.Done;
  const isInProgress = status === RecurringTaskStatus.InProgress;

  return (
    <View style={styles.statusColumn}>
      <TaskCheckboxVisual isDone={isDone} isInProgress={isInProgress} />
      <Text
        style={[
          styles.statusLabel,
          isInProgress && styles.statusLabelProgress,
          isDone && styles.statusLabelDone,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export default function RecurringTaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: RecurringTaskCardProps) {
  const { t } = useLanguage();
  const isDone = task.status === RecurringTaskStatus.Done;
  const isInProgress = task.status === RecurringTaskStatus.InProgress;

  const statusLabelKey =
    task.status === RecurringTaskStatus.Todo
      ? 'recurring.status.todo'
      : task.status === RecurringTaskStatus.InProgress
        ? 'recurring.status.inProgress'
        : 'recurring.status.done';

  function handleToggleStatus() {
    if (isDone) {
      onStatusChange(task.id, RecurringTaskStatus.Todo);
      return;
    }

    const nextStatus = getNextStatus(task.status);
    if (nextStatus) {
      onStatusChange(task.id, nextStatus);
    }
  }

  return (
    <PremiumSurface
      accent={isDone ? 'success' : isInProgress ? 'gold' : 'none'}
      compact={!isDone}
      padding={8}
      radius={12}
      style={isDone ? styles.doneShell : isInProgress ? styles.progressShell : undefined}
    >
      <View style={styles.row}>
        <Pressable
          style={styles.mainTapArea}
          accessibilityRole="button"
          accessibilityLabel={t('recurring.status.toggle')}
          accessibilityHint={t('recurring.status.toggleHint')}
          onPress={handleToggleStatus}
        >
          <RecurringStatusIndicator
            status={task.status}
            label={t(statusLabelKey)}
          />

          <View style={styles.content}>
            <Text
              style={[styles.title, isDone && styles.titleDone]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            <View
              style={[
                styles.streakPill,
                isInProgress && styles.streakPillProgress,
                isDone && styles.streakPillDone,
              ]}
            >
              <FireIcon
                size={10}
                color={
                  isDone
                    ? recurringTheme.accentBright
                    : isInProgress
                      ? recurringTheme.goldBright
                      : '#c9a227'
                }
              />
              <Text
                style={[
                  styles.streakText,
                  isInProgress && styles.streakTextProgress,
                  isDone && styles.streakTextDone,
                ]}
              >
                {t('recurring.streak.count', { count: String(task.streakCount) })}
              </Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            accessibilityLabel={t('recurring.edit')}
            onPress={() => onEdit(task.id)}
          >
            <EditIcon size={14} />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            accessibilityLabel={t('recurring.delete')}
            onPress={() => onDelete(task)}
          >
            <TrashIcon size={14} />
          </Pressable>
        </View>
      </View>
    </PremiumSurface>
  );
}

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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mainTapArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
    paddingRight: 4,
  },
  statusColumn: {
    width: 48,
    flexShrink: 0,
    alignItems: 'center',
    gap: 5,
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
  statusLabelDone: {
    color: recurringTheme.accentBright,
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
  content: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    ...premiumType.title,
    color: recurringTheme.textPrimary,
    fontSize: 14,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: recurringTheme.accentBright,
    textShadowColor: 'rgba(110, 207, 170, 0.35)',
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  streakPillProgress: {
    backgroundColor: recurringTheme.goldSoft,
    borderColor: 'rgba(212, 168, 67, 0.28)',
  },
  streakPillDone: {
    backgroundColor: 'rgba(82, 183, 136, 0.18)',
    borderColor: 'rgba(110, 207, 170, 0.45)',
  },
  streakText: {
    fontSize: 10,
    fontWeight: '700',
    color: recurringTheme.textSecondary,
  },
  streakTextProgress: {
    color: recurringTheme.goldBright,
    fontWeight: '800',
  },
  streakTextDone: {
    color: recurringTheme.accentBright,
  },
  actions: {
    flexDirection: 'row',
    gap: 2,
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
