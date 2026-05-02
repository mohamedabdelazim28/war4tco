import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SketchFill } from './SketchFill';
import { theme } from '../../theme';

const c = theme.colors.cartoon;

interface CartoonFeaturedCardProps {
  badge?: string;
  title: string;
  description?: string;
  price: string;
  originalPrice?: string;
  onAddToCart?: () => void;
  style?: ViewStyle;
}

export function CartoonFeaturedCard({
  badge = 'Best Seller',
  title,
  description,
  price,
  originalPrice,
  onAddToCart,
  style,
}: CartoonFeaturedCardProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [floatAnim]);

  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <View style={[styles.shadowWrapper, style]}>
      <View style={styles.shadowOffset}>
        <SketchFill />
      </View>
      <View style={styles.card}>
        {/* Decorative circles */}
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.decoCircle3} />

        <View style={styles.content}>
          <View style={styles.leftContent}>
            {badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ) : null}
            <Text style={styles.title}>{title}</Text>
            {description ? (
              <Text style={styles.description}>{description}</Text>
            ) : null}
            <View style={styles.priceRow}>
              <Text style={styles.price}>{price}</Text>
              {originalPrice ? (
                <Text style={styles.originalPrice}>{originalPrice}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={onAddToCart}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="cart-plus" size={18} color={c.red} />
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>

          {/* Floating cartoon icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              { transform: [{ translateY: floatY }] },
            ]}
          >
            <MaterialCommunityIcons name="oil" size={64} color="#FFFFFF" />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    position: 'relative',
  },
  shadowOffset: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
    borderRadius: 28,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: c.red,
    padding: 20,
    borderWidth: 2,
    borderColor: theme.colors.borderCardDark,
  },
  decoCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -24,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decoCircle3: {
    position: 'absolute',
    top: '50%',
    right: '25%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  leftContent: {
    flex: 1,
    marginRight: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    textDecorationLine: 'line-through',
  },
  addButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: c.red,
  },
  iconContainer: {
    width: 100,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
});
