import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { UserStackParamList } from '../types/navigation';
import { UserTabs } from './UserTabs';
import { UserStoreScreen } from '../features/user/screens/UserStoreScreen';
import { CartScreen } from '../features/user/screens/CartScreen';
import { SearchingScreen } from '../features/user/screens/SearchingScreen';
import { ActiveJobScreen } from '../features/user/screens/ActiveJobScreen';
import { MechanicListScreen } from '../features/booking/screens/MechanicListScreen';
import { MechanicProfileScreen } from '../features/booking/screens/MechanicProfileScreen';
import { BookingScreen } from '../features/booking/screens/BookingScreen';
import { BookingSuccessScreen } from '../features/booking/screens/BookingSuccessScreen';
import { EditProfileScreen } from '../features/user/screens/EditProfileScreen';
import { SettingsScreen } from '../features/user/screens/SettingsScreen';
import { AddVehicleScreen } from '../features/user/screens/AddVehicleScreen';
import { MyVehiclesScreen } from '../features/user/screens/MyVehiclesScreen';
import { PaymentMethodsScreen } from '../features/user/screens/PaymentMethodsScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<UserStackParamList>();

export function UserStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.textOnLight, fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="UserTabs"
        component={UserTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Store"
        component={UserStoreScreen}
        options={{ title: 'Store' }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'My Cart',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Searching"
        component={SearchingScreen}
        options={{ title: 'Searching' }}
      />
      <Stack.Screen
        name="ActiveJob"
        component={ActiveJobScreen}
        options={{ title: 'Active job' }}
      />
      <Stack.Screen
        name="MechanicList"
        component={MechanicListScreen}
        options={{ title: 'Book a mechanic' }}
      />
      <Stack.Screen
        name="MechanicProfile"
        component={MechanicProfileScreen}
        options={{ title: 'Mechanic' }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ title: 'Book appointment' }}
      />
      <Stack.Screen
        name="BookingSuccess"
        component={BookingSuccessScreen}
        options={{ title: 'Booking confirmed' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{ title: 'Add Vehicle' }}
      />
      <Stack.Screen
        name="MyVehicles"
        component={MyVehiclesScreen}
        options={{ title: 'My Garage' }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethodsScreen}
        options={{ title: 'Payment Methods' }}
      />
    </Stack.Navigator>
  );
}
