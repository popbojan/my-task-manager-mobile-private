import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import OnboardingSlideVisual from '@/onboarding/OnboardingSlideVisual';
import { ONBOARDING_SLIDES } from '@/onboarding/onboardingSlides';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type OnboardingModalProps = {
  visible: boolean;
  hasPremiumAccess: boolean;
  onClose: () => void;
  onComplete: () => void;
};

export default function OnboardingModal({
  visible,
  onClose,
  onComplete,
}: OnboardingModalProps) {
  const { t } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);
  const slide = ONBOARDING_SLIDES[stepIndex];
  const isLastStep = stepIndex >= ONBOARDING_SLIDES.length - 1;

  useEffect(() => {
    if (!visible) {
      setStepIndex(0);
    }
  }, [visible]);

  function handleClose() {
    setStepIndex(0);
    onClose();
  }

  function handleSkipStep() {
    if (isLastStep) {
      handleClose();
      return;
    }

    setStepIndex(current => current + 1);
  }

  function handlePrimary() {
    if (isLastStep) {
      setStepIndex(0);
      onComplete();
      return;
    }

    setStepIndex(current => current + 1);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('onboarding.badge')}</Text>
          </View>
          <Pressable
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.closeAll')}
            onPress={handleClose}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentHeader}>
            <Text style={styles.stepLabel}>
              {t('onboarding.progress', {
                current: stepIndex + 1,
                total: ONBOARDING_SLIDES.length,
              })}
            </Text>

            <View style={styles.dotsRow}>
              {ONBOARDING_SLIDES.map((item, index) => (
                <View
                  key={item.id}
                  style={[styles.dot, index === stepIndex ? styles.dotActive : null]}
                />
              ))}
            </View>

            <Text style={styles.title}>{t(slide.titleKey)}</Text>
          </View>

          <View style={styles.visualWrap}>
            <OnboardingSlideVisual slideId={slide.id} />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={styles.skipButton}
            accessibilityRole="button"
            onPress={handleSkipStep}
          >
            <Text style={styles.skipButtonText}>
              {isLastStep ? t('onboarding.closeAll') : t('onboarding.skipStep')}
            </Text>
          </Pressable>

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
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  closeButtonText: {
    color: recurringTheme.textPrimary,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '300',
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
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: recurringTheme.cardBorder,
    paddingTop: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
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
