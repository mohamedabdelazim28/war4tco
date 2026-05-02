import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

const c = theme.colors.cartoon;

interface CartoonMenuRowProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconBgColor: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function CartoonMenuRow({
  icon,
  iconBgColor,
  iconColor,
  title,
  subtitle,
  onPress,
  style,
}: CartoonMenuRowProps) {
  const content = (
    <>
      <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
        <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.chevronBox}>
        <MaterialCommunityIcons name="chevron-right" size={22} color={c.gray} />
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.row, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.row, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: c.charcoal,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: c.gray,
    marginTop: 2,
  },
  chevronBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: c.creamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
