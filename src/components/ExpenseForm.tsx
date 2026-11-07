import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AmountInput } from '@/components/AmountInput';
import { CategoryPicker } from '@/components/CategoryPicker';
import { PhotoCapture } from '@/components/PhotoCapture';
import { Brand } from '@/constants/colors';
import { submitExpense } from '@/lib/api';
import {
  CATEGORY_CONFIGS,
  PHOTO_LABELS,
  type ExpenseCategory,
  type PhotoSlot,
} from '@/lib/types';

type Props = {
  token: string;
  initialCategory?: ExpenseCategory | null;
  onSubmitted?: () => void;
};

type SectionHeaderProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  style?: object;
};

function SectionHeader({ icon, title, style }: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Ionicons name={icon} size={18} color={Brand.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export function ExpenseForm({
  token,
  initialCategory = null,
  onSubmitted,
}: Props) {
  const [category, setCategory] = useState<ExpenseCategory | null>(
    initialCategory,
  );
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Explicit per-image URI state (string | null only)
  const [odometerImage, setOdometerImage] = useState<string | null>(null);
  const [pumpImage, setPumpImage] = useState<string | null>(null);
  const [tollImage, setTollImage] = useState<string | null>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const clearAllPhotos = useCallback(() => {
    setOdometerImage(null);
    setPumpImage(null);
    setTollImage(null);
    setReceiptImage(null);
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
      clearAllPhotos();
    }
  }, [initialCategory, clearAllPhotos]);

  const config = useMemo(
    () => CATEGORY_CONFIGS.find((c) => c.key === category) ?? null,
    [category],
  );

  const slots = useMemo<PhotoSlot[]>(() => {
    if (!config) return [];
    return [...config.requiredPhotos, ...config.optionalPhotos];
  }, [config]);

  const photoBySlot: Record<PhotoSlot, string | null> = {
    odometerImage,
    pumpImage,
    tollImage,
    receiptImage,
  };

  const onSelectCategory = useCallback(
    (next: ExpenseCategory) => {
      setCategory(next);
      clearAllPhotos();
    },
    [clearAllPhotos],
  );

  const onChangeAmount = useCallback((text: string) => {
    setAmount(text);
  }, []);

  const resetCategory = useCallback(() => {
    setCategory(null);
    setAmount('');
    clearAllPhotos();
  }, [clearAllPhotos]);

  const onSubmit = useCallback(async () => {
    if (!category || !config) {
      Alert.alert('تنبيه', 'اختر نوع المصروف أولاً');
      return;
    }

    const value = Number(amount.replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert('تنبيه', 'أدخل مبلغاً صحيحاً أكبر من صفر');
      return;
    }

    for (const slot of config.requiredPhotos) {
      if (!photoBySlot[slot]) {
        Alert.alert('صورة مطلوبة', `يجب إضافة: ${PHOTO_LABELS[slot]}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await submitExpense({
        token,
        category,
        amount: value,
        photos: {
          odometerImage,
          pumpImage,
          tollImage,
          receiptImage,
        },
      });
      Alert.alert('تم الإرسال', 'تم إرسال المصروف وهو الآن قيد المراجعة');
      setAmount('');
      clearAllPhotos();
      onSubmitted?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'فشل إرسال المصروف';
      Alert.alert('خطأ', message);
    } finally {
      setSubmitting(false);
    }
  }, [
    category,
    config,
    amount,
    token,
    odometerImage,
    pumpImage,
    tollImage,
    receiptImage,
    clearAllPhotos,
    onSubmitted,
  ]);

  return (
    <View style={styles.wrap}>
      <SectionHeader icon="grid-outline" title="نوع المصروف" />
      <CategoryPicker value={category} onChange={onSelectCategory} />

      {category ? (
        <View style={styles.formBody}>
          <SectionHeader
            icon="cash-outline"
            title="المبلغ (ج.م)"
            style={styles.mt}
          />
          <AmountInput
            value={amount}
            onChangeText={onChangeAmount}
            editable={!submitting}
          />

          <SectionHeader
            icon="images-outline"
            title="الصور المطلوبة"
            style={styles.mt}
          />

          <View style={styles.photos}>
            {slots.includes('odometerImage') ? (
              <PhotoCapture
                key="odometerImage"
                label={PHOTO_LABELS.odometerImage}
                required={config!.requiredPhotos.includes('odometerImage')}
                uri={odometerImage}
                onChange={setOdometerImage}
              />
            ) : null}

            {slots.includes('pumpImage') ? (
              <PhotoCapture
                key="pumpImage"
                label={PHOTO_LABELS.pumpImage}
                required={config!.requiredPhotos.includes('pumpImage')}
                uri={pumpImage}
                onChange={setPumpImage}
              />
            ) : null}

            {slots.includes('tollImage') ? (
              <PhotoCapture
                key="tollImage"
                label={PHOTO_LABELS.tollImage}
                required={config!.requiredPhotos.includes('tollImage')}
                uri={tollImage}
                onChange={setTollImage}
              />
            ) : null}

            {slots.includes('receiptImage') ? (
              <PhotoCapture
                key="receiptImage"
                label={PHOTO_LABELS.receiptImage}
                required={config!.requiredPhotos.includes('receiptImage')}
                uri={receiptImage}
                onChange={setReceiptImage}
              />
            ) : null}
          </View>

          <Pressable
            style={[styles.submit, submitting && styles.submitDisabled]}
            disabled={submitting}
            onPress={onSubmit}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>إرسال المصروف</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={styles.changeCategory}
            onPress={resetCategory}
            disabled={submitting}>
            <Text style={styles.changeCategoryText}>تغيير نوع المصروف</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  formBody: {
    gap: 8,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    color: Brand.primary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
  mt: {
    marginTop: 20,
  },
  photos: {
    gap: 14,
  },
  submit: {
    alignItems: 'center',
    backgroundColor: Brand.primary,
    borderRadius: 14,
    elevation: 3,
    flexDirection: 'row-reverse',
    gap: 8,
    justifyContent: 'center',
    marginTop: 22,
    paddingVertical: 16,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  changeCategory: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
  },
  changeCategoryText: {
    color: Brand.textMuted,
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
