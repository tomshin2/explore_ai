import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../../lib/auth-context';
import { api, Profile } from '../../../lib/api';

export default function HomeScreen() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    if (!session) return;
    api.getProfile(session.user.id).then(setProfile);
    api.getProfiles().then((p) => setMemberCount(p.length));
  }, [session]);

  const fullName = profile?.full_name || session?.user.email || 'there';
  const initials = (fullName as string)
    .split(' ')
    .map((p: string) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Welcome back</Text>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroName}>{fullName}</Text>
          <Text style={styles.heroEmail}>{session?.user.email}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{memberCount}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile?.username ? '1' : '0'}</Text>
          <Text style={styles.statLabel}>Profile set</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <Link href="/(app)/(tabs)/profile" asChild>
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionTitle}>Edit your profile</Text>
          <Text style={styles.actionDesc}>Update your name and username</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/(app)/(tabs)/members" asChild>
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionTitle}>Browse members</Text>
          <Text style={styles.actionDesc}>See everyone who's joined</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f1a' },
  content: { padding: 24, paddingTop: 60 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 20 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28 },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: '#4f6ef7',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  heroName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  heroEmail: { color: '#8b94ad', fontSize: 14, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1, backgroundColor: '#151b2b', borderRadius: 14, padding: 18, alignItems: 'center',
  },
  statNumber: { color: '#fff', fontSize: 32, fontWeight: '800' },
  statLabel: { color: '#8b94ad', fontSize: 13, marginTop: 4 },
  sectionTitle: { color: '#8b94ad', fontSize: 14, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase' },
  actionCard: { backgroundColor: '#151b2b', borderRadius: 14, padding: 18, marginBottom: 12 },
  actionTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  actionDesc: { color: '#8b94ad', fontSize: 14, marginTop: 4 },
});