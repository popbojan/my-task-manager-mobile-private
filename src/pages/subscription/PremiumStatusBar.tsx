import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import { useSubscriptionAccess } from '@/subscription/useSubscriptionAccess';

type PremiumStatusBarProps = {
  onOpenSubscription?: () => void;
};

export default function PremiumStatusBar({ onOpenSubscription }: PremiumStatusBarProps) {
  const { t } = useLanguage();
  const subscriptionQuery = useSubscriptionAccess();
  const hasPremiumAccess = subscriptionQuery.data?.hasPremiumAccess ?? false;

  if (!onOpenSubscription) {
    return null;
  }

  if (subscriptionQuery.isLoading || hasPremiumAccess) {
    return null;
  }

  return (
    <Pressable style={styles.root} onPress={onOpenSubscription} accessibilityRole="button">
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{t('premium.badge')}</Text>
        <Text style={styles.label}>{t('subscription.settings.subscribeCta')}</Text>
      </View>
      <Text style={styles.chevron}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(212, 168, 67, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
    marginBottom: 12,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  eyebrow: {
    color: recurringTheme.goldBright,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  label: {
    color: recurringTheme.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  chevron: {
    color: recurringTheme.goldBright,
    fontSize: 20,
    fontWeight: '700',
  },
});
