import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type LogoutConfirmModalProps = {
  visible: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function LogoutConfirmModal({
  visible,
  isPending,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  const { t } = useLanguage();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>{t('profile.accountMenu.title')}</Text>
              <Text style={styles.title}>{t('header.logout.confirmTitle')}</Text>
            </View>
            <Pressable
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              onPress={onClose}
              disabled={isPending}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.body}>
            <Text style={styles.message}>{t('header.logout.confirmQuestion')}</Text>
            <Text style={styles.message}>{t('header.logout.confirmBody')}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              style={[styles.secondaryButton, isPending && styles.buttonDisabled]}
              onPress={onClose}
              disabled={isPending}
            >
              <Text style={styles.secondaryButtonText}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmButton, isPending && styles.buttonDisabled]}
              onPress={onConfirm}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>{t('header.logout')}</Text>
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
    maxWidth: 420,
    backgroundColor: recurringTheme.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    borderBottomWidth: 1,
    borderBottomColor: recurringTheme.cardBorder,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  eyebrow: {
    color: recurringTheme.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: recurringTheme.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: recurringTheme.textMuted,
    fontSize: 28,
    lineHeight: 28,
    fontWeight: '300',
  },
  body: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 10,
  },
  message: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: recurringTheme.cardBorder,
  },
  secondaryButton: {
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceCard,
  },
  secondaryButtonText: {
    color: recurringTheme.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  confirmButton: {
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.accent,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
