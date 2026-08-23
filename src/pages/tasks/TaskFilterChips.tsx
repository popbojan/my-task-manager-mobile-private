import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  TASK_FILTERS,
  type TaskFilterId,
} from '@/pages/tasks/taskBoardConfig';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type TaskFilterChipsProps = {
  activeFilter: TaskFilterId;
  onFilterChange: (filter: TaskFilterId) => void;
};

function FilterIcon({ icon }: { icon: 'shield' | 'star' | 'bolt' | 'doc' }) {
  if (icon === 'shield') {
    return <Text style={[styles.filterIcon, styles.iconShield]}>🛡</Text>;
  }

  if (icon === 'star') {
    return <Text style={[styles.filterIcon, styles.iconStar]}>★</Text>;
  }

  if (icon === 'bolt') {
    return <Text style={[styles.filterIcon, styles.iconBolt]}>⚡</Text>;
  }

  return <Text style={[styles.filterIcon, styles.iconDoc]}>📄</Text>;
}

export default function TaskFilterChips({
  activeFilter,
  onFilterChange,
}: TaskFilterChipsProps) {
  const { t } = useLanguage();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {TASK_FILTERS.map(filter => {
        const active = filter.id === activeFilter;

        return (
          <Pressable
            key={filter.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onFilterChange(filter.id)}
          >
            {filter.icon ? <FilterIcon icon={filter.icon} /> : null}
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
              {t(filter.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.statCardBg,
  },
  chipActive: {
    borderColor: recurringTheme.cardBorderAccent,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  chipLabel: {
    ...premiumType.caption,
    color: recurringTheme.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  chipLabelActive: {
    color: recurringTheme.accentBright,
  },
  filterIcon: {
    fontSize: 12,
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
    fontSize: 11,
  },
});
