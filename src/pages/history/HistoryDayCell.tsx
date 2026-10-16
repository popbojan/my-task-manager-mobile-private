import { StyleSheet, Text, View } from 'react-native';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import { FireIcon } from '@/pages/recurring-tasks/premium/PremiumIcons';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import {
  formatHistoryTaskRatio,
  resolveHistoryDayCellTone,
  shouldShowHistoryMetrics,
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
  const ratio = formatHistoryTaskRatio(entry);
  const showMetrics = shouldShowHistoryMetrics(entry);

  return (
    <View style={[toneStyles(tone, isToday), { minHeight: height }]}>
      <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>
        {dayOfMonth}
      </Text>

      {ratio ? <Text style={styles.ratio}>{ratio}</Text> : <View style={styles.ratioSpacer} />}

      {showMetrics && entry ? (
        <View style={styles.metricsRow}>
          {entry.currentStreak !== null ? (
            <View style={styles.metricItem}>
              <FireIcon size={9} color={recurringTheme.goldBright} />
              <Text style={styles.metricText}>{entry.currentStreak}</Text>
            </View>
          ) : null}
          {entry.currentLevel !== null ? (
            <Text style={styles.levelText}>Lv {entry.currentLevel}</Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.metricsSpacer} />
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
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
  ratio: {
    color: recurringTheme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  ratioSpacer: {
    height: 18,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metricText: {
    color: recurringTheme.textPrimary,
    fontSize: 10,
    fontWeight: '800',
  },
  levelText: {
    color: recurringTheme.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  metricsSpacer: {
    height: 14,
  },
});
