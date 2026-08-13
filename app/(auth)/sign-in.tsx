import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../../lib/api';

type Mode = 'signIn' | 'signUp';

export default function SignInScreen() {
  const [mode, setMode] = useState<Mode>('signUp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.title}>explore_ai</Text>
        <Text style={styles.subtitle}>
          {mode === 'signUp' ? 'Create an account' : 'Welcome back'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#5a6485"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#5a6485"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {mode === 'signUp' ? 'Sign up' : 'Sign in'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'signUp' ? 'signIn' : 'signUp')}>
          <Text style={styles.switchText}>
            {mode === 'signUp'
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f1a', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#151b2b', borderRadius: 16, padding: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#8b94ad', fontSize: 15, marginBottom: 24 },
  input: {
    backgroundColor: '#1f2739',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  button: { backgroundColor: '#4f6ef7', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchText: { color: '#8b94ad', textAlign: 'center', marginTop: 16, fontSize: 14 },
});