import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MechanicStackParamList } from '../types/navigation';
import { MechanicTabs } from './MechanicTabs';
import { MechanicActiveJobScreen } from '../features/mechanic/screens/ActiveJobScreen';
import { RequestDetailsScreen } from '../features/mechanic/screens/MechanicRequestDetailsScreen';
import { EditProfileScreen } from '../features/user/screens/EditProfileScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<MechanicStackParamList>();

export function MechanicStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen
        name="MechanicTabs"
        component={MechanicTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ActiveJob"
        component={MechanicActiveJobScreen}
        options={{ title: 'Active job' }}
      />
      <Stack.Screen
        name="RequestDetails"
        component={RequestDetailsScreen}
        options={{ title: 'Request details' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen as any}
        options={{ title: 'Edit Profile' }}
      />
    </Stack.Navigator>
  );
}
