import type { ImageSourcePropType } from 'react-native';

export const MASTERY_AVATAR_SOURCES: Record<string, ImageSourcePropType> = {
  'mastery-level-01-beginner': require('./mastery-avatars/mastery-level-01-beginner.png'),
  'mastery-level-02-apprentice': require('./mastery-avatars/mastery-level-02-apprentice.png'),
  'mastery-level-03-disciplined': require('./mastery-avatars/mastery-level-03-disciplined.png'),
  'mastery-level-04-warrior': require('./mastery-avatars/mastery-level-04-warrior.png'),
  'mastery-level-05-protector': require('./mastery-avatars/mastery-level-05-protector.png'),
  'mastery-level-06-veteran': require('./mastery-avatars/mastery-level-06-veteran.png'),
  'mastery-level-07-ranger': require('./mastery-avatars/mastery-level-07-ranger.png'),
  'mastery-level-08-knight': require('./mastery-avatars/mastery-level-08-knight.png'),
  'mastery-level-09-champion': require('./mastery-avatars/mastery-level-09-champion.png'),
  'mastery-level-10-elite': require('./mastery-avatars/mastery-level-10-elite.png'),
  'mastery-level-11-commander': require('./mastery-avatars/mastery-level-11-commander.png'),
  'mastery-level-12-master': require('./mastery-avatars/mastery-level-12-master.png'),
  'mastery-level-13-legend': require('./mastery-avatars/mastery-level-13-legend.png'),
  'mastery-level-14-guardian': require('./mastery-avatars/mastery-level-14-guardian.png'),
  'mastery-level-15-sage': require('./mastery-avatars/mastery-level-15-sage.png'),
  'mastery-level-16-enlightened': require('./mastery-avatars/mastery-level-16-enlightened.png'),
  'mastery-level-17-perfected': require('./mastery-avatars/mastery-level-17-perfected.png'),
  'mastery-level-18-unstoppable': require('./mastery-avatars/mastery-level-18-unstoppable.png'),
  'mastery-level-19-chosen-one': require('./mastery-avatars/mastery-level-19-chosen-one.png'),
  'mastery-level-20-transcendent': require('./mastery-avatars/mastery-level-20-transcendent.png'),
  'mastery-level-21-immortal': require('./mastery-avatars/mastery-level-21-immortal.png'),
  'mastery-level-22-mythic': require('./mastery-avatars/mastery-level-22-mythic.png'),
  'mastery-level-23-icon': require('./mastery-avatars/mastery-level-23-icon.png'),
  'mastery-level-24-master-of-self': require('./mastery-avatars/mastery-level-24-master-of-self.png'),
};

export function getMasteryAvatarSource(
  avatarKey: string | null | undefined,
): ImageSourcePropType | null {
  if (!avatarKey) {
    return null;
  }

  return MASTERY_AVATAR_SOURCES[avatarKey] ?? null;
}
