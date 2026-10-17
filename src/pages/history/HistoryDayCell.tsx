import { StyleSheet, Text, View } from 'react-native';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import { CrownIcon, FireIcon } from '@/pages/recurring-tasks/premium/PremiumIcons';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import {
  formatHistoryLevelDisplay,
  formatHistoryStreakDisplay,
  formatHistoryTaskRatioDisplay,
  resolveHistoryDayCellTone,
  shouldShowHistoryDayDetails,
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

export default function HistoryDayCell({
  dayOfMonth,
  entry,
  isToday,
  height,
}: HistoryDayCellProps) {
  const tone = resolveHistoryDayCellTone(entry);
  const showDetails = shouldShowHistoryDayDetails(entry);
  const showSuccessCrown = shouldShowHistorySuccessCrown(entry);

  return (
    <View style={[toneStyles(tone, isToday), styles.cellFill, { minHeight: height }]}>
      <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
        {dayOfMonth}
      </Text>

      {showDetails ? (
        <View style={styles.detailsColumn}>
          <View style={styles.ratioBlock}>
            {showSuccessCrown ? (
              <View style={styles.successCrownBadge}>
                <View style={styles.successCrownFillDeep} />
                <CrownIcon size={12} color={recurringTheme.goldBright} />
              </View>
            ) : null}
            <Text style={styles.ratio}>{formatHistoryTaskRatioDisplay(entry)}</Text>
          </View>

          <View style={styles.streakRow}>
            <FireIcon size={9} color={recurringTheme.goldBright} />
            <Text style={styles.metricText}>{formatHistoryStreakDisplay(entry)}</Text>
          </View>

          <Text style={styles.levelText}>Lv {formatHistoryLevelDisplay(entry)}</Text>
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
  dayNumber: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    alignSelf: 'flex-start',
  },
  dayNumberToday: {
    color: recurringTheme.accentBright,
  },
  detailsColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: '100%',
  },
  ratioBlock: {
    alignItems: 'center',
    gap: 2,
  },
  successCrownBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: recurringTheme.goldSoft,
    borderWidth: 1.5,
    borderColor: 'rgba(240, 204, 98, 0.75)',
    marginBottom: 1,
  },
  successCrownFillDeep: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(72, 52, 14, 0.42)',
  },
  ratio: {
    color: recurringTheme.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 18,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 14,
  },
  metricText: {
    color: recurringTheme.textPrimary,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  levelText: {
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
