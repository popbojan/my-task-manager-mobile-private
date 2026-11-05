import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type HistoryRepairConfirmModalProps = {
  visible: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function HistoryRepairConfirmModal({
  visible,
  isPending,
  onClose,
  onConfirm,
}: HistoryRepairConfirmModalProps) {
  const { t } = useLanguage();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{t('history.repair.confirmTitle')}</Text>
          <Text style={styles.body}>{t('history.repair.confirmBody')}</Text>

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onClose} disabled={isPending}>
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmButton, isPending && styles.confirmButtonDisabled]}
              onPress={onConfirm}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmText}>{t('history.repair.action')}</Text>
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
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  cancelText: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: recurringTheme.accent,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
});
