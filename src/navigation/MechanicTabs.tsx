import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MechanicTabParamList } from '../types/navigation';
import { RequestsNearbyScreen } from '../features/mechanic/screens/RequestsNearbyScreen';
import { JobsScreen } from '../features/mechanic/screens/JobsScreen';
import { MechanicBookingsScreen } from '../features/mechanic/screens/MechanicBookingsScreen';
import { MechanicProfileScreen } from '../features/mechanic/screens/ProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator<MechanicTabParamList>();

export function MechanicTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'Requests'
              ? 'map-marker-radius-outline'
              : route.name === 'Jobs'
                ? 'briefcase-outline'
                : route.name === 'Bookings'
                  ? 'calendar-clock-outline'
                  : 'account-circle-outline';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Requests"
        component={RequestsNearbyScreen}
        options={{ title: 'Nearby requests' }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsScreen}
        options={{ title: 'Jobs' }}
      />
      <Tab.Screen
        name="Bookings"
        component={MechanicBookingsScreen}
        options={{ title: 'Bookings' }}
      />
      <Tab.Screen
        name="Profile"
        component={MechanicProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
