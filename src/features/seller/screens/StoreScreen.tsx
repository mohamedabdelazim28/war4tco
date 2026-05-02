import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal,
  TextInput, Alert, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer, CartoonStoreHeader, SketchFill } from '../../../components/ui';
import { useAuth } from '../../../hooks/useAuth';
import {
  getSellerIdForUser, fetchSellerProducts, addProduct, deleteProduct,
  uploadProductImage,
  type SellerProduct,
} from '../../../lib/sellerHelpers';
import { theme } from '../../../theme';

const c = theme.colors.cartoon;

const CATEGORIES = [
  { id: 'tires', label: 'Tires', icon: 'tire' as const, bgColor: c.blueBg, iconColor: c.blue },
  { id: 'batteries', label: 'Batteries', icon: 'car-battery' as const, bgColor: c.yellowBg, iconColor: c.yellow },
  { id: 'oil', label: 'Oil', icon: 'oil' as const, bgColor: c.mintBg, iconColor: c.mint },
  { id: 'filters', label: 'Filters', icon: 'air-filter' as const, bgColor: c.purpleBg, iconColor: c.purple },
  { id: 'accessories', label: 'Accessories', icon: 'wrench' as const, bgColor: c.orangeBg, iconColor: c.orange },
  { id: 'brakes', label: 'Brakes', icon: 'disc' as const, bgColor: c.creamDark, iconColor: c.red },
];

function getCategoryTheme(category: string | null) {
  return CATEGORIES.find(cat => cat.id === category) ?? {
    id: 'other', label: 'Other', icon: 'package-variant' as const, bgColor: c.blueBg, iconColor: c.blue
  };
}

export function StoreScreen() {
  const { user } = useAuth();
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // New product form
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const displayName = user?.name?.split(' ')[0] ?? 'Seller';

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    const sid = await getSellerIdForUser(user.id);
    setSellerId(sid);
    if (sid) {
      const prods = await fetchSellerProducts(sid);
      setProducts(prods);
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

  function resetForm() {
    setNewName('');
    setNewDescription('');
    setNewPrice('');
    setNewStock('');
    setNewCategory('');
    setSelectedImageUri(null);
  }

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload product images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImageUri(result.assets[0].uri);
    }
  }

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access to take product photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelectedImageUri(result.assets[0].uri);
    }
  }

  function handleImagePress() {
    Alert.alert('Add Product Image', 'Choose an option', [
      { text: 'Camera', onPress: handleTakePhoto },
      { text: 'Photo Library', onPress: handlePickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function handleAddProduct() {
    if (!newName.trim()) {
      Alert.alert('Missing Info', 'Product name is required.');
      return;
    }
    if (!newPrice.trim() || isNaN(parseFloat(newPrice))) {
      Alert.alert('Missing Info', 'Valid price is required.');
      return;
    }
    if (!newCategory) {
      Alert.alert('Missing Info', 'Please select a category.');
      return;
    }
    if (!selectedImageUri) {
      Alert.alert('Missing Info', 'Please add a product image.');
      return;
    }
    if (!sellerId || !user?.id) {
      Alert.alert('Error', 'Seller account not found. Try logging out and in again.');
      return;
    }

    setSaving(true);
    try {
      // Upload image first
      const imageUrl = await uploadProductImage(user.id, selectedImageUri);
      if (!imageUrl) {
        Alert.alert('Upload Failed', 'Could not upload the product image. Please try again.');
        setSaving(false);
        return;
      }

      await addProduct(sellerId, {
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        price: parseFloat(newPrice),
        category: newCategory,
        stock: parseInt(newStock, 10) || 0,
        image_url: imageUrl,
      });
      resetForm();
      setModalVisible(false);
      await loadData();
      Alert.alert('Success', 'Product added successfully!');
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to add product.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(product: SellerProduct) {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              await loadData();
            } catch (err: unknown) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete.');
            }
          },
        },
      ]
    );
  }

  // Group products in pairs for 2-column grid
  const productRows = products.reduce<SellerProduct[][]>((rows, item, i) => {
    if (i % 2 === 0) rows.push([item]);
    else rows[rows.length - 1].push(item);
    return rows;
  }, []);

  return (
    <ScreenContainer style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.blobRed} />
      <View style={styles.blobBlue} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={c.red} />
        }
      >
        <CartoonStoreHeader
          userName={displayName}
          notificationCount={0}
          onNotificationPress={() => {}}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Products ({products.length})</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.7}>
            <View style={styles.addNewButton}>
              <MaterialCommunityIcons name="plus" size={16} color={c.red} />
              <Text style={styles.sectionLink}>Add New</Text>
            </View>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={c.red} style={{ marginTop: 40 }} />
        ) : products.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant" size={64} color={c.gray} />
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptySubtitle}>Tap "Add New" to list your first product</Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {productRows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.productRow}>
                {row.map((product) => {
                  const catTheme = getCategoryTheme(product.category);
                  return (
                    <View key={product.id} style={styles.productCard}>
                      <View style={styles.cardShadow}><SketchFill /></View>
                      <View style={styles.card}>
                        {/* Delete button */}
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteProduct(product)}
                          activeOpacity={0.8}
                        >
                          <MaterialCommunityIcons name="delete-outline" size={16} color="#FFFFFF" />
                        </TouchableOpacity>

                        {/* Image/Icon area */}
                        <View style={[styles.illustrationArea, { backgroundColor: catTheme.bgColor }]}>
                          {product.image_url ? (
                            <Image source={{ uri: product.image_url }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                          ) : (
                            <MaterialCommunityIcons name={catTheme.icon} size={42} color={catTheme.iconColor} />
                          )}
                        </View>

                        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                        {product.description ? (
                          <Text style={styles.productDesc} numberOfLines={1}>{product.description}</Text>
                        ) : null}

                        <View style={styles.productFooter}>
                          <View style={styles.priceBadge}>
                            <Text style={styles.priceText}>${product.price}</Text>
                          </View>
                          <Text style={styles.stockText}>Stock: {product.stock}</Text>
                        </View>

                        {/* Category tag */}
                        <View style={[styles.categoryTag, { backgroundColor: catTheme.bgColor }]}>
                          <Text style={[styles.categoryTagText, { color: catTheme.iconColor }]}>
                            {catTheme.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
                {row.length === 1 && <View style={styles.productCard} />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add New Product Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Product</Text>
                <TouchableOpacity onPress={() => { resetForm(); setModalVisible(false); }}>
                  <MaterialCommunityIcons name="close" size={24} color={c.charcoal} />
                </TouchableOpacity>
              </View>

              {/* Product Image Picker */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Image *</Text>
                <TouchableOpacity
                  style={styles.imagePickerBox}
                  onPress={handleImagePress}
                  activeOpacity={0.7}
                >
                  {selectedImageUri ? (
                    <Image source={{ uri: selectedImageUri }} style={styles.imagePreview} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <MaterialCommunityIcons name="camera-plus-outline" size={40} color={c.gray} />
                      <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                    </View>
                  )}
                  {selectedImageUri && (
                    <View style={styles.imageChangeOverlay}>
                      <MaterialCommunityIcons name="camera" size={20} color="#FFFFFF" />
                      <Text style={styles.imageChangeText}>Change</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Product Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Premium Engine Oil 5W-30"
                  placeholderTextColor={c.gray}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  placeholder="Describe your product..."
                  placeholderTextColor={c.gray}
                  value={newDescription}
                  onChangeText={setNewDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category *</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryButton,
                        newCategory === cat.id && styles.categoryButtonActive,
                        newCategory === cat.id && { borderColor: cat.iconColor },
                      ]}
                      onPress={() => setNewCategory(cat.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.categoryIconBox, { backgroundColor: cat.bgColor }]}>
                        <MaterialCommunityIcons name={cat.icon} size={18} color={cat.iconColor} />
                      </View>
                      <Text style={[
                        styles.categoryButtonText,
                        newCategory === cat.id && { color: cat.iconColor, fontWeight: '800' },
                      ]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price & Stock Row */}
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Price ($) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="45.99"
                    placeholderTextColor={c.gray}
                    keyboardType="decimal-pad"
                    value={newPrice}
                    onChangeText={setNewPrice}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Stock</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="50"
                    placeholderTextColor={c.gray}
                    keyboardType="number-pad"
                    value={newStock}
                    onChangeText={setNewStock}
                  />
                </View>
              </View>

              {/* Save Button */}
              <View style={styles.saveWrapper}>
                <View style={styles.saveShadow}><SketchFill /></View>
                <TouchableOpacity
                  style={[styles.saveButton, saving && { opacity: 0.7 }]}
                  onPress={handleAddProduct}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  {saving ? (
                    <View style={styles.saveContent}>
                      <ActivityIndicator color="#FFFFFF" />
                      <Text style={styles.saveText}>Uploading...</Text>
                    </View>
                  ) : (
                    <View style={styles.saveContent}>
                      <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                      <Text style={styles.saveText}>Save Product</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.cream },
  blobRed: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: `${c.red}12` },
  blobBlue: { position: 'absolute', top: '33%', left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: `${c.blue}12` },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: theme.spacing.xl + theme.layout.tabBarHeight },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: theme.spacing.md, marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md + 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: c.charcoal },
  addNewButton: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: `${c.red}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
  },
  sectionLink: { fontSize: 13, fontWeight: '700', color: c.red },

  // Empty state
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: c.charcoal, marginTop: 16 },
  emptySubtitle: { fontSize: 14, fontWeight: '600', color: c.gray, textAlign: 'center', marginTop: 8 },

  // Product grid
  productGrid: { paddingHorizontal: theme.spacing.md },
  productRow: { flexDirection: 'row', marginBottom: theme.spacing.md, gap: theme.spacing.md },
  productCard: { flex: 1, minWidth: 0, position: 'relative' },
  cardShadow: {
    position: 'absolute', top: 5, left: 5, right: -5, bottom: -5,
    borderRadius: 20, backgroundColor: theme.colors.lightAccent,
    borderWidth: 2, borderColor: theme.colors.borderCardLight, overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 14,
    position: 'relative', overflow: 'hidden',
    borderWidth: 2, borderColor: theme.colors.borderCardLight,
  },
  deleteButton: {
    position: 'absolute', top: 12, right: 12, zIndex: 10,
    width: 30, height: 30, borderRadius: 15, backgroundColor: c.red,
    alignItems: 'center', justifyContent: 'center',
  },
  illustrationArea: {
    aspectRatio: 1, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, overflow: 'hidden', position: 'relative',
  },
  productName: { fontSize: 14, fontWeight: '800', color: c.charcoal, lineHeight: 18, marginBottom: 2 },
  productDesc: { fontSize: 11, fontWeight: '600', color: c.gray, marginBottom: 6 },
  productFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  priceBadge: {
    alignSelf: 'flex-start', backgroundColor: `${c.red}15`,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
  },
  priceText: { fontSize: 14, fontWeight: '900', color: c.red },
  stockText: { fontSize: 11, fontWeight: '700', color: c.gray },
  categoryTag: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8, marginTop: 6,
  },
  categoryTagText: { fontSize: 10, fontWeight: '800' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: theme.spacing.md, paddingVertical: 40 },
  modalContent: {
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: theme.spacing.lg,
    borderWidth: 2, borderColor: theme.colors.borderCardLight,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: c.charcoal },
  inputGroup: { marginBottom: theme.spacing.md },
  inputLabel: { fontSize: 14, fontWeight: '700', color: c.charcoal, marginBottom: 6, marginLeft: 4 },
  input: {
    backgroundColor: c.cream, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 16, fontWeight: '600', color: c.charcoal,
    borderWidth: 1, borderColor: theme.colors.borderCardLight,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row', gap: 12 },

  // Image picker
  imagePickerBox: {
    width: '100%', aspectRatio: 1.4, borderRadius: 16, overflow: 'hidden',
    borderWidth: 2, borderColor: theme.colors.borderCardLight, borderStyle: 'dashed',
    backgroundColor: c.cream,
  },
  imagePreview: { width: '100%', height: '100%' },
  imagePlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  imagePlaceholderText: { fontSize: 14, fontWeight: '700', color: c.gray },
  imageChangeOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  imageChangeText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  // Category picker
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
    borderWidth: 2, borderColor: theme.colors.borderCardLight,
    backgroundColor: '#FFFFFF',
  },
  categoryButtonActive: { borderWidth: 2, backgroundColor: '#FFFFFF' },
  categoryIconBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  categoryButtonText: { fontSize: 12, fontWeight: '700', color: c.charcoal },

  // Save button
  saveWrapper: { position: 'relative', marginTop: theme.spacing.md },
  saveShadow: {
    position: 'absolute', top: 4, left: 4, right: -4, bottom: -4,
    borderRadius: 20, backgroundColor: theme.colors.lightAccent,
    borderWidth: 2, borderColor: theme.colors.borderCardLight, overflow: 'hidden',
  },
  saveButton: {
    width: '100%', paddingVertical: 14, borderRadius: 20,
    backgroundColor: c.red, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: theme.colors.borderCardLight,
  },
  saveContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
