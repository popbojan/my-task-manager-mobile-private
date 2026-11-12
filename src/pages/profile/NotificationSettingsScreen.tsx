import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type AppStateStatus,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  loadDailyOpenTasksReminderPrefs,
  saveDailyOpenTasksReminderPrefs,
  type DailyOpenTasksReminderPrefs,
} from '@/notifications/dailyOpenTasksReminderPrefs';
import { flushDailyOpenTasksReminderSchedule } from '@/notifications/flushDailyOpenTasksReminderSchedule';
import {
  DEFAULT_DAILY_OPEN_TASKS_REMINDER_TIME,
  formatNotificationTimeLabel,
  notificationTimeFromDate,
  notificationTimeToDate,
} from '@/notifications/recurringNotificationTimeUtils';
import {
  getCachedRecurringReminderPermission,
  hasRecurringReminderPermission,
  openRecurringReminderNotificationSettings,
  requestRecurringReminderPermission,
} from '@/notifications/recurringReminderScheduler';
import { openAndroidTimePicker } from '@/pages/recurring-tasks/openAndroidTimePicker';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import PremiumStatusBar from '@/pages/subscription/PremiumStatusBar';
import { useSubscriptionAccess } from '@/subscription/useSubscriptionAccess';
import { useCurrentUser } from '@/user/useCurrentUser';
import { getDeviceTimezone } from '@/user/deviceTimezone';

type NotificationSettingsScreenProps = {
  onBack: () => void;
  onOpenSubscription?: () => void;
};

function resolvePickerDate(notificationTime: string): Date {
  return (
    notificationTimeToDate(notificationTime) ??
    notificationTimeToDate(DEFAULT_DAILY_OPEN_TASKS_REMINDER_TIME)!
  );
}

export default function NotificationSettingsScreen({
  onBack,
  onOpenSubscription,
}: NotificationSettingsScreenProps) {
  const { language, t } = useLanguage();
  const currentUserQuery = useCurrentUser();
  const subscriptionQuery = useSubscriptionAccess();
  const hasPremiumAccess = subscriptionQuery.data?.hasPremiumAccess ?? false;
  const canEdit = hasPremiumAccess;
  const timeZone =
    currentUserQuery.data?.timezone?.trim() || getDeviceTimezone();

  const [prefs, setPrefs] = useState<DailyOpenTasksReminderPrefs | null>(null);
  const [showIosPicker, setShowIosPicker] = useState(false);
  const [pickerDraft, setPickerDraft] = useState(() =>
    resolvePickerDate(DEFAULT_DAILY_OPEN_TASKS_REMINDER_TIME),
  );
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    () => getCachedRecurringReminderPermission(),
  );
  const [isSyncing, setIsSyncing] = useState(false);

  const locale =
    language === 'de'
      ? 'de-DE'
      : language === 'fr'
        ? 'fr-FR'
        : language === 'sr'
          ? 'sr-RS'
          : 'en-GB';

  const refreshPermission = useCallback(async () => {
    const granted = await hasRecurringReminderPermission();
    setPermissionGranted(granted);
    return granted;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const loaded = await loadDailyOpenTasksReminderPrefs();
      if (!cancelled) {
        setPrefs(loaded);
      }
      await refreshPermission();
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshPermission]);

  useEffect(() => {
    const onAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        void refreshPermission();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [refreshPermission]);

  async function persistAndSync(
    next: DailyOpenTasksReminderPrefs,
    options?: { requestPermission?: boolean },
  ) {
    if (!canEdit) {
      return;
    }

    setPrefs(next);
    setIsSyncing(true);
    try {
      await saveDailyOpenTasksReminderPrefs(next);

      if (next.enabled && options?.requestPermission) {
        const alreadyGranted =
          permissionGranted === true ||
          getCachedRecurringReminderPermission() === true ||
          (await hasRecurringReminderPermission());
        const granted = alreadyGranted
          ? true
          : await requestRecurringReminderPermission();
        setPermissionGranted(granted);
      } else if (next.enabled) {
        await refreshPermission();
      }

      await flushDailyOpenTasksReminderSchedule({
        t,
        timeZone,
        hasPremiumAccess,
      });
    } finally {
      setIsSyncing(false);
    }
  }

  function openTimePicker() {
    if (!prefs || !canEdit) {
      return;
    }

    const initial = resolvePickerDate(prefs.notificationTime);
    if (Platform.OS === 'android') {
      openAndroidTimePicker(initial, date => {
        if (date) {
          void persistAndSync({
            ...prefs,
            notificationTime: notificationTimeFromDate(date),
          });
        }
      });
      return;
    }

    setPickerDraft(initial);
    setShowIosPicker(true);
  }

  function handleToggle(nextEnabled: boolean) {
    if (!prefs || !canEdit) {
      return;
    }

    void persistAndSync(
      {
        enabled: nextEnabled,
        notificationTime:
          prefs.notificationTime || DEFAULT_DAILY_OPEN_TASKS_REMINDER_TIME,
      },
      { requestPermission: nextEnabled },
    );
  }

  function handlePickerChange(_event: DateTimePickerEvent, date?: Date) {
    if (date) {
      setPickerDraft(date);
    }
  }

  function confirmIosPicker() {
    if (!prefs || !canEdit) {
      return;
    }

    setShowIosPicker(false);
    void persistAndSync({
      ...prefs,
      notificationTime: notificationTimeFromDate(pickerDraft),
    });
  }

  const enabled = prefs?.enabled ?? true;
  const displayTime =
    prefs?.notificationTime ?? DEFAULT_DAILY_OPEN_TASKS_REMINDER_TIME;
  const timeLabel = formatNotificationTimeLabel(displayTime, locale);
  const showPermissionHint =
    canEdit && enabled && permissionGranted === false;
  const showEnabledHint = canEdit && enabled && permissionGranted === true;
  const showDisabledHint = canEdit && !enabled;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack} accessibilityRole="button">
          <Text style={styles.backButtonText}>← {t('common.back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('profile.accountMenu.notifications')}</Text>
        <View style={styles.headerSpacer}>
          {isSyncing ? (
            <ActivityIndicator color={recurringTheme.accent} size="small" />
          ) : null}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <PremiumStatusBar onOpenSubscription={onOpenSubscription} />

        <Text style={styles.intro}>{t('profile.notifications.intro')}</Text>

        <View style={[styles.card, !canEdit && styles.cardLocked]}>
          {!prefs ? (
            <ActivityIndicator color={recurringTheme.accent} />
          ) : (
            <>
              <View style={styles.row}>
                <Text style={styles.label} numberOfLines={2}>
                  {t('profile.notifications.reminderLabel')}
                </Text>
                <Pressable
                  style={[styles.timeChip, !canEdit && styles.controlDisabled]}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !canEdit }}
                  accessibilityLabel={`${t('profile.notifications.timeA11y')}: ${timeLabel}`}
                  disabled={!canEdit}
                  onPress={openTimePicker}
                >
                  <Text style={styles.timeChipText} numberOfLines={1}>
                    {timeLabel}
                  </Text>
                </Pressable>
                <Switch
                  value={enabled}
                  onValueChange={handleToggle}
                  disabled={!canEdit}
                  trackColor={{
                    false: recurringTheme.cardBorder,
                    true: recurringTheme.accent,
                  }}
                  thumbColor={enabled ? recurringTheme.accentBright : '#f4f4f5'}
                />
              </View>

              <View style={styles.permissionSlot}>
                {showPermissionHint ? (
                  <View style={[styles.statusBox, styles.permissionBox]}>
                    <Text style={styles.statusText} numberOfLines={3}>
                      {t('profile.notifications.permissionBefore')}
                      <Text
                        style={styles.permissionLink}
                        onPress={() => {
                          void openRecurringReminderNotificationSettings();
                        }}
                        accessibilityRole="link"
                      >
                        {t('profile.notifications.permissionLink')}
                      </Text>
                      {t('profile.notifications.permissionAfter')}
                    </Text>
                  </View>
                ) : null}
                {showEnabledHint ? (
                  <View style={[styles.statusBox, styles.enabledBox]}>
                    <Text style={styles.statusText} numberOfLines={3}>
                      {t('profile.notifications.enabledHint', { time: timeLabel })}
                    </Text>
                  </View>
                ) : null}
                {showDisabledHint ? (
                  <View style={[styles.statusBox, styles.disabledBox]}>
                    <Text style={styles.statusTextMuted} numberOfLines={3}>
                      {t('profile.notifications.disabledHint')}
                    </Text>
                  </View>
                ) : null}
              </View>

              {showIosPicker && Platform.OS === 'ios' && canEdit ? (
                <View style={styles.iosPickerSheet}>
                  <DateTimePicker
                    value={pickerDraft}
                    mode="time"
                    display="spinner"
                    is24Hour
                    onChange={handlePickerChange}
                  />
                  <Pressable
                    style={styles.iosDoneButton}
                    accessibilityRole="button"
                    onPress={confirmIosPicker}
                  >
                    <Text style={styles.iosDoneText}>{t('common.done')}</Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: recurringTheme.pageBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: recurringTheme.cardBorder,
  },
  backButton: {
    minWidth: 72,
    paddingVertical: 4,
  },
  backButtonText: {
    color: recurringTheme.accentBright,
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    flex: 1,
    color: recurringTheme.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSpacer: {
    minWidth: 72,
    alignItems: 'flex-end',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  intro: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 14,
    backgroundColor: recurringTheme.surfaceCard,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    padding: 16,
    gap: 8,
  },
  cardLocked: {
    opacity: 0.55,
  },
  controlDisabled: {
    opacity: 0.7,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    flex: 1,
    minWidth: 0,
    color: recurringTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  timeChip: {
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 72,
    alignItems: 'center',
    backgroundColor: recurringTheme.surfaceInset,
  },
  timeChipText: {
    color: recurringTheme.accentBright,
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  permissionSlot: {
    minHeight: 64,
    justifyContent: 'center',
  },
  statusBox: {
    minHeight: 64,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  permissionBox: {
    borderColor: 'rgba(245, 158, 11, 0.45)',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  enabledBox: {
    borderColor: recurringTheme.cardBorderAccent,
    backgroundColor: 'rgba(82, 183, 136, 0.14)',
  },
  disabledBox: {
    borderColor: recurringTheme.cardBorder,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  statusText: {
    color: recurringTheme.textPrimary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
  statusTextMuted: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
  permissionLink: {
    color: recurringTheme.accentBright,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  iosPickerSheet: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceInset,
  },
  iosDoneButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: recurringTheme.cardBorder,
  },
  iosDoneText: {
    color: recurringTheme.accentBright,
    fontWeight: '800',
  },
});
