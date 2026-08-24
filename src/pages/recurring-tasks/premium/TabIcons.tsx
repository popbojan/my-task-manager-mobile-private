import { StyleSheet, View } from 'react-native';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';
import { FireIcon } from '@/pages/recurring-tasks/premium/PremiumIcons';

type TabIconProps = {
  size?: number;
  color?: string;
  active?: boolean;
};

export function TabFlameIcon({
  size = 24,
  active = false,
}: TabIconProps) {
  return <FireIcon size={size} active={active} />;
}

export function TabListIcon({
  size = 20,
  color = recurringTheme.textMuted,
  active = false,
}: TabIconProps) {
  const c = active ? recurringTheme.accentBright : color;
  const lineH = 2;
  const gap = 4;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', gap }}>
      {[0.85, 0.65, 0.45].map(w => (
        <View
          key={w}
          style={{
            width: size * w,
            height: lineH,
            backgroundColor: c,
            borderRadius: 1,
          }}
        />
      ))}
    </View>
  );
}

export function TabChartIcon({
  size = 20,
  color = recurringTheme.textMuted,
  active = false,
}: TabIconProps) {
  const c = active ? recurringTheme.accentBright : color;
  const bars = [0.45, 0.7, 0.55];

  return (
    <View
      style={{
        width: size,
        height: size,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 3,
      }}
    >
      {bars.map((h, i) => (
        <View
          key={i}
          style={{
            width: size * 0.18,
            height: size * h,
            backgroundColor: c,
            borderRadius: 2,
          }}
        />
      ))}
    </View>
  );
}

export function TabProfileIcon({
  size = 20,
  color = recurringTheme.textMuted,
  active = false,
}: TabIconProps) {
  const c = active ? recurringTheme.accentBright : color;

  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.38,
          height: size * 0.38,
          borderRadius: size * 0.19,
          borderWidth: 1.5,
          borderColor: c,
        }}
      />
      <View
        style={{
          width: size * 0.72,
          height: size * 0.38,
          borderTopLeftRadius: size * 0.36,
          borderTopRightRadius: size * 0.36,
          borderWidth: 1.5,
          borderColor: c,
          borderBottomWidth: 0,
          marginTop: 2,
        }}
      />
    </View>
  );
}

export function EditIcon({ size = 14, color = recurringTheme.textMuted }: TabIconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          width: size * 0.75,
          height: 1.5,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
          position: 'absolute',
          top: size * 0.55,
          left: size * 0.1,
        }}
      />
      <View
        style={{
          width: size * 0.35,
          height: 1.5,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
          position: 'absolute',
          top: size * 0.22,
          left: size * 0.48,
        }}
      />
    </View>
  );
}

export function TrashIcon({
  size = 14,
  color = recurringTheme.fireRedBright,
}: TabIconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.72,
          height: 1.5,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          width: size * 0.22,
          height: size * 0.18,
          borderTopLeftRadius: 1,
          borderTopRightRadius: 1,
          borderWidth: 1.5,
          borderColor: color,
          borderBottomWidth: 0,
          marginTop: 1,
        }}
      />
      <View
        style={{
          width: size * 0.58,
          height: size * 0.62,
          borderWidth: 1.5,
          borderColor: color,
          borderTopWidth: 0,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
          marginTop: -0.5,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.2,
          width: 1.5,
          height: size * 0.28,
          backgroundColor: color,
          left: size * 0.36,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: size * 0.2,
          width: 1.5,
          height: size * 0.28,
          backgroundColor: color,
          right: size * 0.36,
        }}
      />
    </View>
  );
}

export function MoreIcon({ size = 14, color = recurringTheme.textMuted }: TabIconProps) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', gap: 3 }}>
      {[0, 1, 2].map(i => (
        <View
          key={i}
          style={{
            width: 3,
            height: 3,
            borderRadius: 2,
            backgroundColor: color,
            alignSelf: 'center',
          }}
        />
      ))}
    </View>
  );
}

export function PlusIcon({ size = 14, color = '#fff' }: TabIconProps) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size * 0.55, height: 2, backgroundColor: color, borderRadius: 1 }} />
      <View
        style={{
          width: 2,
          height: size * 0.55,
          backgroundColor: color,
          borderRadius: 1,
          position: 'absolute',
        }}
      />
    </View>
  );
}

export const tabIconStyles = StyleSheet.create({
  hit: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
