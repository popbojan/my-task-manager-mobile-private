import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

/** Android has no combined datetime mode — date dialog, then time dialog. */
export function openAndroidDeadlinePicker(
  initial: Date,
  onComplete: (date: Date | null) => void,
): void {
  DateTimePickerAndroid.open({
    value: initial,
    mode: 'date',
    is24Hour: true,
    onChange: (event, selectedDate) => {
      if (event.type === 'dismissed' || !selectedDate) {
        onComplete(null);
        return;
      }

      const withDate = new Date(selectedDate);
      withDate.setHours(initial.getHours(), initial.getMinutes(), 0, 0);

      DateTimePickerAndroid.open({
        value: withDate,
        mode: 'time',
        is24Hour: true,
        onChange: (timeEvent, timeDate) => {
          if (timeEvent.type === 'dismissed' || !timeDate) {
            onComplete(null);
            return;
          }

          const result = new Date(withDate);
          result.setHours(timeDate.getHours(), timeDate.getMinutes(), 0, 0);
          onComplete(result);
        },
      });
    },
  });
}
