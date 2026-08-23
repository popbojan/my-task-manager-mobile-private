import { StyleSheet, Text, View } from 'react-native';
import type { TaskPriority } from '@/api/generated';
import { useLanguage } from '@/i18n/LanguageProvider';
import { getPrioritySectionMeta } from '@/pages/tasks/taskBoardConfig';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type TaskPrioritySectionHeaderProps = {
  priority: TaskPriority;
  isFirst?: boolean;
};

function SectionIcon({ icon }: { icon: 'shield' | 'star' | 'bolt' | 'doc' }) {
  if (icon === 'shield') {
    return <Text style={[styles.icon, styles.iconShield]}>🛡</Text>;
  }

  if (icon === 'star') {
    return <Text style={[styles.icon, styles.iconStar]}>★</Text>;
  }

  if (icon === 'bolt') {
    return <Text style={[styles.icon, styles.iconBolt]}>⚡</Text>;
  }

  return <Text style={[styles.icon, styles.iconDoc]}>📄</Text>;
}

export default function TaskPrioritySectionHeader({
  priority,
  isFirst = false,
}: TaskPrioritySectionHeaderProps) {
  const { t } = useLanguage();
  const section = getPrioritySectionMeta(priority);

  return (
    <View style={[styles.wrap, !isFirst && styles.wrapSpaced]}>
      {!isFirst ? <View style={styles.divider} /> : null}
      <View style={styles.labelRow}>
        <SectionIcon icon={section.icon!} />
        <Text style={styles.label}>{t(section.labelKey)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    paddingBottom: 2,
  },
  wrapSpaced: {
    paddingTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: recurringTheme.cardBorder,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    ...premiumType.overline,
    color: recurringTheme.textSecondary,
    fontSize: 9,
    letterSpacing: 1.4,
  },
  icon: {
    fontSize: 11,
  },
  iconShield: {
    color: '#C46A4A',
  },
  iconStar: {
    color: '#60A5FA',
  },
  iconBolt: {
    color: '#FBBF24',
  },
  iconDoc: {
    color: recurringTheme.textMuted,
    fontSize: 10,
  },
});
