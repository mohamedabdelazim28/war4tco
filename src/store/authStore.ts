import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  ensureProfileExists,
  ensureMechanicRoleAndRow,
  authUserFromSession,
  getSessionWithProfile,
  type ProfileRow,
} from '../lib/authHelpers';
import type { AuthUser } from '../types';

export interface SignUpPayload {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'user' | 'mechanic' | 'seller';
}

interface AuthState {
  session: Session | null;
  user: AuthUser | null;
  profile: ProfileRow | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setSession: (session: Session | null, profile: ProfileRow | null, user: AuthUser | null) => void;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<{ needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  login: (user: AuthUser) => void;
  logout: () => void;
  clear: () => void;
}

const initialState = {
  session: null as Session | null,
  user: null as AuthUser | null,
  profile: null as ProfileRow | null,
  isAuthenticated: false,
  isLoading: false,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  setSession: (session, profile, user) =>
    set(() => {
      console.log(
        '[authStore] setSession',
        JSON.stringify(
          {
            hasSession: !!session,
            userId: user?.id,
            role: user?.role,
          },
          null,
          2
        )
      );
      return {
        session,
        profile,
        user,
        isAuthenticated: !!user,
      };
    }),

  setUser: (user) =>
    set(() => {
      console.log(
        '[authStore] setUser',
        JSON.stringify(
          {
            userId: user?.id,
            role: user?.role,
          },
          null,
          2
        )
      );
      return {
        user,
        isAuthenticated: !!user,
        session: user ? get().session : null,
        profile: user ? get().profile : null,
      };
    }),

  setLoading: (isLoading) => set({ isLoading }),

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const session = data.session;
    if (!session) throw new Error('No session after sign in');
    let profile = await ensureProfileExists(session);
    profile = await ensureMechanicRoleAndRow(session, profile);
    const authUser = authUserFromSession(session, profile);
    console.log(
      '[authStore] signIn success',
      JSON.stringify(
        {
          userId: authUser.id,
          role: authUser.role,
          email: authUser.email,
        },
        null,
        2
      )
    );
    set({
      session,
      user: authUser,
      profile,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  signUp: async (payload) => {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          name: payload.name,
          phone: payload.phone,
          role: payload.role,
        },
      },
    });
    if (error) throw error;
    if (data.session) {
      let profile = await ensureProfileExists(data.session);
      profile = await ensureMechanicRoleAndRow(data.session, profile);

      // Build base AuthUser from session + profile
      let authUser = authUserFromSession(data.session, profile);

      // Trust the explicit role selected at signup (payload.role),
      // while keeping DB profile.role in sync via ensureMechanicRoleAndRow.
      if (payload.role === 'mechanic' || payload.role === 'seller') {
        authUser = { ...authUser, role: payload.role };
      } else {
        authUser = { ...authUser, role: 'user' };
      }
      console.log(
        '[authStore] signUp success',
        JSON.stringify(
          {
            userId: authUser.id,
            role: authUser.role,
            email: authUser.email,
            requestedRole: payload.role,
          },
          null,
          2
        )
      );
      set({
        session: data.session,
        user: authUser,
        profile,
        isAuthenticated: true,
        isLoading: false,
      });
      return {};
    }
    return { needsEmailConfirmation: true };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    console.log('[authStore] signOut');
    set({ ...initialState });
  },

  login: (user) =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  logout: () => set({ ...initialState }),

  clear: () => set(initialState),
}));

export const authStore = useAuthStore;
