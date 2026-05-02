import { useCallback } from 'react';
import { useAuthStore } from '../store';
import type { Role } from '../types';

export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const signOut = useAuthStore((state) => state.signOut);

  const role: Role | null = profile?.role ?? user?.role ?? null;

  const logout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  return {
    session,
    user,
    profile,
    role,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signOut,
    logout,
    setUser,
    setLoading,
  };
}
