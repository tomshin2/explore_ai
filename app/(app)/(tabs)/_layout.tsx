import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';
import { useAppTheme } from '../../../lib/theme';

export default function TabsLayout() {
  const theme = useAppTheme();
  const { colors } = theme;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarStyle:
          Platform.OS === 'ios'
            ? {
                position: 'absolute',
                borderTopWidth: 0,
                backgroundColor: theme.dark ? 'rgba(28, 28, 30, 0.72)' : 'rgba(249, 249, 249, 0.72)',
              }
            : { backgroundColor: colors.tabBar, borderTopColor: colors.border },
        tabBarBackground:
          Platform.OS === 'ios'
            ? () => (
                <BlurView
                  tint={theme.dark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
                  intensity={100}
                  style={StyleSheet.absoluteFill}
                />
              )
            : undefined,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: 'Members',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
