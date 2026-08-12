import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Session } from '@supabase/supabase-js';
import { api } from './lib/api';
import AuthScreen from './components/AuthScreen';
import ProfileScreen from './components/ProfileScreen';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSession().then((session) => {
      setSession(session);
      setLoading(false);
    });

    const unsubscribe = api.onSessionChange((session) => {
      setSession(session);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#4f6ef7" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {session ? <ProfileScreen session={session} /> : <AuthScreen />}
      {!api.configured && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>DEMO MODE — no backend connected</Text>
        </View>
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f1a',
  },
  badge: {
    position: 'absolute',
    top: 46,
    alignSelf: 'center',
    backgroundColor: '#3a2d12',
    borderColor: '#f0b429',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#f0b429',
    fontSize: 12,
    fontWeight: '700',
  },
});
