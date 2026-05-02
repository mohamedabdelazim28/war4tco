import React from 'react';
import { useAuthStore } from '../store';
import { AuthStack } from './AuthStack';
import { UserStack } from './UserStack';
import { MechanicStack } from './MechanicStack';
import { SellerStack } from './SellerStack';
import { LoadingScreen } from '../components/LoadingScreen';
import type { Role } from '../types';

export function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) {
    console.log('[RootNavigator] Loading auth state…');
    return <LoadingScreen />;
  }
  if (!isAuthenticated || !user) {
    console.log('[RootNavigator] No authenticated user – showing AuthStack');
    return <AuthStack />;
  }

  console.log(
    '[RootNavigator] Authenticated user',
    JSON.stringify({ id: user.id, role: user.role, email: user.email }, null, 2)
  );

  switch (user.role as Role) {
    case 'user':
      console.log('[RootNavigator] Routing to UserStack');
      return <UserStack />;
    case 'mechanic':
      console.log('[RootNavigator] Routing to MechanicStack');
      return <MechanicStack />;
    case 'seller':
      console.log('[RootNavigator] Routing to SellerStack');
      return <SellerStack />;
    default:
      console.warn('[RootNavigator] Unknown role, falling back to AuthStack', user.role);
      return <AuthStack />;
  }
}
