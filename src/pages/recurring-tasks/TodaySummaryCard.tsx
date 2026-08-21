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
      accent={allComplete && totalTasks > 0 ? 'success' : 'green'}
      compact
      padding={10}
      radius={14}
    >
      <View style={styles.row}>
        <IconBadge tone="green" size={38}>
          <ClockIcon size={20} />
        </IconBadge>

        <View style={styles.copy}>
          <Text style={styles.label}>{t('recurring.today.label')}</Text>
          <Text style={styles.remaining}>{remainingLabel}</Text>
          <Text style={styles.reset}>{t('recurring.today.resetAt')}</Text>
        </View>

        <PremiumProgressRing percent={percent} size={56} stroke={3}>
          <Text style={styles.progressPercent}>{percent}%</Text>
          <Text style={styles.progressCaption}>
            {t('recurring.today.doneLabel')}
          </Text>
        </PremiumProgressRing>
      </View>
    </PremiumSurface>
  );
}

const styles = StyleSheet.create({
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
    color: recurringTheme.accentBright,
    fontSize: 9,
  },
  remaining: {
    ...premiumType.title,
    color: recurringTheme.textPrimary,
    fontSize: 16,
  },
  reset: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  progressPercent: {
    color: recurringTheme.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 15,
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
