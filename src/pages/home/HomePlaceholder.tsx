import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '@/api/authClient';
import { useAuth } from '@/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function HomePlaceholder() {
  const { setAccessToken } = useAuth();
  const { t } = useLanguage();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Session may already be invalid; still clear local access token.
    } finally {
      setAccessToken(null);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('home.welcome')}</Text>
        <Text style={styles.subtitle}>{t('home.placeholder')}</Text>
        <Pressable style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>{t('header.logout')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f6',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1b4332',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#4a5568',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1b4332',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
