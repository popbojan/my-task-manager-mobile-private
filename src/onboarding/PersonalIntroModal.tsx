import { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import IntroStepPager from '@/onboarding/IntroStepPager';
import type { PersonalIntroDraft } from '@/onboarding/personalIntroDraft';
import LanguagePicker from '@/pages/login/LanguagePicker';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import { useAppRefresh } from '@/refresh/useAppRefresh';
import { useRefreshControl } from '@/refresh/useRefreshControl';

const heroSource = require('@/assets/images/recurring-hero-boxing.jpg');
const PERSONAL_INTRO_STEPS = 4;
const HERO_HEIGHT = 160;
const HERO_TOP_MARGIN = 16;

const introInputProps = {
  autoCorrect: false,
  spellCheck: false,
  autoCapitalize: 'sentences' as const,
  autoComplete: 'off' as const,
  textContentType: 'none' as const,
  importantForAutofill: 'no' as const,
  underlineColorAndroid: 'transparent',
  placeholder: '',
  keyboardAppearance: 'dark' as const,
};

type PersonalIntroModalProps = {
  visible: boolean;
  draft: PersonalIntroDraft;
  onDraftChange: (draft: PersonalIntroDraft) => void;
  onContinueToOnboarding: () => void;
};

export default function PersonalIntroModal({
  visible,
  draft,
  onDraftChange,
  onContinueToOnboarding,
}: PersonalIntroModalProps) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { refreshing, onRefresh } = useAppRefresh();
  const refreshControl = useRefreshControl({ refreshing, onRefresh });
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const { stepIndex, taskName, whyText } = draft;
  const trimmedTaskName = taskName.trim();
  const trimmedWhyText = whyText.trim();
  const isLastStep = stepIndex >= PERSONAL_INTRO_STEPS - 1;
  const canGoBack = stepIndex > 0;
  const keyboardOpen = keyboardHeight > 0;

  function updateDraft(partial: Partial<PersonalIntroDraft>) {
    onDraftChange({ ...draft, ...partial });
  }

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, event => {
      const { screenY, height } = event.endCoordinates;
      const insetFromScreenY = screenY > 0 ? windowHeight - screenY : height;
      const androidBuffer = Platform.OS === 'android' ? 8 : 0;
      setKeyboardHeight(insetFromScreenY + androidBuffer);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible, windowHeight]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stepIndex > 0) {
        Keyboard.dismiss();
        updateDraft({ stepIndex: stepIndex - 1 });
        return true;
      }

      Keyboard.dismiss();
      onContinueToOnboarding();
      return true;
    });

    return () => subscription.remove();
  }, [visible, stepIndex, draft, onContinueToOnboarding, onDraftChange]);

  function handleSkipPersonalIntro() {
    Keyboard.dismiss();
    onContinueToOnboarding();
  }

  function handleBack() {
    Keyboard.dismiss();
    updateDraft({ stepIndex: Math.max(0, stepIndex - 1) });
  }

  function handlePrimary() {
    Keyboard.dismiss();

    if (isLastStep) {
      onContinueToOnboarding();
      return;
    }

    updateDraft({ stepIndex: stepIndex + 1 });
  }

  const primaryDisabled =
    (stepIndex === 0 && !trimmedTaskName) || (stepIndex === 1 && !trimmedWhyText);

  const primaryLabel = isLastStep ? t('personalIntro.page4.cta') : t('personalIntro.next');

  function getTitle(pageIndex: number) {
    switch (pageIndex) {
      case 0:
        return t('personalIntro.page1.title');
      case 1:
        return t('personalIntro.page2.title');
      case 2:
        return t('personalIntro.page3.title', { taskName: trimmedTaskName });
      default:
        return t('personalIntro.page4.title');
    }
  }

  function getBody(pageIndex: number) {
    switch (pageIndex) {
      case 0:
        return t('personalIntro.page1.body');
      case 1:
        return t('personalIntro.page2.body', { taskName: trimmedTaskName });
      case 2:
        return t('personalIntro.page3.body');
      default:
        return t('personalIntro.page4.body');
    }
  }

  function handleStepIndexChange(index: number) {
    Keyboard.dismiss();
    updateDraft({ stepIndex: index });
  }

  const canNavigateToStep = useCallback(
    (targetIndex: number) => {
      if (targetIndex <= stepIndex) {
        return true;
      }

      if (targetIndex > stepIndex + 1) {
        return false;
      }

      if (stepIndex === 0 && !trimmedTaskName) {
        return false;
      }

      if (stepIndex === 1 && !trimmedWhyText) {
        return false;
      }

      return true;
    },
    [stepIndex, trimmedTaskName, trimmedWhyText],
  );

  function handleSwipeToOnboarding() {
    if (primaryDisabled) {
      return;
    }

    Keyboard.dismiss();
    onContinueToOnboarding();
  }

  function renderProgressHeader(pageIndex: number) {
    return (
      <View style={styles.questionBlock}>
        <Text style={styles.stepLabel}>
          {t('personalIntro.progress', {
            current: String(pageIndex + 1),
            total: String(PERSONAL_INTRO_STEPS),
          })}
        </Text>

        <View style={styles.dotsRow}>
          {Array.from({ length: PERSONAL_INTRO_STEPS }, (_, index) => (
            <View
              key={index}
              style={[styles.dot, index === pageIndex ? styles.dotActive : null]}
            />
          ))}
        </View>

        <Text style={styles.title}>{getTitle(pageIndex)}</Text>
        <Text style={styles.body}>{getBody(pageIndex)}</Text>
      </View>
    );
  }

  function renderStep(pageIndex: number) {
    const isInputPage = pageIndex === 0 || pageIndex === 1;
    const isActiveStep = pageIndex === stepIndex;
    const hideHeroImage = keyboardOpen && isInputPage;

    return (
      <>
        {hideHeroImage ? (
          <View style={styles.heroSlotCollapsed} />
        ) : (
          <View style={styles.heroSlot}>
            <View style={styles.heroWrap}>
              <Image source={heroSource} style={styles.heroImage} resizeMode="cover" />
              <View style={styles.heroOverlay} />
            </View>
          </View>
        )}

        <View
          style={[
            isInputPage ? styles.inputStepContent : styles.content,
            keyboardOpen && isInputPage ? styles.inputStepContentCompact : null,
          ]}
        >
          {renderProgressHeader(pageIndex)}

          {pageIndex === 0 ? (
            <View style={styles.inputBlock} pointerEvents={isActiveStep ? 'auto' : 'none'}>
              <Text style={styles.inputHint}>{t('personalIntro.page1.hint')}</Text>
              <TextInput
                {...introInputProps}
                style={[styles.input, styles.inputSingleLine]}
                value={taskName}
                editable={isActiveStep}
                onChangeText={value => updateDraft({ taskName: value })}
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (trimmedTaskName) {
                    handlePrimary();
                  }
                }}
              />
            </View>
          ) : null}

          {pageIndex === 1 ? (
            <View style={styles.inputBlock} pointerEvents={isActiveStep ? 'auto' : 'none'}>
              <Text style={styles.inputHint}>{t('personalIntro.page2.hint')}</Text>
              <TextInput
                {...introInputProps}
                style={[
                  styles.input,
                  styles.textArea,
                  keyboardOpen ? styles.textAreaCompact : null,
                ]}
                value={whyText}
                editable={isActiveStep}
                onChangeText={value => updateDraft({ whyText: value })}
                multiline
                submitBehavior="newline"
                textAlignVertical="top"
              />
            </View>
          ) : null}

          {pageIndex === 2 ? (
            <View style={styles.whyCard}>
              <Text style={styles.whyLabel}>
                {t('personalIntro.page3.whyLabel', { why: trimmedWhyText })}
              </Text>
            </View>
          ) : null}
        </View>
      </>
    );
  }

  if (!visible) {
    return null;
  }

  const footerBottom = keyboardOpen
    ? keyboardHeight
    : Math.max(insets.bottom, 8);

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <StatusBar barStyle="light-content" backgroundColor={recurringTheme.pageBg} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.shell}>
            <View style={styles.header}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t('personalIntro.badge')}</Text>
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
              stepCount={PERSONAL_INTRO_STEPS}
              scrollEnabled={!keyboardOpen}
              onStepIndexChange={handleStepIndexChange}
              canNavigateToStep={canNavigateToStep}
              onSwipeAfterLast={handleSwipeToOnboarding}
              onHorizontalScrollBegin={Keyboard.dismiss}
              layoutSyncKey={`${keyboardOpen}-${footerBottom}-${footerHeight}`}
              refreshControl={refreshControl}
              pagerStyle={[
                styles.main,
                footerHeight > 0 ? { paddingBottom: footerHeight + footerBottom } : null,
              ]}
              pageScrollContentStyle={styles.scrollContent}
              renderStep={renderStep}
            />

            <View
              onLayout={event => {
                const nextHeight = event.nativeEvent.layout.height;
                if (nextHeight !== footerHeight) {
                  setFooterHeight(nextHeight);
                }
              }}
              style={[
                styles.footer,
                styles.footerDocked,
                keyboardOpen ? styles.footerCompact : null,
                { bottom: footerBottom },
              ]}
            >
              {!isLastStep ? (
                <Pressable
                  style={styles.skipButton}
                  accessibilityRole="button"
                  onPress={handleSkipPersonalIntro}
                >
                  <Text style={styles.skipButtonText}>{t('personalIntro.skip')}</Text>
                </Pressable>
              ) : null}

              <Pressable
                style={[
                  styles.primaryButton,
                  primaryDisabled ? styles.primaryButtonDisabled : null,
                ]}
                accessibilityRole="button"
                disabled={primaryDisabled}
                onPress={handlePrimary}
              >
                <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 2000,
    elevation: 2000,
    backgroundColor: recurringTheme.pageBg,
  },
  container: {
    flex: 1,
    backgroundColor: recurringTheme.pageBg,
  },
  shell: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
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
  headerBackButton: {
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  headerBackText: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  main: {
    flex: 1,
    minHeight: 0,
  },
  inputStepContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 20,
  },
  inputStepContentCompact: {
    paddingTop: 12,
    gap: 12,
  },
  heroSlot: {
    overflow: 'hidden',
    backgroundColor: recurringTheme.pageBg,
  },
  heroSlotCollapsed: {
    height: 0,
    overflow: 'hidden',
  },
  heroWrap: {
    height: HERO_HEIGHT,
    marginHorizontal: 16,
    marginTop: HERO_TOP_MARGIN,
    borderRadius: recurringTheme.cardRadius,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: recurringTheme.vignette,
  },
  questionBlock: {
    gap: 12,
  },
  scroll: {
    flex: 1,
    backgroundColor: recurringTheme.pageBg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
    backgroundColor: recurringTheme.pageBg,
  },
  content: {
    paddingHorizontal: 20,
    gap: 12,
    paddingTop: 24,
    paddingBottom: 8,
  },
  stepLabel: {
    ...premiumType.overline,
    color: recurringTheme.textMuted,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
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
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  body: {
    color: recurringTheme.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  inputBlock: {
    gap: 6,
    flexShrink: 0,
  },
  inputHint: {
    color: recurringTheme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: recurringTheme.textPrimary,
    fontSize: 15,
    backgroundColor: recurringTheme.surfaceInset,
  },
  inputSingleLine: {
    height: 44,
    minHeight: 44,
    flexShrink: 0,
  },
  textArea: {
    height: 112,
    paddingTop: 10,
    lineHeight: 20,
  },
  textAreaCompact: {
    height: 72,
  },
  whyCard: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorderAccent,
    backgroundColor: recurringTheme.accentGlow,
  },
  whyLabel: {
    color: recurringTheme.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: recurringTheme.cardBorder,
    paddingTop: 8,
    backgroundColor: recurringTheme.pageBg,
  },
  footerDocked: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  footerCompact: {
    gap: 6,
    paddingTop: 6,
    paddingBottom: 6,
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
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: recurringTheme.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
