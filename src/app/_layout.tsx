import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { I18nManager } from 'react-native';

import { Brand } from '@/constants/colors';
import { SessionProvider, useSession } from '@/context/auth';

SplashScreen.preventAutoHideAsync();

// Prefer RTL layout for Arabic UI (no forced reload here).
if (!I18nManager.isRTL) {
  try {
    I18nManager.allowRTL(true);
  } catch {
    // ignore
  }
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SessionProvider>
  );
}

function RootNavigator() {
  const { token, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Brand.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: Brand.surface },
      }}>
      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!token}>
        <Stack.Screen
          name="login"
          options={{ headerShown: false, title: 'تسجيل الدخول' }}
        />
      </Stack.Protected>
    </Stack>
  );
}
