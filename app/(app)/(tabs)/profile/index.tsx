import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api, Profile } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth-context';
import { useAppTheme } from '../../../../lib/theme';
import { AppPressable, Avatar } from '../../../../lib/ui';

export default function ProfileScreen() {
  const { session } = useAuth();
  const { colors } = useAppTheme();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    api.getProfile(session.user.id).then((data) => {
      if (data) {
        setUsername(data.username ?? '');
        setFullName(data.full_name ?? '');
      }
      setLoading(false);
    });
  }, [session]);

  async function saveProfile() {
    if (!session) return;
    setSaving(true);
    const error = await api.upsertProfile({
      id: session.user.id,
      username: username.trim() || null,
      full_name: fullName.trim() || null,
    });
    if (error) {
      Alert.alert('Save failed', error.message);
    } else {
      Alert.alert('Saved', 'Profile updated.');
    }
    setSaving(false);
  }

  async function signOut() {
    const error = await api.signOut();
    if (error) Alert.alert('Sign out failed', error.message);
  }

  if (loading || !session) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  const initials = (fullName || session.user.email || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarWrap}>
          <Avatar initials={initials} size={88} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
          <Text style={[styles.email, { color: colors.text }]}>{session.user.email}</Text>

          <Text style={[styles.label, { color: colors.textMuted }]}>Username</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
            placeholder="e.g. explorer"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <Text style={[styles.label, { color: colors.textMuted }]}>Full name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            value={fullName}
            onChangeText={setFullName}
          />

          <AppPressable
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.buttonText, { color: colors.accentText }]}>Save profile</Text>
            )}
          </AppPressable>
        </View>

        <AppPressable onPress={signOut} style={styles.signOutWrap}>
          <Text style={[styles.signOut, { color: colors.danger }]}>Sign out</Text>
        </AppPressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 24, paddingBottom: 100 },
  avatarWrap: { alignItems: 'center', marginBottom: 20 },
  card: { borderRadius: 16, padding: 20 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 14 },
  email: { fontSize: 16 },
  input: { borderRadius: 10, padding: 14, fontSize: 16 },
  button: { borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 20 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  signOutWrap: { marginTop: 24, alignItems: 'center', padding: 8 },
  signOut: { fontSize: 15, fontWeight: '600' },
});
