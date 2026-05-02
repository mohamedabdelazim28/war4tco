import axios from 'axios';
import { authStore } from '../store';
import { supabase } from '../lib/supabase';

import Constants from 'expo-constants';

function getEnv(name: string): string {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  const fromExtra = extra?.[name]?.trim() ?? '';
  const fromProcess = (typeof process !== 'undefined' && process.env?.[name as keyof NodeJS.ProcessEnv])?.trim() ?? '';
  return fromExtra || fromProcess || '';
}

const baseURL = getEnv('EXPO_PUBLIC_API_URL') || 'http://localhost:3000';

if (baseURL === 'http://localhost:3000' || baseURL.includes('example.com')) {
  console.warn('[apiClient] Using fallback/placeholder baseURL. External API requests may fail.');
} else {
  console.log('[apiClient] Initialized with baseURL:', baseURL);
}

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = authStore.getState().user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      authStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
