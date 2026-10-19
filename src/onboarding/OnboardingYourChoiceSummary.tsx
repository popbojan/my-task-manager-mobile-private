import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

export default function OnboardingYourChoiceSummary() {
  const { t } = useLanguage();

  return (
    <View style={styles.wrap}>
      <View style={styles.premiumCard}>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>{t('premium.badge')}</Text>
        </View>
        <Text style={styles.premiumIntro}>{t('onboarding.slide6.premiumIntro')}</Text>
        <Text style={styles.premiumEmphasis}>{t('onboarding.slide6.premiumEmphasis')}</Text>
      </View>

      <View style={styles.freeCard}>
        <Text style={styles.freeIntro}>{t('onboarding.slide6.freeIntro')}</Text>
        <Text style={styles.freeEmphasis}>{t('onboarding.slide6.freeEmphasis')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  premiumCard: {
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    backgroundColor: recurringTheme.accentGlow,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: recurringTheme.accentDark,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
  },
  premiumBadgeText: {
    color: recurringTheme.accentBright,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  premiumIntro: {
    color: recurringTheme.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  premiumEmphasis: {
    color: recurringTheme.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  freeCard: {
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    backgroundColor: recurringTheme.surfaceElevated,
  },
  freeIntro: {
    color: recurringTheme.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  freeEmphasis: {
    color: recurringTheme.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 26,
  },
});
