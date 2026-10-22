import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

export function openAndroidTimePicker(
  initial: Date,
  onComplete: (date: Date | null) => void,
): void {
  DateTimePickerAndroid.open({
    value: initial,
    mode: 'time',
    is24Hour: true,
    onChange: (event, selectedDate) => {
      if (event.type === 'dismissed' || !selectedDate) {
        onComplete(null);
        return;
      }

      onComplete(selectedDate);
    },
  });
}
