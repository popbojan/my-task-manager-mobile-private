import { useEffect, useRef } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollView as ScrollViewType,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { PersonalIntroDraft } from '@/onboarding/personalIntroDraft';
import LanguagePicker from '@/pages/login/LanguagePicker';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

const heroSource = require('@/assets/images/recurring-hero-boxing.jpg');
const PERSONAL_INTRO_STEPS = 4;
const HERO_HEIGHT = 160;
const HERO_TOP_MARGIN = 16;
const HERO_SLOT_HEIGHT = HERO_HEIGHT + HERO_TOP_MARGIN;
const HERO_COLLAPSE_DURATION = 540;
const HERO_EXPAND_DURATION_IOS = 500;
const HERO_EXPAND_DURATION_ANDROID = 520;
const HERO_COLLAPSE_EASING = Easing.bezier(0.33, 0, 0.1, 1);
const HERO_EXPAND_EASING = Easing.bezier(0.16, 0.84, 0.2, 1);

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
  const scrollRef = useRef<ScrollViewType>(null);
  const heroProgress = useRef(new Animated.Value(1)).current;
  const { stepIndex, taskName, whyText } = draft;
  const trimmedTaskName = taskName.trim();
  const trimmedWhyText = whyText.trim();
  const isLastStep = stepIndex >= PERSONAL_INTRO_STEPS - 1;
  const canGoBack = stepIndex > 0;

  function updateDraft(partial: Partial<PersonalIntroDraft>) {
    onDraftChange({ ...draft, ...partial });
  }

  function animateHero(expanded: boolean, duration: number) {
    heroProgress.stopAnimation();

    Animated.timing(heroProgress, {
      toValue: expanded ? 1 : 0,
      duration,
      easing: expanded ? HERO_EXPAND_EASING : HERO_COLLAPSE_EASING,
      useNativeDriver: false,
    }).start();
  }

  function collapseHeroForKeyboard() {
    animateHero(false, HERO_COLLAPSE_DURATION);
  }

  function expandHeroAfterKeyboard(eventDuration?: number) {
    const fallback =
      Platform.OS === 'ios' ? HERO_EXPAND_DURATION_IOS : HERO_EXPAND_DURATION_ANDROID;
    animateHero(true, Math.max(eventDuration ?? 0, fallback));
  }

  useEffect(() => {
    if (!visible) {
      heroProgress.setValue(1);
      return;
    }

    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const hideSubscription = Keyboard.addListener(hideEvent, event => {
      expandHeroAfterKeyboard(event.duration);
    });

    return () => {
      hideSubscription.remove();
    };
  }, [visible, heroProgress]);

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
    if (isLastStep) {
      onContinueToOnboarding();
      return;
    }

    updateDraft({ stepIndex: stepIndex + 1 });
  }

  function handleInputFocus() {
    collapseHeroForKeyboard();
  }

  const primaryDisabled =
    (stepIndex === 0 && !trimmedTaskName) || (stepIndex === 1 && !trimmedWhyText);

  const title = (() => {
    switch (stepIndex) {
      case 0:
        return t('personalIntro.page1.title');
      case 1:
        return t('personalIntro.page2.title');
      case 2:
        return t('personalIntro.page3.title', { taskName: trimmedTaskName });
      default:
        return t('personalIntro.page4.title');
    }
  })();

  const body = (() => {
    switch (stepIndex) {
      case 0:
        return t('personalIntro.page1.body');
      case 1:
        return t('personalIntro.page2.body', { taskName: trimmedTaskName });
      case 2:
        return t('personalIntro.page3.body');
      default:
        return t('personalIntro.page4.body');
    }
  })();

  const primaryLabel = isLastStep ? t('personalIntro.page4.cta') : t('personalIntro.next');

  const heroSlotHeight = heroProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, HERO_SLOT_HEIGHT],
  });
  const heroOpacity = heroProgress;
  const contentPaddingTop = heroProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 24],
  });

  const heroBlock = (
    <Animated.View
      style={[styles.heroSlot, { height: heroSlotHeight, opacity: heroOpacity }]}
      pointerEvents="none"
    >
      <View style={styles.heroWrap}>
        <Image source={heroSource} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.heroOverlay} />
      </View>
    </Animated.View>
  );

  const progressHeader = (
    <View style={styles.questionBlock}>
      <Text style={styles.stepLabel}>
        {t('personalIntro.progress', {
          current: String(stepIndex + 1),
          total: String(PERSONAL_INTRO_STEPS),
        })}
      </Text>

      <View style={styles.dotsRow}>
        {Array.from({ length: PERSONAL_INTRO_STEPS }, (_, index) => (
          <View
            key={index}
            style={[styles.dot, index === stepIndex ? styles.dotActive : null]}
          />
        ))}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} accessibilityViewIsModal>
      <StatusBar barStyle="light-content" backgroundColor={recurringTheme.pageBg} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
        keyboardVerticalOffset={insets.top}
      >
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {heroBlock}
            <Animated.View style={[styles.content, { paddingTop: contentPaddingTop }]}>
              {progressHeader}

              {stepIndex === 0 ? (
                <View style={styles.inputBlock}>
                  <Text style={styles.inputHint}>{t('personalIntro.page1.hint')}</Text>
                  <TextInput
                    {...introInputProps}
                    style={styles.input}
                    value={taskName}
                    onChangeText={value => updateDraft({ taskName: value })}
                    returnKeyType="next"
                    onFocus={handleInputFocus}
                    onSubmitEditing={() => {
                      if (trimmedTaskName) {
                        handlePrimary();
                      }
                    }}
                  />
                </View>
              ) : null}

              {stepIndex === 1 ? (
                <View style={styles.inputBlock}>
                  <Text style={styles.inputHint}>{t('personalIntro.page2.hint')}</Text>
                  <TextInput
                    {...introInputProps}
                    style={[styles.input, styles.textArea]}
                    value={whyText}
                    onChangeText={value => updateDraft({ whyText: value })}
                    multiline
                    textAlignVertical="top"
                    returnKeyType="done"
                    blurOnSubmit
                    onFocus={handleInputFocus}
                    onSubmitEditing={() => {
                      if (trimmedWhyText) {
                        handlePrimary();
                      }
                    }}
                  />
                </View>
              ) : null}

              {stepIndex === 2 ? (
                <View style={styles.whyCard}>
                  <Text style={styles.whyLabel}>
                    {t('personalIntro.page3.whyLabel', { why: trimmedWhyText })}
                  </Text>
                </View>
              ) : null}
            </Animated.View>
          </ScrollView>

          <View style={styles.footer}>
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
        </SafeAreaView>
      </KeyboardAvoidingView>
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
  flex: {
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
  heroSlot: {
    overflow: 'hidden',
    backgroundColor: recurringTheme.pageBg,
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
    paddingBottom: 24,
    backgroundColor: recurringTheme.pageBg,
  },
  content: {
    paddingHorizontal: 20,
    gap: 12,
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
    marginTop: 4,
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
  textArea: {
    height: 112,
    paddingTop: 10,
    lineHeight: 20,
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
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
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
