import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  TabChartIcon,
  TabFlameIcon,
  TabListIcon,
  TabProfileIcon,
} from '@/pages/recurring-tasks/premium/TabIcons';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

export type MainTab = 'today' | 'tasks' | 'progress' | 'profile';

type MainTabBarProps = {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
};

const TABS: {
  id: MainTab;
  labelKey: 'nav.today' | 'nav.tasks' | 'nav.progress' | 'nav.profile';
  renderIcon: (active: boolean) => ReactNode;
}[] = [
  {
    id: 'today',
    labelKey: 'nav.today',
    renderIcon: active => <TabFlameIcon active={active} />,
  },
  {
    id: 'tasks',
    labelKey: 'nav.tasks',
    renderIcon: active => <TabListIcon active={active} />,
  },
  {
    id: 'progress',
    labelKey: 'nav.progress',
    renderIcon: active => <TabChartIcon active={active} />,
  },
  {
    id: 'profile',
    labelKey: 'nav.profile',
    renderIcon: active => <TabProfileIcon active={active} />,
  },
];

export default function MainTabBar({ activeTab, onTabChange }: MainTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  return (
    <View style={[styles.barWrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={styles.barShine} />
      <View style={styles.bar}>
        {TABS.map(tab => {
          const active = tab.id === activeTab;

          return (
            <Pressable
              key={tab.id}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onTabChange(tab.id)}
            >
              {active ? <View style={styles.activeIndicator} /> : null}
              {tab.renderIcon(active)}
              <Text style={[styles.label, active && styles.labelActive]}>
                {t(tab.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barWrap: {
    backgroundColor: recurringTheme.pageBgElevated,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  barShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: recurringTheme.shineLine,
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minHeight: 48,
    position: 'relative',
    borderRadius: 12,
    marginHorizontal: 2,
    paddingVertical: 4,
  },
  tabActive: {
    backgroundColor: 'rgba(82, 183, 136, 0.08)',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 36,
    height: 3,
    borderRadius: 999,
    backgroundColor: recurringTheme.accentBright,
    shadowColor: recurringTheme.accent,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  label: {
    color: recurringTheme.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  labelActive: {
    color: recurringTheme.accentBright,
  },
});
