import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, Button } from '../../../components/ui';
import { useCartStore } from '../../../store';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../theme';
import type { UserStackScreenProps } from '../../../types/navigation';

const c = theme.colors.cartoon;

type Props = UserStackScreenProps<'Cart'>;

export function CartScreen({ navigation }: Props) {
  const { user } = useAuth();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const [checkingOut, setCheckingOut] = useState(false);

  const total = items.reduce((sum, i) => {
    const price = parseFloat(i.price.replace(/[^0-9.]/g, '')) || 0;
    return sum + price * i.quantity;
  }, 0);

  async function handleCheckout() {
    if (items.length === 0) {
      Alert.alert('Empty cart', 'Add items from the Store first.');
      return;
    }
    if (!user?.id) {
      Alert.alert('Sign in required', 'Please sign in to checkout.');
      return;
    }
    setCheckingOut(true);
    try {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_price: total,
          status: 'pending',
        })
        .select('id')
        .single();
      if (orderErr || !order) throw orderErr ?? new Error('Failed to create order');

      // Insert into order_line_items (text-based, for display)
      const lineItems = items.map((i) => {
        const price = parseFloat(i.price.replace(/[^0-9.]/g, '')) || 0;
        return { order_id: order.id, product_name: i.name, price, quantity: i.quantity };
      });
      const { error: itemsErr } = await supabase.from('order_line_items').insert(lineItems);
      if (itemsErr) throw itemsErr;

      // Insert into order_items (FK-based, links to products → sellers can see orders)
      const realProductItems = items
        .filter((i) => i.productId !== 'featured') // skip non-DB items
        .map((i) => {
          const price = parseFloat(i.price.replace(/[^0-9.]/g, '')) || 0;
          return { order_id: order.id, product_id: i.productId, price, quantity: i.quantity };
        });
      if (realProductItems.length > 0) {
        const { error: oiErr } = await supabase.from('order_items').insert(realProductItems);
        if (oiErr) console.warn('[Cart] order_items insert error:', oiErr.message);
      }

      clearCart();
      navigation.goBack();
      Alert.alert('Order placed!', `Your order total: $${total.toFixed(2)}. We'll notify you when it ships.`);
    } catch (e: unknown) {
      Alert.alert('Checkout failed', e instanceof Error ? e.message : 'Could not complete order.');
    } finally {
      setCheckingOut(false);
    }
  }

  function handleClearCart() {
    if (items.length === 0) return;
    Alert.alert('Clear cart?', 'Remove all items from your cart.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  }

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={c.charcoal} />
        </TouchableOpacity>
        <Text style={styles.title}>My Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart} activeOpacity={0.8}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="cart-outline" size={80} color={c.gray} />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add items from the Store to get started
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('UserTabs', { screen: 'Store' })}
              activeOpacity={0.8}
            >
              <Text style={styles.shopButtonText}>Go to Store</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {items.map((item) => (
              <View key={item.productId} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    {item.price} × {item.quantity}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeItem(item.productId)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="delete-outline" size={22} color={c.red} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
          </>
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.footer}>
          <Button
            title="Checkout"
            onPress={handleCheckout}
            loading={checkingOut}
            disabled={checkingOut}
            style={styles.checkoutButton}
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: c.creamDark,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: c.charcoal,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '700',
    color: c.red,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 120,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: c.charcoal,
    marginTop: theme.spacing.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: c.gray,
    marginTop: theme.spacing.xs,
  },
  shopButton: {
    marginTop: theme.spacing.lg,
    backgroundColor: c.red,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.md,
    borderRadius: 20,
    marginBottom: theme.spacing.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: c.charcoal,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: c.gray,
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: c.charcoal,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: c.red,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    backgroundColor: c.cream,
    borderTopWidth: 1,
    borderTopColor: c.creamDark,
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: c.red,
  },
});
