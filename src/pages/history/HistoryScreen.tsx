import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import { useAuth } from '@/auth/AuthContext';
import AppBrandHeader from '@/components/AppBrandHeader';
import { historyMonthQueryKey } from '@/history/historyQueryKeys';
import { useRefetchHistoryOnTabFocus } from '@/history/useRefetchHistoryOnTabFocus';
import { useLanguage } from '@/i18n/LanguageProvider';
import { formatHistoryMonthYear } from '@/i18n/calendarLabels';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import HistoryDayCell from '@/pages/history/HistoryDayCell';
import HistoryMonthPickerModal from '@/pages/history/HistoryMonthPickerModal';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import PremiumStatusBar from '@/pages/subscription/PremiumStatusBar';
import PremiumUpsellModal from '@/pages/subscription/PremiumUpsellModal';
import { useAppRefresh } from '@/refresh/useAppRefresh';
import { useRefreshControl } from '@/refresh/useRefreshControl';
import { useSubscriptionAccess } from '@/subscription/useSubscriptionAccess';
import { shouldRetryApiQuery } from '@/utils/apiError';
import {
  addMonths,
  buildMonthCalendarGrid,
  computeHistoryCalendarCellWidth,
  defaultVisibleMonthKey,
  formatApiCalendarDate,
  indexHistoryDaysByDate,
  parseMonthKey,
} from '@/utils/historyCalendar';
export type HistoryDayDetailPayload = {
  date: string;
  dayOfMonth: number;
  isToday: boolean;
  entry?: HistoryDay;
  todayCalendarDate: string | null;
  visibleMonth: string;
};

type HistoryScreenProps = {
  isActive?: boolean;
  onOpenSubscription?: () => void;
  onOpenDayDetail?: (payload: HistoryDayDetailPayload) => void;
};

const WEEKDAY_KEYS = [
  'history.weekday.mon',
  'history.weekday.tue',
  'history.weekday.wed',
  'history.weekday.thu',
  'history.weekday.fri',
  'history.weekday.sat',
  'history.weekday.sun',
] as const;

export default function HistoryScreen({
  isActive = true,
  onOpenSubscription,
  onOpenDayDetail,
}: HistoryScreenProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { accessToken } = useAuth();
  const subscriptionQuery = useSubscriptionAccess();
  const hasPremiumAccess = subscriptionQuery.data?.hasPremiumAccess ?? false;
  const subscriptionReady =
    !subscriptionQuery.isLoading && subscriptionQuery.isFetched;

  const [visibleMonth, setVisibleMonth] = useState(() => defaultVisibleMonthKey());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isPremiumUpsellOpen, setIsPremiumUpsellOpen] = useState(false);
  const { refreshing, onRefresh } = useAppRefresh();
  const refreshControl = useRefreshControl({ refreshing, onRefresh });

  const historyQueryEnabled = !!accessToken && hasPremiumAccess;

  const historyQuery = useQuery({
    queryKey: historyMonthQueryKey(accessToken, visibleMonth),
    queryFn: () => authApi.getHistory({ month: visibleMonth }),
    enabled: historyQueryEnabled,
    retry: shouldRetryApiQuery,
  });

  const handleReturnedToHistoryTab = useCallback(() => {
    setVisibleMonth(defaultVisibleMonthKey());
    setPickerOpen(false);
  }, []);

  useRefetchHistoryOnTabFocus(
    isActive,
    accessToken,
    hasPremiumAccess,
    handleReturnedToHistoryTab,
  );

  const today = historyQuery.data?.today
    ? formatApiCalendarDate(historyQuery.data.today)
    : null;
  const daysByDate = useMemo(
    () => indexHistoryDaysByDate(historyQuery.data?.days ?? []),
    [historyQuery.data?.days],
  );

  const visibleMonthParts = useMemo(
    () => parseMonthKey(visibleMonth),
    [visibleMonth],
  );

  const gridCells = useMemo(
    () => buildMonthCalendarGrid(visibleMonth),
    [visibleMonth],
  );

  const rowCount = gridCells.length / 7;
  const cellWidth = useMemo(
    () => computeHistoryCalendarCellWidth(windowWidth),
    [windowWidth],
  );
  const headerBlockHeight = 96;
  const weekdayRowHeight = 28;
  const tabBarReserve = 72 + Math.max(insets.bottom, 8);
  const rowHeight = Math.max(
    72,
    Math.floor(
      (windowHeight -
        insets.top -
        headerBlockHeight -
        weekdayRowHeight -
        tabBarReserve -
        24) /
        rowCount,
    ),
  );

  function guardPremiumInteraction(): boolean {
    if (hasPremiumAccess) {
      return false;
    }

    if (!subscriptionReady) {
      return true;
    }

    setIsPremiumUpsellOpen(true);
    return true;
  }

  function shiftMonth(delta: number) {
    if (guardPremiumInteraction()) {
      return;
    }

    setVisibleMonth(current => addMonths(current, delta));
  }

  function openDayDetail(
    date: string,
    dayOfMonth: number,
    isToday: boolean,
    entry?: HistoryDay,
  ) {
    if (guardPremiumInteraction() || !onOpenDayDetail) {
      return;
    }

    onOpenDayDetail({
      date,
      dayOfMonth,
      isToday,
      entry,
      todayCalendarDate: today,
      visibleMonth,
    });
  }

  const isLoading = hasPremiumAccess && historyQuery.isPending && !historyQuery.data;
  const loadFailed =
    hasPremiumAccess && historyQuery.isError && !historyQuery.data;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <AppBrandHeader />

        <View style={styles.headerBlock}>
          <Text style={styles.screenTitle}>{t('history.title')}</Text>

          <View style={styles.monthNav}>
            <Pressable
              style={styles.navButton}
              accessibilityLabel={t('history.previousMonth')}
              onPress={() => shiftMonth(-1)}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </Pressable>

            <Pressable
              style={styles.monthTitleButton}
              accessibilityLabel={t('history.pickMonth')}
              onPress={() => {
                if (guardPremiumInteraction()) {
                  return;
                }
                setPickerOpen(true);
              }}
            >
              <Text style={styles.monthTitle}>
                {formatHistoryMonthYear(
                  visibleMonthParts.monthIndex,
                  visibleMonthParts.year,
                  t,
                )}
              </Text>
            </Pressable>

            <Pressable
              style={styles.navButton}
              accessibilityLabel={t('history.nextMonth')}
              onPress={() => shiftMonth(1)}
            >
              <Text style={styles.navButtonText}>›</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <PremiumStatusBar onOpenSubscription={onOpenSubscription} />

          {!hasPremiumAccess && subscriptionReady ? (
            <Text style={styles.premiumHint}>{t('history.premiumRequired')}</Text>
          ) : null}

          {isLoading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={recurringTheme.accentBright} />
            </View>
          ) : null}

          {loadFailed ? (
            <Text style={styles.errorText}>{t('history.loadError')}</Text>
          ) : null}

          <View style={styles.weekdayRow}>
            {WEEKDAY_KEYS.map(key => (
              <Text key={key} style={[styles.weekdayLabel, { width: cellWidth }]}>
                {t(key)}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {Array.from({ length: rowCount }, (_, rowIndex) => (
              <View key={rowIndex} style={styles.gridRow}>
                {gridCells.slice(rowIndex * 7, rowIndex * 7 + 7).map((cell, columnIndex) => {
                  const slotStyle = {
                    width: cellWidth,
                    minHeight: rowHeight,
                  };

                  if (cell.kind === 'blank') {
                    return (
                      <View
                        key={`blank-${rowIndex}-${columnIndex}`}
                        style={[styles.gridSlot, slotStyle]}
                      />
                    );
                  }

                  const entry = daysByDate.get(cell.date);
                  const isToday = today === cell.date;

                  return (
                    <Pressable
                      key={cell.date}
                      style={({ pressed }) => [
                        styles.gridSlot,
                        slotStyle,
                        pressed && styles.gridSlotPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={t('history.openDay', {
                        day: String(cell.dayOfMonth),
                      })}
                      onPress={() =>
                        openDayDetail(cell.date, cell.dayOfMonth, isToday, entry)
                      }
                    >
                      <HistoryDayCell
                        dayOfMonth={cell.dayOfMonth}
                        entry={entry}
                        isToday={isToday}
                        height={rowHeight}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <HistoryMonthPickerModal
        visible={pickerOpen}
        monthKey={visibleMonth}
        onClose={() => setPickerOpen(false)}
        onSelectMonth={setVisibleMonth}
      />

      <PremiumUpsellModal
        visible={isPremiumUpsellOpen}
        onClose={() => setIsPremiumUpsellOpen(false)}
        onOpenSubscriptionSettings={
          onOpenSubscription
            ? () => {
                setIsPremiumUpsellOpen(false);
                onOpenSubscription();
              }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: recurringTheme.pageBg,
  },
  safeArea: {
    flex: 1,
  },
  headerBlock: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  screenTitle: {
    color: recurringTheme.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  navButtonText: {
    color: recurringTheme.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    marginTop: -3,
  },
  monthTitleButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  monthTitle: {
    color: recurringTheme.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 16,
    gap: 8,
  },
  premiumHint: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 6,
  },
  loadingBlock: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  errorText: {
    color: recurringTheme.fireRedBright,
    fontSize: 14,
    paddingHorizontal: 6,
  },
  weekdayRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 2,
    marginBottom: 2,
  },
  weekdayLabel: {
    textAlign: 'center',
    color: recurringTheme.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  grid: {
    gap: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 4,
  },
  gridSlot: {
    flexGrow: 0,
    flexShrink: 0,
  },
  gridSlotPressed: {
    opacity: 0.88,
  },
});
