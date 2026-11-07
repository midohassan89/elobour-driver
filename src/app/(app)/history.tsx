import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBadge } from '@/components/StatusBadge';
import { Brand } from '@/constants/colors';
import { useSession } from '@/context/auth';
import { ApiError, fetchExpenses, mediaUrl } from '@/lib/api';
import { CATEGORY_CONFIGS, type DriverExpense } from '@/lib/types';

function categoryLabel(key: string) {
  return CATEGORY_CONFIGS.find((c) => c.key === key)?.labelAr ?? key;
}

function formatMoney(amount: number) {
  return `${amount.toLocaleString('ar-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} ج.م`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function HistoryScreen() {
  const { token, signOut } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<DriverExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!token) return;
      if (mode === 'initial') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);
      setError(null);
      try {
        const data = await fetchExpenses(token);
        setItems(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          await signOut();
          return;
        }
        setError(err instanceof Error ? err.message : 'فشل التحميل');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, signOut],
  );

  useFocusEffect(
    useCallback(() => {
      void load('initial');
    }, [load]),
  );

  function resubmit(category: string) {
    router.push({
      pathname: '/',
      params: { category },
    });
  }

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load('refresh')}
              tintColor={Brand.primary}
            />
          }>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable style={styles.retry} onPress={() => void load('initial')}>
                <Text style={styles.retryText}>إعادة المحاولة</Text>
              </Pressable>
            </View>
          ) : null}

          {!error && items.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>لا توجد مصروفات بعد</Text>
              <Text style={styles.emptyText}>
                بعد إرسال أول مصروف سيظهر هنا مع حالته.
              </Text>
            </View>
          ) : null}

          {items.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.row}>
                <StatusBadge status={item.status} />
                <Text style={styles.category}>
                  {categoryLabel(item.category)}
                </Text>
              </View>

              <Text style={styles.amount}>{formatMoney(item.amount)}</Text>
              {item.approvedAmount != null &&
                item.status !== 'PENDING' &&
                item.status !== 'REJECTED' && (
                  <Text style={styles.approved}>
                    المعتمد: {formatMoney(item.approvedAmount)}
                  </Text>
                )}

              <Text style={styles.date}>{formatDate(item.createdAt)}</Text>

              {item.status === 'REJECTED' && item.adminNotes ? (
                <View style={styles.noteBox}>
                  <Text style={styles.noteLabel}>ملاحظة الإدارة</Text>
                  <Text style={styles.noteText}>{item.adminNotes}</Text>
                  <Pressable
                    style={styles.resubmit}
                    onPress={() => resubmit(item.category)}>
                    <Text style={styles.resubmitText}>تصحيح وإعادة الإرسال</Text>
                  </Pressable>
                </View>
              ) : null}

              {item.status === 'REJECTED' && !item.adminNotes ? (
                <Pressable
                  style={[styles.resubmit, { marginTop: 12 }]}
                  onPress={() => resubmit(item.category)}>
                  <Text style={styles.resubmitText}>إعادة الإرسال</Text>
                </Pressable>
              ) : null}

              <PhotoThumbs item={item} />
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function PhotoThumbs({ item }: { item: DriverExpense }) {
  const thumbs = [
    { label: 'عداد', uri: mediaUrl(item.odometerImage) },
    { label: 'مضخة', uri: mediaUrl(item.pumpImage) },
    { label: 'كارتة', uri: mediaUrl(item.tollImage) },
    { label: 'فاتورة', uri: mediaUrl(item.receiptImage) },
  ].filter((t) => t.uri);

  if (thumbs.length === 0) return null;

  return (
    <View style={styles.thumbs}>
      {thumbs.map((t) => (
        <View key={t.label} style={styles.thumbChip}>
          <Text style={styles.thumbText}>{t.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: Brand.surface,
    flex: 1,
  },
  content: {
    gap: 12,
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    backgroundColor: Brand.card,
    borderRadius: 16,
    marginTop: 40,
    padding: 24,
  },
  emptyTitle: {
    color: Brand.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: Brand.textMuted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: Brand.dangerBg,
    borderRadius: 14,
    gap: 10,
    padding: 14,
  },
  errorText: {
    color: Brand.danger,
    fontWeight: '600',
    textAlign: 'right',
  },
  retry: {
    alignSelf: 'flex-start',
    backgroundColor: Brand.danger,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  },
  card: {
    backgroundColor: Brand.card,
    borderColor: Brand.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  category: {
    color: Brand.text,
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 10,
    textAlign: 'right',
  },
  amount: {
    color: Brand.primary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
    textAlign: 'right',
  },
  approved: {
    color: Brand.success,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'right',
  },
  date: {
    color: Brand.textMuted,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
  noteBox: {
    backgroundColor: Brand.dangerBg,
    borderRadius: 12,
    marginTop: 12,
    padding: 12,
  },
  noteLabel: {
    color: Brand.danger,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
  },
  noteText: {
    color: Brand.text,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },
  resubmit: {
    alignSelf: 'flex-start',
    backgroundColor: Brand.primary,
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resubmitText: {
    color: '#fff',
    fontWeight: '700',
  },
  thumbs: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  thumbChip: {
    backgroundColor: Brand.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  thumbText: {
    color: Brand.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});
