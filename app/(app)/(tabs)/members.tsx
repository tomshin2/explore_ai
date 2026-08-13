import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Link } from 'expo-router';
import { api, Profile } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';

export default function MembersScreen() {
  const { session } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const data = await api.getProfiles();
    setProfiles(data);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    load();
  }, []);

  function getInitials(p: Profile) {
    const name = p.full_name || p.username || '?';
    return name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  }

  const colors = ['#4f6ef7', '#f76e4f', '#4ff76e', '#f7c44f', '#c44ff7', '#4ff7c4'];

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color="#4f6ef7" size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Members</Text>
      <Text style={styles.subtitle}>{profiles.length} people in the community</Text>
      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#4f6ef7" />}
        renderItem={({ item, index }) => {
          const isYou = item.id === session?.user.id;
          return (
            <Link href={{ pathname: '/(app)/member/[id]', params: { id: item.id } }} asChild>
              <TouchableOpacity style={styles.row}>
                <View style={[styles.miniAvatar, { backgroundColor: colors[index % colors.length] }]}>
                  <Text style={styles.miniAvatarText}>{getInitials(item)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName}>
                    {item.full_name || item.username || 'Unnamed'}
                    {isYou ? '  (you)' : ''}
                  </Text>
                  <Text style={styles.rowUsername}>@{item.username || 'no-username'}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </Link>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No members yet. Be the first!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f1a', paddingTop: 60, paddingHorizontal: 24 },
  center: { flex: 1, backgroundColor: '#0b0f1a', justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: '#8b94ad', fontSize: 14, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1f2739' },
  miniAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  miniAvatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rowName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  rowUsername: { color: '#8b94ad', fontSize: 13, marginTop: 2 },
  chevron: { color: '#8b94ad', fontSize: 24 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#8b94ad', fontSize: 15 },
});