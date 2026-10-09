import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useLanguage } from '@/i18n/LanguageProvider';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import { openAndroidDeadlinePicker } from '@/pages/tasks/openAndroidDeadlinePicker';
import {
  deadlineInputFromDate,
  defaultDeadlineDate,
  parseDeadlineInput,
} from '@/pages/tasks/taskDeadlineUtils';

type TaskDeadlineFieldProps = {
  value: string;
  onChange: (deadlineInput: string) => void;
  showInvalid?: boolean;
};

function resolvePickerDate(deadlineInput: string): Date {
  return parseDeadlineInput(deadlineInput) ?? defaultDeadlineDate();
}

export default function TaskDeadlineField({
  value,
  onChange,
  showInvalid = false,
}: TaskDeadlineFieldProps) {
  const { t } = useLanguage();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDraft, setPickerDraft] = useState(() => resolvePickerDate(value));

  function openPicker() {
    const initial = resolvePickerDate(value);

    if (Platform.OS === 'android') {
      openAndroidDeadlinePicker(initial, date => {
        if (date) {
          applyPickerDate(date);
        }
      });
      return;
    }

    setPickerDraft(initial);
    setShowPicker(true);
  }

  function applyPickerDate(date: Date) {
    onChange(deadlineInputFromDate(date));
  }

  function handlePickerChange(event: DateTimePickerEvent, date?: Date) {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'dismissed' || !date) {
        return;
      }
      applyPickerDate(date);
      return;
    }

    if (date) {
      setPickerDraft(date);
    }
  }

  function confirmIosPicker() {
    applyPickerDate(pickerDraft);
    setShowPicker(false);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>{t('tasks.form.deadlineLabel')}</Text>
        <TextInput
          style={[styles.input, showInvalid ? styles.inputError : null]}
          value={value}
          onChangeText={onChange}
          placeholder={t('tasks.form.deadlinePlaceholder')}
          placeholderTextColor={recurringTheme.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
        />
        <Pressable
          style={styles.pickButton}
          accessibilityRole="button"
          accessibilityLabel={t('tasks.form.deadlinePickA11y')}
          onPress={openPicker}
        >
          <Text style={styles.pickButtonText}>{t('tasks.form.deadlinePick')}</Text>
        </Pressable>
      </View>

      {showPicker && Platform.OS === 'ios' ? (
        <View style={styles.iosPickerSheet}>
          <DateTimePicker
            value={pickerDraft}
            mode="datetime"
            display="spinner"
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
    color: recurringTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: recurringTheme.textPrimary,
    fontSize: 12,
    backgroundColor: recurringTheme.surfaceInset,
  },
  inputError: {
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  pickButton: {
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  pickButtonText: {
    color: recurringTheme.accentBright,
    fontSize: 11,
    fontWeight: '800',
  },
  iosPickerSheet: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceInset,
    overflow: 'hidden',
  },
  iosDoneButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: recurringTheme.cardBorder,
  },
  iosDoneText: {
    color: recurringTheme.accentBright,
    fontSize: 15,
    fontWeight: '800',
  },
});
