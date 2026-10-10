import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_VERSION = 'v1';

function storageKey(userId: string): string {
  return `onboarding.${STORAGE_VERSION}.completed.${userId}`;
}

export async function isOnboardingDismissed(userId: string): Promise<boolean> {
  const value = await AsyncStorage.getItem(storageKey(userId));
  return value === '1';
}

export async function markOnboardingDismissed(userId: string): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), '1');
}
