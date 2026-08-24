import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type IconProps = { size?: number; color?: string; active?: boolean };

export function FireIcon({
  size = 14,
  color = recurringTheme.fireRed,
}: IconProps) {
  return (
    <View style={[styles.fireWrap, { width: size, height: size }]}>
      <View
        style={[
          styles.fireCore,
          {
            width: size * 0.55,
            height: size * 0.72,
            borderTopLeftRadius: size * 0.45,
            borderTopRightRadius: size * 0.45,
            backgroundColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.fireInner,
          {
            width: size * 0.28,
            height: size * 0.38,
            borderTopLeftRadius: size * 0.2,
            borderTopRightRadius: size * 0.2,
            bottom: size * 0.12,
          },
        ]}
      />
    </View>
  );
}

export function TrophyIcon({ size = 14, color = recurringTheme.goldBright }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.72,
          height: size * 0.42,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          borderWidth: 1.5,
          borderColor: color,
          borderBottomWidth: 0,
        }}
      />
      <View
        style={{
          width: size * 0.34,
          height: size * 0.28,
          backgroundColor: color,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
        }}
      />
      <View
        style={{
          width: size * 0.55,
          height: 2,
          backgroundColor: color,
          marginTop: 1,
        }}
      />
    </View>
  );
}

export function StarIcon({ size = 14, color = recurringTheme.accentBright }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.28,
          borderRightWidth: size * 0.28,
          borderBottomWidth: size * 0.38,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: color,
          transform: [{ rotate: '0deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.28,
          borderRightWidth: size * 0.28,
          borderTopWidth: size * 0.38,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: color,
          transform: [{ rotate: '180deg' }],
          top: size * 0.22,
        }}
      />
    </View>
  );
}

export function CrownIcon({ size = 14, color = recurringTheme.goldBright }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 1 }}>
        {[0.35, 0.55, 0.35].map((h, i) => (
          <View
            key={i}
            style={{
              width: size * 0.22,
              height: size * h,
              backgroundColor: color,
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
            }}
          />
        ))}
      </View>
      <View
        style={{
          width: size * 0.82,
          height: size * 0.22,
          backgroundColor: color,
          borderRadius: 2,
          marginTop: 1,
        }}
      />
    </View>
  );
}

export function ClockIcon({ size = 18, color = recurringTheme.accentBright }: IconProps) {
  const r = size / 2;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: r,
        borderWidth: 1.5,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(82, 183, 136, 0.12)',
      }}
    >
      <View style={{ width: 1.5, height: r * 0.5, backgroundColor: color, borderRadius: 1, marginTop: -r * 0.08 }} />
      <View
        style={{
          position: 'absolute',
          width: r * 0.35,
          height: 1.5,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '90deg' }],
          top: r * 0.52,
        }}
      />
    </View>
  );
}

export function CalendarIcon({
  size = 14,
  color = recurringTheme.accentBright,
}: IconProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: color,
        overflow: 'hidden',
        backgroundColor: 'rgba(82, 183, 136, 0.12)',
      }}
    >
      <View style={{ height: size * 0.22, backgroundColor: color }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: size * 0.34,
            height: 1.5,
            backgroundColor: color,
            borderRadius: 1,
          }}
        />
      </View>
    </View>
  );
}

export function CheckIcon({
  size = 14,
  color = recurringTheme.accentBright,
}: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: 'absolute',
          left: size * 0.12,
          bottom: size * 0.34,
          width: size * 0.28,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '-45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.28,
          bottom: size * 0.38,
          width: size * 0.52,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function ShieldCrownIcon({ size = 20, color = recurringTheme.goldBright }: IconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.72,
          height: size * 0.82,
          backgroundColor: 'rgba(212, 168, 67, 0.18)',
          borderWidth: 1.5,
          borderColor: color,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          borderBottomLeftRadius: size * 0.36,
          borderBottomRightRadius: size * 0.36,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CrownIcon size={size * 0.45} color={color} />
      </View>
    </View>
  );
}

export function IconBadge({
  tone,
  children,
  size = 30,
}: {
  tone: 'red' | 'green' | 'gold';
  children: ReactNode;
  size?: number;
}) {
  const toneStyle =
    tone === 'red'
      ? styles.badgeRed
      : tone === 'gold'
        ? styles.badgeGold
        : styles.badgeGreen;

  return (
    <View
      style={[
        styles.badge,
        toneStyle,
        { width: size, height: size, borderRadius: size * 0.28 },
      ]}
    >
      <View style={styles.badgeShine} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  fireWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fireCore: {
    shadowColor: recurringTheme.fireRed,
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  fireInner: {
    position: 'absolute',
    backgroundColor: '#fca5a5',
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  badgeShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  badgeRed: {
    backgroundColor: recurringTheme.fireRedSoft,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  badgeGreen: {
    backgroundColor: 'rgba(82, 183, 136, 0.16)',
    borderColor: 'rgba(82, 183, 136, 0.32)',
  },
  badgeGold: {
    backgroundColor: recurringTheme.goldSoft,
    borderColor: 'rgba(212, 168, 67, 0.38)',
  },
});
