import { StyleSheet, Text, View } from 'react-native';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import { FireIcon } from '@/pages/recurring-tasks/premium/PremiumIcons';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import {
  formatHistoryLevelDisplay,
  formatHistoryStreakDisplay,
  formatHistoryTaskRatioDisplay,
  resolveHistoryDayCellTone,
  shouldShowHistoryDayDetails,
  type HistoryDayCellTone,
} from '@/utils/historyCalendar';

type HistoryDayCellProps = {
  dayOfMonth: number;
  entry?: HistoryDay;
  isAdjacentMonth?: boolean;
  isToday: boolean;
  height: number;
};

function toneStyles(
  tone: HistoryDayCellTone,
  isToday: boolean,
  isAdjacentMonth: boolean,
) {
  const base = isToday ? styles.todayOutline : null;
  const scope = isAdjacentMonth ? styles.cellAdjacent : null;

  switch (tone) {
    case 'success':
      return [
        styles.cell,
        isAdjacentMonth ? styles.cellAdjacentSuccess : styles.cellSuccess,
        scope,
        base,
      ];
    case 'missed':
      return [
        styles.cell,
        isAdjacentMonth ? styles.cellAdjacentMissed : styles.cellMissed,
        scope,
        base,
      ];
    case 'in_progress':
      return [
        styles.cell,
        isAdjacentMonth ? styles.cellAdjacentInProgress : styles.cellInProgress,
        scope,
        base,
      ];
    default:
      return [styles.cell, isAdjacentMonth ? styles.cellAdjacentNeutral : styles.cellNeutral, scope, base];
  }
}

export default function HistoryDayCell({
  dayOfMonth,
  entry,
  isAdjacentMonth = false,
  isToday,
  height,
}: HistoryDayCellProps) {
  const tone = resolveHistoryDayCellTone(entry);
  const showDetails = shouldShowHistoryDayDetails(entry);

  return (
    <View style={[toneStyles(tone, isToday, isAdjacentMonth), { minHeight: height }]}>
      <Text
        style={[
          styles.dayNumber,
          isToday && styles.dayNumberToday,
          isAdjacentMonth && styles.dayNumberAdjacent,
        ]}
      >
        {dayOfMonth}
      </Text>

      {showDetails ? (
        <View style={styles.detailsColumn}>
          <Text style={[styles.ratio, isAdjacentMonth && styles.metricAdjacent]}>
            {formatHistoryTaskRatioDisplay(entry)}
          </Text>

          <View style={styles.streakRow}>
            <FireIcon size={9} color={recurringTheme.goldBright} />
            <Text style={[styles.metricText, isAdjacentMonth && styles.metricAdjacent]}>
              {formatHistoryStreakDisplay(entry)}
            </Text>
          </View>

          <Text style={[styles.levelText, isAdjacentMonth && styles.metricAdjacent]}>
            Lv {formatHistoryLevelDisplay(entry)}
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
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cellNeutral: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cellAdjacentNeutral: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  cellSuccess: {
    backgroundColor: 'rgba(82, 183, 136, 0.32)',
    borderColor: 'rgba(82, 183, 136, 0.45)',
  },
  cellAdjacentSuccess: {
    backgroundColor: 'rgba(27, 67, 50, 0.55)',
    borderColor: 'rgba(82, 183, 136, 0.18)',
  },
  cellMissed: {
    backgroundColor: 'rgba(239, 68, 68, 0.28)',
    borderColor: 'rgba(248, 113, 113, 0.42)',
  },
  cellAdjacentMissed: {
    backgroundColor: 'rgba(80, 24, 24, 0.55)',
    borderColor: 'rgba(248, 113, 113, 0.16)',
  },
  cellInProgress: {
    backgroundColor: 'rgba(212, 168, 67, 0.28)',
    borderColor: 'rgba(240, 204, 98, 0.42)',
  },
  cellAdjacentInProgress: {
    backgroundColor: 'rgba(74, 58, 18, 0.55)',
    borderColor: 'rgba(240, 204, 98, 0.16)',
  },
  cellAdjacent: {
    opacity: 0.88,
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
  dayNumberAdjacent: {
    color: recurringTheme.textMuted,
    opacity: 0.55,
  },
  detailsColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: '100%',
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
  metricAdjacent: {
    opacity: 0.82,
  },
  detailsPlaceholder: {
    flex: 1,
    minHeight: 36,
  },
});
