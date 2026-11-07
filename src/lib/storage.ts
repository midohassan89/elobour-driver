import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Persist auth secrets: SecureStore on native, AsyncStorage on web /
 * when SecureStore is unavailable.
 */
async function useSecure(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function setSecureItem(
  key: string,
  value: string | null,
): Promise<void> {
  const secure = await useSecure();
  if (secure) {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
    return;
  }

  if (value == null) {
    await AsyncStorage.removeItem(key);
  } else {
    await AsyncStorage.setItem(key, value);
  }
}

export async function getSecureItem(key: string): Promise<string | null> {
  const secure = await useSecure();
  if (secure) {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}
