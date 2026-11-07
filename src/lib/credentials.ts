import { getSecureItem, setSecureItem } from '@/lib/storage';

const CREDS_USER_KEY = 'driver_remember_username';
const CREDS_PASS_KEY = 'driver_remember_password';
const CREDS_FLAG_KEY = 'driver_remember_enabled';

export type SavedCredentials = {
  username: string;
  password: string;
};

export async function saveCredentials(
  username: string,
  password: string,
): Promise<void> {
  await Promise.all([
    setSecureItem(CREDS_USER_KEY, username.trim()),
    setSecureItem(CREDS_PASS_KEY, password),
    setSecureItem(CREDS_FLAG_KEY, '1'),
  ]);
}

export async function clearCredentials(): Promise<void> {
  await Promise.all([
    setSecureItem(CREDS_USER_KEY, null),
    setSecureItem(CREDS_PASS_KEY, null),
    setSecureItem(CREDS_FLAG_KEY, null),
  ]);
}

export async function loadCredentials(): Promise<SavedCredentials | null> {
  const [enabled, username, password] = await Promise.all([
    getSecureItem(CREDS_FLAG_KEY),
    getSecureItem(CREDS_USER_KEY),
    getSecureItem(CREDS_PASS_KEY),
  ]);
  if (enabled !== '1' || !username || !password) return null;
  return { username, password };
}
