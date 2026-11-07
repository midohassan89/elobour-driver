import { StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/colors';

const STATUS_META: Record<
  string,
  { label: string; color: string; background: string }
> = {
  PENDING: {
    label: 'قيد المراجعة',
    color: Brand.pending,
    background: Brand.pendingBg,
  },
  APPROVED: {
    label: 'مقبول',
    color: Brand.success,
    background: Brand.successBg,
  },
  PARTIAL: {
    label: 'مقبول جزئياً',
    color: Brand.partial,
    background: Brand.partialBg,
  },
  REJECTED: {
    label: 'مرفوض',
    color: Brand.danger,
    background: Brand.dangerBg,
  },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? {
    label: status,
    color: Brand.textMuted,
    background: Brand.surface,
  };

  return (
    <View style={[styles.badge, { backgroundColor: meta.background }]}>
      <Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
});
