import React, { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  CartoonActionButton,
  CartoonEmptyState,
  FloatingIconsBackground,
  ScreenContainer,
  SketchFill,
} from '../../../components/ui';
import type { MechanicStackScreenProps } from '../../../types/navigation';
import { theme } from '../../../theme';
import { supabase } from '../../../lib/supabase';
import { getMechanicId, acceptRequest } from '../../../lib/mechanicHelpers';
import { formatEta, requestStatusLabel } from '../utils/mapHelpers';
import { OptionalMapView, OptionalMarker } from '../utils/optionalMaps';

type Props = MechanicStackScreenProps<'RequestDetails'>;

const c = theme.colors.cartoon;

interface RequestDetail {
  id: string;
  customerName: string;
  customerPhone: string | null;
  problem: string | null;
  status: string;
  locationLat: number | null;
  locationLng: number | null;
  distanceKm: number;
  createdAt: string;
}

function PanelCard({ children, style }: { children: React.ReactNode; style?: { width?: number } }) {
  return (
    <View style={[styles.panelWrap, style]}>
      <View style={styles.panelShadow}>
        <SketchFill />
      </View>
      <View style={styles.panel}>{children}</View>
    </View>
  );
}

export function RequestDetailsScreen({ route, navigation }: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(420, width - theme.spacing.lg * 2);
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const [mechanicId, setMechanicId] = useState<string | null>(null);

  useEffect(() => {
    getMechanicId().then(setMechanicId);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchRequest() {
      const { data, error } = await supabase
        .from('requests')
        .select('id, user_id, status, problem_description, location_lat, location_lng, created_at')
        .eq('id', route.params.requestId)
        .single();

      if (cancelled || error || !data) {
        if (!cancelled) {
          setRequest(null);
          setLoading(false);
        }
        return;
      }

      // Fetch customer name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, phone')
        .eq('id', (data as any).user_id)
        .single();

      if (cancelled) return;

      setRequest({
        id: (data as any).id,
        customerName: (profile as any)?.name ?? 'Customer',
        customerPhone: (profile as any)?.phone ?? null,
        problem: (data as any).problem_description,
        status: (data as any).status,
        locationLat: (data as any).location_lat,
        locationLng: (data as any).location_lng,
        distanceKm: 0,
        createdAt: (data as any).created_at,
      });
      setLoading(false);
    }

    fetchRequest();
    return () => { cancelled = true; };
  }, [route.params.requestId]);

  if (loading) {
    return (
      <ScreenContainer style={styles.screen}>
        <ActivityIndicator size="large" color={c.red} style={{ marginTop: 48 }} />
      </ScreenContainer>
    );
  }

  if (!request) {
    return (
      <ScreenContainer style={styles.screen}>
        <CartoonEmptyState
          icon="file-alert-outline"
          title="Request not found"
          message="This request no longer exists. Try opening another one from Nearby Requests."
        />
      </ScreenContainer>
    );
  }

  const status = localStatus ?? request.status;

  async function handleAccept() {
    if (!mechanicId || !request) return;
    const success = await acceptRequest(request.id, mechanicId);
    if (success) {
      setLocalStatus('accepted');
    }
  }

  function handleReject() {
    navigation.goBack();
  }

  function handleCall() {
    if (request?.customerPhone) {
      Linking.openURL(`tel:${request.customerPhone}`);
    }
  }

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <FloatingIconsBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PanelCard style={{ width: cardWidth }}>
          <View style={styles.rowBetween}>
            <View style={styles.customerRow}>
              <MaterialCommunityIcons name="account-circle" size={36} color={c.blue} />
              <View>
                <Text style={styles.customerName}>{request.customerName}</Text>
                <Text style={styles.statusText}>Status: {requestStatusLabel(status as any)}</Text>
              </View>
            </View>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color={c.mint} />
          </View>
        </PanelCard>

        <PanelCard style={{ width: cardWidth }}>
          <Text style={styles.panelTitle}>Problem</Text>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="car-wrench" size={16} color={c.orange} />
            <Text style={styles.bodyText}>{request.problem ?? 'No description provided'}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="timer-outline" size={16} color={c.purple} />
            <Text style={styles.bodyText}>
              {new Date(request.createdAt).toLocaleString()}
            </Text>
          </View>
        </PanelCard>

        {request.locationLat != null && request.locationLng != null && (
          <PanelCard style={{ width: cardWidth }}>
            <Text style={styles.panelTitle}>Location</Text>
            <OptionalMapView
              style={styles.miniMap}
              initialRegion={{
                latitude: request.locationLat,
                longitude: request.locationLng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
            >
              <OptionalMarker
                coordinate={{ latitude: request.locationLat, longitude: request.locationLng }}
                title={request.customerName}
                description={request.problem ?? undefined}
              />
            </OptionalMapView>
          </PanelCard>
        )}

        {status === 'pending' && (
          <View style={[styles.actionsPanel, { width: cardWidth }]}>
            <View style={styles.actionCell}>
              <CartoonActionButton
                label="Accept"
                variant="accept"
                icon="check-circle-outline"
                onPress={handleAccept}
                fullWidth
              />
            </View>
            <View style={styles.actionCell}>
              <CartoonActionButton
                label="Reject"
                variant="reject"
                icon="close-circle-outline"
                onPress={handleReject}
                fullWidth
              />
            </View>
            <View style={styles.actionCell}>
              <CartoonActionButton
                label="Call"
                variant="primary"
                icon="phone-outline"
                onPress={handleCall}
                fullWidth
              />
            </View>
          </View>
        )}

        {status === 'accepted' && (
          <View style={[styles.actionsPanel, { width: cardWidth }]}>
            <PanelCard>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="check-circle" size={20} color={c.mint} />
                <Text style={[styles.bodyText, { fontWeight: '800', color: c.mint }]}>
                  Request accepted! Go to Jobs to manage.
                </Text>
              </View>
            </PanelCard>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.cream,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md + 4,
    paddingBottom: theme.spacing.xl + theme.layout.tabBarHeight,
    gap: theme.spacing.md,
  },
  panelWrap: {
    position: 'relative',
  },
  panelShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    borderRadius: 20,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  panel: {
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customerName: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: c.charcoal,
  },
  statusText: {
    ...theme.typography.caption,
    color: c.gray,
    marginTop: 2,
  },
  panelTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: c.charcoal,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bodyText: {
    ...theme.typography.body,
    color: c.charcoal,
    flex: 1,
  },
  miniMap: {
    width: '100%',
    height: 190,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  actionsPanel: {
    gap: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  actionCell: {
    width: '48%',
  },
});
