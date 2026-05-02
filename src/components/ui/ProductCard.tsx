import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

export interface ProductCardProps {
  id: string;
  brand: string;
  name: string;
  price: string;
  imageUri?: string | null;
  onAddPress?: () => void;
  style?: ViewStyle;
}

export function ProductCard({
  brand,
  name,
  price,
  imageUri,
  onAddPress,
  style,
}: ProductCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.imageWrap}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
            accessibilityLabel={name}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons
              name="package-variant"
              size={40}
              color={theme.colors.textSecondary}
            />
          </View>
        )}
      </View>
      <Text style={styles.brand} numberOfLines={1} ellipsizeMode="tail">
        {brand}
      </Text>
      <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {name}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.price} numberOfLines={1} ellipsizeMode="tail">
          {price}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPress}
          activeOpacity={0.8}
          accessibilityLabel={`Add ${name} to cart`}
        >
          <MaterialCommunityIcons name="plus" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 0,
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  imageWrap: {
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceDarkLight,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  name: {
    ...theme.typography.subtitle,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.white,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    minWidth: 0,
  },
  price: {
    ...theme.typography.subtitle,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '800',
    color: theme.colors.primary,
    flexShrink: 1,
    marginRight: theme.spacing.xs,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
