import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { Platform, Pressable, Text } from 'react-native';

import { Brand } from '@/constants/colors';
import { useSession } from '@/context/auth';

export default function AppLayout() {
  const { user, signOut } = useSession();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Brand.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '800' },
        headerTitleAlign: 'center',
        tabBarActiveTintColor: Brand.primary,
        tabBarInactiveTintColor: Brand.textMuted,
        tabBarStyle: {
          backgroundColor: Brand.card,
          borderTopColor: Brand.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
        headerRight: () => (
          <Pressable
            onPress={() => void signOut()}
            style={{ paddingHorizontal: 14 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>خروج</Text>
          </Pressable>
        ),
        headerLeft: () =>
          user ? (
            <Text
              style={{
                color: 'rgba(255,255,255,0.9)',
                fontWeight: '600',
                paddingHorizontal: 14,
              }}>
              {user.username}
            </Text>
          ) : null,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'مصروف جديد',
          tabBarLabel: 'إرسال',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'سجل المصروفات',
          tabBarLabel: 'السجل',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
