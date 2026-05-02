import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SketchFill } from './SketchFill';
import { theme } from '../../theme';

const c = theme.colors.cartoon;

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface CartoonProductCardProps {
  name: string;
  description?: string;
  price: string;
  iconName: IconName;
  bgColor: string;
  iconColor: string;
  imageUrl?: string | null;
  onAddPress?: () => void;
  compact?: boolean;
  style?: ViewStyle;
}

export function CartoonProductCard({
  name,
  description,
  price,
  iconName,
  bgColor,
  iconColor,
  imageUrl,
  onAddPress,
  compact = false,
  style,
}: CartoonProductCardProps) {
  const cardStyles = compact ? stylesCompact : styles;
  return (
    <View style={[cardStyles.shadowWrapper, style]}>
      <View style={cardStyles.shadowOffset}>
        <SketchFill />
      </View>
      <View style={cardStyles.card}>
        {/* Floating + button */}
        <TouchableOpacity
          style={cardStyles.addButton}
          onPress={onAddPress}
          activeOpacity={0.8}
          accessibilityLabel={`Add ${name} to cart`}
        >
          <MaterialCommunityIcons name="plus" size={compact ? 14 : 18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Product illustration area */}
        <View style={[cardStyles.illustrationArea, { backgroundColor: bgColor }]}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <>
              <View style={cardStyles.illustrationBlob} />
              <MaterialCommunityIcons name={iconName} size={compact ? 28 : 48} color={iconColor} />
            </>
          )}
        </View>

        {/* Product info */}
        <Text style={cardStyles.name} numberOfLines={1}>
          {name}
        </Text>
        {description && !compact ? (
          <Text style={cardStyles.description} numberOfLines={1}>
            {description}
          </Text>
        ) : null}

        {/* Price badge */}
        <View style={cardStyles.priceBadge}>
          <Text style={cardStyles.priceText}>{price}</Text>
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
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    borderRadius: 20,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  addButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: c.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationArea: {
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  illustrationBlob: {
    position: 'absolute',
    bottom: -12,
    right: -12,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: c.charcoal,
    lineHeight: 18,
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    fontWeight: '600',
    color: c.gray,
    marginBottom: 8,
  },
  priceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${c.red}15`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '900',
    color: c.red,
  },
});

const stylesCompact = StyleSheet.create({
  shadowWrapper: { position: 'relative' },
  shadowOffset: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    borderRadius: 14,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 1.5,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 8,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: theme.colors.borderCardLight,
  },
  addButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: c.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationArea: {
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  illustrationBlob: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  name: {
    fontSize: 11,
    fontWeight: '800',
    color: c.charcoal,
    lineHeight: 14,
    marginBottom: 1,
  },
  description: {
    fontSize: 9,
    fontWeight: '600',
    color: c.gray,
    marginBottom: 4,
  },
  priceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${c.red}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '900',
    color: c.red,
  },
});
