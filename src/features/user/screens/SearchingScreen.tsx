import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ScreenContainer,
  SearchingRadar,
  ServiceDetailsCard,
} from '../../../components/ui';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../theme';
import type { UserStackScreenProps } from '../../../types/navigation';

type Props = UserStackScreenProps<'Searching'>;

const MAP_IMAGE_URI =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCb0q-aF71eCbLI-UAYL1InZUo9xQMDT7jKJhYuA7UeAKZxDZFl_qj1bq-3qJBa-Tc6u_37a63lBAGLCO-fBbx_7gIJB2IgU-A6W3jB5_qvipEuWEYoHCnREl6oGbHgYCL5ZDeVPumBxgN3TVFoOr_5x61CU-0TJXBcxi1jshD64hlrgY2ZBF5Vyo_cN20BsRQ_CIErvIxK9RDnpJb2RQ0dyXnZ7pwHkk2Tlw1fKuStrYxS_Sf569c-z6fj9SH-jCAweK7asEgjzIy4';

const PLACEHOLDER_SERVICE = {
  title: 'Flat Tire Repair',
  vehicle: '2018 Honda Civic • Grey • Lic: 8XYZ123',
  price: '$45.00',
  priceLabel: 'Base Fee',
};

export function SearchingScreen({ navigation, route }: Props) {
  const { requestId } = route.params;
  const channelRef = useRef<RealtimeChannel | null>(null);
  const insets = useSafeAreaInsets();
  const waitDotOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(waitDotOpacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(waitDotOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [waitDotOpacity]);

  useEffect(() => {
    const channel = supabase
      .channel(`request:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          const row = payload.new as { status: string };
          if (row.status === 'accepted') {
            if (channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }
            navigation.navigate('ActiveJob', { requestId });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [requestId, navigation]);

  function handleBack() {
    navigation.goBack();
  }

  function handleHelp() {
    Alert.alert('Help', 'Need assistance? Contact support or stay on this screen until a mechanic accepts.');
  }

  async function handleCancelRequest() {
    Alert.alert(
      'Cancel request?',
      'You will stop searching for a mechanic. You can request again from Home.',
      [
        { text: 'Keep searching', style: 'cancel' },
        {
          text: 'Cancel request',
          style: 'destructive',
          onPress: async () => {
            await supabase
              .from('requests')
              .update({ status: 'cancelled' })
              .eq('id', requestId);
            navigation.goBack();
          },
        },
      ]
    );
  }

  const avatarUri = null;

  return (
    <ScreenContainer style={styles.screen} edges={[]}>
      <ImageBackground
        source={{ uri: MAP_IMAGE_URI }}
        style={styles.mapBg}
        imageStyle={styles.mapBgImage}
      >
        <View style={styles.overlay} />

        <View style={[styles.header, { paddingTop: insets.top + theme.spacing.sm }]}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBack} activeOpacity={0.8}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={theme.colors.white} />
          </TouchableOpacity>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="hammer-wrench" size={16} color={theme.colors.primary} />
            <Text style={styles.badgeText}>Emergency Request</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={handleHelp} activeOpacity={0.8}>
            <MaterialCommunityIcons name="help-circle-outline" size={22} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.center}>
          <SearchingRadar avatarUri={avatarUri} />
          <View style={styles.statusBlock}>
            <Text style={styles.statusTitle}>
              Finding nearby{'\n'}mechanics...
            </Text>
            <Text style={styles.statusSubtitle}>
              Scanning your area for available experts.
            </Text>
            <View style={styles.waitBadge}>
              <Animated.View style={[styles.waitDot, { opacity: waitDotOpacity }]} />
              <Text style={styles.waitText}>Est. wait time: 1-2 min</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottom}>
          <ServiceDetailsCard
            title={PLACEHOLDER_SERVICE.title}
            vehicleDescription={PLACEHOLDER_SERVICE.vehicle}
            price={PLACEHOLDER_SERVICE.price}
            priceLabel={PLACEHOLDER_SERVICE.priceLabel}
            style={styles.serviceCard}
          />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelRequest}
            activeOpacity={0.9}
          >
            <MaterialCommunityIcons name="close" size={22} color={theme.colors.textSecondary} />
            <Text style={styles.cancelButtonText}>Cancel Request</Text>
          </TouchableOpacity>
          <Text style={styles.footerHint}>
            Please stay on this screen while we connect you.
          </Text>
        </View>
      </ImageBackground>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 0,
    backgroundColor: theme.colors.background,
  },
  mapBg: {
    flex: 1,
    width: '100%',
  },
  mapBgImage: {
    opacity: 0.85,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.background,
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: `${theme.colors.primary}33`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}4D`,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -40,
  },
  statusBlock: {
    marginTop: -80,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    zIndex: 10,
  },
  statusTitle: {
    ...theme.typography.title,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: theme.colors.white,
    textAlign: 'center',
  },
  statusSubtitle: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  waitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  waitDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  waitText: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  bottom: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl + theme.spacing.md,
  },
  serviceCard: {
    marginBottom: theme.spacing.md,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceDarkLight,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceDark,
  },
  cancelButtonText: {
    ...theme.typography.subtitle,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  footerHint: {
    ...theme.typography.caption,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
