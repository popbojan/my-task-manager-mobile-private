import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCOUNT_DELETED_NOTICE_KEY = 'tm.accountDeletedNotice';

export async function markAccountDeletedNotice(): Promise<void> {
  try {
    await AsyncStorage.setItem(ACCOUNT_DELETED_NOTICE_KEY, '1');
  } catch {
    // Storage blocked or unavailable.
  }
}

export async function hasAccountDeletedNotice(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ACCOUNT_DELETED_NOTICE_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function clearAccountDeletedNotice(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ACCOUNT_DELETED_NOTICE_KEY);
  } catch {
    // ignore
  }
}
