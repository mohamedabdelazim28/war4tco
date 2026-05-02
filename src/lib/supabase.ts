import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

function getEnv(name: string): string {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  const fromExtra = extra?.[name]?.trim() ?? '';
  const fromProcess = (typeof process !== 'undefined' && process.env?.[name as keyof NodeJS.ProcessEnv])?.trim() ?? '';
  return fromExtra || fromProcess || '';
}

const supabaseUrl = getEnv('EXPO_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('EXPO_PUBLIC_SUPABASE_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] MISSING CREDENTIALS: EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_KEY is empty. Check your .env file.'
  );
} else {
  const isPlaceholder = supabaseUrl.includes('your-project') || supabaseUrl.includes('example.co');
  if (isPlaceholder) {
    console.warn(
      '[Supabase] PLACEHOLDER DETECTED: The current Supabase URL appears to be a placeholder. Please update your .env with valid credentials.'
    );
  } else {
    console.log('[Supabase] Initializing with PROJECT_ID:', supabaseUrl.split('//')[1]?.split('.')[0]);
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
