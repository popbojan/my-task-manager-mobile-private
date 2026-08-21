import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLanguage } from '@/i18n/LanguageProvider';
import { premiumType, recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type AllTasksCompleteCelebrationProps = {
  visible: boolean;
  onDismiss: () => void;
};

type Spark = {
  id: string;
  left: number;
  top: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
  delay: number;
  progress: Animated.Value;
  opacity: Animated.Value;
};

const SPARK_COLORS = [
  recurringTheme.accentBright,
  recurringTheme.goldBright,
  '#ffffff',
  '#86efac',
  '#fde68a',
];

function createSparks(
  width: number,
  height: number,
  burstCount: number,
  sparksPerBurst: number,
): Spark[] {
  const sparks: Spark[] = [];

  for (let burst = 0; burst < burstCount; burst += 1) {
    const originX = width * (0.2 + Math.random() * 0.6);
    const originY = height * (0.18 + Math.random() * 0.35);

    for (let i = 0; i < sparksPerBurst; i += 1) {
      sparks.push({
        id: `${burst}-${i}`,
        left: originX,
        top: originY,
        color: SPARK_COLORS[i % SPARK_COLORS.length],
        size: 4 + Math.random() * 4,
        angle: (Math.PI * 2 * i) / sparksPerBurst + Math.random() * 0.35,
        distance: 48 + Math.random() * 72,
        delay: burst * 320 + Math.random() * 120,
        progress: new Animated.Value(0),
        opacity: new Animated.Value(0),
      });
    }
  }

  return sparks;
}

export default function AllTasksCompleteCelebration({
  visible,
  onDismiss,
}: AllTasksCompleteCelebrationProps) {
  const { t } = useLanguage();
  const { width, height } = useWindowDimensions();
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const sparks = useMemo(
    () => createSparks(width, height, 4, 14),
    [width, height],
  );

  useEffect(() => {
    if (!visible) {
      cardScale.setValue(0.88);
      cardOpacity.setValue(0);
      sparks.forEach(spark => {
        spark.progress.setValue(0);
        spark.opacity.setValue(0);
      });
      return;
    }

    const cardAnim = Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 7,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]);

    cardAnim.start();

    const sparkAnims = sparks.map(spark =>
      Animated.sequence([
        Animated.delay(spark.delay),
        Animated.parallel([
          Animated.timing(spark.progress, {
            toValue: 1,
            duration: 850,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(spark.opacity, {
              toValue: 1,
              duration: 120,
              useNativeDriver: true,
            }),
            Animated.timing(spark.opacity, {
              toValue: 0,
              duration: 730,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
    );

    Animated.stagger(40, sparkAnims).start();

    const dismissTimer = setTimeout(onDismiss, 4200);

    return () => {
      cardAnim.stop();
      clearTimeout(dismissTimer);
    };
  }, [visible, cardOpacity, cardScale, onDismiss, sparks]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {sparks.map(spark => {
            const translateX = spark.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.cos(spark.angle) * spark.distance],
            });
            const translateY = spark.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, Math.sin(spark.angle) * spark.distance],
            });
            const scale = spark.progress.interpolate({
              inputRange: [0, 0.4, 1],
              outputRange: [0.2, 1.1, 0.4],
            });

            return (
              <Animated.View
                key={spark.id}
                style={[
                  styles.spark,
                  {
                    left: spark.left,
                    top: spark.top,
                    width: spark.size,
                    height: spark.size,
                    borderRadius: spark.size / 2,
                    backgroundColor: spark.color,
                    opacity: spark.opacity,
                    transform: [{ translateX }, { translateY }, { scale }],
                  },
                ]}
              />
            );
          })}
        </View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          <Text style={styles.emoji}>🎆</Text>
          <Text style={styles.title}>{t('recurring.celebration.title')}</Text>
          <Text style={styles.subtitle}>{t('recurring.celebration.subtitle')}</Text>
          <Text style={styles.hint}>{t('recurring.celebration.dismiss')}</Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 6, 5, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  spark: {
    position: 'absolute',
    shadowColor: '#fff',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
    backgroundColor: recurringTheme.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(110, 207, 170, 0.55)',
    shadowColor: recurringTheme.accentBright,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  title: {
    ...premiumType.title,
    fontSize: 22,
    color: recurringTheme.accentBright,
    textAlign: 'center',
  },
  subtitle: {
    color: recurringTheme.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 280,
  },
  hint: {
    marginTop: 6,
    color: recurringTheme.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
