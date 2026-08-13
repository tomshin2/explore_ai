import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api, Profile } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getProfile(id).then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#4f6ef7" size="large" /></View>;
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Profile not found.</Text>
      </View>
    );
  }

  const isYou = profile.id === session?.user.id;
  const name = profile.full_name || profile.username || 'Unnamed';
  const initials = name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ alignItems: 'center', paddingTop: 60 }}>
      <View style={styles.bigAvatar}>
        <Text style={styles.bigAvatarText}>{initials}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.username}>@{profile.username || 'no-username'}</Text>
      {isYou && <View style={styles.youBadge}><Text style={styles.youBadgeText}>This is you</Text></View>}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Full name</Text>
        <Text style={styles.infoValue}>{profile.full_name || 'Not set'}</Text>
        <Text style={styles.infoLabel}>Username</Text>
        <Text style={styles.infoValue}>{profile.username || 'Not set'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f1a' },
  center: { flex: 1, backgroundColor: '#0b0f1a', justifyContent: 'center', alignItems: 'center' },
  bigAvatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#4f6ef7', alignItems: 'center', justifyContent: 'center' },
  bigAvatarText: { color: '#fff', fontSize: 42, fontWeight: '800' },
  name: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 16 },
  username: { color: '#8b94ad', fontSize: 16, marginTop: 4 },
  youBadge: { marginTop: 12, backgroundColor: '#3a2d12', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  youBadgeText: { color: '#f0b429', fontSize: 13, fontWeight: '700' },
  infoCard: { width: '90%', marginTop: 32, backgroundColor: '#151b2b', borderRadius: 16, padding: 20 },
  infoLabel: { color: '#8b94ad', fontSize: 13, marginBottom: 4, marginTop: 14 },
  infoValue: { color: '#fff', fontSize: 16 },
  emptyText: { color: '#8b94ad', fontSize: 16 },
});