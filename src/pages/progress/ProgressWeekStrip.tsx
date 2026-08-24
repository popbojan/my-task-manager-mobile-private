import { StyleSheet, Text, View } from 'react-native';
import type { AppLanguage } from '@/i18n/types';
import { useLanguage } from '@/i18n/LanguageProvider';
import PremiumProgressRing from '@/pages/recurring-tasks/premium/PremiumProgressRing';
import PremiumSurface from '@/pages/recurring-tasks/premium/PremiumSurface';
import { CheckIcon } from '@/pages/recurring-tasks/premium/PremiumIcons';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import {
  buildWeekDayStates,
  getWeekDaysMondayStart,
  type WeekDayState,
} from '@/pages/progress/progressWeekUtils';
import type { RecurringTaskProgress } from '@/api/generated/models/RecurringTaskProgress';

type ProgressWeekStripProps = {
  progress: RecurringTaskProgress;
  doneTasksToday: number;
  totalTasksToday: number;
};

const LOCALE_MAP: Record<AppLanguage, string> = {
  de: 'de-DE',
  en: 'en-GB',
  fr: 'fr-FR',
  sr: 'sr-RS',
};

function formatWeekdayLabel(date: Date, language: AppLanguage): string {
  const label = new Intl.DateTimeFormat(LOCALE_MAP[language], {
    weekday: 'short',
  }).format(date);
  return label.replace(/\./g, '').slice(0, 2).toUpperCase();
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
}: ProgressWeekStripProps) {
  const { t, language } = useLanguage();
  const weekDays = getWeekDaysMondayStart();
  const states = buildWeekDayStates(
    progress,
    doneTasksToday,
    totalTasksToday,
  );
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
        {weekDays.map((day, index) => (
          <View key={day.toISOString()} style={styles.dayItem}>
            <Text style={styles.weekday}>{formatWeekdayLabel(day, language)}</Text>
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
