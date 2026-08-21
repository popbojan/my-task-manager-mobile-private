import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RecurringTaskStatus } from '@/api/generated';
import { useLanguage } from '@/i18n/LanguageProvider';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type DeleteRecurringTaskModalProps = {
  visible: boolean;
  taskTitle: string | null;
  taskStatus: RecurringTaskStatus | null;
  isPending: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteRecurringTaskModal({
  visible,
  taskTitle,
  taskStatus,
  isPending,
  errorMessage,
  onClose,
  onConfirm,
}: DeleteRecurringTaskModalProps) {
  const { t } = useLanguage();
  const isDone = taskStatus === RecurringTaskStatus.Done;
  const blockedMessage = isDone
    ? t('recurring.deleteBlockedDone', {
        column: t('recurring.status.done'),
      })
    : null;
  const canDelete = !isDone && !isPending;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{t('recurring.deleteTitle')}</Text>
          <Text style={styles.body}>
            {t('recurring.deleteConfirm', { title: taskTitle ?? '' })}
          </Text>

          {blockedMessage ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>{blockedMessage}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={[styles.infoBox, styles.errorBox]}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              style={[styles.deleteButton, !canDelete && styles.deleteButtonDisabled]}
              onPress={onConfirm}
              disabled={!canDelete}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.deleteText}>{t('recurring.delete')}</Text>
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
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: recurringTheme.surfaceElevated,
    borderRadius: 16,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  title: {
    color: recurringTheme.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  body: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  infoBox: {
    borderRadius: 12,
    padding: 12,
    backgroundColor: recurringTheme.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  errorBox: {
    backgroundColor: recurringTheme.fireRedSoft,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  infoText: {
    color: recurringTheme.goldBright,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  errorText: {
    color: recurringTheme.fireRedBright,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  cancelText: {
    color: recurringTheme.textSecondary,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#7f1d1d',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  deleteButtonDisabled: {
    opacity: 0.45,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '800',
  },
});
