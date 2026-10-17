import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_VERSION = 'v1';

function storageKey(userId: string): string {
  return `personalIntro.${STORAGE_VERSION}.completed.${userId}`;
}

export async function isPersonalIntroDismissed(userId: string): Promise<boolean> {
  const value = await AsyncStorage.getItem(storageKey(userId));
  return value === '1';
}

export async function markPersonalIntroDismissed(userId: string): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), '1');
}
