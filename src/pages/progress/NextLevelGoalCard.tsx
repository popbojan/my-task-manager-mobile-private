import { Image, StyleSheet, Text, View } from 'react-native';
import type { MasteryLevel } from '@/api/generated/models/MasteryLevel';
import { getMasteryAvatarSource } from '@/assets/masteryAvatars';
import { useLanguage } from '@/i18n/LanguageProvider';
import PremiumProgressRing from '@/pages/recurring-tasks/premium/PremiumProgressRing';
import PremiumSurface from '@/pages/recurring-tasks/premium/PremiumSurface';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import type { LevelProgress } from '@/utils/masteryProgress';
import { getMasteryLevelName } from '@/utils/masteryLevelName';

type NextLevelGoalCardProps = {
  levelProgress: LevelProgress;
};

export default function NextLevelGoalCard({ levelProgress }: NextLevelGoalCardProps) {
  const { t, language } = useLanguage();
  const nextLevel = levelProgress.nextLevel;

  if (!nextLevel) {
    return null;
  }

  const daysRemaining = Math.max(
    0,
    levelProgress.daysNeededForNextLevel - levelProgress.daysInCurrentLevel,
  );
  const avatarSource = getMasteryAvatarSource(nextLevel.avatarKey);

  return (
    <PremiumSurface accent="green" compact padding={12} radius={14}>
      <View style={styles.row}>
        <View style={styles.avatarWrap}>
          {avatarSource ? (
            <Image source={avatarSource} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]} />
          )}
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{nextLevel.number}</Text>
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>
            {t('progress.nextGoalTitle', {
              level: String(nextLevel.number),
              name: getMasteryLevelName(nextLevel, language),
            })}
          </Text>
          <Text style={styles.subtitle}>
            {t('progress.daysToNextLevel', { count: String(daysRemaining) })}
          </Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${levelProgress.progressPercent}%` },
              ]}
            />
          </View>
        </View>

        <PremiumProgressRing
          percent={levelProgress.progressPercent}
          size={52}
          stroke={3}
          tone="green"
        >
          <Text style={styles.ringPercent}>{levelProgress.progressPercent}%</Text>
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
  avatarWrap: {
    width: 52,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: recurringTheme.cardBorderAccent,
    backgroundColor: recurringTheme.surfaceInset,
  },
  avatarFallback: {
    backgroundColor: '#40916c',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.accentDark,
    borderWidth: 1.5,
    borderColor: recurringTheme.accentBright,
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    ...premiumType.title,
    fontSize: 14,
    color: recurringTheme.textPrimary,
  },
  subtitle: {
    color: recurringTheme.accentBright,
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: recurringTheme.surfaceInset,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: recurringTheme.accentBright,
    minWidth: 3,
  },
  ringPercent: {
    color: recurringTheme.accentBright,
    fontSize: 11,
    fontWeight: '800',
  },
});
