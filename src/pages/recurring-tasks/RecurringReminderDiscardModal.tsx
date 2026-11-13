import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type RecurringReminderDiscardModalProps = {
  visible: boolean;
  isPending: boolean;
  onKeepAndClose: () => void;
  onResetAndClose: () => void;
  onDismiss: () => void;
};

/** Same visual language as HistoryConfirmModal / LogoutConfirmModal. */
export default function RecurringReminderDiscardModal({
  visible,
  isPending,
  onKeepAndClose,
  onResetAndClose,
  onDismiss,
}: RecurringReminderDiscardModalProps) {
  const { t } = useLanguage();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onDismiss}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.title}>
            {t('recurring.form.reminderDiscardTitle')}
          </Text>
          <Text style={styles.body}>
            {t('recurring.form.reminderDiscardBody')}
          </Text>

          <View style={styles.actions}>
            <Pressable
              style={[styles.secondaryButton, isPending && styles.buttonDisabled]}
              onPress={onKeepAndClose}
              disabled={isPending}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>
                {t('recurring.form.reminderDiscardKeep')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.confirmButton, isPending && styles.buttonDisabled]}
              onPress={onResetAndClose}
              disabled={isPending}
              accessibilityRole="button"
            >
              {isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  {t('recurring.form.reminderDiscardReset')}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: recurringTheme.surfaceElevated,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  title: {
    color: recurringTheme.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  body: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    gap: 8,
    marginTop: 4,
  },
  secondaryButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  secondaryButtonText: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: recurringTheme.accent,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
