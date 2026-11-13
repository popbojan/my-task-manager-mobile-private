import { useCallback, useEffect, useState } from 'react';
import {
  AppState,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
  type AppStateStatus,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  DEFAULT_RECURRING_NOTIFICATION_TIME,
  formatNotificationTimeLabel,
  notificationTimeFromDate,
  notificationTimeToDate,
} from '@/notifications/recurringNotificationTimeUtils';
import NotificationPermissionHint from '@/notifications/NotificationPermissionHint';
import {
  getCachedRecurringReminderAlarmPermission,
  getCachedRecurringReminderPermission,
  hasRecurringReminderAlarmPermission,
  hasRecurringReminderPermission,
  openRecurringReminderAlarmSettings,
  openRecurringReminderNotificationSettings,
} from '@/notifications/recurringReminderScheduler';
import { openAndroidTimePicker } from '@/pages/recurring-tasks/openAndroidTimePicker';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type RecurringTaskNotificationFieldProps = {
  enabled: boolean;
  notificationTime: string | null;
  onEnabledChange: (enabled: boolean) => void;
  onNotificationTimeChange: (notificationTime: string) => void;
};

function resolvePickerDate(notificationTime: string | null): Date {
  return (
    notificationTimeToDate(notificationTime ?? DEFAULT_RECURRING_NOTIFICATION_TIME) ??
    notificationTimeToDate(DEFAULT_RECURRING_NOTIFICATION_TIME)!
  );
}

export default function RecurringTaskNotificationField({
  enabled,
  notificationTime,
  onEnabledChange,
  onNotificationTimeChange,
}: RecurringTaskNotificationFieldProps) {
  const { language, t } = useLanguage();
  const [showIosPicker, setShowIosPicker] = useState(false);
  const [pickerDraft, setPickerDraft] = useState(() =>
    resolvePickerDate(notificationTime),
  );
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    () => getCachedRecurringReminderPermission(),
  );
  const [alarmGranted, setAlarmGranted] = useState<boolean | null>(() =>
    getCachedRecurringReminderAlarmPermission(),
  );
  const displayTime =
    notificationTime ?? DEFAULT_RECURRING_NOTIFICATION_TIME;
  const locale =
    language === 'de'
      ? 'de-DE'
      : language === 'fr'
        ? 'fr-FR'
        : language === 'sr'
          ? 'sr-RS'
          : 'en-GB';

  const refreshPermission = useCallback(async () => {
    const [granted, alarmOk] = await Promise.all([
      hasRecurringReminderPermission(),
      hasRecurringReminderAlarmPermission(),
    ]);
    setPermissionGranted(granted);
    setAlarmGranted(alarmOk);
    return granted;
  }, []);

  useEffect(() => {
    void refreshPermission();
  }, [refreshPermission]);

  useEffect(() => {
    const onAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        // Permission only — do not kick a native trigger sync from the form.
        void refreshPermission();
      }
    };
    const sub = AppState.addEventListener('change', onAppState);
    return () => sub.remove();
  }, [refreshPermission]);

  function openTimePicker() {
    const initial = resolvePickerDate(notificationTime);
    if (Platform.OS === 'android') {
      openAndroidTimePicker(initial, date => {
        if (date) {
          onNotificationTimeChange(notificationTimeFromDate(date));
        }
      });
      return;
    }

    setPickerDraft(initial);
    setShowIosPicker(true);
  }

  function handleToggle(nextEnabled: boolean) {
    // No permission prompts here (Profil handles that). Persist starts immediately.
    onEnabledChange(nextEnabled);
    if (nextEnabled) {
      void refreshPermission();
    }
  }

  function handlePickerChange(event: DateTimePickerEvent, date?: Date) {
    if (date) {
      setPickerDraft(date);
    }
  }

  function confirmIosPicker() {
    onNotificationTimeChange(notificationTimeFromDate(pickerDraft));
    setShowIosPicker(false);
  }

  const timeLabel = formatNotificationTimeLabel(displayTime, locale);
  const showPermissionHint = enabled && permissionGranted === false;
  const showAlarmHint =
    enabled && permissionGranted === true && alarmGranted === false;
  const showEnabledHint =
    enabled && permissionGranted === true && alarmGranted !== false;
  const showDisabledHint = !enabled;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label} numberOfLines={2}>
          {t('recurring.form.notificationLabel')}
        </Text>
        <Pressable
          style={styles.timeChip}
          accessibilityRole="button"
          accessibilityLabel={`${t('recurring.form.notificationTimeA11y')}: ${timeLabel}`}
          onPress={openTimePicker}
        >
          <Text style={styles.timeChipText} numberOfLines={1}>
            {timeLabel}
          </Text>
        </Pressable>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{
            false: recurringTheme.cardBorder,
            true: recurringTheme.accent,
          }}
          thumbColor={enabled ? recurringTheme.accentBright : '#f4f4f5'}
        />
      </View>

      {/* Fixed slot so Cancel/Save don't jump when the hint changes. */}
      <View style={styles.permissionSlot}>
        {showPermissionHint ? (
          <NotificationPermissionHint
            before={t('recurring.form.notificationPermissionBefore')}
            linkLabel={t('recurring.form.notificationPermissionLink')}
            after={t('recurring.form.notificationPermissionAfter')}
            onPress={() => {
              void openRecurringReminderNotificationSettings();
            }}
          />
        ) : null}
        {showAlarmHint ? (
          <NotificationPermissionHint
            before={t('recurring.form.notificationAlarmBefore')}
            linkLabel={t('recurring.form.notificationAlarmLink')}
            after={t('recurring.form.notificationAlarmAfter')}
            onPress={() => {
              void openRecurringReminderAlarmSettings();
            }}
          />
        ) : null}
        {showEnabledHint ? (
          <View style={[styles.statusBox, styles.enabledBox]}>
            <Text style={styles.statusText} numberOfLines={2}>
              {t('recurring.form.notificationEnabledHint', { time: timeLabel })}
            </Text>
          </View>
        ) : null}
        {showDisabledHint ? (
          <View style={[styles.statusBox, styles.disabledBox]}>
            <Text style={styles.statusTextMuted} numberOfLines={2}>
              {t('recurring.form.notificationDisabledHint')}
            </Text>
          </View>
        ) : null}
      </View>

      {showIosPicker && Platform.OS === 'ios' ? (
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
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
  permissionSlot: {
    minHeight: 56,
    justifyContent: 'center',
  },
  statusBox: {
    minHeight: 56,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
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
