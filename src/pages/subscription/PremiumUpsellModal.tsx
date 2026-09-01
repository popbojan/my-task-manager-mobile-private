import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import PremiumSubscribeSection from '@/pages/subscription/PremiumSubscribeSection';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type PremiumUpsellModalProps = {
  visible: boolean;
  onClose: () => void;
  onOpenSubscriptionSettings?: () => void;
};

export default function PremiumUpsellModal({
  visible,
  onClose,
  onOpenSubscriptionSettings,
}: PremiumUpsellModalProps) {
  const { t } = useLanguage();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('premium.badge')}</Text>
          </View>
          <Pressable
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <PremiumSubscribeSection />
          {onOpenSubscriptionSettings ? (
            <Pressable style={styles.linkButton} onPress={onOpenSubscriptionSettings}>
              <Text style={styles.linkButtonText}>
                {t('subscription.settings.title')} →
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: recurringTheme.pageBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: recurringTheme.cardBorder,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(212, 168, 67, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.45)',
  },
  badgeText: {
    color: recurringTheme.goldBright,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  closeButtonText: {
    color: recurringTheme.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '300',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  linkButton: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  linkButtonText: {
    color: recurringTheme.accentBright,
    fontSize: 14,
    fontWeight: '700',
  },
});
