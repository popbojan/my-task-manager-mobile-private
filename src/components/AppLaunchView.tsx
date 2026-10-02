import { ActivityIndicator, Image, StatusBar, StyleSheet, View } from 'react-native';
import { loginTheme } from '@/pages/login/loginTheme';

const logoSource = require('@/assets/images/logo.png');

/** Matches native launch screen while JS auth bootstrap runs. */
export default function AppLaunchView() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Image
        source={logoSource}
        style={styles.logo}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
        accessibilityLabel="My Task Manager"
      />
      <ActivityIndicator
        style={styles.spinner}
        size="small"
        color={loginTheme.masteryGreen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  logo: {
    width: 120,
    height: 120,
  },
  spinner: {
    position: 'absolute',
    bottom: 48,
    opacity: 0.85,
  },
});
