import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SketchFill } from './SketchFill';
import { theme } from '../../theme';

const c = theme.colors.cartoon;

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface CartoonCategoryCardProps {
  label: string;
  iconName: IconName;
  bgColor: string;
  iconColor: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function CartoonCategoryCard({
  label,
  iconName,
  bgColor,
  iconColor,
  onPress,
  style,
}: CartoonCategoryCardProps) {
  return (
    <TouchableOpacity
      style={[styles.wrapper, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconShadowWrapper}>
        <View style={styles.iconShadowOffset}>
          <SketchFill />
        </View>
        <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
          <MaterialCommunityIcons name={iconName} size={28} color={iconColor} />
        </View>
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 76,
    gap: 6,
  },
  iconShadowWrapper: {
    position: 'relative',
    width: 60,
    height: 60,
  },
  iconShadowOffset: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    borderRadius: 18,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 1.5,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.borderCardLight,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: c.charcoal,
    textAlign: 'center',
  },
});
