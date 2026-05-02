import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface FloatingIconConfig {
  name: IconName;
  size: number;
  /** 0–1, horizontal position ratio */
  x: number;
  /** 0–1, vertical position ratio */
  y: number;
  /** Float duration in ms (one full cycle) */
  duration: number;
  /** Vertical float distance in px */
  floatDistance: number;
  /** Delay before starting animation (ms) */
  delay?: number;
  /** Opacity 0–1 */
  opacity: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DEFAULT_ICONS: Omit<FloatingIconConfig, 'delay'>[] = [
  { name: 'car-wrench', size: 52, x: 0.08, y: 0.15, duration: 4000, floatDistance: 18, opacity: 0.08 },
  { name: 'cog', size: 42, x: 0.85, y: 0.22, duration: 5000, floatDistance: 16, opacity: 0.07 },
  { name: 'car-side', size: 60, x: 0.12, y: 0.55, duration: 4500, floatDistance: 20, opacity: 0.08 },
  { name: 'wrench', size: 38, x: 0.78, y: 0.48, duration: 3800, floatDistance: 14, opacity: 0.08 },
  { name: 'oil', size: 46, x: 0.9, y: 0.72, duration: 4200, floatDistance: 18, opacity: 0.07 },
  { name: 'car', size: 40, x: 0.05, y: 0.78, duration: 4700, floatDistance: 15, opacity: 0.07 },
  { name: 'hammer-wrench', size: 44, x: 0.72, y: 0.12, duration: 4100, floatDistance: 16, opacity: 0.07 },
  { name: 'car-cog', size: 34, x: 0.2, y: 0.38, duration: 3900, floatDistance: 12, opacity: 0.08 },
  { name: 'toolbox-outline', size: 42, x: 0.82, y: 0.88, duration: 4300, floatDistance: 15, opacity: 0.07 },
];

interface FloatingIconsBackgroundProps {
  /** Icon color (default: black) */
  iconColor?: string;
  /** Override icons (optional) */
  icons?: FloatingIconConfig[];
}

export function FloatingIconsBackground({ iconColor = theme.colors.black, icons: customIcons }: FloatingIconsBackgroundProps) {
  const icons = customIcons ?? DEFAULT_ICONS.map((icon, i) => ({ ...icon, delay: i * 200 }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {icons.map((icon, index) => (
        <FloatingIcon key={index} config={icon} color={iconColor} />
      ))}
    </View>
  );
}

function FloatingIcon({ config, color }: { config: FloatingIconConfig; color: string }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const delay = config.delay ?? 0;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(translateY, {
          toValue: 1,
          duration: config.duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: config.duration / 2,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay, config.duration, translateY]);

  const floatY = translateY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -config.floatDistance],
  });

  const left = SCREEN_WIDTH * config.x - config.size / 2;
  const top = SCREEN_HEIGHT * config.y - config.size / 2;

  return (
    <Animated.View
      style={[
        styles.iconWrap,
        {
          left,
          top,
          width: config.size,
          height: config.size,
          opacity: config.opacity,
          transform: [{ translateY: floatY }],
        },
      ]}
    >
      <MaterialCommunityIcons name={config.name} size={config.size} color={color} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
