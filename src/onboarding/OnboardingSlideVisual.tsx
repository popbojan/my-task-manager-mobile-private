import type { ReactNode } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getMasteryAvatarSource } from '@/assets/masteryAvatars';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  ONBOARDING_DEMO_PROGRESS,
  ONBOARDING_DEMO_TASKS_TODAY,
} from '@/onboarding/onboardingDemoProgress';
import type { OnboardingSlideId } from '@/onboarding/onboardingSlides';
import ProgressWeekStrip from '@/pages/progress/ProgressWeekStrip';
import {
  CrownIcon,
  FireIcon,
  StarIcon,
  TrophyIcon,
} from '@/pages/recurring-tasks/premium/PremiumIcons';
import PremiumSurface from '@/pages/recurring-tasks/premium/PremiumSurface';
import { PlusIcon } from '@/pages/recurring-tasks/premium/TabIcons';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type OnboardingSlideVisualProps = {
  slideId: OnboardingSlideId;
};

function OnboardingSection({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
      {children}
    </View>
  );
}

function RecurringStatusColumn({ done = false }: { done?: boolean }) {
  const { t } = useLanguage();

  return (
    <View style={styles.statusColumn}>
      {done ? (
        <View style={styles.checkboxDoneRound}>
          <Text style={styles.checkmarkDone}>✓</Text>
        </View>
      ) : (
        <View style={styles.checkboxOuterRound}>
          <View style={styles.checkboxInnerRound} />
        </View>
      )}
      <Text
        style={[styles.statusLabel, done && styles.statusLabelDone]}
        numberOfLines={1}
      >
        {done ? t('recurring.status.done') : t('recurring.status.todo')}
      </Text>
    </View>
  );
}

function BoardStatusColumn({ done = false }: { done?: boolean }) {
  const { t } = useLanguage();

  return (
    <View style={styles.statusColumn}>
      {done ? (
        <View style={styles.checkboxDoneRound}>
          <Text style={styles.checkmarkDone}>✓</Text>
        </View>
      ) : (
        <View style={styles.checkboxOuterRound}>
          <View style={styles.checkboxInnerRound} />
        </View>
      )}
      <Text
        style={[styles.statusLabel, done && styles.statusLabelDone]}
        numberOfLines={1}
      >
        {done ? t('tasks.status.done') : t('tasks.status.todo')}
      </Text>
    </View>
  );
}

function HabitExampleCard() {
  const { t } = useLanguage();

  return (
    <PremiumSurface accent="green" compact padding={8} radius={12}>
      <View style={styles.cardRow}>
        <RecurringStatusColumn />
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {t('onboarding.slide1.habitExample')}
          </Text>
        </View>
      </View>
    </PremiumSurface>
  );
}

function BoardExampleCard({ done = false }: { done?: boolean }) {
  const { t } = useLanguage();

  return (
    <PremiumSurface
      accent={done ? 'success' : 'none'}
      compact
      padding={8}
      radius={12}
      style={done ? styles.doneCardShell : undefined}
    >
      <View style={styles.cardRow}>
        <BoardStatusColumn done={done} />
        <View style={styles.cardCopy}>
          <Text
            style={[styles.cardTitle, done && styles.cardTitleDone]}
            numberOfLines={1}
          >
            {t('onboarding.slide1.boardExample')}
          </Text>
          {!done ? (
            <View style={styles.metaRow}>
              <View style={styles.deadlineBadgeWeek}>
                <Text style={styles.deadlineBadgeWeekText}>
                  {t('tasks.deadline.thisWeek')}
                </Text>
              </View>
              <Text style={styles.cardMeta}>{t('onboarding.slide1.boardDeadline')}</Text>
              <View style={styles.priorityBadge}>
                <Text style={styles.priorityBadgeText}>
                  {t('tasks.priority.important')}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </PremiumSurface>
  );
}

function MockTasksHeader({ highlightAdd = false }: { highlightAdd?: boolean }) {
  const { t } = useLanguage();

  return (
    <View style={styles.mockHeader}>
      <Text style={styles.mockHeaderTitle}>{t('tasks.sectionTitle')}</Text>
      <View style={styles.mockHeaderRight}>
        <View style={styles.mockHeaderBadge}>
          <Text style={styles.mockHeaderBadgeText}>1</Text>
        </View>
        <View
          style={[
            styles.mockAddFab,
            highlightAdd ? styles.mockAddFabHighlight : null,
          ]}
        >
          {highlightAdd ? <View style={styles.mockAddFabRing} /> : null}
          <PlusIcon size={12} color="#fff" />
        </View>
      </View>
    </View>
  );
}

function FlowStep({
  stepNumber,
  title,
  body,
  visual,
}: {
  stepNumber: number;
  title: string;
  body: string;
  visual?: ReactNode;
}) {
  return (
    <View style={styles.flowStep}>
      <View style={styles.flowStepHeading}>
        <View style={styles.flowStepBadge}>
          <Text style={styles.flowStepBadgeText}>{stepNumber}</Text>
        </View>
        <Text style={styles.flowStepTitle}>{title}</Text>
      </View>
      <Text style={styles.flowStepBody}>{body}</Text>
      {visual ? <View style={styles.flowStepVisual}>{visual}</View> : null}
    </View>
  );
}

function OnboardingStatTile({
  tone,
  icon,
  label,
  hint,
  value,
}: {
  tone: 'green' | 'gold' | 'red';
  icon: ReactNode;
  label: string;
  hint: string;
  value: string;
}) {
  return (
    <PremiumSurface accent={tone} compact padding={10} radius={12} style={styles.statTile}>
      <View style={styles.statTileTop}>
        <View style={styles.statIconWrap}>{icon}</View>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statHint}>{hint}</Text>
    </PremiumSurface>
  );
}

function TwoWorldsVisual() {
  const { t } = useLanguage();

  return (
    <View style={styles.slideRoot}>
      <OnboardingSection
        title={t('onboarding.slide1.today.sectionTitle')}
        body={t('onboarding.slide1.today.body')}
      >
        <HabitExampleCard />
      </OnboardingSection>

      <OnboardingSection
        title={t('onboarding.slide1.tasks.sectionTitle')}
        body={t('onboarding.slide1.tasks.body')}
      >
        <BoardExampleCard />
      </OnboardingSection>
    </View>
  );
}

function GetStartedVisual() {
  const { t } = useLanguage();

  return (
    <View style={styles.slideRoot}>
      <FlowStep
        stepNumber={1}
        title={t('onboarding.slide2.step1.title')}
        body={t('onboarding.slide2.step1.body')}
      />

      <FlowStep
        stepNumber={2}
        title={t('onboarding.slide2.step2.title')}
        body={t('onboarding.slide2.step2.body')}
        visual={
          <View style={styles.createPreview}>
            <MockTasksHeader highlightAdd />
            <BoardExampleCard />
          </View>
        }
      />

      <FlowStep
        stepNumber={3}
        title={t('onboarding.slide2.step3.title')}
        body={t('onboarding.slide2.step3.body')}
        visual={<BoardExampleCard done />}
      />

      <Text style={styles.premiumNote}>{t('onboarding.slide2.premiumNote')}</Text>
    </View>
  );
}

function ProgressVisual() {
  const { t } = useLanguage();
  const avatarSource = getMasteryAvatarSource('mastery-level-03-disciplined');
  const avatarSize = 72;
  const progress = ONBOARDING_DEMO_PROGRESS;

  return (
    <View style={styles.slideRoot}>
      <Text style={styles.introText}>{t('onboarding.slide3.intro')}</Text>

      <View style={styles.avatarCenter}>
        <View style={[styles.avatarWrap, { width: avatarSize }]}>
          <View
            style={[
              styles.avatarRing,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
              },
            ]}
          >
            {avatarSource ? (
              <Image source={avatarSource} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarImage, styles.avatarFallback]} />
            )}
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{progress.currentLevel}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statsGridRow}>
          <OnboardingStatTile
            tone="green"
            icon={<StarIcon size={14} />}
            label={t('recurring.stats.currentLevel')}
            hint={t('onboarding.slide3.stat.currentLevel.hint')}
            value={t('recurring.stats.levelValue', {
              level: String(progress.currentLevel),
            })}
          />
          <OnboardingStatTile
            tone="gold"
            icon={<CrownIcon size={14} />}
            label={t('recurring.stats.highestLevel')}
            hint={t('onboarding.slide3.stat.highestLevel.hint')}
            value={t('recurring.stats.levelValue', {
              level: String(progress.highestLevelReached),
            })}
          />
        </View>
        <View style={styles.statsGridRow}>
          <OnboardingStatTile
            tone="red"
            icon={<FireIcon size={14} />}
            label={t('recurring.stats.currentStreak')}
            hint={t('onboarding.slide3.stat.currentStreak.hint')}
            value={t('recurring.stats.daysValue', {
              days: String(progress.currentStreak),
            })}
          />
          <OnboardingStatTile
            tone="gold"
            icon={<TrophyIcon size={14} />}
            label={t('recurring.stats.highestStreak')}
            hint={t('onboarding.slide3.stat.highestStreak.hint')}
            value={t('recurring.stats.daysValue', {
              days: String(progress.highestStreakReached),
            })}
          />
        </View>
      </View>

      <Text style={styles.streakFootnote}>{t('onboarding.slide3.streakFootnote')}</Text>

      <View style={styles.weekBlock}>
        <Text style={styles.weekTitle}>{t('onboarding.slide3.weekTitle')}</Text>
        <ProgressWeekStrip
          progress={progress}
          doneTasksToday={ONBOARDING_DEMO_TASKS_TODAY.done}
          totalTasksToday={ONBOARDING_DEMO_TASKS_TODAY.total}
        />
      </View>
    </View>
  );
}

export default function OnboardingSlideVisual({ slideId }: OnboardingSlideVisualProps) {
  switch (slideId) {
    case 'twoWorlds':
      return <TwoWorldsVisual />;
    case 'getStarted':
      return <GetStartedVisual />;
    case 'progress':
      return <ProgressVisual />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  slideRoot: {
    gap: 18,
    paddingBottom: 4,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: recurringTheme.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionBody: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  introText: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  cardTitle: {
    color: recurringTheme.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  cardTitleDone: {
    color: recurringTheme.textSecondary,
    textDecorationLine: 'line-through',
  },
  cardMeta: {
    color: recurringTheme.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  deadlineBadgeWeek: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(212, 168, 67, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  deadlineBadgeWeekText: {
    color: recurringTheme.goldBright,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(82, 183, 136, 0.12)',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
  },
  priorityBadgeText: {
    color: recurringTheme.accentBright,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statusColumn: {
    width: 48,
    flexShrink: 0,
    alignItems: 'center',
    gap: 4,
  },
  checkboxOuterRound: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(82, 183, 136, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(82, 183, 136, 0.22)',
  },
  checkboxInnerRound: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: recurringTheme.accentBright,
    backgroundColor: 'transparent',
  },
  checkboxDoneRound: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.accentBright,
    borderWidth: 2,
    borderColor: '#b7f7d8',
  },
  checkmarkDone: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  statusLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: recurringTheme.textMuted,
    textAlign: 'center',
  },
  statusLabelDone: {
    color: recurringTheme.accentBright,
  },
  doneCardShell: {
    backgroundColor: 'rgba(82, 183, 136, 0.12)',
  },
  flowStep: {
    gap: 6,
  },
  flowStepHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  flowStepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.accentDark,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
  },
  flowStepBadgeText: {
    color: recurringTheme.accentBright,
    fontSize: 12,
    fontWeight: '800',
  },
  flowStepTitle: {
    flex: 1,
    color: recurringTheme.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  flowStepBody: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 34,
  },
  flowStepVisual: {
    paddingLeft: 34,
    paddingTop: 4,
  },
  createPreview: {
    gap: 8,
  },
  mockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  mockHeaderTitle: {
    ...premiumType.overline,
    color: recurringTheme.textSecondary,
    fontSize: 11,
  },
  mockHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mockHeaderBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.surfaceInset,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  mockHeaderBadgeText: {
    color: recurringTheme.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  mockAddFab: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.accentDark,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
  },
  mockAddFabHighlight: {
    shadowColor: recurringTheme.accent,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 4,
  },
  mockAddFabRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(82, 183, 136, 0.45)',
  },
  premiumNote: {
    color: recurringTheme.textMuted,
    fontSize: 12,
    lineHeight: 18,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: recurringTheme.cardBorder,
  },
  avatarCenter: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarRing: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: recurringTheme.cardBorderAccent,
    backgroundColor: recurringTheme.surfaceInset,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    backgroundColor: recurringTheme.accentDark,
  },
  levelBadge: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.gold,
    borderWidth: 2,
    borderColor: recurringTheme.pageBg,
  },
  levelBadgeText: {
    color: recurringTheme.pageBg,
    fontSize: 11,
    fontWeight: '900',
  },
  statsGrid: {
    gap: 8,
  },
  statsGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statTile: {
    flex: 1,
    minWidth: 0,
  },
  statTileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 6,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.surfaceInset,
  },
  statValue: {
    color: recurringTheme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    flexShrink: 1,
    textAlign: 'right',
  },
  statLabel: {
    color: recurringTheme.textPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
  statHint: {
    color: recurringTheme.textMuted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },
  streakFootnote: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  weekBlock: {
    gap: 8,
  },
  weekTitle: {
    ...premiumType.sectionTitle,
    color: recurringTheme.textSecondary,
    fontSize: 12,
  },
});
