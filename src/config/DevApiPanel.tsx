import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';
import { useApiEnvironment } from '@/config/ApiEnvironmentProvider';
import type { ApiEnvironment } from '@/config/api';
import { useLanguage } from '@/i18n/LanguageProvider';
import { loginTheme } from '@/pages/login/loginTheme';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type DevApiPanelProps = {
  tone?: 'login' | 'profile';
  onEnvironmentSwitch?: (nextEnvironment: ApiEnvironment) => void | Promise<void>;
};

export default function DevApiPanel({
  tone = 'profile',
  onEnvironmentSwitch,
}: DevApiPanelProps) {
  const { t } = useLanguage();
  const {
    environment,
    apiBaseUrl,
    devMachineHost,
    setEnvironment,
    setDevMachineHost,
  } = useApiEnvironment();
  const [hostDraft, setHostDraft] = useState(devMachineHost);
  const [hostError, setHostError] = useState<string | null>(null);
  const isLoginTone = tone === 'login';
  const theme = isLoginTone ? loginDevTheme : profileDevTheme;

  useEffect(() => {
    setHostDraft(devMachineHost);
  }, [devMachineHost]);

  async function handleSwitchEnvironment() {
    const nextEnvironment: ApiEnvironment =
      environment === 'local' ? 'production' : 'local';
    await setEnvironment(nextEnvironment);
    await onEnvironmentSwitch?.(nextEnvironment);
  }

  async function handleSaveDevHost() {
    try {
      await setDevMachineHost(hostDraft);
      setHostError(null);
      await onEnvironmentSwitch?.(environment);
    } catch {
      setHostError(t('dev.api.invalidHost'));
    }
  }

  return (
    <View style={[styles.panel, theme.panel]}>
      <Text style={[styles.title, theme.title]}>{t('dev.api.title')}</Text>
      <Text style={[styles.url, theme.url]}>{apiBaseUrl}</Text>
      <Text style={[styles.hint, theme.hint]}>
        {environment === 'local'
          ? t('dev.api.hintLocal')
          : t('dev.api.hintProduction')}
      </Text>

      {environment === 'local' ? (
        <View style={styles.hostSection}>
          <Text style={[styles.hostLabel, theme.hint]}>{t('dev.api.devHostLabel')}</Text>
          <TextInput
            style={[styles.hostInput, theme.hostInput]}
            value={hostDraft}
            onChangeText={setHostDraft}
            placeholder={t('dev.api.devHostPlaceholder')}
            placeholderTextColor={theme.placeholder.color}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
          />
          <Pressable style={[styles.hostSaveButton, theme.switchButton]} onPress={handleSaveDevHost}>
            <Text style={[styles.hostSaveText, theme.switchText]}>
              {t('dev.api.saveDevHost')}
            </Text>
          </Pressable>
          {hostError ? (
            <Text style={[styles.hostError, theme.hostError]}>{hostError}</Text>
          ) : null}
        </View>
      ) : null}

      <Pressable
        style={[styles.switchButton, theme.switchButton]}
        onPress={handleSwitchEnvironment}
      >
        <Text style={[styles.switchText, theme.switchText]}>
          {environment === 'local'
            ? t('dev.api.switchToProduction')
            : t('dev.api.switchToLocal')}
        </Text>
      </Pressable>
    </View>
  );
}

const loginDevTheme = {
  panel: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  } satisfies ViewStyle,
  title: { color: 'rgba(255, 255, 255, 0.88)' },
  url: { color: 'rgba(255, 255, 255, 0.55)' },
  hint: { color: 'rgba(255, 255, 255, 0.45)' },
  hostInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
  },
  switchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  switchText: { color: loginTheme.masteryGreen },
  placeholder: { color: 'rgba(255, 255, 255, 0.35)' },
  hostError: { color: loginTheme.error },
};

const profileDevTheme = {
  panel: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: recurringTheme.surfaceCard,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  } satisfies ViewStyle,
  title: { color: recurringTheme.textPrimary },
  url: { color: recurringTheme.accentBright },
  hint: { color: recurringTheme.textMuted },
  hostInput: {
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
    backgroundColor: recurringTheme.surfaceInset,
    color: recurringTheme.textPrimary,
  },
  switchButton: {
    backgroundColor: 'rgba(212, 168, 67, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 67, 0.35)',
  },
  switchText: { color: recurringTheme.goldBright },
  placeholder: { color: recurringTheme.textMuted },
  hostError: { color: recurringTheme.fireRedBright },
};

const styles = StyleSheet.create({
  panel: {},
  title: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },
  url: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  hint: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
  },
  hostSection: {
    marginBottom: 8,
    gap: 6,
  },
  hostLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  hostInput: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
  },
  hostSaveButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  hostSaveText: {
    fontSize: 12,
    fontWeight: '700',
  },
  hostError: {
    fontSize: 11,
    lineHeight: 16,
  },
  switchButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  switchText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
