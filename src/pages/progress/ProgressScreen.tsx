import { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { RecurringTaskStatus } from '@/api/generated';
import { authApi } from '@/api/authClient';
import { useAuth } from '@/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageProvider';
import AppBrandHeader from '@/components/AppBrandHeader';
import MasteryProfileHero, {
  MasteryStatsGrid,
} from '@/pages/recurring-tasks/MasteryProfileHero';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import NextLevelGoalCard from '@/pages/progress/NextLevelGoalCard';
import ProgressSectionHeader from '@/pages/progress/ProgressSectionHeader';
import ProgressWeekStrip from '@/pages/progress/ProgressWeekStrip';
import StreakRecordCard from '@/pages/progress/StreakRecordCard';
import {
  recurringTaskProgressQueryKey,
  recurringTasksQueryKey,
} from '@/recurring/recurringQueryKeys';
import { isApiPremiumRequiredError, shouldRetryApiQuery } from '@/utils/apiError';
import { computeLevelProgress } from '@/utils/masteryProgress';
import {
  DEFAULT_RECURRING_PROGRESS,
  normalizeRecurringProgress,
} from '@/utils/recurringProgress';

const heroSource = require('@/assets/images/recurring-hero-boxing.jpg');

export default function ProgressScreen() {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const heroHeight = Math.min(
    Math.max(Math.round(windowHeight * 0.21), 175),
    198,
  );
  const { t } = useLanguage();
  const { accessToken } = useAuth();

  const tasksQuery = useQuery({
    queryKey: recurringTasksQueryKey(accessToken),
    queryFn: () => authApi.getRecurringTasks(),
    enabled: !!accessToken,
    retry: shouldRetryApiQuery,
  });

  const progressQuery = useQuery({
    queryKey: recurringTaskProgressQueryKey(accessToken),
    queryFn: () => authApi.getRecurringTaskProgress(),
    enabled: !!accessToken,
    retry: shouldRetryApiQuery,
  });

  const masteryLevelsQuery = useQuery({
    queryKey: ['mastery-levels'],
    queryFn: () => authApi.getMasteryLevels(),
    staleTime: 1000 * 60 * 30,
  });

  const tasksPremiumLocked =
    tasksQuery.isError && isApiPremiumRequiredError(tasksQuery.error);
  const progressPremiumLocked =
    progressQuery.isError && isApiPremiumRequiredError(progressQuery.error);
  const isPremiumPreview = tasksPremiumLocked || progressPremiumLocked;

  const displayTasks = tasksQuery.data ?? [];
  const doneTasksToday = displayTasks.filter(
    task => task.status === RecurringTaskStatus.Done,
  ).length;
  const displayProgress = isPremiumPreview
    ? DEFAULT_RECURRING_PROGRESS
    : normalizeRecurringProgress(progressQuery.data);
  const masteryLevels = masteryLevelsQuery.data ?? [];

  const levelProgress = useMemo(
    () =>
      computeLevelProgress(
        masteryLevels,
        displayProgress.currentStreak,
        displayProgress.currentLevel,
      ),
    [displayProgress.currentLevel, displayProgress.currentStreak, masteryLevels],
  );

  const progressIsLoading = progressQuery.isPending && !progressPremiumLocked;
  const progressFailed =
    progressQuery.isError && !progressPremiumLocked && !progressQuery.data;
  const canRenderContent = progressQuery.isSuccess || isPremiumPreview;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={[styles.hero, { height: heroHeight, width: windowWidth }]}>
        <Image
          source={heroSource}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
        <View style={styles.heroLeftScrim} />
        <View style={styles.heroBottomFadeLight} />
        <View style={styles.heroBottomFadeMid} />
        <View style={styles.heroBottomFadeDeep} />

        <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
          <AppBrandHeader />

          <View style={styles.heroContent}>
            {progressIsLoading ? (
              <View style={styles.loadingBlock}>
                <ActivityIndicator color={recurringTheme.accentBright} />
              </View>
            ) : progressFailed ? (
              <Text style={styles.heroErrorText}>{t('recurring.progressError')}</Text>
            ) : (
              <MasteryProfileHero
                progress={displayProgress}
                levels={masteryLevels}
                showProgressPercent
              />
            )}
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tasksPremiumLocked ? (
          <View style={styles.premiumNotice}>
            <Text style={styles.premiumNoticeText}>
              {t('recurring.premiumRequired')}
            </Text>
          </View>
        ) : null}

        {progressFailed ? (
          <Text style={styles.errorText}>{t('recurring.progressError')}</Text>
        ) : null}

        {canRenderContent && !progressIsLoading && !progressFailed ? (
          <>
            <ProgressSectionHeader label={t('progress.sectionTitle')} />
            <MasteryStatsGrid progress={displayProgress} layout="grid" />

            <ProgressSectionHeader label={t('progress.last7Days')} />
            <ProgressWeekStrip
              progress={displayProgress}
              doneTasksToday={doneTasksToday}
              totalTasksToday={displayTasks.length}
            />

            {levelProgress.nextLevel ? (
              <>
                <ProgressSectionHeader label={t('progress.nextGoal')} />
                <NextLevelGoalCard levelProgress={levelProgress} />
              </>
            ) : null}

            <ProgressSectionHeader label={t('progress.recordInSight')} />
            <StreakRecordCard progress={displayProgress} />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: recurringTheme.pageBg,
  },
  hero: {
    overflow: 'hidden',
    backgroundColor: recurringTheme.pageBg,
  },
  heroImage: {
    position: 'absolute',
    top: -8,
    right: -56,
    width: '118%',
    height: '115%',
    opacity: 0.72,
  },
  heroLeftScrim: {
    position: 'absolute',
    top: 44,
    left: 0,
    bottom: 0,
    width: '56%',
    backgroundColor: 'rgba(6, 9, 8, 0.22)',
  },
  heroBottomFadeLight: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 52,
    height: 48,
    backgroundColor: 'rgba(6, 9, 8, 0.16)',
  },
  heroBottomFadeMid: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 28,
    height: 40,
    backgroundColor: 'rgba(6, 9, 8, 0.36)',
  },
  heroBottomFadeDeep: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 36,
    backgroundColor: recurringTheme.pageBg,
  },
  heroSafeArea: {
    flex: 1,
    gap: 4,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 8,
  },
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  premiumNotice: {
    borderRadius: 12,
    padding: 10,
    backgroundColor: recurringTheme.goldSoft,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  premiumNoticeText: {
    color: recurringTheme.goldBright,
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    color: recurringTheme.fireRedBright,
    fontSize: 13,
    textAlign: 'center',
  },
  heroErrorText: {
    color: recurringTheme.fireRedBright,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
