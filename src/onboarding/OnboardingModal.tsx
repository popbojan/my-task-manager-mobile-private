import { useEffect, useState } from 'react';
import {
  BackHandler,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import IntroStepPager from '@/onboarding/IntroStepPager';
import OnboardingSlideVisual from '@/onboarding/OnboardingSlideVisual';
import OnboardingYourChoiceSummary from '@/onboarding/OnboardingYourChoiceSummary';
import { ONBOARDING_SLIDES } from '@/onboarding/onboardingSlides';
import LanguagePicker from '@/pages/login/LanguagePicker';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import { useAppRefresh } from '@/refresh/useAppRefresh';
import { useRefreshControl } from '@/refresh/useRefreshControl';

type OnboardingModalProps = {
  visible: boolean;
  hasPremiumAccess: boolean;
  showBackToPersonalIntro?: boolean;
  onBackToPersonalIntro?: () => void;
  onClose: () => void;
  onComplete: () => void;
};

export default function OnboardingModal({
  visible,
  showBackToPersonalIntro = false,
  onBackToPersonalIntro,
  onClose,
  onComplete,
}: OnboardingModalProps) {
  const { t } = useLanguage();
  const { refreshing, onRefresh } = useAppRefresh();
  const refreshControl = useRefreshControl({ refreshing, onRefresh });
  const [stepIndex, setStepIndex] = useState(0);
  const isLastStep = stepIndex >= ONBOARDING_SLIDES.length - 1;
  const canGoBack = stepIndex > 0;

  useEffect(() => {
    if (!visible) {
      setStepIndex(0);
    }
  }, [visible]);

  function handleClose() {
    setStepIndex(0);
    onClose();
  }

  function handleBack() {
    setStepIndex(current => Math.max(0, current - 1));
  }

  function handleBackToPersonalIntroOrClose() {
    if (showBackToPersonalIntro && onBackToPersonalIntro) {
      onBackToPersonalIntro();
      return;
    }

    handleClose();
  }

  useEffect(() => {
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stepIndex > 0) {
        handleBack();
        return true;
      }

      handleBackToPersonalIntroOrClose();
      return true;
    });

    return () => subscription.remove();
  }, [visible, stepIndex, showBackToPersonalIntro, onBackToPersonalIntro]);

  function handleRequestClose() {
    if (stepIndex > 0) {
      handleBack();
      return;
    }

    handleBackToPersonalIntroOrClose();
  }

  function finishOnboarding() {
    onComplete();
  }

  function handleSkipOnboarding() {
    finishOnboarding();
  }

  function handlePrimary() {
    if (isLastStep) {
      finishOnboarding();
      return;
    }

    setStepIndex(current => current + 1);
  }

  function handleSwipeAfterLast() {
    finishOnboarding();
  }

  function renderStep(pageIndex: number) {
    const pageSlide = ONBOARDING_SLIDES[pageIndex];

    return (
      <>
        <View style={styles.contentHeader}>
          <Text style={styles.stepLabel}>
            {t('onboarding.progress', {
              current: String(pageIndex + 1),
              total: String(ONBOARDING_SLIDES.length),
            })}
          </Text>

          <View style={styles.dotsRow}>
            {ONBOARDING_SLIDES.map((item, index) => (
              <View
                key={item.id}
                style={[styles.dot, index === pageIndex ? styles.dotActive : null]}
              />
            ))}
          </View>

          <Text style={styles.title}>{t(pageSlide.titleKey)}</Text>
          {pageSlide.id === 'yourChoice' ? (
            <OnboardingYourChoiceSummary />
          ) : (
            <Text style={styles.body}>{t(pageSlide.bodyKey)}</Text>
          )}
        </View>

        <View
          style={[
            styles.visualWrap,
            pageSlide.id === 'yourChoice' ? styles.visualWrapCompact : null,
          ]}
        >
          {pageSlide.id === 'yourChoice' ? (
            <Text style={styles.visualCaption}>{t('onboarding.slide6.visualCaption')}</Text>
          ) : null}
          <OnboardingSlideVisual slideId={pageSlide.id} />
        </View>
      </>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleRequestClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('onboarding.badge')}</Text>
          </View>
          <View style={styles.headerRight}>
            {canGoBack ? (
              <Pressable
                style={styles.headerBackButton}
                accessibilityRole="button"
                onPress={handleBack}
              >
                <Text style={styles.headerBackText}>← {t('personalIntro.back')}</Text>
              </Pressable>
            ) : null}
            <LanguagePicker variant="ghost" />
          </View>
        </View>

        <IntroStepPager
          stepIndex={stepIndex}
          stepCount={ONBOARDING_SLIDES.length}
          onStepIndexChange={setStepIndex}
          canNavigateToStep={() => true}
          onSwipeBeforeFirst={handleBackToPersonalIntroOrClose}
          onSwipeAfterLast={handleSwipeAfterLast}
          refreshControl={refreshControl}
          pagerStyle={styles.scroll}
          pageScrollContentStyle={styles.scrollContent}
          renderStep={renderStep}
        />

        <View style={styles.footer}>
          {showBackToPersonalIntro && onBackToPersonalIntro ? (
            <Pressable
              style={styles.backLinkButton}
              accessibilityRole="button"
              onPress={onBackToPersonalIntro}
            >
              <Text style={styles.backLinkText}>{t('onboarding.backToPersonalIntro')}</Text>
            </Pressable>
          ) : null}

          {!isLastStep ? (
            <Pressable
              style={styles.skipButton}
              accessibilityRole="button"
              onPress={handleSkipOnboarding}
            >
              <Text style={styles.skipButtonText}>{t('onboarding.skip')}</Text>
            </Pressable>
          ) : null}

          <Pressable
            style={styles.primaryButton}
            accessibilityRole="button"
            onPress={handlePrimary}
          >
            <Text style={styles.primaryButtonText}>
              {isLastStep ? t('onboarding.finish') : t('onboarding.next')}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: recurringTheme.pageBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.pageBg,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBackButton: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  headerBackText: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: recurringTheme.accentGlow,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
  },
  badgeText: {
    color: recurringTheme.accentBright,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 12,
  },
  contentHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  visualWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  visualWrapCompact: {
    paddingTop: 8,
  },
  visualCaption: {
    ...premiumType.overline,
    color: recurringTheme.textMuted,
    fontSize: 10,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  stepLabel: {
    ...premiumType.overline,
    color: recurringTheme.textMuted,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: recurringTheme.cardBorder,
  },
  dotActive: {
    width: 24,
    backgroundColor: recurringTheme.accent,
  },
  title: {
    color: recurringTheme.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  body: {
    color: recurringTheme.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: recurringTheme.cardBorder,
    paddingTop: 8,
  },
  backLinkButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backLinkText: {
    color: recurringTheme.accentBright,
    fontSize: 14,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  skipButtonText: {
    color: recurringTheme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: recurringTheme.accentDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: recurringTheme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
