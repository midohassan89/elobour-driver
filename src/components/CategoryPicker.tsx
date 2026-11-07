import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand } from '@/constants/colors';
import { CATEGORY_CONFIGS, type ExpenseCategory } from '@/lib/types';

type Props = {
  value: ExpenseCategory | null;
  onChange: (value: ExpenseCategory) => void;
};

const CATEGORY_ICONS: Record<
  ExpenseCategory,
  keyof typeof Ionicons.glyphMap
> = {
  FUEL: 'flame',
  TOLL: 'trail-sign',
  OIL: 'water',
  MAINTENANCE: 'construct',
};

const CATEGORY_TINTS: Record<ExpenseCategory, string> = {
  FUEL: '#E65100',
  TOLL: '#1565C0',
  OIL: '#6A1B9A',
  MAINTENANCE: '#2E7D32',
};

export function CategoryPicker({ value, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {CATEGORY_CONFIGS.map((cat) => {
        const selected = value === cat.key;
        const tint = CATEGORY_TINTS[cat.key];
        return (
          <Pressable
            key={cat.key}
            onPress={() => onChange(cat.key)}
            style={[styles.card, selected && styles.cardSelected]}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: selected
                    ? 'rgba(255,255,255,0.18)'
                    : `${tint}18`,
                },
              ]}>
              <Ionicons
                name={CATEGORY_ICONS[cat.key]}
                size={26}
                color={selected ? '#fff' : tint}
              />
            </View>
            <Text style={[styles.title, selected && styles.titleSelected]}>
              {cat.labelAr}
            </Text>
            <Text style={[styles.desc, selected && styles.descSelected]}>
              {cat.description}
            </Text>
            {selected ? (
              <View style={styles.check}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: Brand.card,
    borderColor: Brand.border,
    borderRadius: 18,
    borderWidth: 1.5,
    elevation: 2,
    paddingHorizontal: 14,
    paddingVertical: 16,
    shadowColor: '#0B3D2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: '48%',
  },
  cardSelected: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
    elevation: 5,
    shadowOpacity: 0.2,
  },
  iconWrap: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    marginBottom: 12,
    width: 48,
  },
  title: {
    color: Brand.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
  titleSelected: {
    color: '#fff',
  },
  desc: {
    color: Brand.textMuted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
    textAlign: 'right',
  },
  descSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  check: {
    left: 10,
    position: 'absolute',
    top: 10,
  },
});
