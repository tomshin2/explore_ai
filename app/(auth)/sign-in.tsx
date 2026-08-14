import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from '../../lib/api';
import { useAppTheme } from '../../lib/theme';
import { AppPressable } from '../../lib/ui';

type Mode = 'signIn' | 'signUp';

export default function SignInScreen() {
  const { colors } = useAppTheme();
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  async function handleAuth() {
    if (loading) return;
    if (!email.trim() || password.length < 6) {
      Alert.alert('Check your input', 'Email required and password must be 6+ characters.');
      return;
    }
    setLoading(true);
    try {
      const result =
        mode === 'signUp'
          ? await api.signUp(email.trim(), password)
          : await api.signIn(email.trim(), password);
      if (result.error) throw result.error;
      if (mode === 'signUp' && !result.session) {
        Alert.alert('Check your email', 'Confirm your email to activate the account, then sign in.');
      }
    } catch (err) {
      Alert.alert('Auth failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>explore_ai</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {mode === 'signUp' ? 'Create an account' : 'Welcome back'}
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType={mode === 'signUp' ? 'emailAddress' : 'username'}
          autoComplete={mode === 'signUp' ? 'email' : 'username'}
          value={email}
          onChangeText={setEmail}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <TextInput
          ref={passwordRef}
          style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
          placeholder="Password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
          autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
          value={password}
          onChangeText={setPassword}
          returnKeyType="go"
          onSubmitEditing={handleAuth}
        />

        <AppPressable
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { color: colors.accentText }]}>
              {mode === 'signUp' ? 'Sign up' : 'Sign in'}
            </Text>
          )}
        </AppPressable>

        <AppPressable onPress={() => setMode(mode === 'signUp' ? 'signIn' : 'signUp')}>
          <Text style={[styles.switchText, { color: colors.accent }]}>
            {mode === 'signUp'
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </Text>
        </AppPressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { borderRadius: 16, padding: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 15, marginBottom: 24 },
  input: { borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 12 },
  button: { borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 8 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  switchText: { textAlign: 'center', marginTop: 16, fontSize: 14, fontWeight: '500' },
});
