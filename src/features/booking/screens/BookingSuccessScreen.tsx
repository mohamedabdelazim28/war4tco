import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ScreenContainer, Button } from '../../../components/ui';
import { theme } from '../../../theme';
import type { UserStackScreenProps } from '../../../types/navigation';

type Props = UserStackScreenProps<'BookingSuccess'>;

export function BookingSuccessScreen({ navigation }: Props) {
  function handleViewBookings() {
    navigation.navigate('UserTabs', { screen: 'Bookings' });
  }

  function handleBackToHome() {
    navigation.navigate('UserTabs', { screen: 'Home' });
  }

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Booking confirmed</Text>
      <Text style={styles.message}>
        Your appointment has been booked successfully. The mechanic will see your booking in their schedule.
      </Text>
      <Button
        title="View my bookings"
        onPress={handleViewBookings}
        style={styles.button}
      />
      <Button
        title="Back to home"
        variant="outline"
        onPress={handleBackToHome}
        style={styles.button}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textOnLight,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.muted,
    marginTop: theme.spacing.md,
  },
  button: {
    marginTop: theme.spacing.lg,
  },
});
