import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { MainTab } from '@/navigation/MainTabBar';
import {
  TabCalendarIcon,
  TabChartIcon,
  TabHistoryIcon,
  TabListIcon,
  TabProfileIcon,
} from '@/pages/recurring-tasks/premium/TabIcons';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type OnboardingAppPreviewProps = {
  activeTab: MainTab;
  children: ReactNode;
};

const TAB_ITEMS: {
  id: MainTab;
  labelKey:
    | 'nav.today'
    | 'nav.history'
    | 'nav.progress'
    | 'nav.tasks'
    | 'nav.profile';
  renderIcon: (active: boolean) => ReactNode;
}[] = [
  {
    id: 'today',
    labelKey: 'nav.today',
    renderIcon: active => <TabCalendarIcon active={active} />,
  },
  {
    id: 'history',
    labelKey: 'nav.history',
    renderIcon: active => <TabHistoryIcon active={active} />,
  },
  {
    id: 'progress',
    labelKey: 'nav.progress',
    renderIcon: active => <TabChartIcon active={active} />,
  },
  {
    id: 'tasks',
    labelKey: 'nav.tasks',
    renderIcon: active => <TabListIcon active={active} />,
  },
  {
    id: 'profile',
    labelKey: 'nav.profile',
    renderIcon: active => <TabProfileIcon active={active} />,
  },
];

export default function OnboardingAppPreview({
  activeTab,
  children,
}: OnboardingAppPreviewProps) {
  const { t } = useLanguage();

  return (
    <View style={styles.shell} pointerEvents="none">
      <View style={styles.screen}>{children}</View>
      <View style={styles.tabBar}>
        {TAB_ITEMS.map(tab => {
          const active = tab.id === activeTab;

          return (
            <View key={tab.id} style={[styles.tab, active && styles.tabActive]}>
              {active ? <View style={styles.activeIndicator} /> : null}
              {tab.renderIcon(active)}
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {t(tab.labelKey)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.pageBg,
    overflow: 'hidden',
  },
  screen: {
    backgroundColor: recurringTheme.pageBg,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 8,
    minHeight: 280,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceElevated,
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
    position: 'relative',
  },
  tabActive: {},
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: recurringTheme.accentBright,
  },
  tabLabel: {
    ...premiumType.caption,
    color: recurringTheme.textMuted,
    fontSize: 9,
  },
  tabLabelActive: {
    color: recurringTheme.accentBright,
    fontWeight: '700',
  },
});
