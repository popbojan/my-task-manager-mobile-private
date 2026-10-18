import { StyleSheet, Text, View } from 'react-native';
import { RecurringTaskStatus } from '@/api/generated';
import { useLanguage } from '@/i18n/LanguageProvider';
import OnboardingAppPreview from '@/onboarding/OnboardingAppPreview';
import {
  createOnboardingDemoTask,
  ONBOARDING_DEMO_CALENDAR,
  ONBOARDING_DEMO_NOTE_DAY,
  ONBOARDING_DEMO_TASK_TITLE_KEY,
} from '@/onboarding/onboardingDemoData';
import type { OnboardingSlideId } from '@/onboarding/onboardingSlides';
import HistoryDayCell from '@/pages/history/HistoryDayCell';
import { CheckIcon, FireIcon } from '@/pages/recurring-tasks/premium/PremiumIcons';
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

function DemoSectionHeader({ highlightAdd = false }: { highlightAdd?: boolean }) {
  const { t } = useLanguage();

  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{t('recurring.tasks.sectionTitle')}</Text>
      <View style={styles.sectionHeaderRight}>
        <View style={styles.sectionBadge}>
          <Text style={styles.sectionBadgeText}>1</Text>
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

function StatusFlowStrip() {
  const { t } = useLanguage();

  return (
    <View style={styles.statusFlowRow}>
      {DAILY_STATUS_COLUMNS.map(({ status, labelKey }, index) => (
        <View key={status} style={styles.statusFlowItem}>
          <View style={styles.statusFlowChip}>
            <Text style={styles.statusFlowChipText}>{t(labelKey)}</Text>
          </View>
          {index < DAILY_STATUS_COLUMNS.length - 1 ? (
            <Text style={styles.statusFlowArrow}>→</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function CompleteStreakVisual() {
  const { t } = useLanguage();
  const doneTask = createOnboardingDemoTask(
    'onboarding-done',
    t(ONBOARDING_DEMO_TASK_TITLE_KEY),
    RecurringTaskStatus.Done,
  );
  const openTask = createOnboardingDemoTask(
    'onboarding-todo',
    t('onboarding.demo.secondTaskTitle'),
    RecurringTaskStatus.Todo,
  );

  return (
    <OnboardingAppPreview activeTab="today">
      <TodaySummaryCard totalTasks={2} doneTasks={1} allComplete={false} />
      <DemoSectionHeader />
      <RecurringTaskCard
        task={doneTask}
        onEdit={noop}
        onDelete={noop}
        onToggleStatus={noop}
      />
      <RecurringTaskCard
        task={openTask}
        onEdit={noop}
        onDelete={noop}
        onToggleStatus={noop}
      />
      <StatusFlowStrip />
      <Text style={styles.callout}>{t('onboarding.slide2.callout')}</Text>
      <TodaySummaryCard totalTasks={2} doneTasks={2} allComplete />
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
    case 'completeStreak':
      return <CompleteStreakVisual />;
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
  statusFlowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
    paddingVertical: 4,
  },
  statusFlowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusFlowChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: recurringTheme.surfaceInset,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  statusFlowChipText: {
    color: recurringTheme.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  statusFlowArrow: {
    color: recurringTheme.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  callout: {
    color: recurringTheme.accentBright,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 4,
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
