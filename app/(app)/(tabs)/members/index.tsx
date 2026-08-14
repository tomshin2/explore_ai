import { Link, Stack } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api, Profile } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth-context';
import { useAppTheme } from '../../../../lib/theme';
import { AppPressable, Avatar } from '../../../../lib/ui';

export default function MembersScreen() {
  const { session } = useAuth();
  const { colors } = useAppTheme();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  async function load() {
    const data = await api.getProfiles();
    setProfiles(data);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        (p.full_name || '').toLowerCase().includes(q) ||
        (p.username || '').toLowerCase().includes(q)
    );
  }, [profiles, query]);

  function getInitials(p: Profile) {
    const name = p.full_name || p.username || '?';
    return name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: 'Search members',
            onChangeText: (e) => setQuery(e.nativeEvent.text),
            tintColor: colors.accent,
          },
        }}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.accent}
          />
        }
        renderItem={({ item, index }) => {
          const isYou = item.id === session?.user.id;
          return (
            <Link href={{ pathname: '/(app)/member/[id]', params: { id: item.id } }} asChild>
              <AppPressable style={[styles.row, { borderBottomColor: colors.border }]}>
                <Avatar initials={getInitials(item)} size={44} colorIndex={index} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowName, { color: colors.text }]}>
                    {item.full_name || item.username || 'Unnamed'}
                    {isYou ? '  (you)' : ''}
                  </Text>
                  <Text style={[styles.rowUsername, { color: colors.textMuted }]}>
                    @{item.username || 'no-username'}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
              </AppPressable>
            </Link>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {query ? 'No members match your search.' : 'No members yet. Be the first!'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 120 : 80 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowName: { fontSize: 16, fontWeight: '600' },
  rowUsername: { fontSize: 13, marginTop: 2 },
  chevron: { fontSize: 24 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15 },
});
