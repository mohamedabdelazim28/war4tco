import React, { useState, useEffect, useCallback } from 'react';
import {
  Text, StyleSheet, FlatList, View, TouchableOpacity,
  Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, SketchFill, CartoonStoreHeader } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import {
  getSellerIdForUser, fetchSellerOrders, updateOrderStatus,
  type SellerOrder,
} from '../../../lib/sellerHelpers';
import { theme } from '../../../theme';

const c = theme.colors.cartoon;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: c.yellowBg, text: c.yellow },
  paid: { bg: c.blueBg, text: c.blue },
  shipped: { bg: c.purpleBg, text: c.purple },
  delivered: { bg: c.mintBg, text: c.mint },
  cancelled: { bg: `${c.red}15`, text: c.red },
};

const NEXT_STATUS: Record<string, string> = {
  pending: 'paid',
  paid: 'shipped',
  shipped: 'delivered',
};

export function OrdersScreen() {
  const { user } = useAuth();
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const displayName = user?.name?.split(' ')[0] ?? 'Seller';

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    const sid = await getSellerIdForUser(user.id);
    setSellerId(sid);
    if (sid) {
      const data = await fetchSellerOrders(sid);
      setOrders(data);
    }
  }, [user?.id]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleUpdateStatus(order: SellerOrder) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;

    Alert.alert(
      'Update Status',
      `Move order to "${next.toUpperCase()}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await updateOrderStatus(order.id, next);
              await loadData();
            } catch (err: unknown) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to update.');
            }
          },
        },
      ]
    );
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const ListHeader = (
    <>
      <CartoonStoreHeader
        userName={displayName}
        notificationCount={orders.filter(o => o.status === 'pending').length}
        onNotificationPress={() => {}}
      />
      <View style={styles.headerContainer}>
        <Text style={styles.pageTitle}>Orders ({orders.length})</Text>
        <Text style={styles.pageSubtitle}>Track and fulfill customer orders</Text>
      </View>
    </>
  );

  if (loading) {
    return (
      <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
        {ListHeader}
        <ActivityIndicator size="large" color={c.red} style={{ marginTop: 40 }} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.blobRed} />
      <View style={styles.blobMint} />

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={c.red} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={c.gray} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>Orders will appear here when customers buy your products</Text>
          </View>
        }
        renderItem={({ item }) => {
          const statusTheme = STATUS_COLORS[item.status] ?? STATUS_COLORS.pending;
          const canAdvance = !!NEXT_STATUS[item.status];

          return (
            <View style={styles.cardWrap}>
              <View style={styles.cardShadow}><SketchFill /></View>
              <View style={styles.cardInfo}>
                {/* Header: Order ID + Status */}
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId}>
                    #{item.id.slice(0, 8).toUpperCase()}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
                    <Text style={[styles.statusText, { color: statusTheme.text }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Buyer info */}
                <View style={styles.buyerRow}>
                  <MaterialCommunityIcons name="account-outline" size={16} color={c.gray} />
                  <Text style={styles.buyerName}>{item.buyer_name}</Text>
                </View>

                {/* Order items */}
                <View style={styles.itemsContainer}>
                  {item.items.map((oi) => (
                    <View key={oi.id} style={styles.orderItemRow}>
                      <Text style={styles.orderItemName} numberOfLines={1}>
                        {oi.product_name}
                      </Text>
                      <Text style={styles.orderItemQty}>×{oi.quantity}</Text>
                      <Text style={styles.orderItemPrice}>${(oi.price * oi.quantity).toFixed(2)}</Text>
                    </View>
                  ))}
                </View>

                {/* Footer: Date + Total + Action */}
                <View style={styles.cardFooter}>
                  <View style={styles.footerLeft}>
                    <View style={styles.dateRow}>
                      <MaterialCommunityIcons name="calendar-month-outline" size={14} color={c.gray} />
                      <Text style={styles.date}>{formatDate(item.created_at)}</Text>
                    </View>
                    <Text style={styles.totalPrice}>${item.total_price.toFixed(2)}</Text>
                  </View>

                  {canAdvance && (
                    <TouchableOpacity
                      style={styles.advanceButton}
                      onPress={() => handleUpdateStatus(item)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
                      <Text style={styles.advanceText}>
                        {NEXT_STATUS[item.status]?.charAt(0).toUpperCase() +
                          NEXT_STATUS[item.status]?.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.cream },
  blobRed: {
    position: 'absolute', top: -40, left: -40, width: 160, height: 160,
    borderRadius: 80, backgroundColor: `${c.red}12`, zIndex: 0,
  },
  blobMint: {
    position: 'absolute', bottom: '20%', right: -20, width: 100, height: 100,
    borderRadius: 50, backgroundColor: `${c.mint}12`, zIndex: 0,
  },
  headerContainer: { paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.sm, marginBottom: theme.spacing.md },
  pageTitle: { fontSize: 24, fontWeight: '900', color: c.charcoal },
  pageSubtitle: { fontSize: 14, fontWeight: '600', color: c.gray, marginTop: 4 },
  list: { paddingBottom: theme.spacing.xl + theme.layout.tabBarHeight },

  // Card
  cardWrap: { position: 'relative', marginBottom: theme.spacing.lg, marginHorizontal: theme.spacing.md },
  cardShadow: {
    position: 'absolute', top: 6, left: 6, right: -6, bottom: -6,
    borderRadius: 18, backgroundColor: theme.colors.lightAccent,
    borderWidth: 2, borderColor: theme.colors.borderCardLight, overflow: 'hidden',
  },
  cardInfo: {
    backgroundColor: '#FFFFFF', borderRadius: 18,
    borderWidth: 2, borderColor: theme.colors.borderCardLight, padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  orderId: { fontSize: 12, fontWeight: '800', color: c.gray, letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800' },

  // Buyer
  buyerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  buyerName: { fontSize: 14, fontWeight: '700', color: c.charcoal },

  // Items
  itemsContainer: {
    backgroundColor: c.cream, borderRadius: 12, padding: 10, marginBottom: 12,
  },
  orderItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  orderItemName: { flex: 1, fontSize: 13, fontWeight: '600', color: c.charcoal },
  orderItemQty: { fontSize: 12, fontWeight: '700', color: c.gray, marginHorizontal: 8 },
  orderItemPrice: { fontSize: 13, fontWeight: '800', color: c.red },

  // Footer
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: c.creamDark,
  },
  footerLeft: { gap: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  date: { fontSize: 12, fontWeight: '600', color: c.gray },
  totalPrice: { fontSize: 18, fontWeight: '900', color: c.charcoal },

  advanceButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: c.red, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
  },
  advanceText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },

  // Empty
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: c.charcoal, marginTop: 16 },
  emptySubtitle: { fontSize: 14, fontWeight: '600', color: c.gray, textAlign: 'center', marginTop: 8 },
});
