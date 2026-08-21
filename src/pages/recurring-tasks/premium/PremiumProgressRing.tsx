import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type PremiumProgressRingProps = {
  percent: number;
  size?: number;
  stroke?: number;
  children: ReactNode;
  style?: ViewStyle;
};

function segmentColor(percent: number, threshold: number) {
  return percent >= threshold
    ? recurringTheme.accentBright
    : 'rgba(255, 255, 255, 0.07)';
}

export default function PremiumProgressRing({
  percent,
  size = 64,
  stroke = 3,
  children,
  style,
}: PremiumProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = size / 2;
  const inner = size - stroke * 2 - 6;

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      {clamped > 0 ? (
        <View
          style={[
            styles.glow,
            { width: size + 10, height: size + 10, borderRadius: (size + 10) / 2 },
          ]}
        />
      ) : null}

      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: radius,
            borderWidth: stroke,
            borderColor: 'rgba(255, 255, 255, 0.06)',
            transform: [{ rotate: '-45deg' }],
            borderTopColor: segmentColor(clamped, 12),
            borderRightColor: segmentColor(clamped, 37),
            borderBottomColor: segmentColor(clamped, 62),
            borderLeftColor: segmentColor(clamped, 87),
          },
        ]}
      />

      <View
        style={[
          styles.inner,
          {
            width: inner,
            height: inner,
            borderRadius: inner / 2,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: recurringTheme.accentGlow,
    opacity: 0.55,
  },
  ring: {
    position: 'absolute',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: recurringTheme.surfaceInset,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
});
