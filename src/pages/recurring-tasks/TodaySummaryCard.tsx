import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ClockIcon, IconBadge } from '@/pages/recurring-tasks/premium/PremiumIcons';
import PremiumProgressRing from '@/pages/recurring-tasks/premium/PremiumProgressRing';
import PremiumSurface from '@/pages/recurring-tasks/premium/PremiumSurface';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type TodaySummaryCardProps = {
  totalTasks: number;
  doneTasks: number;
  allComplete: boolean;
};

export default function TodaySummaryCard({
  totalTasks,
  doneTasks,
  allComplete,
}: TodaySummaryCardProps) {
  const { t } = useLanguage();
  const openTasks = Math.max(0, totalTasks - doneTasks);
  const percent =
    totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const isComplete = allComplete && totalTasks > 0;

  const remainingLabel =
    totalTasks === 0
      ? t('recurring.noTasks')
      : openTasks === 0
        ? t('recurring.today.allDone')
        : openTasks === 1
          ? t('recurring.today.remainingOne')
          : t('recurring.today.remaining', {
              count: String(openTasks),
            });

  return (
    <PremiumSurface
      accent={isComplete ? 'success' : totalTasks > 0 ? 'gold' : 'none'}
      compact
      padding={10}
      radius={14}
      style={isComplete ? styles.shellComplete : totalTasks > 0 ? styles.shellPending : undefined}
    >
      <View style={styles.row}>
        <IconBadge tone={isComplete ? 'green' : 'gold'} size={38}>
          <ClockIcon size={20} color={isComplete ? recurringTheme.accentBright : recurringTheme.goldBright} />
        </IconBadge>

        <View style={styles.copy}>
          <Text style={[styles.label, isComplete ? styles.labelComplete : styles.labelPending]}>
            {t('recurring.today.label')}
          </Text>
          <Text
            style={[
              styles.remaining,
              isComplete ? styles.remainingComplete : styles.remainingPending,
            ]}
          >
            {remainingLabel}
          </Text>
          <Text style={styles.reset}>{t('recurring.today.resetAt')}</Text>
        </View>

        <PremiumProgressRing
          percent={percent}
          size={56}
          stroke={3}
          tone={isComplete ? 'green' : 'gold'}
        >
          <Text
            style={[
              styles.progressPercent,
              isComplete ? styles.progressPercentComplete : styles.progressPercentPending,
            ]}
          >
            {percent}%
          </Text>
          <Text style={styles.progressCaption}>
            {t('recurring.today.doneLabel')}
          </Text>
        </PremiumProgressRing>
      </View>
    </PremiumSurface>
  );
}

const styles = StyleSheet.create({
  shellPending: {
    backgroundColor: 'rgba(212, 168, 67, 0.06)',
  },
  shellComplete: {
    backgroundColor: 'rgba(82, 183, 136, 0.1)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    ...premiumType.overline,
    fontSize: 9,
  },
  labelPending: {
    color: recurringTheme.goldBright,
  },
  labelComplete: {
    color: recurringTheme.accentBright,
  },
  remaining: {
    ...premiumType.title,
    fontSize: 16,
  },
  remainingPending: {
    color: recurringTheme.textPrimary,
  },
  remainingComplete: {
    color: recurringTheme.accentBright,
  },
  reset: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 15,
  },
  progressPercentPending: {
    color: recurringTheme.goldBright,
  },
  progressPercentComplete: {
    color: recurringTheme.accentBright,
  },
  progressCaption: {
    color: recurringTheme.textMuted,
    fontSize: 7,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 1,
    textAlign: 'center',
    maxWidth: 48,
  },
});
