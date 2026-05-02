import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer } from '../../../components/ui';
import { CartoonStoreHeader } from '../../../components/ui/CartoonStoreHeader';
import { CartoonFeaturedCard } from '../../../components/ui/CartoonFeaturedCard';
import { CartoonCategoryCard } from '../../../components/ui/CartoonCategoryCard';
import { CartoonProductCard } from '../../../components/ui/CartoonProductCard';
import { useAuth } from '../../../hooks/useAuth';
import { useCartStore } from '../../../store';
import { supabase } from '../../../lib/supabase';
import { theme } from '../../../theme';
import type { UserTabScreenProps } from '../../../types/navigation';

type Props = UserTabScreenProps<'Store'>;

const c = theme.colors.cartoon;

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'store' as const, bgColor: c.creamDark, iconColor: c.charcoal },
  { id: 'tires', label: 'Tires', icon: 'tire' as const, bgColor: c.blueBg, iconColor: c.blue },
  { id: 'batteries', label: 'Batteries', icon: 'car-battery' as const, bgColor: c.yellowBg, iconColor: c.yellow },
  { id: 'oil', label: 'Oil', icon: 'oil' as const, bgColor: c.mintBg, iconColor: c.mint },
  { id: 'filters', label: 'Filters', icon: 'air-filter' as const, bgColor: c.purpleBg, iconColor: c.purple },
  { id: 'accessories', label: 'Accessories', icon: 'wrench' as const, bgColor: c.orangeBg, iconColor: c.orange },
  { id: 'brakes', label: 'Brakes', icon: 'disc' as const, bgColor: c.creamDark, iconColor: c.red },
];

type Product = {
  id: string;
  seller_id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url: string | null;
  description: string | null;
  seller_name: string | null;
  shop_name: string | null;
};

export function UserStoreScreen({ navigation }: Props) {
  const { user } = useAuth();
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.getCount());

  const userName = user?.name?.split(' ')[0] ?? 'Guest';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    async function fetchProducts() {
      setLoading(true);
      // Join products with sellers and profiles to get shop/seller names
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, seller_id, name, category, price, stock, image_url, description,
          sellers (
            shop_name,
            profiles ( name )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[UserStoreScreen] fetch error:', error.message);
        Alert.alert('Error', 'Failed to load products');
      } else if (mounted) {
        const mapped = (data ?? []).map((item: any) => ({
          id: item.id,
          seller_id: item.seller_id,
          name: item.name,
          category: item.category,
          price: item.price,
          stock: item.stock,
          image_url: item.image_url,
          description: item.description,
          seller_name: item.sellers?.profiles?.name ?? null,
          shop_name: item.sellers?.shop_name ?? null,
        }));
        setProducts(mapped);
      }
      if (mounted) setLoading(false);
    }
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  function handleCartPress() {
    const stack = navigation.getParent();
    if (stack && 'navigate' in stack) {
      (stack as { navigate: (name: string) => void }).navigate('Cart');
    }
  }

  function handleAddProduct(productId: string, name: string, price: string) {
    addItem(productId, name, price, 1);
  }

  function handleNotificationPress() {
    Alert.alert('Notifications', 'No new notifications.');
  }

  const scrollRef = useRef<ScrollView>(null);

  function handleCategoryPress(categoryId: string) {
    setSelectedCategory(categoryId);
  }

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  // Group products into pairs
  const productRows = filteredProducts.reduce<Product[][]>((rows, item, i) => {
    if (i % 2 === 0) rows.push([item]);
    else rows[rows.length - 1].push(item);
    return rows;
  }, []);

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      {/* Decorative background blobs */}
      <View style={styles.blobRed} />
      <View style={styles.blobBlue} />
      <View style={styles.blobGreen} />

      <CartoonStoreHeader
        userName={userName}
        notificationCount={0}
        onNotificationPress={handleNotificationPress}
        cartCount={cartCount}
        onCartPress={handleCartPress}
      />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CartoonFeaturedCard
          badge="Best Seller"
          title={'Premium\nEngine Oil'}
          description="Keep your engine happy & smooth!"
          price="$45.99"
          originalPrice="$59.99"
          onAddToCart={() => handleAddProduct('featured', 'Premium Engine Oil', '$45.99')}
          style={styles.featured}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
          style={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => (
            <CartoonCategoryCard
              key={cat.id}
              label={cat.label}
              iconName={cat.icon}
              bgColor={selectedCategory === cat.id ? `${c.red}15` : cat.bgColor}
              iconColor={selectedCategory === cat.id ? c.red : cat.iconColor}
              onPress={() => handleCategoryPress(cat.id)}
            />
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{selectedCategory === 'all' ? 'All Products' : CATEGORIES.find(c => c.id === selectedCategory)?.label}</Text>
          {selectedCategory !== 'all' && (
            <TouchableOpacity onPress={() => setSelectedCategory('all')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>Clear Filter</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={c.red} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.productGrid}>
            {productRows.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: c.gray }}>No products found.</Text>
            ) : (
              productRows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.productRow}>
                  {row.map((product) => {
                    const catTheme = CATEGORIES.find(c => c.id === product.category) || CATEGORIES[0];
                    // Build description: show seller/shop name
                    const sellerLabel = product.shop_name || product.seller_name;
                    const desc = sellerLabel ? `By: ${sellerLabel}` : `Stock: ${product.stock}`;

                    return (
                      <CartoonProductCard
                        key={product.id}
                        name={product.name}
                        description={desc}
                        price={`$${product.price}`}
                        iconName={catTheme.icon}
                        bgColor={catTheme.bgColor}
                        iconColor={catTheme.iconColor}
                        imageUrl={product.image_url}
                        onAddPress={() => handleAddProduct(product.id, product.name, `$${product.price}`)}
                        style={styles.productCard}
                      />
                    );
                  })}
                  {row.length === 1 && <View style={styles.productCard} />}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.cream },
  blobRed: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: `${c.red}12` },
  blobBlue: { position: 'absolute', top: '33%', left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: `${c.blue}12` },
  blobGreen: { position: 'absolute', bottom: '25%', right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: `${c.mint}12` },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: theme.spacing.xl + theme.layout.tabBarHeight },
  featured: { marginHorizontal: theme.spacing.md, marginTop: theme.spacing.xs, marginBottom: theme.spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm, paddingHorizontal: theme.spacing.md + 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: c.charcoal },
  seeAll: { fontSize: 14, fontWeight: '700', color: c.red },
  categoriesScroll: { marginBottom: theme.spacing.lg },
  categoriesContent: { paddingHorizontal: theme.spacing.md, gap: 12 },
  productGrid: { paddingHorizontal: theme.spacing.md },
  productRow: { flexDirection: 'row', marginBottom: theme.spacing.md, gap: theme.spacing.md },
  productCard: { flex: 1, minWidth: 0 },
});
