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
    if (!notificationTime) {
      onNotificationTimeChange(DEFAULT_RECURRING_NOTIFICATION_TIME);
    }

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

  const timeLabel = formatNotificationTimeLabel(displayTime, locale);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label} numberOfLines={2}>
          {t('recurring.form.notificationLabel')}
        </Text>
        <Pressable
          style={[styles.timeChip, !enabled && styles.timeChipMuted]}
          accessibilityRole="button"
          accessibilityLabel={`${t('recurring.form.notificationTimeA11y')}: ${timeLabel}`}
          onPress={openTimePicker}
        >
          <Text
            style={[styles.timeChipText, !enabled && styles.timeChipTextMuted]}
            numberOfLines={1}
          >
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
    gap: 6,
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
  timeChipMuted: {
    opacity: 0.92,
  },
  timeChipText: {
    color: recurringTheme.accentBright,
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timeChipTextMuted: {
    color: recurringTheme.textSecondary,
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
