import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { authApi } from '@/api/authClient';
import { useAuth } from '@/auth/AuthContext';
import { useApiLanguage, useLanguage } from '@/i18n/LanguageProvider';
import LanguagePicker from '@/pages/login/LanguagePicker';
import LoginHelpModal from '@/pages/login/LoginHelpModal';
import MasteryLevelStrip from '@/pages/login/MasteryLevelStrip';
import { loginTheme } from '@/pages/login/loginTheme';
import type { MasteryLevel } from '@/api/generated/models/MasteryLevel';

const logoSource = require('@/assets/images/logo.png');
const loginBgSource = require('@/assets/images/login-bg.jpg');

type LoginStep = 'email' | 'otp';

export default function LoginScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { setAccessToken } = useAuth();
  const { t } = useLanguage();
  const apiLanguage = useApiLanguage();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<LoginStep>('email');
  const [helpOpen, setHelpOpen] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [levels, setLevels] = useState<MasteryLevel[]>([]);
  const [levelsLoading, setLevelsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    authApi
      .getMasteryLevels()
      .then(data => {
        if (!cancelled) {
          setLevels(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLevels([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLevelsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSendOtp = useCallback(async () => {
    if (!email.trim() || isSendingOtp) {
      return;
    }

    setOtpError(null);
    setIsSendingOtp(true);

    try {
      await authApi.requestOtp({
        oTPRequest: { email: email.trim(), language: apiLanguage },
      });
      setStep('otp');
    } catch {
      setOtpError(t('login.errorOtpRequest'));
    } finally {
      setIsSendingOtp(false);
    }
  }, [apiLanguage, email, isSendingOtp, t]);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !otp.trim() || isLoggingIn) {
      return;
    }

    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const data = await authApi.loginWithOtp({
        loginRequest: {
          email: email.trim(),
          otp: otp.trim(),
          language: apiLanguage,
        },
      });

      if (data.accessToken) {
        setAccessToken(data.accessToken);
      }
    } catch {
      setLoginError(t('login.errorLogin'));
    } finally {
      setIsLoggingIn(false);
    }
  }, [apiLanguage, email, isLoggingIn, otp, setAccessToken, t]);

  const canSendOtp = !!email.trim() && !isSendingOtp;
  const canLogin = !!email.trim() && !!otp.trim() && !isLoggingIn;
  const contentMinHeight = windowHeight - insets.top - insets.bottom;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={loginBgSource}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
          >
            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                {
                  minHeight: contentMinHeight,
                  justifyContent: 'space-between',
                  paddingTop: insets.top + 16,
                },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.topSection}>
                <View style={styles.header}>
                  <View style={styles.brandChip}>
                    <View style={styles.logoShell}>
                      <Image
                        source={logoSource}
                        style={styles.logo}
                        accessibilityIgnoresInvertColors
                      />
                    </View>
                    <View style={styles.brandCopy}>
                      <Text style={styles.brandName} numberOfLines={1}>
                        {t('header.brand')}
                      </Text>
                      <Text style={styles.brandTagline} numberOfLines={1}>
                        {t('login.brand.tagline')}
                      </Text>
                    </View>
                  </View>
                  <LanguagePicker />
                </View>

                <View style={styles.hero}>
                  <Text
                    style={styles.heroTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.78}
                  >
                    {t('login.hero.title')}
                  </Text>
                  <Text style={styles.heroSubtitle}>
                    {t('login.hero.subtitle')}
                  </Text>
                </View>
              </View>

              <View style={styles.mainContent}>
                <View style={styles.middleSection}>
                  <View style={styles.panel}>
                <View style={styles.panelHeader}>
                  <View style={styles.titleRow}>
                    <Text style={styles.panelTitle}>
                      {step === 'email'
                        ? t('login.title')
                        : t('login.titleOtp')}
                    </Text>
                    <Pressable
                      style={styles.helpButton}
                      accessibilityLabel={t('login.help.trigger')}
                      onPress={() => setHelpOpen(true)}
                    >
                      <Text style={styles.helpButtonText}>?</Text>
                    </Pressable>
                  </View>
                  {step === 'email' ? (
                    <Text style={styles.panelSubtitle}>{t('login.subtitle')}</Text>
                  ) : (
                    <Text style={styles.stepHint}>
                      {t('login.subtitleOtp', { email: email.trim() })}
                    </Text>
                  )}
                </View>

                {step === 'email' ? (
                  <View>
                    <Text style={styles.label}>{t('login.email')}</Text>
                    <View style={styles.inputRow}>
                      <Text style={styles.inputIcon}>✉</Text>
                      <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t('login.emailPlaceholder')}
                        placeholderTextColor="rgba(255, 255, 255, 0.42)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        textContentType="emailAddress"
                        returnKeyType="next"
                        onSubmitEditing={handleSendOtp}
                      />
                    </View>
                    <Pressable
                      style={[styles.button, !canSendOtp && styles.buttonDisabled]}
                      disabled={!canSendOtp}
                      onPress={handleSendOtp}
                    >
                      {isSendingOtp ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>{t('login.sendCode')}</Text>
                      )}
                    </Pressable>
                    <Text style={styles.otpHint}>🔒 {t('login.otpHint')}</Text>
                    {otpError ? (
                      <Text style={styles.error}>{otpError}</Text>
                    ) : null}
                  </View>
                ) : (
                  <View>
                    <Text style={styles.label}>{t('login.otp')}</Text>
                    <TextInput
                      style={styles.inputStandalone}
                      value={otp}
                      onChangeText={setOtp}
                      placeholder={t('login.otpPlaceholder')}
                      placeholderTextColor="rgba(255, 255, 255, 0.42)"
                      keyboardType="number-pad"
                      autoComplete={
                        Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'
                      }
                      textContentType="oneTimeCode"
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <Pressable
                      style={[styles.button, !canLogin && styles.buttonDisabled]}
                      disabled={!canLogin}
                      onPress={handleLogin}
                    >
                      {isLoggingIn ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>{t('login.submit')}</Text>
                      )}
                    </Pressable>
                    {loginError ? (
                      <Text style={styles.error}>{loginError}</Text>
                    ) : null}
                    <Pressable
                      style={styles.backLink}
                      onPress={() => {
                        setStep('email');
                        setOtp('');
                        setLoginError(null);
                      }}
                    >
                      <Text style={styles.backLinkText}>← {t('login.email')}</Text>
                    </Pressable>
                  </View>
                )}
              </View>
                </View>
              </View>

              <View style={styles.bottomSection}>
                <MasteryLevelStrip
                  levels={levels}
                  isLoading={levelsLoading}
                />
                <Text style={styles.securityFooter}>
                  🛡 {t('login.security')}
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>

      <LoginHelpModal visible={helpOpen} onClose={() => setHelpOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: loginTheme.background,
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topSection: {
    flexShrink: 0,
    width: '100%',
  },
  mainContent: {
    flexGrow: 1,
    width: '100%',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  middleSection: {
    flexShrink: 0,
    width: '100%',
  },
  bottomSection: {
    flexShrink: 0,
    paddingTop: 8,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 8,
    paddingLeft: 6,
    paddingRight: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
  },
  logoShell: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  logo: {
    width: 62,
    height: 62,
    resizeMode: 'contain',
  },
  brandCopy: {
    paddingRight: 2,
  },
  brandName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  brandTagline: {
    color: loginTheme.brandTagline,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  heroTitle: {
    width: '100%',
    color: '#fff',
    fontSize: 23,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 27,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    width: '100%',
    marginTop: 6,
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  panel: {
    borderRadius: 18,
    padding: 20,
    backgroundColor: loginTheme.glassBg,
    borderWidth: 1,
    borderColor: loginTheme.glassBorder,
  },
  panelHeader: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  panelTitle: {
    flex: 1,
    color: loginTheme.text,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  helpButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    color: 'rgba(255, 255, 255, 0.88)',
    fontSize: 15,
    fontWeight: '700',
  },
  panelSubtitle: {
    marginTop: 6,
    color: loginTheme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  stepHint: {
    marginTop: 6,
    color: loginTheme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: loginTheme.inputBorder,
    backgroundColor: loginTheme.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    color: '#fff',
    fontSize: 16,
  },
  inputStandalone: {
    borderWidth: 1,
    borderColor: loginTheme.inputBorder,
    backgroundColor: loginTheme.inputBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    marginTop: 14,
    backgroundColor: loginTheme.primary,
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.52,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  otpHint: {
    marginTop: 12,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    marginTop: 10,
    color: loginTheme.error,
    fontSize: 14,
    lineHeight: 20,
  },
  backLink: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  backLinkText: {
    color: loginTheme.masteryGreen,
    fontSize: 14,
    fontWeight: '600',
  },
  securityFooter: {
    marginTop: 4,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 11,
    lineHeight: 16,
  },
});
