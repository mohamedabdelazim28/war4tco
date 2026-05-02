import React, { useEffect } from 'react';
import { Platform, View, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { RootNavigator } from './src/navigation';
import { theme } from './src/theme';
import { authStore } from './src/store';
import { getSessionWithProfile } from './src/lib/authHelpers';
import { supabase } from './src/lib/supabase';

// Push notifications are not supported in Expo Go (SDK 53+). Only configure in dev/production builds.
const isExpoGo = Constants.appOwnership === 'expo';

if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export default function App() {
  useEffect(() => {
    let mounted = true;
    authStore.getState().setLoading(true);
    
    async function initAuth() {
      // Safeguard timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (mounted && authStore.getState().isLoading) {
          authStore.getState().setLoading(false);
        }
      }, 5000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!mounted) return;
        if (session) {
          const result = await getSessionWithProfile();
          if (result) {
            authStore.getState().setSession(result.session, result.profile, result.authUser);
          }
        }
      } catch (err) {
        console.error('[App] Auth initialization error:', err);
        if (mounted) {
          Alert.alert(
            'Connection Error',
            'Could not connect to the server. Please check your internet connection and verify that your backend is running.'
          );
        }
      } finally {
        clearTimeout(timeoutId);
        if (mounted) {
          authStore.getState().setLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        try {
          if (event === 'SIGNED_OUT') {
            authStore.getState().logout();
          } else if (session) {
            const result = await getSessionWithProfile();
            if (result) {
              authStore.getState().setSession(result.session, result.profile, result.authUser);
            }
          }
        } catch (err) {
          console.error('[App] Auth state change error:', err);
        }
      }
    );
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isExpoGo) return;

    async function registerPushToken() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }
      // Optional: get push token and send to backend
      // const token = (await Notifications.getExpoPushTokenAsync()).data;
    }
    registerPushToken();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaProvider style={styles.safeArea}>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
