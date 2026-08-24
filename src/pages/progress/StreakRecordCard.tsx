import { StyleSheet, Text, View } from 'react-native';
import type { RecurringTaskProgress } from '@/api/generated/models/RecurringTaskProgress';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ShieldCrownIcon, TrophyIcon } from '@/pages/recurring-tasks/premium/PremiumIcons';
import PremiumSurface from '@/pages/recurring-tasks/premium/PremiumSurface';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type StreakRecordCardProps = {
  progress: RecurringTaskProgress;
};

export default function StreakRecordCard({ progress }: StreakRecordCardProps) {
  const { t } = useLanguage();
  const { currentStreak, highestStreakReached } = progress;

  if (highestStreakReached <= 0) {
    return null;
  }

  const isAtRecord = currentStreak >= highestStreakReached;
  const daysToRecord = Math.max(0, highestStreakReached - currentStreak);
  const progressPercent = isAtRecord
    ? 100
    : Math.min(
        100,
        Math.round((currentStreak / highestStreakReached) * 100),
      );

  return (
    <PremiumSurface accent="gold" compact padding={12} radius={14}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <ShieldCrownIcon size={34} />
          <View style={styles.trophyBadge}>
            <TrophyIcon size={10} />
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>{t('progress.recordInSight')}</Text>
          <Text style={styles.body}>
            {isAtRecord
              ? t('progress.recordAchieved')
              : t('progress.daysToRecord', { count: String(daysToRecord) })}
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${progressPercent}%` }]}
        />
      </View>
    </PremiumSurface>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iconWrap: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophyBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  eyebrow: {
    ...premiumType.overline,
    color: recurringTheme.goldBright,
    fontSize: 9,
  },
  body: {
    color: recurringTheme.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: recurringTheme.surfaceInset,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.22)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: recurringTheme.goldBright,
    minWidth: 3,
  },
});
