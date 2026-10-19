import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

export default function OnboardingYourChoiceSummary() {
  const { t } = useLanguage();

  return (
    <View style={styles.wrap}>
      <View style={styles.premiumCard}>
        <Text style={styles.premiumLabel}>{t('onboarding.slide6.premiumLabel')}</Text>
        <Text style={styles.headline}>{t('onboarding.slide6.premiumHeadline')}</Text>
        <Text style={styles.body}>{t('onboarding.slide6.premiumBody')}</Text>
      </View>

      <View style={styles.freeCard}>
        <Text style={styles.freeLabel}>{t('onboarding.slide6.freeLabel')}</Text>
        <Text style={styles.headline}>{t('onboarding.slide6.freeHeadline')}</Text>
        <Text style={styles.body}>{t('onboarding.slide6.freeBody')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 16,
  },
  premiumCard: {
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    backgroundColor: recurringTheme.accentGlow,
  },
  freeCard: {
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceElevated,
  },
  premiumLabel: {
    ...premiumType.overline,
    color: recurringTheme.accentBright,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  freeLabel: {
    ...premiumType.overline,
    color: recurringTheme.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  headline: {
    color: recurringTheme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  body: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
