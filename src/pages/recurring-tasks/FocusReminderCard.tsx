import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { ShieldCrownIcon } from '@/pages/recurring-tasks/premium/PremiumIcons';
import PremiumSurface from '@/pages/recurring-tasks/premium/PremiumSurface';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type FocusReminderCardProps = {
  allTasksComplete: boolean;
  hasTasks: boolean;
};

export default function FocusReminderCard({
  allTasksComplete,
  hasTasks,
}: FocusReminderCardProps) {
  const { t } = useLanguage();

  if (!hasTasks) {
    return null;
  }

  const successActive = allTasksComplete;

  return (
    <PremiumSurface accent={successActive ? 'success' : 'gold'} compact padding={10} radius={14}>
      <View style={styles.row}>
        <ShieldCrownIcon size={22} />
        <View style={styles.copy}>
          <Text
            style={[styles.title, successActive && styles.titleSuccess]}
            numberOfLines={1}
          >
            {t('recurring.focus.title')}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {successActive
              ? t('recurring.banner.successLine')
              : t('recurring.banner.warningLine')}
          </Text>
        </View>
      </View>
    </PremiumSurface>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...premiumType.title,
    fontSize: 13,
    color: recurringTheme.goldBright,
  },
  titleSuccess: {
    color: recurringTheme.accentBright,
  },
  body: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
  },
});
