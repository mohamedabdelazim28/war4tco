import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

const SIZE = 112;
const RING_WIDTH = 4;

interface ProfileAvatarProps {
  avatarUri?: string | null;
  onCameraPress?: () => void;
  style?: ViewStyle;
}

export function ProfileAvatar({ avatarUri, onCameraPress, style }: ProfileAvatarProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.ring}>
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatar}
            accessibilityLabel="Profile photo"
          />
        ) : (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons
              name="account"
              size={48}
              color={theme.colors.surfaceDarkLight}
            />
          </View>
        )}
      </View>
      {onCameraPress && (
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={onCameraPress}
          activeOpacity={0.8}
          accessibilityLabel="Change photo"
        >
          <MaterialCommunityIcons name="camera" size={20} color={theme.colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    width: SIZE + RING_WIDTH * 2,
    height: SIZE + RING_WIDTH * 2,
  },
  ring: {
    width: SIZE + RING_WIDTH * 2,
    height: SIZE + RING_WIDTH * 2,
    borderRadius: (SIZE + RING_WIDTH * 2) / 2,
    padding: RING_WIDTH,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: theme.colors.backgroundDark,
  },
  placeholder: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: theme.colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.backgroundDark,
  },
});
