import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  StyleSheet,
  Alert,
  Animated,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ScreenContainer,
  HomeHeader,
  HeroCard,
  ActionCard,
  ActivityItem,
  PromoBanner,
  FloatingIconsBackground,
  CartoonProductCard,
} from '../../../components/ui';
import { useCartStore } from '../../../store';
import { getCurrentPosition } from '../../../utils/location';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store';
import { theme } from '../../../theme';
import type { UserTabScreenProps } from '../../../types/navigation';

type Props = UserTabScreenProps<'Home'>;

const HEADER_HEIGHT = 60;

/** Activity card backgrounds: cycle per card (cartoon style) */
const CARD_COLORS = ['#3fc5fc', '#fa4186', '#b942fc'] as const;

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const RECENT_ACTIVITY_VISIBLE_COUNT = 5;

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url: string | null;
};

const CATEGORY_STYLE_MAP: Record<string, { icon: any, bgColor: string, iconColor: string }> = {
  tires: { icon: 'tire', bgColor: '#E8F4FF', iconColor: '#6EC6FF' },
  batteries: { icon: 'car-battery', bgColor: '#FFF8E8', iconColor: '#FFD66B' },
  oil: { icon: 'oil', bgColor: '#E8FFF3', iconColor: '#7EEAB3' },
  filters: { icon: 'air-filter', bgColor: '#F3ECFF', iconColor: '#C4A1FF' },
  accessories: { icon: 'wrench', bgColor: '#FFF0E5', iconColor: '#FFA756' },
  brakes: { icon: 'disc', bgColor: '#FCEAEA', iconColor: '#FF6B6B' },
};

type ActivityItemData = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  amount: string;
  icon: 'truck-delivery' | 'car-wrench' | 'oil' | 'car-brake-parking' | 'calendar-today' | 'hammer-wrench' | 'shopping';
  iconColor: string;
  amountMuted: boolean;
  sortAt?: number;
};

function formatActivityDate(d: string, time?: string) {
  const date = new Date(d + (time ? `T${time}` : 'Z'));
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ACTIVITY_PAGE_GAP = 12;
const ACTIVITY_CARD_HEIGHT = 200;
const RECENT_ACTIVITY_BLOCK_HEIGHT = 800;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const user = useAuthStore((state) => state.user);
  const cartItems = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<ActivityItemData[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const displayActivities = [
    ...cartItems.map((cItem, i) => ({
      id: `cart-${cItem.productId}-${i}`,
      title: 'Added to Cart',
      subtitle: `${cItem.name} (x${cItem.quantity})`,
      status: 'In Cart',
      amount: cItem.price,
      icon: 'shopping' as const,
      iconColor: theme.colors.cartoon.orange,
      amountMuted: false,
    })),
    ...activities,
  ].slice(0, RECENT_ACTIVITY_VISIBLE_COUNT);

  const activityPageWidth = windowWidth - 2 * theme.spacing.md - 2 * theme.spacing.lg;
  const activityCardWidth = (activityPageWidth - 2 * ACTIVITY_PAGE_GAP) / 3;
  const activityPages = chunk(displayActivities, 3);

  const headerTop = insets.top;
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -(headerTop + HEADER_HEIGHT)],
    extrapolate: 'clamp',
  });

  const scrollPaddingTop = headerTop + HEADER_HEIGHT - 18;

  const heroAnim = useRef(new Animated.Value(0)).current;
  const actionRowAnim = useRef(new Animated.Value(0)).current;
  const activityAnim = useRef(new Animated.Value(0)).current;
  const storeAnim = useRef(new Animated.Value(0)).current;
  const promoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    async function fetchActivities() {
      const [requestsRes, bookingsRes, productsRes] = await Promise.all([
        supabase
          .from('requests')
          .select('id, status, problem_description, price, created_at')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('bookings')
          .select('id, date, time, status')
          .eq('user_id', user!.id)
          .order('date', { ascending: false })
          .order('time', { ascending: false })
          .limit(10),
        supabase
          .from('products')
          .select('id, name, category, price, stock, image_url')
          .order('created_at', { ascending: false })
          .limit(4),
      ]);
      if (cancelled) return;
      const items: ActivityItemData[] = [];
      
      setProducts((productsRes.data as Product[]) ?? []);
      (requestsRes.data ?? []).forEach((r) => {
        items.push({
          id: `req-${r.id}`,
          title: r.problem_description || 'Mechanic request',
          subtitle: `${formatActivityDate(r.created_at)} • Request`,
          status: r.status.replace('_', ' '),
          amount: r.price != null ? `$${Number(r.price).toFixed(2)}` : '—',
          icon: r.status === 'accepted' || r.status === 'in_progress' ? 'hammer-wrench' : 'car-wrench',
          iconColor: theme.colors.primary,
          amountMuted: r.status === 'pending' || r.status === 'cancelled',
          sortAt: new Date(r.created_at).getTime(),
        });
      });
      (bookingsRes.data ?? []).forEach((b) => {
        const dt = new Date(`${b.date}T${b.time}`).getTime();
        items.push({
          id: `book-${b.id}`,
          title: 'Scheduled appointment',
          subtitle: `${formatActivityDate(b.date, b.time)} • Booking`,
          status: b.status === 'pending' ? 'Scheduled' : b.status.replace('_', ' '),
          amount: b.status === 'pending' ? 'Upcoming' : b.status === 'completed' ? 'Done' : '—',
          icon: 'calendar-today',
          iconColor: theme.colors.purple,
          amountMuted: b.status !== 'pending',
          sortAt: dt,
        });
      });
      items.sort((a, b) => (b.sortAt ?? 0) - (a.sortAt ?? 0));
      setActivities(items.slice(0, RECENT_ACTIVITY_VISIBLE_COUNT));
    }
    fetchActivities();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(actionRowAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(activityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(storeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(promoAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroAnim, actionRowAnim, activityAnim, storeAnim, promoAnim]);

  const fadeIn = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
      },
    ],
  });

  async function handleRequestMechanic() {
    if (!user?.id) {
      Alert.alert('Error', 'You must be signed in to request a mechanic.');
      return;
    }
    setLoading(true);
    try {
      const location = await getCurrentPosition();
      if (!location) {
        Alert.alert(
          'Location required',
          'Please enable location access to request a mechanic.'
        );
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('requests')
        .insert({
          user_id: user.id,
          status: 'pending',
          location_lat: location.coords.latitude,
          location_lng: location.coords.longitude,
        })
        .select('id')
        .single();

      if (error) {
        Alert.alert('Error', error.message);
        setLoading(false);
        return;
      }
      const stack = navigation.getParent();
      if (stack) {
        (stack as { navigate: (name: string, params: { requestId: string }) => void }).navigate(
          'Searching',
          { requestId: data.id }
        );
      }
    } finally {
      setLoading(false);
    }
  }

  function handleBookMechanic() {
    const stack = navigation.getParent();
    if (stack && 'navigate' in stack) {
      (stack as { navigate: (name: string) => void }).navigate('MechanicList');
    }
  }

  function handleGoToStore() {
    navigation.navigate('Store');
  }

  function handleAddStoreItem(productId: string, name: string, price: string) {
    addItem(productId, name, price, 1);
  }

  const displayUser = {
    name: user?.name ?? 'Guest',
    avatarUri: undefined as string | undefined,
  };

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <FloatingIconsBackground />
      <Animated.View
        style={[
          styles.headerWrapper,
          {
            top: headerTop,
            transform: [{ translateY: headerTranslate }],
          },
        ]}
      >
        <HomeHeader
          user={displayUser}
          notifications={{ unread: true }}
          onNotificationPress={() => { }}
          light
        />
      </Animated.View>
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: scrollPaddingTop }]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={fadeIn(heroAnim)}>
          <HeroCard
            title="Emergency Mechanic"
            description="Stuck on the road? Tap to request immediate assistance to your location."
            icon="tow-truck"
            buttonText="Request Now"
            onPress={handleRequestMechanic}
            badge="Emergency"
            loading={loading}
            lightBackground
          />
        </Animated.View>

        <Animated.View style={[styles.storeSection, fadeIn(storeAnim)]}>
          <View style={styles.recentActivityHeader}>
            <Text style={styles.recentActivityTitle}>Recent Activity</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Bookings')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllButtonText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storeScrollContent}
          >
            {products.map((item) => {
              const style = CATEGORY_STYLE_MAP[item.category] || CATEGORY_STYLE_MAP['accessories'];
              return (
                <CartoonProductCard
                  key={item.id}
                  name={item.name}
                  description={`Stock: ${item.stock}`}
                  price={`$${item.price}`}
                  iconName={style.icon}
                  bgColor={style.bgColor}
                  iconColor={style.iconColor}
                  imageUrl={item.image_url}
                  onAddPress={() => handleAddStoreItem(item.id, item.name, `$${item.price}`)}
                  compact
                  style={styles.storeCard}
                />
              );
            })}
          </ScrollView>
        </Animated.View>

        <Animated.View style={[styles.actionRow, fadeIn(actionRowAnim)]}>
          <ActionCard
            title="Book Service"
            subtitle="Maintenance & Repairs"
            icon="calendar-month"
            bgColor={theme.colors.success}
            onPress={handleBookMechanic}
            lightBackground
            style={styles.actionCard}
          />
          <ActionCard
            title="Parts Store"
            subtitle="Buy Genuine Parts"
            icon="shopping"
            bgColor={theme.colors.secondary}
            onPress={handleGoToStore}
            lightBackground
            style={styles.actionCard}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.recentActivityBlock,
            { marginTop: theme.spacing.lg },
            fadeIn(activityAnim),
          ]}
        >
          <View style={styles.recentActivityHeader}>
            <Text style={styles.recentActivityTitle}>Recent Activity</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Bookings')}
              style={styles.seeAllButton}
            >
              <Text style={styles.seeAllButtonText}>See All</Text>
            </TouchableOpacity>
          </View>

          {displayActivities.length === 0 ? (
            <Text style={styles.emptyActivity}>
              No recent activity. Book a mechanic or add products to cart.
            </Text>
          ) : (
            <FlatList
              data={activityPages}
              keyExtractor={(_, pageIndex) => `activity-page-${pageIndex}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({ item: pageItems, index: pageIndex }) => (
                <View style={[styles.activityPage, { width: activityPageWidth }]}>
                  {pageItems.map((item, i) => {
                    const globalIndex = pageIndex * 3 + i;
                    const bgColor = CARD_COLORS[globalIndex % CARD_COLORS.length];
                    return (
                      <ActivityItem
                        key={item.id}
                        title={item.title}
                        subtitle={item.subtitle}
                        status={item.status}
                        amount={item.amount}
                        icon={item.icon}
                        iconColor={theme.colors.white}
                        amountMuted={item.amountMuted}
                        backgroundColor={bgColor}
                        useLightText={false}
                        useRedText={false}
                        shadowBackgroundColor={theme.colors.cartoon.creamDark}
                        variant="light"
                        style={StyleSheet.flatten([
                          styles.activityItem,
                          { width: '95%' }, // طول ثابت
                        ])}
                      />
                    );
                  })}
                </View>
              )}
            />
          )}
        </Animated.View>

        <Animated.View style={[{ marginTop: theme.spacing.lg }, fadeIn(promoAnim)]}>
          <PromoBanner
            title="Pro Membership"
            subtitle="Get 20% off on your first tow"
            icon="percent"
            light
          />
        </Animated.View>
      </Animated.ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
  },
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.layout.tabBarHeight,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  actionCard: {
    flex: 1,
  },
  recentActivityBlock: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    height: 600
  },
  recentActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  recentActivityTitle: {
    ...theme.typography.subtitle,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textOnLight,
  },
  seeAllButton: {
    backgroundColor: theme.colors.cartoon.charcoal,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,

  },

  seeAllShadowWrapper: {
    backgroundColor: theme.colors.cartoon.creamDark, 
  borderRadius: theme.radius.md,
  transform: [{ translateX: 4 }, { translateY: 4 }],

  },

  seeAllButtonText: {
    ...theme.typography.fontSize,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.white,
    fontWeight: '700',
  },

  activityPage: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ACTIVITY_PAGE_GAP,
  },
  activityItem: {
    marginBottom: 0,
    justifyContent: 'center',
  },
  storeSection: {
    marginTop: theme.spacing.md,
  },
  storeScrollContent: {
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  storeCard: {
    width: 89,
    flex: 0,
  },
  emptyActivity: {
    ...theme.typography.body,
    color: theme.colors.muted,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
});
