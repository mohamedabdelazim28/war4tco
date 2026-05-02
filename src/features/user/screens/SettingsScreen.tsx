import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '../../../components/ui';
import { theme } from '../../../theme';
import type { UserStackScreenProps } from '../../../types/navigation';

const c = theme.colors.cartoon;
const NOTIFICATIONS_KEY = '@autoassist_notifications';

type Props = UserStackScreenProps<'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(NOTIFICATIONS_KEY).then((v) => {
      setNotifications(v !== 'false');
    });
  }, []);

  function toggleNotifications(value: boolean) {
    setNotifications(value);
    AsyncStorage.setItem(NOTIFICATIONS_KEY, String(value));
  }

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Push Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: c.gray, true: c.mint }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.cream,
  },
  scroll: {
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: c.charcoal,
  },
});
