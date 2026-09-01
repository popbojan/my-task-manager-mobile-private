import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import SubscriptionPanelErrorBoundary from '@/pages/profile/SubscriptionPanelErrorBoundary';
import SubscriptionSettingsPanel from '@/pages/profile/SubscriptionSettingsPanel';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type SubscriptionSettingsScreenProps = {
  onBack: () => void;
};

export default function SubscriptionSettingsScreen({
  onBack,
}: SubscriptionSettingsScreenProps) {
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack} accessibilityRole="button">
          <Text style={styles.backButtonText}>← {t('common.back')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('subscription.settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SubscriptionPanelErrorBoundary
          title={t('subscription.settings.title')}
          fallbackMessage={t('subscription.mobile.panelUnavailable')}
        >
          <SubscriptionSettingsPanel />
        </SubscriptionPanelErrorBoundary>
      </ScrollView>
    </SafeAreaView>
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
  backButton: {
    minWidth: 72,
    paddingVertical: 4,
  },
  backButtonText: {
    color: recurringTheme.accentBright,
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    flex: 1,
    color: recurringTheme.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  headerSpacer: {
    minWidth: 72,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
});
