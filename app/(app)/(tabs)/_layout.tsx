import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth-context';

export default function TabsLayout() {
  const { session } = useAuth();
  const initial = (session?.user.email || '?').charAt(0).toUpperCase();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { backgroundColor: '#151b2b', borderTopColor: '#1f2739' },
        tabBarActiveTintColor: '#4f6ef7',
        tabBarInactiveTintColor: '#8b94ad',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
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