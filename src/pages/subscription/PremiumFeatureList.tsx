import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/locales';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

const FEATURES: {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
}[] = [
  {
    titleKey: 'premium.feature.recurring.title',
    descriptionKey: 'premium.feature.recurring.description',
  },
  {
    titleKey: 'premium.feature.streaks.title',
    descriptionKey: 'premium.feature.streaks.description',
  },
  {
    titleKey: 'premium.feature.levels.title',
    descriptionKey: 'premium.feature.levels.description',
  },
  {
    titleKey: 'premium.feature.secure.title',
    descriptionKey: 'premium.feature.secure.description',
  },
  {
    titleKey: 'premium.feature.access.title',
    descriptionKey: 'premium.feature.access.description',
  },
];

export default function PremiumFeatureList() {
  const { t } = useLanguage();

  return (
    <View style={styles.list}>
      {FEATURES.map(feature => (
        <View key={feature.titleKey} style={styles.item}>
          <Text style={styles.bullet}>★</Text>
          <View style={styles.copy}>
            <Text style={styles.title}>{t(feature.titleKey)}</Text>
            <Text style={styles.description}>{t(feature.descriptionKey)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginBottom: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  bullet: {
    color: recurringTheme.goldBright,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 1,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: recurringTheme.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  description: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
