import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { MasteryLevel } from '@/api/generated/models/MasteryLevel';
import type { RecurringTaskProgress } from '@/api/generated/models/RecurringTaskProgress';
import { getMasteryAvatarSource } from '@/assets/masteryAvatars';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  CrownIcon,
  FireIcon,
  IconBadge,
  StarIcon,
  TrophyIcon,
} from '@/pages/recurring-tasks/premium/PremiumIcons';
import PremiumSurface from '@/pages/recurring-tasks/premium/PremiumSurface';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import { computeLevelProgress } from '@/utils/masteryProgress';
import { getMasteryLevelName } from '@/utils/masteryLevelName';

type StatTone = 'red' | 'green' | 'gold';

function StatCard({
  label,
  value,
  tone,
  icon,
  variant = 'stacked',
}: {
  label: string;
  value: string;
  tone: StatTone;
  icon: ReactNode;
  variant?: 'stacked' | 'inline';
}) {
  const accent = tone === 'red' ? 'red' : tone === 'gold' ? 'gold' : 'green';
  const isInline = variant === 'inline';

  return (
    <PremiumSurface
      accent={accent}
      compact
      padding={isInline ? 10 : 7}
      radius={12}
      style={[styles.statShell, isInline && styles.statShellInline]}
      contentStyle={[styles.statContent, isInline && styles.statContentInline]}
    >
      {isInline ? (
        <>
          <IconBadge tone={tone} size={34}>
            {icon}
          </IconBadge>
          <View style={styles.statCopyInline}>
            <Text
              style={styles.statValueInline}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {value}
            </Text>
            <Text style={styles.statLabelInline} numberOfLines={2}>
              {label}
            </Text>
          </View>
        </>
      ) : (
        <>
          <IconBadge tone={tone} size={24}>
            {icon}
          </IconBadge>
          <Text
            style={styles.statValue}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {value}
          </Text>
          <Text style={styles.statLabel} numberOfLines={2}>
            {label}
          </Text>
        </>
      )}
    </PremiumSurface>
  );
}

type StatCardConfig = {
  key: string;
  label: string;
  value: string;
  tone: StatTone;
  icon: ReactNode;
};

function renderStatCard(
  { key: _key, ...card }: StatCardConfig,
  variant: 'stacked' | 'inline' = 'stacked',
) {
  return <StatCard {...card} variant={variant} />;
}

export function MasteryStatsGrid({
  progress,
  layout = 'row',
}: {
  progress: RecurringTaskProgress;
  layout?: 'row' | 'grid';
}) {
  const { t } = useLanguage();
  const iconSize = (compact: number, expanded: number) =>
    layout === 'grid' ? expanded : compact;

  const cards: StatCardConfig[] = [
    {
      key: 'current-streak',
      tone: 'red' as const,
      icon: <FireIcon size={iconSize(11, 14)} />,
      label: t('recurring.stats.currentStreak'),
      value: t('recurring.stats.daysValue', {
        days: String(progress.currentStreak),
      }),
    },
    {
      key: 'highest-streak',
      tone: 'gold' as const,
      icon: <TrophyIcon size={iconSize(13, 15)} />,
      label: t('recurring.stats.highestStreak'),
      value: t('recurring.stats.daysValue', {
        days: String(progress.highestStreakReached),
      }),
    },
    {
      key: 'current-level',
      tone: 'green' as const,
      icon: <StarIcon size={iconSize(13, 15)} />,
      label: t('recurring.stats.currentLevel'),
      value: t('recurring.stats.levelValue', {
        level: String(progress.currentLevel),
      }),
    },
    {
      key: 'highest-level',
      tone: 'gold' as const,
      icon: <CrownIcon size={iconSize(13, 15)} />,
      label: t('recurring.stats.highestLevel'),
      value: t('recurring.stats.levelValue', {
        level: String(progress.highestLevelReached),
      }),
    },
  ];

  if (layout === 'grid') {
    return (
      <View style={styles.statsGridLayout}>
        <View style={styles.statsGridRow}>
          {renderStatCard(cards[0]!, 'inline')}
          {renderStatCard(cards[1]!, 'inline')}
        </View>
        <View style={styles.statsGridRow}>
          {renderStatCard(cards[2]!, 'inline')}
          {renderStatCard(cards[3]!, 'inline')}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.statsGrid}>
      {cards.map(({ key, ...card }) => (
        <StatCard key={key} {...card} />
      ))}
    </View>
  );
}

export default function MasteryProfileHero({
  progress,
  levels,
  showProgressPercent = false,
}: {
  progress: RecurringTaskProgress;
  levels: MasteryLevel[];
  showProgressPercent?: boolean;
}) {
  const { t, language } = useLanguage();
  const levelProgress = computeLevelProgress(
    levels,
    progress.currentStreak,
    progress.currentLevel,
  );
  const currentLevel = levelProgress.currentLevel;
  const nextLevel = levelProgress.nextLevel;
  const avatarSource = getMasteryAvatarSource(currentLevel?.avatarKey);
  const avatarSize = 68;

  return (
    <View style={styles.profileRow}>
      <View style={[styles.avatarWrap, { width: avatarSize }]}>
        <View
          style={[
            styles.avatarGlow,
            {
              width: avatarSize + 8,
              height: avatarSize + 8,
              borderRadius: (avatarSize + 8) / 2,
            },
          ]}
        />
        <View
          style={[
            styles.avatarRingOuter,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        >
          <View style={styles.avatarRingMid}>
            <View style={styles.avatarRingInner}>
              {avatarSource ? (
                <Image source={avatarSource} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]} />
              )}
            </View>
          </View>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{progress.currentLevel}</Text>
        </View>
      </View>

      <View style={styles.levelInfo}>
        <Text style={styles.levelLabel}>
          {t('recurring.profile.levelLabel', {
            level: String(progress.currentLevel),
          })}
        </Text>
        <Text style={styles.levelName} numberOfLines={1}>
          {currentLevel
            ? getMasteryLevelName(currentLevel, language)
            : t('recurring.profile.unknownLevel')}
        </Text>

        {nextLevel ? (
          <>
            <Text style={styles.progressText} numberOfLines={1}>
              {t('recurring.profile.daysToNext', {
                current: String(levelProgress.daysInCurrentLevel),
                total: String(levelProgress.daysNeededForNextLevel),
                next: String(nextLevel.number),
              })}
            </Text>
            <View style={styles.progressBarRow}>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${levelProgress.progressPercent}%` },
                  ]}
                />
              </View>
              {showProgressPercent ? (
                <Text style={styles.progressPercentLabel}>
                  {levelProgress.progressPercent}%
                </Text>
              ) : null}
            </View>
          </>
        ) : (
          <Text style={styles.maxLevel}>{t('recurring.profile.maxLevel')}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: 5,
  },
  statsGridLayout: {
    gap: 6,
  },
  statsGridRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statShell: {
    flex: 1,
    minWidth: 0,
  },
  statShellInline: {
    minHeight: 72,
    justifyContent: 'center',
  },
  statContent: {
    gap: 2,
  },
  statContentInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statCopyInline: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  statValue: {
    ...premiumType.statValue,
    color: recurringTheme.textPrimary,
    fontSize: 12,
  },
  statValueInline: {
    color: recurringTheme.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  statLabel: {
    color: recurringTheme.textMuted,
    fontSize: 7,
    fontWeight: '600',
    lineHeight: 10,
  },
  statLabelInline: {
    color: recurringTheme.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 13,
  },
  profileRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  avatarWrap: {
    alignItems: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    top: -4,
    backgroundColor: recurringTheme.accentGlow,
    opacity: 0.65,
  },
  avatarRingOuter: {
    padding: 2,
    backgroundColor: recurringTheme.accentBright,
    shadowColor: recurringTheme.accentBright,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  avatarRingMid: {
    flex: 1,
    borderRadius: 999,
    padding: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  avatarRingInner: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: recurringTheme.surfaceElevated,
    borderWidth: 2,
    borderColor: 'rgba(6, 9, 8, 0.85)',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarFallback: {
    backgroundColor: '#40916c',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -3,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.accentDark,
    borderWidth: 2,
    borderColor: recurringTheme.accentBright,
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  levelInfo: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  levelLabel: {
    ...premiumType.overline,
    color: recurringTheme.accentBright,
    fontSize: 9,
  },
  levelName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: 10,
    fontWeight: '600',
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  progressPercentLabel: {
    color: recurringTheme.accentBright,
    fontSize: 10,
    fontWeight: '800',
    minWidth: 28,
    textAlign: 'right',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: recurringTheme.accentBright,
    minWidth: 3,
  },
  maxLevel: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 11,
    fontWeight: '600',
  },
});
