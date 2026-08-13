import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../lib/auth-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function AppLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#4f6ef7" size="large" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/sign-in" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="member/[id]" options={{ headerShown: true, headerTitle: '', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0b0f1a' } }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#0b0f1a', justifyContent: 'center', alignItems: 'center' },
});