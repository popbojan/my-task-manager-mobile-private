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
};

function toneStyles(tone: HistoryDayCellTone, isToday: boolean) {
  const base = isToday ? styles.todayOutline : null;

  switch (tone) {
    case 'success':
      return [styles.cell, styles.cellSuccess, base];
    case 'missed':
      return [styles.cell, styles.cellMissed, base];
    case 'in_progress':
      return [styles.cell, styles.cellInProgress, base];
    default:
      return [styles.cell, styles.cellNeutral, base];
  }
}

function HistoryStatusBadge({ entry }: { entry?: HistoryDay }) {
  if (shouldShowHistorySuccessCrown(entry)) {
    return (
      <View style={[styles.statusBadge, styles.successBadge]}>
        <CheckIcon size={9} color={recurringTheme.accentBright} />
      </View>
    );
  }

  if (shouldShowHistoryMissedMark(entry)) {
    return (
      <View style={[styles.statusBadge, styles.missedBadge]}>
        <CrossIcon size={9} color={recurringTheme.fireRedBright} />
      </View>
    );
  }

  const progressPercent = resolveHistoryDayProgressPercent(entry);
  if (shouldShowHistoryInProgressMark(entry) && progressPercent !== null) {
    return (
      <View style={[styles.statusBadge, styles.inProgressBadge]}>
        <PremiumProgressRing
          compact
          percent={progressPercent}
          size={12}
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
}: HistoryDayCellProps) {
  const { t } = useLanguage();
  const tone = resolveHistoryDayCellTone(entry);
  const showDetails = shouldShowHistoryDayDetails(entry);
  const showNoteMark = shouldShowHistoryNoteMark(entry);

  return (
    <View style={[toneStyles(tone, isToday), styles.cellFill, { minHeight: height }]}>
      <View style={styles.topRow}>
        <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
          {dayOfMonth}
        </Text>
        <View style={styles.topRightMarks}>
          {showNoteMark ? (
            <View
              style={[styles.statusBadge, styles.noteBadge]}
              accessibilityLabel={t('history.hasNote')}
              importantForAccessibility="yes"
            >
              <NoteIcon size={8} color={recurringTheme.textPrimary} />
            </View>
          ) : null}
          <HistoryStatusBadge entry={entry} />
        </View>
      </View>

      {showDetails ? (
        <View style={styles.detailsColumn}>
          <Text style={styles.ratio}>{formatHistoryTaskRatioDisplay(entry)}</Text>

          <View style={styles.streakRow}>
            <FireIcon size={11} color={recurringTheme.goldBright} />
            <Text style={styles.metricText}>{formatHistoryStreakDisplay(entry)}</Text>
          </View>

          <Text
            style={styles.levelText}
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
  topRightMarks: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 1,
    flexShrink: 0,
  },
  dayNumber: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    fontWeight: '700',
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
  ratio: {
    color: recurringTheme.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 21,
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
  levelText: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
  detailsPlaceholder: {
    flex: 1,
    minHeight: 36,
  },
});
