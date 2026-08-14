import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { useAppTheme } from '../../../../lib/theme';

export default function MembersStackLayout() {
  const { colors } = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: Platform.OS === 'ios',
        headerLargeTitleShadowVisible: false,
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        headerLargeTitleStyle: { color: colors.text },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.accent,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Members' }} />
    </Stack>
  );
}
