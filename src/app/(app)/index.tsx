import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ExpenseForm } from '@/components/ExpenseForm';
import { Brand } from '@/constants/colors';
import { useSession } from '@/context/auth';
import type { ExpenseCategory } from '@/lib/types';

const VALID: ExpenseCategory[] = ['FUEL', 'TOLL', 'OIL', 'MAINTENANCE'];

export default function SubmitExpenseScreen() {
  const { token } = useSession();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const initial =
    typeof params.category === 'string' &&
    VALID.includes(params.category as ExpenseCategory)
      ? (params.category as ExpenseCategory)
      : null;

  const onSubmitted = useCallback(() => {
    router.push('/history');
  }, [router]);

  if (!token) return null;

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}>
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <Ionicons name="receipt-outline" size={22} color="#fff" />
            </View>
            <View style={styles.bannerTextWrap}>
              <Text style={styles.bannerTitle}>تسجيل مصروف جديد</Text>
              <Text style={styles.bannerText}>
                اختر النوع، أدخل المبلغ، ثم أضف الصور من الكاميرا أو المعرض.
              </Text>
            </View>
          </View>
          <ExpenseForm
            token={token}
            initialCategory={initial}
            onSubmitted={onSubmitted}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: Brand.surface,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    alignItems: 'center',
    backgroundColor: Brand.primary,
    borderRadius: 18,
    elevation: 3,
    flexDirection: 'row-reverse',
    gap: 12,
    marginBottom: 18,
    padding: 16,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  bannerIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
  },
  bannerText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'right',
  },
});
