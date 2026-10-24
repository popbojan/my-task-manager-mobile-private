import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import { HistoryDayStatus } from '@/api/generated/models/HistoryDayStatus';
import { authApi } from '@/api/authClient';
import { useAuth } from '@/auth/AuthContext';
import { historyMonthQueryKey } from '@/history/historyQueryKeys';
import { refetchHistoryMonths } from '@/history/refetchHistoryMonths';
import { applyHistoryDayToCache } from '@/history/updateHistoryDayCache';
import { applyHistoryNoteToCache } from '@/history/updateHistoryNoteCache';
import { refetchRecurringBoardData } from '@/recurring/refetchRecurringBoardData';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { AppLanguage } from '@/i18n/types';
import type { TranslationKey } from '@/i18n/locales/de';
import { CheckIcon, CrossIcon, FireIcon } from '@/pages/recurring-tasks/premium/PremiumIcons';
import PremiumProgressRing from '@/pages/recurring-tasks/premium/PremiumProgressRing';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import type { HistoryResponse } from '@/api/generated/models/HistoryResponse';
import {
  formatApiCalendarDate,
  formatHistoryLevelDisplay,
  formatHistoryStreakDisplay,
  formatHistoryTaskRatioDisplay,
  monthKeyFromCalendarDate,
  parseCalendarDate,
  resolveHistoryDayCellTone,
  resolveHistoryDayProgressPercent,
  historyMonthsToRefreshAfterRepair,
  isRepairableMissedHistoryDay,
  shouldShowHistoryInProgressMark,
  shouldShowHistoryMissedMark,
  shouldShowHistorySuccessCrown,
  type HistoryDayCellTone,
} from '@/utils/historyCalendar';
import { focusTextInputSoon } from '@/utils/focusTextInputSoon';
import { getApiErrorMessage, parseApiErrorBody } from '@/utils/apiError';
import HistoryRepairConfirmModal from '@/pages/history/HistoryRepairConfirmModal';

const NOTE_MAX_LENGTH = 2000;

const LOCALE_MAP: Record<AppLanguage, string> = {
  de: 'de-DE',
  en: 'en-GB',
  fr: 'fr-FR',
  sr: 'sr-RS',
};

const STATUS_LABEL_KEYS: Record<HistoryDayStatus, TranslationKey> = {
  [HistoryDayStatus.Success]: 'history.status.success',
  [HistoryDayStatus.Missed]: 'history.status.missed',
  [HistoryDayStatus.InProgress]: 'history.status.inProgress',
  [HistoryDayStatus.NoTasks]: 'history.status.noTasks',
  [HistoryDayStatus.ServerSkipped]: 'history.status.serverSkipped',
  [HistoryDayStatus.Unknown]: 'history.status.unknown',
};

type HistoryDayDetailModalProps = {
  date: string;
  dayOfMonth: number;
  entry?: HistoryDay;
  isToday: boolean;
  todayCalendarDate: string | null;
  visibleMonth: string;
  onClose: () => void;
};

function previewStyles(tone: HistoryDayCellTone, isToday: boolean) {
  const base = isToday ? styles.previewToday : null;

  switch (tone) {
    case 'success':
      return [styles.previewCard, styles.previewSuccess, base];
    case 'missed':
      return [styles.previewCard, styles.previewMissed, base];
    case 'in_progress':
      return [styles.previewCard, styles.previewInProgress, base];
    default:
      return [styles.previewCard, styles.previewNeutral, base];
  }
}

function HistoryDetailStatusBadge({ entry }: { entry?: HistoryDay }) {
  if (shouldShowHistorySuccessCrown(entry)) {
    return (
      <View style={[styles.statusBadge, styles.successBadge]}>
        <CheckIcon size={12} color={recurringTheme.accentBright} />
      </View>
    );
  }

  if (shouldShowHistoryMissedMark(entry)) {
    return (
      <View style={[styles.statusBadge, styles.missedBadge]}>
        <CrossIcon size={12} color={recurringTheme.fireRedBright} />
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
          size={16}
          stroke={2}
          tone="gold"
        />
      </View>
    );
  }

  return null;
}

function formatDayTitle(date: string, language: AppLanguage): string {
  return new Intl.DateTimeFormat(LOCALE_MAP[language], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parseCalendarDate(date));
}

export default function HistoryDayDetailModal({
  date,
  dayOfMonth,
  entry,
  isToday,
  todayCalendarDate,
  visibleMonth,
  onClose,
}: HistoryDayDetailModalProps) {
  const { t, language } = useLanguage();
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const panelHeight = Math.min(Math.round(windowHeight * 0.55), 460);
  const noteInputRef = useRef<TextInputInstance>(null);
  const [displayEntry, setDisplayEntry] = useState(entry);
  const [noteDraft, setNoteDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [repairConfirmVisible, setRepairConfirmVisible] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);

  const tone = resolveHistoryDayCellTone(displayEntry);
  const statusKey = displayEntry
    ? STATUS_LABEL_KEYS[displayEntry.status]
    : 'history.status.noData';
  const canRepair = isRepairableMissedHistoryDay(displayEntry, date, todayCalendarDate);
  const savedNote = displayEntry?.note ?? '';
  const noteDirty = noteDraft !== savedNote;
  const canDeleteNote = savedNote.length > 0;

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (keyboardInset > 0) {
        Keyboard.dismiss();
        return true;
      }

      onClose();
      return true;
    });

    return () => subscription.remove();
  }, [keyboardInset, onClose]);

  useEffect(() => {
    setDisplayEntry(entry);
    setNoteDraft(entry?.note ?? '');
    setError(null);
  }, [date, entry]);

  useEffect(() => {
    if (!accessToken || !todayCalendarDate || date >= todayCalendarDate) {
      return;
    }

    if (entry?.status !== HistoryDayStatus.InProgress) {
      return;
    }

    const monthKey = monthKeyFromCalendarDate(date);
    void queryClient
      .fetchQuery({
        queryKey: historyMonthQueryKey(accessToken, monthKey),
        queryFn: () => authApi.getHistory({ month: monthKey }),
        staleTime: 0,
      })
      .then(data => {
        const fresh = data.days.find(
          day => formatApiCalendarDate(day.date) === date,
        );
        if (fresh) {
          setDisplayEntry(fresh);
        }
      });
  }, [accessToken, date, entry?.status, queryClient, todayCalendarDate]);

  useEffect(() => {
    focusTextInputSoon(noteInputRef);
  }, [date]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, event => {
      const { screenY, height: keyboardHeight } = event.endCoordinates;
      const insetFromScreenY = screenY > 0 ? windowHeight - screenY : keyboardHeight;
      const androidBuffer = Platform.OS === 'android' ? 8 : 0;
      setKeyboardInset(insetFromScreenY + androidBuffer);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardInset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [windowHeight]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const trimmed = noteDraft.trim();
      if (!trimmed) {
        throw new Error('empty');
      }

      if (trimmed.length > NOTE_MAX_LENGTH) {
        throw new Error('too-long');
      }

      return authApi.putHistoryNote({
        date,
        putHistoryNoteRequest: { note: trimmed },
      });
    },
    onSuccess: response => {
      if (!accessToken) {
        onClose();
        return;
      }

      const savedDate = formatApiCalendarDate(response.date);
      const monthKey = monthKeyFromCalendarDate(savedDate);
      const queryKey = historyMonthQueryKey(accessToken, monthKey);
      const current = queryClient.getQueryData<HistoryResponse>(queryKey);
      const updated = applyHistoryNoteToCache(current, savedDate, response.note);

      if (updated) {
        queryClient.setQueryData(queryKey, updated);
      } else {
        void queryClient.invalidateQueries({ queryKey });
      }

      onClose();
    },
    onError: err => {
      if (err instanceof Error && err.message === 'empty') {
        setError(t('history.note.emptyError'));
        return;
      }

      if (err instanceof Error && err.message === 'too-long') {
        setError(t('history.note.tooLongError'));
        return;
      }

      setError(t('history.note.saveError'));
    },
  });

  const repairMutation = useMutation({
    mutationFn: () => authApi.repairHistoryDay(),
    onSuccess: async repairedDay => {
      if (!accessToken) {
        return;
      }

      const repairedDate = formatApiCalendarDate(repairedDay.date);
      const monthKey = monthKeyFromCalendarDate(repairedDate);
      const queryKey = historyMonthQueryKey(accessToken, monthKey);
      const current = queryClient.getQueryData<HistoryResponse>(queryKey);
      const patched = applyHistoryDayToCache(current, repairedDay);

      if (patched) {
        queryClient.setQueryData(queryKey, patched);
      }

      setDisplayEntry(repairedDay);
      setError(null);

      const monthsToRefetch = historyMonthsToRefreshAfterRepair({
        repairedCalendarDate: repairedDate,
        todayCalendarDate,
        visibleMonth,
      });

      await refetchHistoryMonths(queryClient, accessToken, monthsToRefetch);

      const refreshed = queryClient.getQueryData<HistoryResponse>(queryKey);
      const entryFromMonth = refreshed?.days.find(
        day => formatApiCalendarDate(day.date) === repairedDate,
      );
      if (entryFromMonth) {
        setDisplayEntry(entryFromMonth);
      }

      await refetchRecurringBoardData(queryClient, accessToken);

      setRepairConfirmVisible(false);
    },
    onError: async err => {
      setRepairConfirmVisible(false);
      const body = await parseApiErrorBody(err);
      if (body?.code === 'HISTORY_DAY_NOT_REPAIRABLE') {
        setError(t('history.repair.notRepairable'));
        return;
      }

      const apiMessage = await getApiErrorMessage(err);
      setError(apiMessage ?? t('history.repair.error'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await authApi.deleteHistoryNote({ date });
    },
    onSuccess: () => {
      if (!accessToken) {
        onClose();
        return;
      }

      const monthKey = monthKeyFromCalendarDate(date);
      const queryKey = historyMonthQueryKey(accessToken, monthKey);
      const current = queryClient.getQueryData<HistoryResponse>(queryKey);
      const updated = applyHistoryNoteToCache(current, date, null);

      if (updated) {
        queryClient.setQueryData(queryKey, updated);
      } else {
        void queryClient.invalidateQueries({ queryKey });
      }

      onClose();
    },
    onError: () => {
      setError(t('history.note.deleteError'));
    },
  });

  const isBusy =
    saveMutation.isPending || deleteMutation.isPending || repairMutation.isPending;

  function handleSavePress() {
    if (!noteDraft.trim()) {
      setError(t('history.note.emptyError'));
      return;
    }

    setError(null);
    saveMutation.mutate();
  }

  const formContent = (
    <>
      <View style={previewStyles(tone, isToday)}>
        <View style={styles.previewTopRow}>
          <Text style={[styles.previewDayNumber, isToday && styles.previewDayNumberToday]}>
            {dayOfMonth}
          </Text>
          <HistoryDetailStatusBadge entry={displayEntry} />
        </View>

        <View style={styles.metricsList}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>{t('history.metric.tasks')}</Text>
            <Text style={styles.metricValue}>{formatHistoryTaskRatioDisplay(displayEntry)}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>{t('history.metric.streak')}</Text>
            <View style={styles.metricValueRow}>
              <FireIcon size={12} color={recurringTheme.goldBright} />
              <Text style={styles.metricValue}>{formatHistoryStreakDisplay(displayEntry)}</Text>
            </View>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>{t('history.metric.level')}</Text>
            <Text style={styles.metricValue}>{formatHistoryLevelDisplay(displayEntry)}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>{t('history.metric.status')}</Text>
            <Text style={styles.metricValue}>{t(statusKey)}</Text>
          </View>
        </View>
      </View>

      {canRepair ? (
        <Pressable
          style={[styles.repairButton, isBusy && styles.repairButtonDisabled]}
          disabled={isBusy}
          accessibilityRole="button"
          onPress={() => {
            setError(null);
            Keyboard.dismiss();
            setRepairConfirmVisible(true);
          }}
        >
          <Text style={styles.repairButtonText}>{t('history.repair.action')}</Text>
        </Pressable>
      ) : null}

      <View style={styles.fieldBlock}>
        <View style={styles.noteLabelRow}>
          <Text style={styles.label}>{t('history.note.label')}</Text>
          <Text style={styles.noteCounter}>
            {t('history.note.counter', {
              count: String(noteDraft.length),
              max: String(NOTE_MAX_LENGTH),
            })}
          </Text>
        </View>
        <TextInput
          ref={noteInputRef}
          style={[styles.textArea, styles.textAreaCompact]}
          value={noteDraft}
          onChangeText={setNoteDraft}
          placeholder={t('history.note.placeholder')}
          placeholderTextColor={recurringTheme.textMuted}
          multiline
          numberOfLines={3}
          maxLength={NOTE_MAX_LENGTH}
          textAlignVertical="top"
          editable={!isBusy}
          autoFocus
          showSoftInputOnFocus
        />
        {canDeleteNote ? (
          <Pressable
            style={styles.deleteLink}
            disabled={isBusy}
            onPress={() => {
              setError(null);
              deleteMutation.mutate();
            }}
          >
            {deleteMutation.isPending ? (
              <ActivityIndicator color={recurringTheme.fireRedBright} size="small" />
            ) : (
              <Text style={styles.deleteLinkText}>{t('history.note.delete')}</Text>
            )}
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.error} numberOfLines={2}>
            {error}
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable style={styles.cancelButton} onPress={onClose} disabled={isBusy}>
          <Text style={styles.cancelText}>{t('common.cancel')}</Text>
        </Pressable>
        <Pressable
          style={[styles.saveButton, (!noteDirty || isBusy) && styles.saveButtonDisabled]}
          onPress={handleSavePress}
          disabled={!noteDirty || isBusy}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>{t('common.save')}</Text>
          )}
        </Pressable>
      </View>
    </>
  );

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <Pressable
        style={styles.backdropTap}
        accessibilityLabel={t('common.close')}
        onPress={() => {
          if (keyboardInset > 0) {
            Keyboard.dismiss();
            return;
          }

          onClose();
        }}
      />

      <View style={[styles.keyboardWrap, { paddingBottom: keyboardInset }]}>
        <SafeAreaView edges={['top']} style={styles.safeTop}>
          <View style={[styles.panel, { maxHeight: panelHeight }]}>
            <View style={styles.panelHeader}>
              <View style={styles.panelHeaderCopy}>
                <Text style={styles.eyebrow}>{t('history.title')}</Text>
                <Text style={styles.title}>{formatDayTitle(date, language)}</Text>
              </View>
              <Pressable
                style={styles.closeButton}
                accessibilityLabel={t('common.close')}
                onPress={onClose}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formBody}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              {formContent}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>

      <HistoryRepairConfirmModal
        visible={repairConfirmVisible}
        isPending={repairMutation.isPending}
        onClose={() => {
          if (!repairMutation.isPending) {
            setRepairConfirmVisible(false);
          }
        }}
        onConfirm={() => {
          setError(null);
          repairMutation.mutate();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdropTap: {
    ...StyleSheet.absoluteFill,
  },
  keyboardWrap: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  safeTop: {
    justifyContent: 'flex-start',
  },
  panel: {
    marginHorizontal: 12,
    marginTop: 8,
    flexDirection: 'column',
    backgroundColor: recurringTheme.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    overflow: 'hidden',
    shadowColor: recurringTheme.accent,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: recurringTheme.cardBorder,
  },
  panelHeaderCopy: {
    flex: 1,
    gap: 2,
    paddingRight: 8,
  },
  eyebrow: {
    color: recurringTheme.accentBright,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: recurringTheme.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  closeText: {
    color: recurringTheme.textPrimary,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '300',
    marginTop: -2,
  },
  formScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  formBody: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 6,
  },
  previewCard: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 4,
  },
  previewNeutral: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  previewSuccess: {
    backgroundColor: 'rgba(82, 183, 136, 0.32)',
    borderColor: 'rgba(82, 183, 136, 0.45)',
  },
  previewMissed: {
    backgroundColor: 'rgba(239, 68, 68, 0.28)',
    borderColor: 'rgba(248, 113, 113, 0.42)',
  },
  previewInProgress: {
    backgroundColor: 'rgba(212, 168, 67, 0.28)',
    borderColor: 'rgba(240, 204, 98, 0.42)',
  },
  previewToday: {
    borderColor: recurringTheme.accentBright,
    borderWidth: 1.5,
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewDayNumber: {
    color: recurringTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  previewDayNumberToday: {
    color: recurringTheme.accentBright,
  },
  statusBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
  metricsList: {
    gap: 4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricLabel: {
    color: recurringTheme.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    color: recurringTheme.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  repairButton: {
    alignSelf: 'flex-start',
    backgroundColor: recurringTheme.accent,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
  },
  repairButtonDisabled: {
    opacity: 0.6,
  },
  repairButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  fieldBlock: {
    gap: 6,
    marginTop: 2,
  },
  noteLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    color: recurringTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  noteCounter: {
    color: recurringTheme.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingVertical: 10,
    color: recurringTheme.textPrimary,
    fontSize: 15,
    lineHeight: 20,
    backgroundColor: recurringTheme.surfaceInset,
  },
  textAreaCompact: {
    height: 72,
  },
  deleteLink: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  deleteLinkText: {
    color: recurringTheme.fireRedBright,
    fontSize: 12,
    fontWeight: '700',
  },
  errorBox: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: recurringTheme.fireRedSoft,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  error: {
    color: recurringTheme.fireRedBright,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  cancelText: {
    color: recurringTheme.textSecondary,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: recurringTheme.accentDark,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveText: {
    color: '#fff',
    fontWeight: '800',
  },
});
