import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  useWindowDimensions,
  Animated,
  PanResponder,
  Linking,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ScreenContainer,
  CartoonJobCard,
  CartoonJobCardSkeleton,
  CartoonEmptyState,
  FloatingIconsBackground,
  SketchFill,
} from '../../../components/ui';
import type { MechanicTabScreenProps } from '../../../types/navigation';
import { theme } from '../../../theme';
import {
  getMechanicId,
  fetchMechanicJobs,
  updateRequestStatus,
  type MechanicJob,
} from '../../../lib/mechanicHelpers';
import type { JobStatus } from '../../../components/ui';

type Props = MechanicTabScreenProps<'Jobs'>;

const c = theme.colors.cartoon;

/* ─── Status tab definitions ─── */

type StatusTab = { key: JobStatus; label: string; color: string; bg: string; dbStatus: string };

const STATUS_TABS: StatusTab[] = [
  { key: 'on_the_way', label: 'On the way', color: c.blue, bg: c.blueBg, dbStatus: 'accepted' },
  { key: 'working', label: 'Working', color: c.orange, bg: c.orangeBg, dbStatus: 'in_progress' },
  { key: 'completed', label: 'Completed', color: c.red, bg: c.creamDark, dbStatus: 'completed' },
];

/* ─── Per-tab empty state config ─── */

const emptyStateConfig: Record<
  JobStatus,
  { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; title: string; message: string }
> = {
  on_the_way: {
    icon: 'truck-fast-outline',
    title: 'No jobs on the way',
    message: 'Accept a request to start a new job.',
  },
  working: {
    icon: 'wrench-outline',
    title: 'No active work',
    message: "You're not working on anything right now.",
  },
  completed: {
    icon: 'check-circle-outline',
    title: 'No completed jobs',
    message: 'Finished jobs will appear here.',
  },
};

/* ─── Swipeable card wrapper ─── */

const SWIPE_THRESHOLD = 70;
const SWIPE_ACTION_WIDTH = 70;
const ENABLE_SWIPE = true;

function SwipeableCard({
  children,
  onCall,
  onNavigate,
  enabled = true,
}: {
  children: React.ReactNode;
  onCall?: () => void;
  onNavigate?: () => void;
  enabled?: boolean;
}) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        enabled && Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy * 1.5),
      onPanResponderMove: (_, gs) => {
        if (gs.dx < 0) {
          translateX.setValue(Math.max(gs.dx, -(SWIPE_ACTION_WIDTH * 2)));
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -SWIPE_THRESHOLD) {
          Animated.spring(translateX, {
            toValue: -(SWIPE_ACTION_WIDTH * 2),
            useNativeDriver: true,
            friction: 8,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  if (!enabled) return <>{children}</>;

  return (
    <View style={swipeStyles.container}>
      <View style={swipeStyles.actionsRow}>
        <Pressable style={[swipeStyles.action, { backgroundColor: c.blue }]} onPress={onCall}>
          <MaterialCommunityIcons name="phone" size={20} color="#FFFFFF" />
          <Text style={swipeStyles.actionLabel}>Call</Text>
        </Pressable>
        <Pressable style={[swipeStyles.action]} onPress={onNavigate}>
          <MaterialCommunityIcons name="navigation-variant-outline" size={20} color="#FFFFFF" />
          <Text style={swipeStyles.actionLabel}>Navigate</Text>
        </Pressable>
      </View>
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
        {children}
      </Animated.View>
    </View>
  );
}

const swipeStyles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 22,
    marginBottom: theme.spacing.md,
    width: '100%',
    alignSelf: 'center',
  },
  actionsRow: {
    position: 'absolute',
    top: 0,
    bottom: theme.spacing.md,
    right: 0,
    flexDirection: 'row',
    width: SWIPE_ACTION_WIDTH * 2,
    borderRadius: 22,
    overflow: 'hidden',
  },
  action: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

/* ─── Loading skeleton list ─── */

function JobsSkeleton() {
  return (
    <View style={{ paddingTop: 4 }}>
      <CartoonJobCardSkeleton />
      <CartoonJobCardSkeleton />
      <CartoonJobCardSkeleton />
    </View>
  );
}

/* ─── Map DB status to UI status ─── */
function mapDbStatusToJobStatus(dbStatus: string): JobStatus {
  if (dbStatus === 'accepted') return 'on_the_way';
  if (dbStatus === 'in_progress') return 'working';
  return 'completed';
}

/* ─── Main screen ─── */

export function JobsScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const [jobs, setJobs] = useState<MechanicJob[]>([]);
  const [activeTab, setActiveTab] = useState<JobStatus>('on_the_way');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mechanicId, setMechanicId] = useState<string | null>(null);
  const isTablet = width >= 920;

  useEffect(() => {
    getMechanicId().then(setMechanicId);
  }, []);

  const loadJobs = useCallback(async () => {
    if (!mechanicId) return;
    const data = await fetchMechanicJobs(mechanicId);
    setJobs(data);
    setLoading(false);
  }, [mechanicId]);

  useEffect(() => {
    if (mechanicId) {
      loadJobs();
    }
  }, [mechanicId, loadJobs]);

  const filteredJobs = useMemo(() => {
    const tabConfig = STATUS_TABS.find((t) => t.key === activeTab);
    if (!tabConfig) return [];
    return jobs.filter((job) => job.status === tabConfig.dbStatus);
  }, [activeTab, jobs]);

  const counts = useMemo(
    () => ({
      on_the_way: jobs.filter((j) => j.status === 'accepted').length,
      working: jobs.filter((j) => j.status === 'in_progress').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
    }),
    [jobs],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  }, [loadJobs]);

  const handleStartJob = useCallback(async (jobId: string) => {
    const success = await updateRequestStatus(jobId, 'in_progress');
    if (success) {
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: 'in_progress' } : job,
        ),
      );
    }
  }, []);

  const handleCompleteJob = useCallback(async (jobId: string) => {
    const success = await updateRequestStatus(jobId, 'completed');
    if (success) {
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, status: 'completed', completedAt: new Date().toISOString() }
            : job,
        ),
      );
    }
  }, []);

  const handleCall = useCallback((phone?: string | null) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  }, []);

  const handleNavigate = useCallback((lat: number | null, lng: number | null) => {
    if (lat == null || lng == null) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}`,
      default: `https://maps.google.com/?q=${lat},${lng}`,
    });
    if (url) Linking.openURL(url);
  }, []);

  const emptyConfig = emptyStateConfig[activeTab];

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <FloatingIconsBackground />

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jobs</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerBtn}>
            <MaterialCommunityIcons name="magnify" size={20} color={c.charcoal} />
          </Pressable>
          <Pressable style={styles.headerBtn}>
            <MaterialCommunityIcons name="filter-variant" size={20} color={c.charcoal} />
          </Pressable>
        </View>
      </View>

      {/* ─── Status tabs ─── */}
      <View style={styles.tabsRow}>
        {STATUS_TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={styles.tabWrap}
            >
              <View style={[styles.tabShadow, active && styles.tabShadowActive]}>
                <SketchFill />
              </View>
              <View
                style={[
                  styles.tab,
                  { backgroundColor: active ? c.creamDark : '#FFFFFF' },
                  active && { borderColor: c.red },
                ]}
              >
                <Text style={[styles.tabCount, active && { color: c.red }]}>{counts[tab.key]}</Text>
                <Text style={[styles.tabLabel, active && { color: c.red }]}>{tab.label}</Text>
                {active && <View style={[styles.tabIndicator, { backgroundColor: c.red }]} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* ─── Filter / Sort bar ─── */}
      <View style={styles.filterBar}>
        <View style={styles.filterBtnGroup}>
          <Pressable style={styles.filterBtn}>
            <MaterialCommunityIcons name="filter-outline" size={16} color={c.charcoal} />
            <Text style={styles.filterBtnText}>Filter</Text>
          </Pressable>
          <Pressable style={styles.filterBtn}>
            <MaterialCommunityIcons name="sort-variant" size={16} color={c.charcoal} />
            <Text style={styles.filterBtnText}>Sort</Text>
          </Pressable>
        </View>
        <Text style={styles.resultCount}>
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* ─── Job list ─── */}
      {loading ? (
        <JobsSkeleton />
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id}
          numColumns={isTablet ? 2 : 1}
          columnWrapperStyle={isTablet ? styles.columns : undefined}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={c.red}
            />
          }
          ListEmptyComponent={
            <CartoonEmptyState
              icon={emptyConfig.icon}
              title={emptyConfig.title}
              message={emptyConfig.message}
            />
          }
          renderItem={({ item }) => {
            const uiStatus = mapDbStatusToJobStatus(item.status);
            return (
              <View style={[styles.itemWrap, isTablet && styles.itemWrapTablet]}>
                <SwipeableCard
                  enabled={ENABLE_SWIPE && item.status !== 'completed'}
                  onCall={() => handleCall(item.customerPhone)}
                  onNavigate={() => handleNavigate(item.locationLat, item.locationLng)}
                >
                  <CartoonJobCard
                    customerName={item.customerName}
                    problem={item.problem ?? 'No description'}
                    status={uiStatus}
                    eta={uiStatus === 'completed' ? 'Completed' : 'Active'}
                    distanceKm={0}
                    startTime={item.createdAt ? formatTime(item.createdAt) : undefined}
                    endTime={item.completedAt ? formatTime(item.completedAt) : undefined}
                    priceLabel="—"
                    serviceType={item.problem?.substring(0, 30) ?? 'Service'}
                    locationLabel={
                      item.locationLat != null
                        ? `${item.locationLat.toFixed(3)}, ${item.locationLng?.toFixed(3)}`
                        : 'Location N/A'
                    }
                    scheduledTime={formatTime(item.createdAt)}
                    onPress={() => {
                      navigation.navigate('ActiveJob', { requestId: item.id });
                    }}
                    onStartJob={() => handleStartJob(item.id)}
                    onCompleteJob={() => handleCompleteJob(item.id)}
                    onViewDetails={() => {
                      navigation.navigate('ActiveJob', { requestId: item.id });
                    }}
                  />
                </SwipeableCard>
              </View>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

/* ─── styles ─── */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md + 4,
  },
  headerTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    color: c.charcoal,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    backgroundColor: c.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md + 4,
  },
  tabWrap: {
    flex: 1,
    position: 'relative',
  },
  tabShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: 16,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  tabShadowActive: {
    backgroundColor: c.redLight,
  },
  tab: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    minHeight: 60,
    position: 'relative',
  },
  tabCount: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    color: c.charcoal,
  },
  tabLabel: {
    ...theme.typography.caption,
    color: c.gray,
    fontWeight: '700',
    textAlign: 'center',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 6,
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    height: 3,
    borderRadius: 999,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md + 4,
  },
  filterBtnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    backgroundColor: c.cream,
  },
  filterBtnText: {
    ...theme.typography.caption,
    color: c.charcoal,
    fontWeight: '700',
  },
  resultCount: {
    ...theme.typography.caption,
    color: c.gray,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: theme.spacing.md + 4,
    paddingBottom: theme.spacing.xl + theme.layout.tabBarHeight,
  },
  columns: {
    gap: theme.spacing.sm,
  },
  itemWrap: {
    width: '100%',
  },
  itemWrapTablet: {
    flex: 1,
  },
});
