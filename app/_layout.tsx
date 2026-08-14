import { ThemeProvider } from '@react-navigation/core';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { api } from '../lib/api';
import { darkTheme, lightTheme, ThemeContext, useAppTheme } from '../lib/theme';

function DemoBadge() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  if (api.configured) return null;
  return (
    <View
      pointerEvents="none"
      style={[
        styles.badge,
        {
          top: insets.top + 6,
          backgroundColor: theme.colors.warning,
          borderColor: theme.colors.warningText,
        },
      ]}
    >
      <Text style={[styles.badgeText, { color: theme.colors.warningText }]}>DEMO MODE</Text>
    </View>
  );
}

function RootLayoutNav() {
  const { loading } = useAuth();
  const theme = useAppTheme();

  if (loading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.bg }]}>
        <ActivityIndicator color={theme.colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <DemoBadge />
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
    </View>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider value={scheme === 'dark' ? NavDarkTheme : NavDefaultTheme}>
      <ThemeContext.Provider value={theme}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeContext.Provider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  badge: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    zIndex: 100,
  },
  badgeText: { fontSize: 12, fontWeight: '800' },
});
