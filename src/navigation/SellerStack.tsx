import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SellerStackParamList } from '../types/navigation';
import { SellerTabs } from './SellerTabs';
import { EditProfileScreen } from '../features/user/screens/EditProfileScreen';
import { theme } from '../theme';

const Stack = createNativeStackNavigator<SellerStackParamList>();

export function SellerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.cartoon.cream },
        headerTintColor: theme.colors.cartoon.charcoal,
        headerTitleStyle: { color: theme.colors.cartoon.charcoal, fontWeight: '800' },
      }}
    >
      <Stack.Screen
        name="SellerTabs"
        component={SellerTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        // We cast to any because EditProfileScreen expects UserStack props logically, but it's completely generic and only uses navigation.goBack()
        component={EditProfileScreen as any}
        options={{ title: 'Edit Profile' }}
      />
    </Stack.Navigator>
  );
}
