import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { ApiError, loginDriver } from '@/lib/api';
import {
  clearCredentials,
  loadCredentials,
  saveCredentials,
} from '@/lib/credentials';
import { getSecureItem, setSecureItem } from '@/lib/storage';
import type { DriverUser } from '@/lib/types';

const TOKEN_KEY = 'driver_auth_token';
const USER_KEY = 'driver_auth_user';

type AuthContextValue = {
  token: string | null;
  user: DriverUser | null;
  isLoading: boolean;
  signIn: (
    username: string,
    password: string,
    options?: { remember?: boolean },
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be used within <SessionProvider />');
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DriverUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          getSecureItem(TOKEN_KEY),
          getSecureItem(USER_KEY),
        ]);
        if (!alive) return;

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser) as DriverUser);
            } catch {
              setUser(null);
            }
          }
          return;
        }

        // No active session — try remembered credentials for auto-login
        const creds = await loadCredentials();
        if (!alive || !creds) return;

        try {
          const result = await loginDriver(creds.username, creds.password);
          if (!alive) return;
          await Promise.all([
            setSecureItem(TOKEN_KEY, result.token),
            setSecureItem(USER_KEY, JSON.stringify(result.user)),
          ]);
          setToken(result.token);
          setUser(result.user);
        } catch {
          // Credentials stale — leave user on login; fields will still pre-fill
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback(
    async (
      username: string,
      password: string,
      options?: { remember?: boolean },
    ) => {
      const result = await loginDriver(username.trim(), password);
      await Promise.all([
        setSecureItem(TOKEN_KEY, result.token),
        setSecureItem(USER_KEY, JSON.stringify(result.user)),
      ]);

      if (options?.remember ?? true) {
        await saveCredentials(username, password);
      } else {
        await clearCredentials();
      }

      setToken(result.token);
      setUser(result.user);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await Promise.all([
      setSecureItem(TOKEN_KEY, null),
      setSecureItem(USER_KEY, null),
    ]);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, isLoading, signIn, signOut }),
    [token, user, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) return 'اسم المستخدم أو كلمة المرور غير صحيحة';
    return err.message;
  }
  if (err instanceof Error) {
    if (/network|fetch|failed/i.test(err.message)) {
      return 'تعذر الاتصال بالخادم. تأكد من عنوان الـ API واتصالك بالشبكة.';
    }
    return err.message;
  }
  return 'حدث خطأ غير متوقع';
}
