import { StyleSheet, Text } from 'react-native';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type ProgressSectionHeaderProps = {
  label: string;
};

export default function ProgressSectionHeader({ label }: ProgressSectionHeaderProps) {
  return <Text style={styles.label}>{label}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...premiumType.overline,
    color: recurringTheme.accentBright,
    fontSize: 10,
    marginTop: 2,
  },
});
