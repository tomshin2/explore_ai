import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../lib/auth-context';
import { api, Profile } from '../../../lib/api';

export default function ProfileScreen() {
  const { session } = useAuth();
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
    return <View style={styles.center}><ActivityIndicator color="#4f6ef7" size="large" /></View>;
  }

  const initials = (fullName || session.user.email || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.email}>{session.user.email}</Text>
        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} placeholder="e.g. explorer" placeholderTextColor="#5a6485" autoCapitalize="none" value={username} onChangeText={setUsername} />
        <Text style={styles.label}>Full name</Text>
        <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#5a6485" value={fullName} onChangeText={setFullName} />
        <TouchableOpacity style={styles.button} onPress={saveProfile} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save profile</Text>}
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={signOut}>
        <Text style={styles.signOut}>Sign out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f1a', padding: 24, paddingTop: 80 },
  center: { flex: 1, backgroundColor: '#0b0f1a', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 20 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#4f6ef7', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20 },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '700' },
  card: { backgroundColor: '#151b2b', borderRadius: 16, padding: 20 },
  label: { color: '#8b94ad', fontSize: 13, marginBottom: 6, marginTop: 14 },
  email: { color: '#fff', fontSize: 16 },
  input: { backgroundColor: '#1f2739', borderRadius: 10, padding: 14, color: '#fff', fontSize: 16 },
  button: { backgroundColor: '#4f6ef7', borderRadius: 10, padding: 15, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  signOut: { color: '#f4778f', textAlign: 'center', marginTop: 24, fontSize: 15 },
});