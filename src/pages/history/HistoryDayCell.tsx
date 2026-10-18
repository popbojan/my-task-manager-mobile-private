import { StyleSheet, Text, View } from 'react-native';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  CheckIcon,
  CrossIcon,
  FireIcon,
  NoteIcon,
} from '@/pages/recurring-tasks/premium/PremiumIcons';
import PremiumProgressRing from '@/pages/recurring-tasks/premium/PremiumProgressRing';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import {
  formatHistoryLevelDisplay,
  formatHistoryStreakDisplay,
  formatHistoryTaskRatioDisplay,
  resolveHistoryDayCellTone,
  resolveHistoryDayProgressPercent,
  shouldShowHistoryDayDetails,
  shouldShowHistoryInProgressMark,
  shouldShowHistoryMissedMark,
  shouldShowHistoryNoteMark,
  shouldShowHistorySuccessCrown,
  type HistoryDayCellTone,
} from '@/utils/historyCalendar';

type HistoryDayCellProps = {
  dayOfMonth: number;
  entry?: HistoryDay;
  isToday: boolean;
  height: number;
  variant?: 'default' | 'onboarding';
};

function toneStyles(
  tone: HistoryDayCellTone,
  isToday: boolean,
  variant: 'default' | 'onboarding',
) {
  const base = isToday ? styles.todayOutline : null;
  const shell = variant === 'onboarding' ? styles.cellOnboarding : styles.cell;

  switch (tone) {
    case 'success':
      return [shell, styles.cellSuccess, base];
    case 'missed':
      return [shell, styles.cellMissed, base];
    case 'in_progress':
      return [shell, styles.cellInProgress, base];
    default:
      return [shell, styles.cellNeutral, base];
  }
}

function HistoryStatusBadge({
  entry,
  variant = 'default',
}: {
  entry?: HistoryDay;
  variant?: 'default' | 'onboarding';
}) {
  const isOnboarding = variant === 'onboarding';
  const badgeStyle = isOnboarding ? styles.statusBadgeOnboarding : styles.statusBadge;

  if (shouldShowHistorySuccessCrown(entry)) {
    return (
      <View style={[badgeStyle, styles.successBadge]}>
        <CheckIcon size={isOnboarding ? 7 : 9} color={recurringTheme.accentBright} />
      </View>
    );
  }

  if (shouldShowHistoryMissedMark(entry)) {
    return (
      <View style={[badgeStyle, styles.missedBadge]}>
        <CrossIcon size={isOnboarding ? 7 : 9} color={recurringTheme.fireRedBright} />
      </View>
    );
  }

  const progressPercent = resolveHistoryDayProgressPercent(entry);
  if (shouldShowHistoryInProgressMark(entry) && progressPercent !== null) {
    return (
      <View style={[badgeStyle, styles.inProgressBadge]}>
        <PremiumProgressRing
          compact
          percent={progressPercent}
          size={isOnboarding ? 10 : 12}
          stroke={1.5}
          tone="gold"
        />
      </View>
    );
  }

  return null;
}

export default function HistoryDayCell({
  dayOfMonth,
  entry,
  isToday,
  height,
  variant = 'default',
}: HistoryDayCellProps) {
  const { t } = useLanguage();
  const tone = resolveHistoryDayCellTone(entry);
  const showDetails = shouldShowHistoryDayDetails(entry);
  const showNoteMark = shouldShowHistoryNoteMark(entry);
  const isOnboarding = variant === 'onboarding';

  return (
    <View style={[toneStyles(tone, isToday, variant), styles.cellFill, { minHeight: height }]}>
      <View style={[styles.topRow, isOnboarding ? styles.topRowOnboarding : null]}>
        <Text
          style={[
            isOnboarding ? styles.dayNumberOnboarding : styles.dayNumber,
            isToday && styles.dayNumberToday,
          ]}
        >
          {dayOfMonth}
        </Text>
        <View style={[styles.topRightMarks, isOnboarding ? styles.topRightMarksOnboarding : null]}>
          {showNoteMark ? (
            <View
              style={[
                isOnboarding ? styles.statusBadgeOnboarding : styles.statusBadge,
                styles.noteBadge,
              ]}
              accessibilityLabel={t('history.hasNote')}
              importantForAccessibility="yes"
            >
              <NoteIcon size={isOnboarding ? 7 : 8} color={recurringTheme.textPrimary} />
            </View>
          ) : null}
          <HistoryStatusBadge entry={entry} variant={variant} />
        </View>
      </View>

      {showDetails ? (
        <View style={[styles.detailsColumn, isOnboarding ? styles.detailsColumnOnboarding : null]}>
          <Text style={isOnboarding ? styles.ratioOnboarding : styles.ratio}>
            {formatHistoryTaskRatioDisplay(entry)}
          </Text>

          <View style={styles.streakRow}>
            <FireIcon size={isOnboarding ? 10 : 11} color={recurringTheme.goldBright} />
            <Text style={isOnboarding ? styles.metricTextOnboarding : styles.metricText}>
              {formatHistoryStreakDisplay(entry)}
            </Text>
          </View>

          <Text
            style={isOnboarding ? styles.levelTextOnboarding : styles.levelText}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {t('history.levelShort', {
              level: formatHistoryLevelDisplay(entry),
            })}
          </Text>
        </View>
      ) : (
        <View style={styles.detailsPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cellOnboarding: {
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cellFill: {
    width: '100%',
    flex: 1,
  },
  cellNeutral: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cellSuccess: {
    backgroundColor: 'rgba(82, 183, 136, 0.32)',
    borderColor: 'rgba(82, 183, 136, 0.45)',
  },
  cellMissed: {
    backgroundColor: 'rgba(239, 68, 68, 0.28)',
    borderColor: 'rgba(248, 113, 113, 0.42)',
  },
  cellInProgress: {
    backgroundColor: 'rgba(212, 168, 67, 0.28)',
    borderColor: 'rgba(240, 204, 98, 0.42)',
  },
  todayOutline: {
    borderColor: recurringTheme.accentBright,
    borderWidth: 1.5,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 2,
  },
  topRowOnboarding: {
    gap: 1,
  },
  topRightMarks: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 1,
    flexShrink: 0,
  },
  topRightMarksOnboarding: {
    gap: 0,
    maxWidth: 22,
  },
  statusBadgeOnboarding: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  dayNumberOnboarding: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    flexShrink: 1,
    minWidth: 0,
  },
  statusBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  dayNumberToday: {
    color: recurringTheme.accentBright,
  },
  successBadge: {
    backgroundColor: 'rgba(82, 183, 136, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(110, 207, 170, 0.45)',
  },
  missedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.42)',
  },
  inProgressBadge: {
    backgroundColor: 'rgba(212, 168, 67, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(240, 204, 98, 0.35)',
  },
  detailsColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
  },
  detailsColumnOnboarding: {
    gap: 3,
  },
  ratio: {
    color: recurringTheme.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 21,
  },
  ratioOnboarding: {
    color: recurringTheme.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 17,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 16,
  },
  metricText: {
    color: recurringTheme.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  metricTextOnboarding: {
    color: recurringTheme.textPrimary,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
  levelText: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  levelTextOnboarding: {
    color: recurringTheme.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  detailsPlaceholder: {
    flex: 1,
    minHeight: 36,
  },
});
