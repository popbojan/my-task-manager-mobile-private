import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { APP_LANGUAGES, useLanguage } from '@/i18n/LanguageProvider';
import type { AppLanguage } from '@/i18n/types';
import { loginTheme } from '@/pages/login/loginTheme';

type LanguagePickerProps = {
  variant?: 'solid' | 'ghost';
};

export default function LanguagePicker({ variant = 'solid' }: LanguagePickerProps) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);

  const current = APP_LANGUAGES.find(item => item.code === language);

  return (
    <>
      <Pressable
        style={[styles.trigger, variant === 'ghost' && styles.triggerGhost]}
        accessibilityLabel={t('language.switch')}
        onPress={() => setOpen(true)}
      >
        <Text
          style={[
            styles.triggerText,
            variant === 'ghost' && styles.triggerTextGhost,
          ]}
        >
          {current?.flag} {language.toUpperCase()} ▾
        </Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            {APP_LANGUAGES.map(item => (
              <Pressable
                key={item.code}
                style={[
                  styles.option,
                  item.code === language && styles.optionActive,
                ]}
                onPress={() => {
                  setLanguage(item.code as AppLanguage);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>
                  {item.flag} {t(item.labelKey)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  triggerGhost: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  triggerText: {
    color: loginTheme.text,
    fontSize: 13,
    fontWeight: '700',
  },
  triggerTextGhost: {
    fontSize: 12,
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 16,
  },
  menu: {
    minWidth: 180,
    borderRadius: 14,
    backgroundColor: 'rgba(12, 12, 12, 0.96)',
    borderWidth: 1,
    borderColor: loginTheme.glassBorder,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionActive: {
    backgroundColor: 'rgba(73, 201, 145, 0.12)',
  },
  optionText: {
    color: loginTheme.text,
    fontSize: 15,
  },
});
