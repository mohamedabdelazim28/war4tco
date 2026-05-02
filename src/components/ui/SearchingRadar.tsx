import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

const RADAR_SIZE = 280;
const CENTER_SIZE = 96;
const RIPPLE_COUNT = 3;
const RIPPLE_DURATION = 3000;

interface SearchingRadarProps {
  avatarUri?: string | null;
  style?: ViewStyle;
}

export function SearchingRadar({ avatarUri, style }: SearchingRadarProps) {
  const ripples = useRef(
    Array.from({ length: RIPPLE_COUNT }, () => ({
      scale: new Animated.Value(0.17),
      opacity: new Animated.Value(0.8),
    }))
  ).current;
  const pulseDot = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animations = ripples.map((r, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * (RIPPLE_DURATION / RIPPLE_COUNT)),
          Animated.parallel([
            Animated.timing(r.scale, {
              toValue: 1,
              duration: RIPPLE_DURATION,
              useNativeDriver: true,
              easing: Easing.linear,
            }),
            Animated.timing(r.opacity, {
              toValue: 0,
              duration: RIPPLE_DURATION,
              useNativeDriver: true,
              easing: Easing.linear,
            }),
          ]),
          Animated.parallel([
            Animated.timing(r.scale, { toValue: 0.17, duration: 0, useNativeDriver: true }),
            Animated.timing(r.opacity, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          ]),
        ])
      )
    );
    animations.forEach((a) => a.start());
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseDot, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseDot, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    pulseLoop.start();
    return () => {
      animations.forEach((a) => a.stop());
      pulseLoop.stop();
    };
  }, [ripples, pulseDot]);

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {ripples.map((r, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ripple,
            {
              opacity: r.opacity,
              transform: [{ scale: r.scale }],
            },
          ]}
        />
      ))}
      <View style={styles.center}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} accessibilityLabel="Your location" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <MaterialCommunityIcons name="account" size={40} color={theme.colors.surfaceDarkLight} />
          </View>
        )}
        <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseDot }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    backgroundColor: `${theme.colors.primary}1A`,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}4D`,
  },
  center: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: theme.colors.backgroundDark,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: CENTER_SIZE / 2,
    opacity: 0.9,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.green,
    borderWidth: 2,
    borderColor: theme.colors.backgroundDark,
  },
});
