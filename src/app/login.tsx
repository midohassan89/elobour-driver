import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/constants/colors';
import { getAuthErrorMessage, useSession } from '@/context/auth';
import { loadCredentials } from '@/lib/credentials';

type LoginFieldProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  passwordVisible?: boolean;
  onTogglePassword?: () => void;
} & Pick<
  TextInputProps,
  | 'placeholder'
  | 'autoCapitalize'
  | 'autoCorrect'
  | 'textContentType'
  | 'onSubmitEditing'
  | 'returnKeyType'
  | 'blurOnSubmit'
>;

/** Defined outside LoginScreen so focus/state updates never remount the input tree. */
function LoginField({
  label,
  icon,
  value,
  onChangeText,
  editable = true,
  secureTextEntry,
  showPasswordToggle,
  passwordVisible,
  onTogglePassword,
  placeholder,
  autoCapitalize,
  autoCorrect,
  textContentType,
  onSubmitEditing,
  returnKeyType,
  blurOnSubmit,
}: LoginFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
        <Ionicons
          name={icon}
          size={20}
          color={focused ? Brand.primary : Brand.textMuted}
          style={styles.leadingIcon}
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          textContentType={textContentType}
          placeholder={placeholder}
          placeholderTextColor={Brand.textMuted}
          style={styles.input}
          editable={editable}
          secureTextEntry={secureTextEntry}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {showPasswordToggle ? (
          <Pressable
            onPress={onTogglePassword}
            hitSlop={10}
            style={styles.eyeBtn}
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'
            }>
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={Brand.primary}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const { signIn } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const creds = await loadCredentials();
      if (!alive || !creds) return;
      setUsername(creds.username);
      setPassword(creds.password);
      setRememberMe(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const onSubmit = useCallback(async () => {
    setError(null);
    if (!username.trim() || !password) {
      setError('أدخل اسم المستخدم وكلمة المرور');
      return;
    }
    setLoading(true);
    try {
      await signIn(username, password, { remember: rememberMe });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [username, password, rememberMe, signIn]);

  const togglePassword = useCallback(() => {
    setShowPassword((v) => !v);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.bgAccent} pointerEvents="none" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.hero}>
            <View style={styles.logoMark}>
              <Ionicons name="car-sport" size={34} color="#fff" />
            </View>
            <Text style={styles.brand}>العُبور</Text>
            <Text style={styles.subtitle}>
              تطبيق السائقين — مصروفات الأسطول
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>تسجيل الدخول</Text>
            <Text style={styles.hint}>أدخل بيانات حساب السائق للمتابعة</Text>

            <LoginField
              label="اسم المستخدم"
              icon="person-outline"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              placeholder="اسم المستخدم"
              editable={!loading}
              returnKeyType="next"
              blurOnSubmit={false}
            />

            <LoginField
              label="كلمة المرور"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              showPasswordToggle
              passwordVisible={showPassword}
              onTogglePassword={togglePassword}
              textContentType="password"
              placeholder="كلمة المرور"
              editable={!loading}
              returnKeyType="done"
              blurOnSubmit={false}
              onSubmitEditing={onSubmit}
            />

            <Pressable
              style={styles.rememberRow}
              onPress={() => setRememberMe((v) => !v)}
              disabled={loading}>
              <Text style={styles.rememberText}>
                تذكرني وتسجيل الدخول تلقائياً
              </Text>
              <View style={[styles.checkbox, rememberMe && styles.checkboxOn]}>
                {rememberMe ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : null}
              </View>
            </Pressable>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={Brand.danger} />
                <Text style={styles.error}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              disabled={loading}
              onPress={onSubmit}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>دخول</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: Brand.primary,
    flex: 1,
  },
  bgAccent: {
    backgroundColor: Brand.accent,
    height: 180,
    left: 0,
    opacity: 0.18,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoMark: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 22,
    borderWidth: 1,
    height: 72,
    justifyContent: 'center',
    marginBottom: 14,
    width: 72,
  },
  brand: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Brand.card,
    borderRadius: 24,
    elevation: 10,
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: '#041910',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
  },
  title: {
    color: Brand.primary,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'right',
  },
  hint: {
    color: Brand.textMuted,
    fontSize: 13,
    marginBottom: 14,
    marginTop: 6,
    textAlign: 'right',
  },
  label: {
    color: Brand.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
    textAlign: 'right',
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: Brand.surface,
    borderColor: Brand.border,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row-reverse',
    minHeight: 52,
    paddingHorizontal: 12,
  },
  inputWrapFocused: {
    backgroundColor: '#fff',
    borderColor: Brand.accent,
  },
  leadingIcon: {
    marginLeft: 8,
  },
  input: {
    color: Brand.text,
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    textAlign: 'right',
  },
  eyeBtn: {
    marginRight: 4,
    padding: 4,
  },
  rememberRow: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    gap: 10,
    marginTop: 16,
  },
  rememberText: {
    color: Brand.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  checkbox: {
    alignItems: 'center',
    borderColor: Brand.border,
    borderRadius: 7,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxOn: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: Brand.dangerBg,
    borderRadius: 12,
    flexDirection: 'row-reverse',
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  error: {
    color: Brand.danger,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  button: {
    alignItems: 'center',
    backgroundColor: Brand.primary,
    borderRadius: 14,
    elevation: 3,
    marginTop: 20,
    paddingVertical: 15,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
});
