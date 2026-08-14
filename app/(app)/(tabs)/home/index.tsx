import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, Profile } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth-context';
import { useAppTheme } from '../../../../lib/theme';
import { AppPressable, Avatar } from '../../../../lib/ui';

export default function HomeScreen() {
  const { session } = useAuth();
  const { colors } = useAppTheme();
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
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.hero}>
        <Avatar initials={initials} size={56} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroName, { color: colors.text }]}>{fullName}</Text>
          <Text style={[styles.heroEmail, { color: colors.textMuted }]}>{session?.user.email}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.text }]}>{memberCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Members</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {profile?.username ? '1' : '0'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Profile set</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Quick actions</Text>

      <Link href="/(app)/(tabs)/profile" asChild>
        <AppPressable style={[styles.actionCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.actionTitle, { color: colors.text }]}>Edit your profile</Text>
          <Text style={[styles.actionDesc, { color: colors.textMuted }]}>
            Update your name and username
          </Text>
        </AppPressable>
      </Link>
      <Link href="/(app)/(tabs)/members" asChild>
        <AppPressable style={[styles.actionCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.actionTitle, { color: colors.text }]}>Browse members</Text>
          <Text style={[styles.actionDesc, { color: colors.textMuted }]}>
            See everyone who's joined
          </Text>
        </AppPressable>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 16 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28 },
  heroName: { fontSize: 18, fontWeight: '700' },
  heroEmail: { fontSize: 14, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  statNumber: { fontSize: 32, fontWeight: '800' },
  statLabel: { fontSize: 13, marginTop: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  actionCard: { borderRadius: 14, padding: 18, marginBottom: 12 },
  actionTitle: { fontSize: 16, fontWeight: '700' },
  actionDesc: { fontSize: 14, marginTop: 4 },
});
