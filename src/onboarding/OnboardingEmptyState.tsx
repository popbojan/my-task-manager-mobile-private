import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type OnboardingEmptyStateProps = {
  titleKey: 'onboarding.empty.tasks.title' | 'onboarding.empty.recurring.title';
  bodyKey: 'onboarding.empty.tasks.body' | 'onboarding.empty.recurring.body';
  ctaKey: 'onboarding.empty.tasks.cta' | 'onboarding.empty.recurring.cta';
  onPressCta: () => void;
};

export default function OnboardingEmptyState({
  titleKey,
  bodyKey,
  ctaKey,
  onPressCta,
}: OnboardingEmptyStateProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.root}>
      <Text style={styles.overline}>{t('onboarding.empty.overline')}</Text>
      <Text style={styles.title}>{t(titleKey)}</Text>
      <Text style={styles.body}>{t(bodyKey)}</Text>
      <Pressable
        style={styles.ctaButton}
        accessibilityRole="button"
        onPress={onPressCta}
      >
        <Text style={styles.ctaButtonText}>{t(ctaKey)}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 10,
  },
  overline: {
    ...premiumType.overline,
    color: recurringTheme.accentBright,
  },
  title: {
    color: recurringTheme.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  body: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 320,
  },
  ctaButton: {
    marginTop: 8,
    backgroundColor: recurringTheme.accentDark,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  ctaButtonText: {
    color: recurringTheme.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
});
