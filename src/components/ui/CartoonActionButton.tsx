import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SketchFill } from './SketchFill';
import { theme } from '../../theme';

type CartoonActionButtonVariant = 'accept' | 'reject' | 'primary' | 'secondary' | 'dark';

interface CartoonActionButtonProps {
  label: string;
  variant?: CartoonActionButtonVariant;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const c = theme.colors.cartoon;

const variantStyleMap: Record<
  CartoonActionButtonVariant,
  { backgroundColor: string; borderColor: string; iconColor: string; textColor: string }
> = {
  accept: {
    backgroundColor: c.mintBg,
    borderColor: c.mint,
    iconColor: c.mint,
    textColor: c.charcoal,
  },
  reject: {
    backgroundColor: c.creamDark,
    borderColor: c.red,
    iconColor: c.red,
    textColor: c.charcoal,
  },
  primary: {
    backgroundColor: c.blueBg,
    borderColor: c.blue,
    iconColor: c.blue,
    textColor: c.charcoal,
  },
  secondary: {
    backgroundColor: c.cream,
    borderColor: theme.colors.borderCardLight,
    iconColor: c.charcoal,
    textColor: c.charcoal,
  },
  dark: {
    backgroundColor: theme.colors.black,
    borderColor: theme.colors.black,
    iconColor: theme.colors.white,
    textColor: theme.colors.white,
  },
};

export function CartoonActionButton({
  label,
  variant = 'primary',
  icon = 'gesture-tap-button',
  onPress,
  disabled = false,
  fullWidth = false,
  style,
}: CartoonActionButtonProps) {
  const colors = variantStyleMap[variant];

  return (
    <View style={[styles.wrapper, fullWidth && styles.fullWidth, style]}>
      <View style={styles.shadowOffset}>
        <SketchFill opacity={0.22} />
      </View>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.backgroundColor,
            borderColor: colors.borderColor,
          },
          pressed && !disabled && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <MaterialCommunityIcons name={icon} size={18} color={colors.iconColor} />
        <Text style={[styles.label, { color: colors.textColor }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    minWidth: 120,
  },
  fullWidth: {
    width: '100%',
  },
  shadowOffset: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: 14,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  button: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '800',
  },
  pressed: {
    transform: [{ translateY: 1 }],
  },
  disabled: {
    opacity: 0.6,
  },
});

export type { CartoonActionButtonProps, CartoonActionButtonVariant };
