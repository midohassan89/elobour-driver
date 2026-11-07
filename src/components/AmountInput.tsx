import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand } from '@/constants/colors';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
};

/** Standalone amount field — focus state lives here so parent re-renders never remount it. */
export function AmountInput({ value, onChangeText, editable = true }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, focused && styles.wrapFocused]}>
      <Text style={styles.currency}>ج.م</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={Brand.textMuted}
        style={styles.input}
        textAlign="right"
        editable={editable}
        blurOnSubmit={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: Brand.card,
    borderColor: Brand.border,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row-reverse',
    paddingHorizontal: 14,
  },
  wrapFocused: {
    borderColor: Brand.accent,
  },
  currency: {
    color: Brand.primary,
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 8,
  },
  input: {
    color: Brand.text,
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    paddingVertical: 14,
  },
});
