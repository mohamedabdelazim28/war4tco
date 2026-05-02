import React from 'react';
import { View, StyleSheet } from 'react-native';

const LINE_COUNT = 80;
const LINE_SPACING = 8;
const LINE_WIDTH = 1.5;
const LINE_OPACITY = 0.5;

interface SketchFillProps {
  lineColor?: string;
  lineWidth?: number;
  spacing?: number;
  opacity?: number;
}

function SketchFillInner({
  lineColor = '#000000',
  lineWidth = LINE_WIDTH,
  spacing = LINE_SPACING,
  opacity = LINE_OPACITY,
}: SketchFillProps) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents="none">
      {Array.from({ length: LINE_COUNT }).map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute' as const,
            width: lineWidth,
            height: '300%',
            backgroundColor: lineColor,
            opacity,
            left: -120 + i * spacing,
            top: '-100%',
            transform: [{ rotate: '45deg' }],
          }}
        />
      ))}
    </View>
  );
}

export const SketchFill = React.memo(SketchFillInner);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
