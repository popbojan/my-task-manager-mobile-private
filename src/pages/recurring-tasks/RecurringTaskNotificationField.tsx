import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
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
  const [pickerDraft, setPickerDraft] = useState(() => resolvePickerDate(notificationTime));
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
    if (nextEnabled && !notificationTime) {
      onNotificationTimeChange(DEFAULT_RECURRING_NOTIFICATION_TIME);
    }
    onEnabledChange(nextEnabled);
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

  return (
    <View style={styles.wrap}>
      <View style={styles.toggleRow}>
        <View style={styles.toggleCopy}>
          <Text style={styles.label}>{t('recurring.form.notificationLabel')}</Text>
          <Text style={styles.hint}>{t('recurring.form.notificationHint')}</Text>
        </View>
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

      {enabled ? (
        <Pressable
          style={styles.timeButton}
          accessibilityRole="button"
          accessibilityLabel={t('recurring.form.notificationTimeA11y')}
          onPress={openTimePicker}
        >
          <Text style={styles.timeButtonLabel}>
            {t('recurring.form.notificationTimeLabel')}
          </Text>
          <Text style={styles.timeButtonValue}>
            {formatNotificationTimeLabel(displayTime, locale)}
          </Text>
        </Pressable>
      ) : null}

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
    gap: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleCopy: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: recurringTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  hint: {
    color: recurringTheme.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: recurringTheme.surfaceInset,
  },
  timeButtonLabel: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  timeButtonValue: {
    color: recurringTheme.accentBright,
    fontSize: 15,
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
