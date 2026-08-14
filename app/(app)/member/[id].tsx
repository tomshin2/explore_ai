import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, Profile } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { useAppTheme } from '../../../lib/theme';
import { Avatar } from '../../../lib/ui';

export default function MemberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { colors } = useAppTheme();
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
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>Profile not found.</Text>
      </View>
    );
  }

  const isYou = profile.id === session?.user.id;
  const name = profile.full_name || profile.username || 'Unnamed';
  const initials = name.split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <Stack.Screen options={{ title: name }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={styles.content}
      >
        <Avatar initials={initials} size={120} />
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.username, { color: colors.textMuted }]}>
          @{profile.username || 'no-username'}
        </Text>
        {isYou && (
          <View style={[styles.youBadge, { backgroundColor: colors.warning }]}>
            <Text style={[styles.youBadgeText, { color: colors.warningText }]}>This is you</Text>
          </View>
        )}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Full name</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {profile.full_name || 'Not set'}
          </Text>
          <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Username</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>
            {profile.username || 'Not set'}
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', padding: 24, paddingTop: 24 },
  name: { fontSize: 24, fontWeight: '800', marginTop: 16 },
  username: { fontSize: 16, marginTop: 4 },
  youBadge: { marginTop: 12, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  youBadgeText: { fontSize: 13, fontWeight: '700' },
  infoCard: { width: '100%', marginTop: 32, borderRadius: 16, padding: 20 },
  infoLabel: { fontSize: 13, marginBottom: 4, marginTop: 14 },
  infoValue: { fontSize: 16 },
  emptyText: { fontSize: 16 },
});
