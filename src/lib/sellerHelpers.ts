import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

// ---------- Types ----------

export interface SellerRow {
  id: string;
  user_id: string;
  shop_name: string | null;
  address: string | null;
  created_at: string;
}

export interface SellerProduct {
  id: string;
  seller_id: string;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  created_at: string;
}

export interface SellerOrder {
  id: string;
  user_id: string;
  total_price: number;
  status: string;
  delivery_address: string | null;
  created_at: string;
  buyer_name: string | null;
  buyer_email: string | null;
  items: SellerOrderItem[];
}

export interface SellerOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface SellerStats {
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

// ---------- Seller ID ----------

export async function getSellerIdForUser(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('sellers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data.id;
}

export async function getSellerRow(userId: string): Promise<SellerRow | null> {
  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as SellerRow;
}

// ---------- Products ----------

export async function fetchSellerProducts(sellerId: string): Promise<SellerProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', sellerId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[sellerHelpers] fetchSellerProducts error:', error.message);
    return [];
  }
  return (data ?? []) as SellerProduct[];
}

export async function addProduct(
  sellerId: string,
  product: {
    name: string;
    description?: string;
    price: number;
    category: string;
    stock: number;
    image_url?: string;
  }
): Promise<SellerProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: sellerId,
      name: product.name,
      description: product.description ?? null,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image_url: product.image_url ?? null,
    })
    .select('*')
    .single();
  if (error) {
    console.error('[sellerHelpers] addProduct error:', error.message);
    throw new Error(error.message);
  }
  return data as SellerProduct;
}

export async function updateProduct(
  productId: string,
  fields: Partial<{
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    image_url: string;
  }>
): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', productId);
  if (error) throw new Error(error.message);
}

export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);
  if (error) throw new Error(error.message);
}

// ---------- Orders ----------

export async function fetchSellerOrders(sellerId: string): Promise<SellerOrder[]> {
  // Get all order_items that reference products belonging to this seller
  const { data: orderItems, error: oiError } = await supabase
    .from('order_items')
    .select(`
      id,
      order_id,
      product_id,
      quantity,
      price,
      products!inner ( name, seller_id )
    `)
    .eq('products.seller_id', sellerId);

  if (oiError || !orderItems || orderItems.length === 0) {
    return [];
  }

  // Get unique order IDs
  const orderIds = [...new Set(orderItems.map((oi: any) => oi.order_id))];

  // Fetch order details with buyer info
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select(`
      id,
      user_id,
      total_price,
      status,
      delivery_address,
      created_at,
      profiles!inner ( name, email )
    `)
    .in('id', orderIds)
    .order('created_at', { ascending: false });

  if (ordersError || !orders) return [];

  // Map orders with their items
  return orders.map((order: any) => ({
    id: order.id,
    user_id: order.user_id,
    total_price: order.total_price,
    status: order.status,
    delivery_address: order.delivery_address,
    created_at: order.created_at,
    buyer_name: order.profiles?.name ?? 'Unknown',
    buyer_email: order.profiles?.email ?? '',
    items: orderItems
      .filter((oi: any) => oi.order_id === order.id)
      .map((oi: any) => ({
        id: oi.id,
        product_id: oi.product_id,
        product_name: oi.products?.name ?? 'Unknown Product',
        quantity: oi.quantity,
        price: oi.price,
      })),
  }));
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  if (error) throw new Error(error.message);
}

// ---------- Stats ----------

export async function fetchSellerStats(sellerId: string): Promise<SellerStats> {
  // Count products
  const { count: productCount } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', sellerId);

  // Count orders containing seller's products
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('order_id, price, quantity, products!inner(seller_id)')
    .eq('products.seller_id', sellerId);

  const uniqueOrderIds = new Set((orderItems ?? []).map((oi: any) => oi.order_id));
  const totalRevenue = (orderItems ?? []).reduce((sum: number, oi: any) => sum + (oi.price * oi.quantity), 0);

  return {
    totalOrders: uniqueOrderIds.size,
    totalProducts: productCount ?? 0,
    totalRevenue,
  };
}

// ---------- Image Upload ----------

/** Upload a product image to Supabase Storage and return the public URL. */
export async function uploadProductImage(userId: string, uri: string): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });

    const fileName = `${userId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('product-images')
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('[uploadProductImage] Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.error('[uploadProductImage] Error:', err);
    return null;
  }
}

// ---------- Seller Profile ----------

export async function updateSellerProfile(
  userId: string,
  fields: { shop_name?: string; address?: string }
): Promise<void> {
  const { error } = await supabase
    .from('sellers')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
}
