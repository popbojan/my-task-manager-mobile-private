import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { useCurrentCalendarDate } from '@/history/useCurrentCalendarDate';
import { useCurrentUser } from '@/user/useCurrentUser';
import { getDeviceTimezone } from '@/user/deviceTimezone';
import { rollingCalendarDatesEndingToday } from '@/utils/calendarDateInTimeZone';
import { parseCalendarDate } from '@/utils/historyCalendar';
import PremiumProgressRing from '@/pages/recurring-tasks/premium/PremiumProgressRing';
import PremiumSurface from '@/pages/recurring-tasks/premium/PremiumSurface';
import { CheckIcon } from '@/pages/recurring-tasks/premium/PremiumIcons';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import {
  buildWeekDayStates,
  type WeekDayState,
} from '@/pages/progress/progressWeekUtils';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import type { RecurringTaskProgress } from '@/api/generated/models/RecurringTaskProgress';

type ProgressWeekStripProps = {
  progress: RecurringTaskProgress;
  doneTasksToday: number;
  totalTasksToday: number;
  historyDaysByDate: Map<string, HistoryDay>;
};

const WEEKDAY_KEYS = [
  'history.weekday.sun',
  'history.weekday.mon',
  'history.weekday.tue',
  'history.weekday.wed',
  'history.weekday.thu',
  'history.weekday.fri',
  'history.weekday.sat',
] as const;

function formatWeekdayLabel(calendarDate: string, t: (key: (typeof WEEKDAY_KEYS)[number]) => string): string {
  const weekdayIndex = parseCalendarDate(calendarDate).getUTCDay();
  return t(WEEKDAY_KEYS[weekdayIndex]!);
}

function WeekDayCircle({ state }: { state: WeekDayState }) {
  if (state.kind === 'today') {
    const percent =
      state.total > 0 ? Math.round((state.done / state.total) * 100) : 0;
    const label =
      state.total > 0 ? `${state.done}/${state.total}` : '0/0';

    if (state.total > 0 && state.done >= state.total) {
      return (
        <View style={[styles.dayCircle, styles.dayCircleComplete]}>
          <CheckIcon size={14} />
        </View>
      );
    }

    return (
      <PremiumProgressRing percent={percent} size={42} stroke={2.5} tone="green">
        <Text style={styles.todayRatio}>{label}</Text>
      </PremiumProgressRing>
    );
  }

  if (state.kind === 'complete') {
    return (
      <View style={[styles.dayCircle, styles.dayCircleComplete]}>
        <CheckIcon size={14} />
      </View>
    );
  }

  return <View style={[styles.dayCircle, styles.dayCircleEmpty]} />;
}

export default function ProgressWeekStrip({
  progress,
  doneTasksToday,
  totalTasksToday,
  historyDaysByDate,
}: ProgressWeekStripProps) {
  const { t } = useLanguage();
  const currentUserQuery = useCurrentUser();
  const timeZone = currentUserQuery.data?.timezone ?? getDeviceTimezone();
  const calendarDate = useCurrentCalendarDate(timeZone);
  const weekCalendarDates = rollingCalendarDatesEndingToday(calendarDate, 7);
  const states = buildWeekDayStates(progress, doneTasksToday, totalTasksToday, {
    timeZone,
    historyDaysByDate,
  });
  const openTasks = Math.max(0, totalTasksToday - doneTasksToday);

  const footerLabel =
    totalTasksToday === 0
      ? t('recurring.noTasks')
      : openTasks === 0
        ? t('progress.allDoneToday')
        : openTasks === 1
          ? t('progress.remainingTodayOne')
          : t('progress.remainingToday', { count: String(openTasks) });

  return (
    <PremiumSurface accent="green" compact padding={12} radius={14} contentStyle={styles.wrap}>
      <View style={styles.row}>
        {weekCalendarDates.map((calendarDate, index) => (
          <View key={calendarDate} style={styles.dayItem}>
            <Text style={styles.weekday}>{formatWeekdayLabel(calendarDate, t)}</Text>
            <WeekDayCircle state={states[index]!} />
          </View>
        ))}
      </View>
      <Text style={styles.footer}>{footerLabel}</Text>
    </PremiumSurface>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 6,
  },
  weekday: {
    color: recurringTheme.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  dayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayCircleEmpty: {
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceInset,
  },
  dayCircleComplete: {
    borderColor: recurringTheme.cardBorderAccent,
    backgroundColor: 'rgba(82, 183, 136, 0.12)',
  },
  todayRatio: {
    color: recurringTheme.accentBright,
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
  },
  footer: {
    color: recurringTheme.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
