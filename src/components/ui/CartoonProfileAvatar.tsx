import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SketchFill } from './SketchFill';
import { theme } from '../../theme';

const c = theme.colors.cartoon;
const SIZE = 100;
const RING = 4;
const TOTAL = SIZE + RING * 2;

interface CartoonProfileAvatarProps {
  avatarUrl?: string | null;
  onCameraPress?: () => void;
  style?: ViewStyle;
}

export function CartoonProfileAvatar({
  avatarUrl,
  onCameraPress,
  style,
}: CartoonProfileAvatarProps) {
  return (
    <View style={[styles.wrapper, style]}>
      {/* Offset shadow behind the ring */}
      <View style={styles.ringShadow}>
        <SketchFill />
      </View>
      {/* Outer ring */}
      <View style={styles.ring}>
        <View style={styles.inner}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <MaterialCommunityIcons name="account" size={52} color={c.red} />
          )}
        </View>
      </View>
      {/* Online dot */}
      <View style={styles.onlineDot} />
      {/* Camera button */}
      {onCameraPress && (
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={onCameraPress}
          activeOpacity={0.8}
          accessibilityLabel="Change photo"
        >
          <MaterialCommunityIcons name="camera" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: TOTAL,
    height: TOTAL,
  },
  ringShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: TOTAL,
    height: TOTAL,
    borderRadius: TOTAL / 2,
    backgroundColor: theme.colors.lightAccent,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
    overflow: 'hidden',
  },
  ring: {
    width: TOTAL,
    height: TOTAL,
    borderRadius: TOTAL / 2,
    padding: RING,
    backgroundColor: c.red,
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
  inner: {
    flex: 1,
    borderRadius: SIZE / 2,
    backgroundColor: c.cream,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: c.mint,
    borderWidth: 3,
    borderColor: c.cream,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.red,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.borderCardLight,
  },
});
