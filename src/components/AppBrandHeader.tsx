import { Image, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import LanguagePicker from '@/pages/login/LanguagePicker';
import { loginTheme } from '@/pages/login/loginTheme';

const logoSource = require('@/assets/images/logo.png');

export default function AppBrandHeader() {
  const { t } = useLanguage();

  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
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
      <LanguagePicker variant="ghost" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  brandRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoShell: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 44,
    height: 44,
  },
  brandCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  brandName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  brandTagline: {
    color: loginTheme.brandTagline,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
});
