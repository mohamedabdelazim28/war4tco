import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { SellerTabParamList } from '../types/navigation';
import { StoreScreen } from '../features/seller/screens/StoreScreen';
import { OrdersScreen } from '../features/seller/screens/OrdersScreen';
import { SellerProfileScreen } from '../features/seller/screens/ProfileScreen';
import { theme } from '../theme';

const Tab = createBottomTabNavigator<SellerTabParamList>();

const tabIcons: Record<keyof SellerTabParamList, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  Store: 'storefront-outline',
  Orders: 'clipboard-text-outline',
  Profile: 'account-outline',
};

export function SellerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.cartoon.red,
        tabBarInactiveTintColor: theme.colors.cartoon.gray,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopColor: theme.colors.cartoon.creamDark,
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
      })}
    >
      <Tab.Screen
        name="Store"
        component={StoreScreen}
        options={{ title: 'Store', headerShown: false }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ title: 'Orders', headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={SellerProfileScreen}
        options={{ title: 'Profile', headerShown: false }}
      />
    </Tab.Navigator>
  );
}
