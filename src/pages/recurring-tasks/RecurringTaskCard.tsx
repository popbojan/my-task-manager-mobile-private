import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RecurringTask } from '@/api/generated/models/RecurringTask';
import { RecurringTaskStatus } from '@/api/generated';
import { useLanguage } from '@/i18n/LanguageProvider';
import { FireIcon } from '@/pages/recurring-tasks/premium/PremiumIcons';
import { EditIcon, MoreIcon } from '@/pages/recurring-tasks/premium/TabIcons';
import PremiumSurface from '@/pages/recurring-tasks/premium/PremiumSurface';
import { getNextStatus } from '@/pages/recurring-tasks/recurringBoardConfig';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type RecurringTaskCardProps = {
  task: RecurringTask;
  onEdit: (taskId: string) => void;
  onDelete: (task: RecurringTask) => void;
  onStatusChange: (taskId: string, status: RecurringTaskStatus) => void;
  isUpdating?: boolean;
};

export default function RecurringTaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isUpdating = false,
}: RecurringTaskCardProps) {
  const { t } = useLanguage();
  const isDone = task.status === RecurringTaskStatus.Done;

  function handleToggleStatus() {
    if (isUpdating) {
      return;
    }

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
      accent={isDone ? 'success' : 'none'}
      compact
      padding={8}
      radius={12}
      style={isDone ? styles.doneShell : undefined}
    >
      <View style={styles.row}>
        <Pressable
          style={styles.checkboxHitArea}
          accessibilityLabel={t('recurring.status')}
          onPress={handleToggleStatus}
          disabled={isUpdating}
        >
          <View style={[styles.checkboxOuter, isDone && styles.checkboxOuterDone]}>
            <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
              {isDone ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
          </View>
        </Pressable>

        <View style={styles.content}>
          <Text
            style={[styles.title, isDone && styles.titleDone]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <View style={styles.streakPill}>
            <FireIcon size={10} />
            <Text style={styles.streakText}>
              {t('recurring.streak.count', { count: String(task.streakCount) })}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            accessibilityLabel={t('recurring.edit')}
            onPress={() => onEdit(task.id)}
            disabled={isUpdating}
          >
            <EditIcon size={14} />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            accessibilityLabel={t('recurring.delete')}
            onPress={() => onDelete(task)}
            disabled={isUpdating}
          >
            <MoreIcon size={14} />
          </Pressable>
        </View>
      </View>
    </PremiumSurface>
  );
}

const styles = StyleSheet.create({
  doneShell: {
    opacity: 0.85,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxHitArea: {
    padding: 2,
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
  checkboxOuterDone: {
    backgroundColor: 'rgba(82, 183, 136, 0.18)',
    borderColor: 'rgba(82, 183, 136, 0.45)',
    shadowColor: recurringTheme.accent,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: recurringTheme.accentBright,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxDone: {
    backgroundColor: recurringTheme.accentDark,
    borderColor: recurringTheme.accentBright,
  },
  checkmark: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
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
    color: recurringTheme.textSecondary,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: recurringTheme.fireRedSoft,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.28)',
  },
  streakText: {
    fontSize: 10,
    fontWeight: '800',
    color: recurringTheme.fireRedBright,
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
