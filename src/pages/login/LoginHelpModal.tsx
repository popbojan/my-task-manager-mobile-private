import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { loginTheme } from '@/pages/login/loginTheme';

type LoginHelpModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function LoginHelpModal({ visible, onClose }: LoginHelpModalProps) {
  const { t } = useLanguage();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={event => event.stopPropagation()}>
          <Text style={styles.title}>{t('login.help.title')}</Text>
          <ScrollView style={styles.stepsScroll} bounces={false}>
            <Text style={styles.step}>1. {t('login.help.step1')}</Text>
            <Text style={styles.step}>2. {t('login.help.step2')}</Text>
            <Text style={styles.step}>3. {t('login.help.step3')}</Text>
          </ScrollView>
          <Text style={styles.note}>{t('login.help.note')}</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(10, 10, 10, 0.94)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: loginTheme.glassBorder,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    color: loginTheme.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  stepsScroll: {
    maxHeight: 220,
  },
  step: {
    color: loginTheme.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },
  note: {
    color: 'rgba(255, 255, 255, 0.62)',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  closeButtonText: {
    color: loginTheme.masteryGreen,
    fontSize: 15,
    fontWeight: '600',
  },
});
