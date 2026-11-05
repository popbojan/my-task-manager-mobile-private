import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { historyMonthName } from '@/i18n/calendarLabels';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import {
  formatMonthKey,
  parseMonthKey,
} from '@/utils/historyCalendar';

type HistoryMonthPickerModalProps = {
  visible: boolean;
  monthKey: string;
  onClose: () => void;
  onSelectMonth: (monthKey: string) => void;
};

export default function HistoryMonthPickerModal({
  visible,
  monthKey,
  onClose,
  onSelectMonth,
}: HistoryMonthPickerModalProps) {
  const { t } = useLanguage();
  const { year } = parseMonthKey(monthKey);

  function setYear(nextYear: number) {
    const { monthIndex } = parseMonthKey(monthKey);
    onSelectMonth(formatMonthKey(nextYear, monthIndex));
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <Text style={styles.title}>{t('history.pickMonth')}</Text>

          <View style={styles.yearRow}>
            <Pressable
              style={styles.yearButton}
              accessibilityLabel={t('history.previousYear')}
              onPress={() => setYear(year - 1)}
            >
              <Text style={styles.yearButtonText}>‹</Text>
            </Pressable>
            <Text style={styles.yearLabel}>{year}</Text>
            <Pressable
              style={styles.yearButton}
              accessibilityLabel={t('history.nextYear')}
              onPress={() => setYear(year + 1)}
            >
              <Text style={styles.yearButtonText}>›</Text>
            </Pressable>
          </View>

          <View style={styles.monthGrid}>
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const key = formatMonthKey(year, monthIndex);
              const selected = key === monthKey;

              return (
                <Pressable
                  key={key}
                  style={[styles.monthChip, selected && styles.monthChipSelected]}
                  onPress={() => {
                    onSelectMonth(key);
                    onClose();
                  }}
                >
                  <Text
                    style={[styles.monthChipText, selected && styles.monthChipTextSelected]}
                  >
                    {historyMonthName(monthIndex, t)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{t('common.close')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    backgroundColor: recurringTheme.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    padding: 16,
    gap: 14,
  },
  title: {
    color: recurringTheme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  yearButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  yearButtonText: {
    color: recurringTheme.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginTop: -2,
  },
  yearLabel: {
    color: recurringTheme.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    minWidth: 72,
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  monthChip: {
    width: '31%',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  monthChipSelected: {
    backgroundColor: 'rgba(82, 183, 136, 0.18)',
    borderColor: recurringTheme.cardBorderAccent,
  },
  monthChipText: {
    color: recurringTheme.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  monthChipTextSelected: {
    color: recurringTheme.accentBright,
  },
  closeButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    color: recurringTheme.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
