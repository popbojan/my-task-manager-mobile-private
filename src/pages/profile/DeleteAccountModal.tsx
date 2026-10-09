import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ScrollViewInstance,
  type TextInputInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  DELETE_ACCOUNT_OTP_LENGTH,
  isDeleteAccountOtpComplete,
  normalizeDeleteAccountOtp,
} from '@/pages/profile/deleteAccountOtp';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import { focusTextInputSoon } from '@/utils/focusTextInputSoon';

export type DeleteAccountModalStep = 'info' | 'verify';

type DeleteAccountModalProps = {
  visible: boolean;
  step: DeleteAccountModalStep;
  isPending: boolean;
  errorMessage: string | null;
  accountEmail: string | null;
  otp: string;
  otpSent: boolean;
  isSendingOtp: boolean;
  onOtpChange: (value: string) => void;
  onRequestOtp: () => void;
  onClose: () => void;
  onContinueToVerify: () => void;
  onBackToInfo: () => void;
  onConfirm: () => void;
};

function DeleteAccountDialog({
  step,
  isPending,
  errorMessage,
  accountEmail,
  otp,
  otpSent,
  isSendingOtp,
  onOtpChange,
  onRequestOtp,
  onClose,
  onContinueToVerify,
  onBackToInfo,
  onConfirm,
  otpInputRef,
}: Omit<DeleteAccountModalProps, 'visible'> & {
  otpInputRef: RefObject<TextInputInstance | null>;
}) {
  const { t } = useLanguage();
  const isVerifyStep = step === 'verify';
  const canSendOtp = !!accountEmail && !isSendingOtp && !isPending;
  const canConfirm =
    !!accountEmail && isDeleteAccountOtpComplete(otp) && !isPending;

  const body = isVerifyStep ? (
    <View style={styles.verifyBody}>
      <Text style={styles.verifyLead}>{t('profile.deleteAccount.reauthRequired')}</Text>
      <View style={styles.sendBlock}>
        {accountEmail ? (
          <Text style={styles.verifyEmail} numberOfLines={2}>
            {accountEmail}
          </Text>
        ) : null}
        <Pressable
          style={[
            styles.secondaryButton,
            styles.sendCodeButton,
            !canSendOtp && styles.buttonDisabled,
          ]}
          onPress={onRequestOtp}
          disabled={!canSendOtp}
        >
          {isSendingOtp ? (
            <ActivityIndicator color={recurringTheme.accentBright} />
          ) : (
            <Text style={styles.secondaryButtonText}>
              {t('profile.deleteAccount.reauthSendCode')}
            </Text>
          )}
        </Pressable>
      </View>
      {otpSent && accountEmail ? (
        <Text style={styles.verifyCodeSent}>
          {t('profile.deleteAccount.reauthCodeSent', { email: accountEmail })}
        </Text>
      ) : null}
      <Text style={styles.fieldLabel}>{t('login.otp')}</Text>
      <TextInput
        ref={otpInputRef}
        style={styles.input}
        value={otp}
        onChangeText={value => onOtpChange(normalizeDeleteAccountOtp(value))}
        placeholder={t('login.otpPlaceholder')}
        placeholderTextColor={recurringTheme.textMuted}
        keyboardType="number-pad"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        textContentType="oneTimeCode"
        maxLength={DELETE_ACCOUNT_OTP_LENGTH}
        editable={!isPending}
      />
      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}
    </View>
  ) : (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.copy}>
        <Text style={styles.message}>{t('profile.deleteAccount.confirmQuestion')}</Text>
        <Text style={styles.message}>{t('profile.deleteAccount.newAccountNote')}</Text>
        <Text style={styles.message}>{t('profile.deleteAccount.dataLoss')}</Text>
        <Text style={styles.message}>{t('profile.deleteAccount.personalData')}</Text>
        <Text style={styles.message}>
          {t('profile.deleteAccount.subscriptionHintPrefix')}
          <Text style={styles.messageBold}>
            {t('profile.deleteAccount.subscriptionHintBold')}
          </Text>
          {t('profile.deleteAccount.subscriptionHintSuffix')}
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.dialog, isVerifyStep && styles.dialogVerify]}>
      <View style={[styles.header, isVerifyStep && styles.headerVerify]}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>{t('profile.accountMenu.title')}</Text>
          <Text style={[styles.title, isVerifyStep && styles.titleVerify]}>
            {t('profile.deleteAccount.title')}
          </Text>
        </View>
        <Pressable
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
          disabled={isPending}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </Pressable>
      </View>

      {body}

      {isVerifyStep ? (
        <View style={styles.actionsVerify}>
          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.secondaryButton, isPending && styles.buttonDisabled]}
              onPress={onBackToInfo}
              disabled={isPending}
            >
              <Text style={styles.secondaryButtonText}>
                {t('profile.deleteAccount.backToInfo')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.secondaryButton, isPending && styles.buttonDisabled]}
              onPress={onClose}
              disabled={isPending}
            >
              <Text style={styles.secondaryButtonText}>{t('common.cancel')}</Text>
            </Pressable>
          </View>
          <View style={styles.actionsRowConfirm}>
            <Pressable
              style={[styles.dangerButton, !canConfirm && styles.buttonDisabled]}
              onPress={onConfirm}
              disabled={!canConfirm}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.dangerButtonText}>
                  {t('profile.deleteAccount.reauthConfirmButton')}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable
            style={[styles.secondaryButton, isPending && styles.buttonDisabled]}
            onPress={onClose}
            disabled={isPending}
          >
            <Text style={styles.secondaryButtonText}>{t('common.cancel')}</Text>
          </Pressable>
          <Pressable
            style={[styles.dangerButton, isPending && styles.buttonDisabled]}
            onPress={onContinueToVerify}
            disabled={isPending}
          >
            <Text style={styles.dangerButtonText}>
              {t('profile.deleteAccount.continueToVerify')}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default function DeleteAccountModal(props: DeleteAccountModalProps) {
  const { visible, step, otpSent } = props;
  const insets = useSafeAreaInsets();
  const isVerifyStep = step === 'verify';
  const otpInputRef = useRef<TextInputInstance>(null);
  const verifyScrollRef = useRef<ScrollViewInstance>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!visible || !isVerifyStep) {
      return;
    }

    focusTextInputSoon(otpInputRef);
    const frame = requestAnimationFrame(() => {
      verifyScrollRef.current?.scrollToEnd({ animated: false });
      focusTextInputSoon(otpInputRef);
    });

    return () => cancelAnimationFrame(frame);
  }, [visible, isVerifyStep, otpSent]);

  useEffect(() => {
    if (!visible || !isVerifyStep) {
      setKeyboardHeight(0);
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates.height);
      verifyScrollRef.current?.scrollToEnd({ animated: true });
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible, isVerifyStep]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={props.onClose}
    >
      {isVerifyStep ? (
        <KeyboardAvoidingView
          style={styles.backdropTop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          enabled={Platform.OS === 'ios'}
          keyboardVerticalOffset={insets.top}
        >
          <ScrollView
            ref={verifyScrollRef}
            style={styles.verifyScroll}
            contentContainerStyle={[
              styles.verifyScrollContent,
              {
                paddingTop: insets.top + 6,
                paddingBottom:
                  16 +
                  Math.max(insets.bottom, 8) +
                  Math.max(0, keyboardHeight - insets.bottom),
              },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            <DeleteAccountDialog {...props} otpInputRef={otpInputRef} />
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.backdropCenter}>
          <DeleteAccountDialog {...props} otpInputRef={otpInputRef} />
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdropCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  backdropTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  verifyScroll: {
    flex: 1,
  },
  verifyScrollContent: {
    flexGrow: 0,
    paddingHorizontal: 20,
    alignItems: 'stretch',
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '88%',
    backgroundColor: recurringTheme.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    overflow: 'hidden',
  },
  dialogVerify: {
    maxHeight: undefined,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: recurringTheme.cardBorder,
  },
  headerVerify: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 7,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  eyebrow: {
    color: recurringTheme.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    color: recurringTheme.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  titleVerify: {
    fontSize: 17,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: recurringTheme.textMuted,
    fontSize: 28,
    lineHeight: 28,
    fontWeight: '300',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 10,
  },
  verifyBody: {
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 7,
    gap: 7,
  },
  verifyLead: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  verifyCodeSent: {
    color: recurringTheme.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  sendBlock: {
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
    marginBottom: 4,
  },
  verifyEmail: {
    width: '100%',
    color: recurringTheme.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
  },
  sendCodeButton: {
    alignSelf: 'stretch',
  },
  copy: {
    gap: 10,
  },
  message: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  messageBold: {
    color: recurringTheme.textPrimary,
    fontWeight: '800',
  },
  fieldLabel: {
    color: recurringTheme.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: recurringTheme.textPrimary,
    fontSize: 17,
    letterSpacing: 0.5,
    backgroundColor: recurringTheme.surfaceInset,
  },
  error: {
    color: '#f87171',
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: recurringTheme.cardBorder,
  },
  actionsVerify: {
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: recurringTheme.cardBorder,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  actionsRowConfirm: {
    alignItems: 'center',
  },
  secondaryButton: {
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceCard,
  },
  secondaryButtonText: {
    color: recurringTheme.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  dangerButton: {
    minHeight: 40,
    borderRadius: 10,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.fireRed,
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
