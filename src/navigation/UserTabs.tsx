import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { UserTabParamList } from '../types/navigation';
import { HomeScreen } from '../features/user/screens/HomeScreen';
import { BookingsScreen } from '../features/user/screens/BookingsScreen';
import { UserStoreScreen } from '../features/user/screens/UserStoreScreen';
import { ProfileScreen } from '../features/user/screens/ProfileScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator<UserTabParamList>();

const tabIcons: Record<keyof UserTabParamList, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  Home: 'home',
  Bookings: 'calendar-today',
  Store: 'shopping',
  Profile: 'account',
};

export function UserTabs() {
  const cartoonColors = theme.colors.cartoon;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: cartoonColors.red,
        tabBarInactiveTintColor: cartoonColors.gray,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopColor: cartoonColors.creamDark,
          borderTopWidth: 1,
          paddingTop: 4,
          height: 80,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={tabIcons[route.name]}
            size={size ?? 26}
            color={color}
          />
        ),
        headerStyle: { backgroundColor: cartoonColors.cream },
        headerTintColor: cartoonColors.charcoal,
        headerTitleStyle: { color: cartoonColors.charcoal, fontWeight: '700' },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ title: 'Bookings', headerShown: false }}
      />
      <Tab.Screen
        name="Store"
        component={UserStoreScreen}
        options={{ title: 'Store', headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile', headerShown: false }}
      />
    </Tab.Navigator>
  );
}
