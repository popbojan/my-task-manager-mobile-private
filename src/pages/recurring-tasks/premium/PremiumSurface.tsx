import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

export type PremiumAccent = 'none' | 'green' | 'gold' | 'red' | 'success';

type PremiumSurfaceProps = {
  children: ReactNode;
  accent?: PremiumAccent;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  padding?: number;
  radius?: number;
  compact?: boolean;
};

const ACCENT_BORDER: Record<PremiumAccent, string> = {
  none: recurringTheme.cardBorder,
  green: recurringTheme.cardBorderAccent,
  gold: 'rgba(212, 168, 67, 0.3)',
  red: 'rgba(239, 68, 68, 0.28)',
  success: 'rgba(110, 207, 170, 0.72)',
};

const ACCENT_GLOW: Record<PremiumAccent, string | undefined> = {
  none: undefined,
  green: recurringTheme.accent,
  gold: recurringTheme.gold,
  red: recurringTheme.fireRed,
  success: recurringTheme.accentBright,
};

export default function PremiumSurface({
  children,
  accent = 'none',
  style,
  contentStyle,
  padding = 12,
  radius = 16,
  compact = false,
}: PremiumSurfaceProps) {
  const glowColor = ACCENT_GLOW[accent];

  return (
    <View
      style={[
        styles.shell,
        compact && styles.shellCompact,
        {
          borderRadius: radius,
          borderColor: ACCENT_BORDER[accent],
          shadowColor: glowColor ?? '#000',
        },
        glowColor ? styles.shellGlow : null,
        accent === 'success' ? styles.shellGlowSuccess : null,
        style,
      ]}
    >
      <View
        style={[
          styles.shine,
          { borderTopLeftRadius: radius, borderTopRightRadius: radius },
        ]}
      />
      <View style={[styles.base, { borderRadius: radius - 1 }]} />
      <View style={[styles.content, { padding }, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: recurringTheme.surfaceCard,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  shellCompact: {
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  shellGlow: {
    shadowOpacity: 0.26,
  },
  shellGlowSuccess: {
    shadowOpacity: 0.44,
    shadowRadius: 18,
    elevation: 7,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: recurringTheme.shineLine,
    zIndex: 2,
  },
  base: {
    ...StyleSheet.absoluteFill,
    backgroundColor: recurringTheme.surfaceCard,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});
