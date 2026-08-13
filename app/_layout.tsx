import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { api } from '../lib/api';

function RootLayoutNav() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#4f6ef7" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      {!api.configured && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>DEMO MODE — no backend connected</Text>
        </View>
      )}
      <StatusBar style="light" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f1a' },
  loading: { flex: 1, backgroundColor: '#0b0f1a', justifyContent: 'center', alignItems: 'center' },
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
  badgeText: { color: '#f0b429', fontSize: 12, fontWeight: '700' },
});