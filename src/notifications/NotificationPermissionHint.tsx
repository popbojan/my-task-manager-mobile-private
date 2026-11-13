import { Pressable, StyleSheet, Text } from 'react-native';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type NotificationPermissionHintProps = {
  before: string;
  linkLabel: string;
  after: string;
  onPress: () => void;
};

/**
 * Full-width tappable hint — nested Text.onPress links are too small and often
 * miss taps inside modals/scroll views on Android.
 */
export default function NotificationPermissionHint({
  before,
  linkLabel,
  after,
  onPress,
}: NotificationPermissionHintProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.box,
        pressed && styles.boxPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${before}${linkLabel}${after}`}
      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
    >
      <Text style={styles.text} numberOfLines={3}>
        {before}
        <Text style={styles.link}>{linkLabel}</Text>
        {after}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.45)',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  boxPressed: {
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
  },
  text: {
    color: recurringTheme.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  link: {
    color: recurringTheme.accentBright,
    textDecorationLine: 'underline',
    fontWeight: '800',
  },
});
