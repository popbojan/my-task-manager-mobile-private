import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import type { MasteryLevel } from '@/api/generated/models/MasteryLevel';
import { getMasteryAvatarSource } from '@/assets/masteryAvatars';
import { useLanguage } from '@/i18n/LanguageProvider';
import { loginTheme } from '@/pages/login/loginTheme';

const AVATAR_SIZE = 56;
const ITEM_GAP = 12;
const ITEM_WIDTH = AVATAR_SIZE + ITEM_GAP;

type MasteryLevelStripProps = {
  levels: MasteryLevel[];
  isLoading?: boolean;
};

export default function MasteryLevelStrip({
  levels,
  isLoading = false,
}: MasteryLevelStripProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (levels.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Text style={styles.titleHighlight}>{t('login.levels.compactTitle')}</Text>
      </Text>
      <Text style={styles.subtitle}>{t('login.levels.compactSubtitle')}</Text>

      <FlatList
        data={levels}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH}
        snapToAlignment="start"
        nestedScrollEnabled
        contentContainerStyle={styles.listContent}
        keyExtractor={level => String(level.id)}
        renderItem={({ item }) => <LevelAvatar level={item} />}
      />

      {levels.length > 5 ? (
        <Text style={styles.swipeHint}>{t('login.levels.swipeHint')}</Text>
      ) : null}
    </View>
  );
}

function LevelAvatar({ level }: { level: MasteryLevel }) {
  const avatarSource: ImageSourcePropType | null =
    level.avatarRevealed && level.avatarKey
      ? getMasteryAvatarSource(level.avatarKey)
      : null;

  return (
    <View style={styles.item}>
      <View style={styles.avatarRing}>
        {avatarSource ? (
          <Image source={avatarSource} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </View>
      <View style={styles.levelBadge}>
        <Text style={styles.levelBadgeText}>{level.number}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
    marginTop: 8,
  },
  loading: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 14,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  titleHighlight: {
    color: loginTheme.masteryGreen,
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 13,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  item: {
    width: ITEM_WIDTH,
    height: AVATAR_SIZE + 6,
    alignItems: 'center',
  },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(73, 201, 145, 0.55)',
    backgroundColor: 'rgba(8, 12, 16, 0.75)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: loginTheme.masteryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0a0a0a',
  },
  levelBadgeText: {
    color: '#0a0a0a',
    fontSize: 10,
    fontWeight: '800',
  },
  swipeHint: {
    marginTop: 8,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.38)',
    fontSize: 11,
  },
});
