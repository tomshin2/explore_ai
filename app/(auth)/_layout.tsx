import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../lib/auth-context';

export default function AuthLayout() {
  const { session } = useAuth();

  if (session) return <Redirect href="/(app)/(tabs)/home" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}