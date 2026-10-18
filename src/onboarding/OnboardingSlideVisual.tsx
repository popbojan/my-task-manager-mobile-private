import { StyleSheet, Text, View } from 'react-native';
import { RecurringTaskStatus } from '@/api/generated';
import { useLanguage } from '@/i18n/LanguageProvider';
import OnboardingAppPreview from '@/onboarding/OnboardingAppPreview';
import {
  createOnboardingDemoTask,
  ONBOARDING_DEMO_CALENDAR,
  ONBOARDING_DEMO_NOTE_DAY,
  ONBOARDING_DEMO_PROGRESS,
  ONBOARDING_DEMO_TASK_TITLE_KEY,
} from '@/onboarding/onboardingDemoData';
import type { OnboardingSlideId } from '@/onboarding/onboardingSlides';
import HistoryDayCell from '@/pages/history/HistoryDayCell';
import { CheckIcon, FireIcon } from '@/pages/recurring-tasks/premium/PremiumIcons';
import { MasteryStatsGrid } from '@/pages/recurring-tasks/MasteryProfileHero';
import { PlusIcon } from '@/pages/recurring-tasks/premium/TabIcons';
import RecurringTaskCard from '@/pages/recurring-tasks/RecurringTaskCard';
import { DAILY_STATUS_COLUMNS } from '@/pages/recurring-tasks/recurringBoardConfig';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import TodaySummaryCard from '@/pages/recurring-tasks/TodaySummaryCard';
import {
  formatHistoryLevelDisplay,
  formatHistoryStreakDisplay,
  formatHistoryTaskRatioDisplay,
  resolveHistoryDayCellTone,
} from '@/utils/historyCalendar';

type OnboardingSlideVisualProps = {
  slideId: OnboardingSlideId;
};

const noop = () => {};

const WEEKDAY_KEYS = [
  'history.weekday.mon',
  'history.weekday.tue',
  'history.weekday.wed',
  'history.weekday.thu',
  'history.weekday.fri',
  'history.weekday.sat',
  'history.weekday.sun',
] as const;

function DemoSectionHeader({
  taskCount = 1,
  highlightAdd = false,
}: {
  taskCount?: number;
  highlightAdd?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{t('recurring.tasks.sectionTitle')}</Text>
      <View style={styles.sectionHeaderRight}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>{taskCount}</Text>
        </View>
        <View style={[styles.addFab, highlightAdd ? styles.addFabHighlight : null]}>
          {highlightAdd ? <View style={styles.addFabRing} /> : null}
          <PlusIcon size={12} color="#fff" />
        </View>
      </View>
    </View>
  );
}

function CreateTaskFormPreview() {
  const { t } = useLanguage();

  return (
    <View style={styles.formOverlay}>
      <View style={styles.formPanel}>
        <View style={styles.formPanelHeader}>
          <View style={styles.formPanelHeaderCopy}>
            <Text style={styles.formEyebrow}>{t('recurring.stats.dailyHint')}</Text>
            <Text style={styles.formTitle}>{t('recurring.form.createTitle')}</Text>
          </View>
          <View style={styles.formCloseButton}>
            <Text style={styles.formCloseText}>×</Text>
          </View>
        </View>

        <View style={styles.formBody}>
          <View style={styles.formFieldBlock}>
            <Text style={styles.formLabel}>
              {t('recurring.form.titleLabel')} *{' '}
              <Text style={styles.formLabelHint}>
                ({t('recurring.form.titleRequiredHint')})
              </Text>
            </Text>
            <View style={styles.formInputFilled}>
              <Text style={styles.formInputText}>{t(ONBOARDING_DEMO_TASK_TITLE_KEY)}</Text>
            </View>
          </View>

          <View style={styles.formActions}>
            <View style={styles.formCancelButton}>
              <Text style={styles.formCancelText}>{t('common.cancel')}</Text>
            </View>
            <View style={styles.formSaveButton}>
              <Text style={styles.formSaveText}>{t('recurring.form.save')}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function DailyTasksVisual() {
  const { t } = useLanguage();
  const openTask = createOnboardingDemoTask(
    'onboarding-open',
    t(ONBOARDING_DEMO_TASK_TITLE_KEY),
    RecurringTaskStatus.Todo,
  );

  return (
    <OnboardingAppPreview activeTab="today">
      <TodaySummaryCard totalTasks={1} doneTasks={0} allComplete={false} />
      <DemoSectionHeader highlightAdd />
      <RecurringTaskCard
        task={openTask}
        onEdit={noop}
        onDelete={noop}
        onToggleStatus={noop}
      />
      <CreateTaskFormPreview />
    </OnboardingAppPreview>
  );
}

function statusFlowChipStyle(status: RecurringTaskStatus) {
  switch (status) {
    case RecurringTaskStatus.InProgress:
      return styles.statusFlowChipProgress;
    case RecurringTaskStatus.Done:
      return styles.statusFlowChipDone;
    default:
      return styles.statusFlowChipTodo;
  }
}

function statusFlowTextStyle(status: RecurringTaskStatus) {
  switch (status) {
    case RecurringTaskStatus.InProgress:
      return styles.statusFlowChipTextProgress;
    case RecurringTaskStatus.Done:
      return styles.statusFlowChipTextDone;
    default:
      return styles.statusFlowChipTextTodo;
  }
}

function StatusFlowStrip() {
  const { t } = useLanguage();

  return (
    <View style={styles.statusFlowPanel}>
      <View style={styles.statusFlowRow}>
        {DAILY_STATUS_COLUMNS.flatMap(({ status, labelKey }, index) => {
          const chip = (
            <View
              key={status}
              style={[styles.statusFlowChip, statusFlowChipStyle(status)]}
            >
              <Text
                style={[styles.statusFlowChipText, statusFlowTextStyle(status)]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
              >
                {t(labelKey)}
              </Text>
            </View>
          );

          if (index === 0) {
            return [chip];
          }

          return [
            <Text key={`arrow-${status}`} style={styles.statusFlowArrow}>
              →
            </Text>,
            chip,
          ];
        })}
      </View>
    </View>
  );
}

function CompleteTasksVisual() {
  const { t } = useLanguage();
  const openTask = createOnboardingDemoTask(
    'onboarding-todo',
    t(ONBOARDING_DEMO_TASK_TITLE_KEY),
    RecurringTaskStatus.Todo,
  );
  const inProgressTask = createOnboardingDemoTask(
    'onboarding-progress',
    t('onboarding.demo.secondTaskTitle'),
    RecurringTaskStatus.InProgress,
  );
  const doneTask = createOnboardingDemoTask(
    'onboarding-done',
    t('onboarding.demo.thirdTaskTitle'),
    RecurringTaskStatus.Done,
  );

  return (
    <OnboardingAppPreview activeTab="today" compact>
      <TodaySummaryCard totalTasks={3} doneTasks={1} allComplete={false} />
      <DemoSectionHeader taskCount={3} />
      <RecurringTaskCard
        task={openTask}
        onEdit={noop}
        onDelete={noop}
        onToggleStatus={noop}
      />
      <RecurringTaskCard
        task={inProgressTask}
        onEdit={noop}
        onDelete={noop}
        onToggleStatus={noop}
      />
      <RecurringTaskCard
        task={doneTask}
        onEdit={noop}
        onDelete={noop}
        onToggleStatus={noop}
      />
      <StatusFlowStrip />
    </OnboardingAppPreview>
  );
}

const STREAK_CHAIN_ROW_SIZE = 9;

function StreakChainPreview() {
  const { t } = useLanguage();
  const streakDays = ONBOARDING_DEMO_PROGRESS.currentStreak;
  const rowCount = Math.ceil(streakDays / STREAK_CHAIN_ROW_SIZE);

  return (
    <View style={styles.streakCard}>
      <View style={styles.streakCardTop}>
        <View style={styles.streakBadge}>
          <FireIcon size={14} color={recurringTheme.streakOrangeBright} />
        </View>
        <View style={styles.streakCopy}>
          <Text style={styles.streakLabel}>{t('recurring.stats.currentStreak')}</Text>
          <Text style={styles.streakValue}>
            {t('recurring.stats.daysValue', {
              days: String(streakDays),
            })}
          </Text>
        </View>
      </View>

      <View style={styles.chainRows}>
        {Array.from({ length: rowCount }, (_, rowIndex) => {
          const start = rowIndex * STREAK_CHAIN_ROW_SIZE;
          const count = Math.min(STREAK_CHAIN_ROW_SIZE, streakDays - start);

          return (
            <View key={rowIndex} style={styles.chainRow}>
              {Array.from({ length: count }, (_, index) => (
                <View key={start + index} style={styles.chainSegment}>
                  {index > 0 ? <View style={styles.chainLink} /> : null}
                  <View style={styles.chainDay}>
                    <CheckIcon size={8} color={recurringTheme.accentBright} />
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StreakGrowthVisual() {
  const { t } = useLanguage();
  const doneTaskOne = createOnboardingDemoTask(
    'onboarding-streak-done-one',
    t(ONBOARDING_DEMO_TASK_TITLE_KEY),
    RecurringTaskStatus.Done,
    ONBOARDING_DEMO_PROGRESS.currentStreak,
  );
  const doneTaskTwo = createOnboardingDemoTask(
    'onboarding-streak-done-two',
    t('onboarding.demo.secondTaskTitle'),
    RecurringTaskStatus.Done,
    ONBOARDING_DEMO_PROGRESS.currentStreak,
  );

  return (
    <OnboardingAppPreview activeTab="today" compact>
      <MasteryStatsGrid progress={ONBOARDING_DEMO_PROGRESS} />
      <TodaySummaryCard totalTasks={2} doneTasks={2} allComplete />
      <StreakChainPreview />
      <DemoSectionHeader taskCount={2} />
      <RecurringTaskCard
        task={doneTaskOne}
        onEdit={noop}
        onDelete={noop}
        onToggleStatus={noop}
      />
      <RecurringTaskCard
        task={doneTaskTwo}
        onEdit={noop}
        onDelete={noop}
        onToggleStatus={noop}
      />
    </OnboardingAppPreview>
  );
}

function JourneyVisibleVisual() {
  const { t } = useLanguage();
  const cellHeight = 52;
  const cellWidth = 38;

  return (
    <OnboardingAppPreview activeTab="history">
      <Text style={styles.historyScreenTitle}>{t('history.title')}</Text>
      <Text style={styles.historyMonthTitle}>{t('onboarding.demo.monthTitle')}</Text>

      <View style={styles.weekdayRow}>
        {WEEKDAY_KEYS.map(key => (
          <Text key={key} style={[styles.weekdayLabel, { width: cellWidth }]}>
            {t(key)}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {Array.from({ length: Math.ceil(ONBOARDING_DEMO_CALENDAR.length / 7) }, (_, rowIndex) => (
          <View key={rowIndex} style={styles.calendarRow}>
            {ONBOARDING_DEMO_CALENDAR.slice(rowIndex * 7, rowIndex * 7 + 7).map(cell => (
              <View key={cell.dayOfMonth} style={[styles.calendarSlot, { width: cellWidth, minHeight: cellHeight }]}>
                <HistoryDayCell
                  dayOfMonth={cell.dayOfMonth}
                  entry={cell.entry}
                  isToday={cell.isToday ?? false}
                  height={cellHeight - 4}
                />
              </View>
            ))}
          </View>
        ))}
      </View>
    </OnboardingAppPreview>
  );
}

function HistoryDetailStatusBadge() {
  return (
    <View style={[styles.detailStatusBadge, styles.detailSuccessBadge]}>
      <CheckIcon size={12} color={recurringTheme.accentBright} />
    </View>
  );
}

function CaptureNotesVisual() {
  const { t } = useLanguage();
  const entry = ONBOARDING_DEMO_NOTE_DAY;
  const tone = resolveHistoryDayCellTone(entry);

  return (
    <OnboardingAppPreview activeTab="history">
      <View style={styles.detailPanel}>
        <View style={styles.detailPanelHeader}>
          <View style={styles.detailPanelHeaderCopy}>
            <Text style={styles.formEyebrow}>{t('history.title')}</Text>
            <Text style={styles.formTitle}>{t('onboarding.demo.dayTitle')}</Text>
          </View>
          <View style={styles.formCloseButton}>
            <Text style={styles.formCloseText}>×</Text>
          </View>
        </View>

        <View style={styles.detailBody}>
          <View
            style={[
              styles.detailPreviewCard,
              tone === 'success' ? styles.detailPreviewSuccess : null,
            ]}
          >
            <View style={styles.detailPreviewTopRow}>
              <Text style={styles.detailPreviewDay}>12</Text>
              <HistoryDetailStatusBadge />
            </View>
            <View style={styles.detailMetrics}>
              <View style={styles.detailMetricRow}>
                <Text style={styles.detailMetricLabel}>{t('history.metric.tasks')}</Text>
                <Text style={styles.detailMetricValue}>{formatHistoryTaskRatioDisplay(entry)}</Text>
              </View>
              <View style={styles.detailMetricRow}>
                <Text style={styles.detailMetricLabel}>{t('history.metric.streak')}</Text>
                <View style={styles.detailMetricValueRow}>
                  <FireIcon size={12} color={recurringTheme.goldBright} />
                  <Text style={styles.detailMetricValue}>{formatHistoryStreakDisplay(entry)}</Text>
                </View>
              </View>
              <View style={styles.detailMetricRow}>
                <Text style={styles.detailMetricLabel}>{t('history.metric.level')}</Text>
                <Text style={styles.detailMetricValue}>{formatHistoryLevelDisplay(entry)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.noteBlock}>
            <Text style={styles.formLabel}>{t('history.note.label')}</Text>
            <View style={styles.noteInputFilled}>
              <Text style={styles.noteInputText}>{t('onboarding.demo.noteText')}</Text>
            </View>
          </View>
        </View>
      </View>
    </OnboardingAppPreview>
  );
}

export default function OnboardingSlideVisual({ slideId }: OnboardingSlideVisualProps) {
  switch (slideId) {
    case 'dailyTasks':
      return <DailyTasksVisual />;
    case 'completeTasks':
      return <CompleteTasksVisual />;
    case 'streakGrowth':
      return <StreakGrowthVisual />;
    case 'journeyVisible':
      return <JourneyVisibleVisual />;
    case 'captureNotes':
      return <CaptureNotesVisual />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...premiumType.overline,
    color: recurringTheme.textSecondary,
    fontSize: 11,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.surfaceInset,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  sectionBadgeText: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  addFab: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.accentDark,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
  },
  addFabHighlight: {
    shadowColor: recurringTheme.accent,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  addFabRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(82, 183, 136, 0.45)',
  },
  formOverlay: {
    marginTop: -120,
    paddingTop: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  formPanel: {
    backgroundColor: recurringTheme.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    overflow: 'hidden',
  },
  formPanelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: recurringTheme.cardBorder,
  },
  formPanelHeaderCopy: {
    flex: 1,
    gap: 2,
    paddingRight: 8,
  },
  formEyebrow: {
    color: recurringTheme.accentBright,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  formTitle: {
    color: recurringTheme.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  formCloseButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  formCloseText: {
    color: recurringTheme.textPrimary,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '300',
  },
  formBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 12,
  },
  formFieldBlock: {
    gap: 4,
  },
  formLabel: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  formLabelHint: {
    color: recurringTheme.textMuted,
    fontWeight: '600',
  },
  formInputFilled: {
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: recurringTheme.surfaceInset,
  },
  formInputText: {
    color: recurringTheme.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    gap: 8,
  },
  formCancelButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    paddingVertical: 10,
    alignItems: 'center',
  },
  formCancelText: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  formSaveButton: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: recurringTheme.accentDark,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    paddingVertical: 10,
    alignItems: 'center',
  },
  formSaveText: {
    color: recurringTheme.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  statusFlowPanel: {
    marginTop: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceInset,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  statusFlowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    width: '100%',
  },
  statusFlowChip: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusFlowChipTodo: {
    backgroundColor: recurringTheme.surfaceElevated,
    borderColor: recurringTheme.cardBorder,
  },
  statusFlowChipProgress: {
    backgroundColor: 'rgba(212, 168, 67, 0.14)',
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  statusFlowChipDone: {
    backgroundColor: 'rgba(82, 183, 136, 0.14)',
    borderColor: recurringTheme.cardBorderAccent,
  },
  statusFlowChipText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  statusFlowChipTextTodo: {
    color: recurringTheme.textPrimary,
  },
  statusFlowChipTextProgress: {
    color: recurringTheme.goldBright,
  },
  statusFlowChipTextDone: {
    color: recurringTheme.accentBright,
  },
  statusFlowArrow: {
    color: recurringTheme.textSecondary,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
    flexShrink: 0,
    width: 18,
    textAlign: 'center',
  },
  streakCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  streakCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.28)',
  },
  streakCopy: {
    flex: 1,
    gap: 1,
  },
  streakLabel: {
    color: recurringTheme.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  streakValue: {
    color: recurringTheme.streakOrangeBright,
    fontSize: 16,
    fontWeight: '800',
  },
  chainRows: {
    gap: 6,
    alignItems: 'center',
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chainSegment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chainLink: {
    width: 8,
    height: 2,
    backgroundColor: recurringTheme.cardBorderAccent,
    marginHorizontal: 1,
  },
  chainDay: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(82, 183, 136, 0.16)',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
  },
  historyScreenTitle: {
    color: recurringTheme.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  historyMonthTitle: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayLabel: {
    textAlign: 'center',
    color: recurringTheme.textMuted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    gap: 4,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarSlot: {
    alignItems: 'stretch',
  },
  detailPanel: {
    backgroundColor: recurringTheme.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    overflow: 'hidden',
  },
  detailPanelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: recurringTheme.cardBorder,
  },
  detailPanelHeaderCopy: {
    flex: 1,
    gap: 2,
    paddingRight: 8,
  },
  detailBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 10,
  },
  detailPreviewCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  detailPreviewSuccess: {
    backgroundColor: 'rgba(82, 183, 136, 0.12)',
    borderColor: recurringTheme.cardBorderAccent,
  },
  detailPreviewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailPreviewDay: {
    color: recurringTheme.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  detailStatusBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  detailSuccessBadge: {
    backgroundColor: 'rgba(82, 183, 136, 0.16)',
    borderColor: recurringTheme.cardBorderAccent,
  },
  detailMetrics: {
    gap: 4,
  },
  detailMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailMetricLabel: {
    color: recurringTheme.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  detailMetricValue: {
    color: recurringTheme.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  detailMetricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteBlock: {
    gap: 6,
  },
  noteInputFilled: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: recurringTheme.surfaceInset,
  },
  noteInputText: {
    color: recurringTheme.textPrimary,
    fontSize: 13,
    lineHeight: 19,
  },
});
