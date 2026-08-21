import type { MasteryLevel } from '@/api/generated/models/MasteryLevel';

export type LevelProgress = {
  currentLevel: MasteryLevel | null;
  nextLevel: MasteryLevel | null;
  daysInCurrentLevel: number;
  daysNeededForNextLevel: number;
  progressPercent: number;
};

export function computeLevelProgress(
  levels: MasteryLevel[],
  currentStreak: number,
  currentLevelNumber: number,
): LevelProgress {
  const sorted = [...levels].sort((a, b) => a.number - b.number);
  const currentLevel =
    sorted.find(level => level.number === currentLevelNumber) ??
    sorted[0] ??
    null;
  const nextLevel =
    sorted.find(level => level.number === currentLevelNumber + 1) ?? null;

  if (!currentLevel) {
    return {
      currentLevel: null,
      nextLevel: null,
      daysInCurrentLevel: 0,
      daysNeededForNextLevel: 30,
      progressPercent: 0,
    };
  }

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      daysInCurrentLevel: currentStreak - currentLevel.requiredStreak,
      daysNeededForNextLevel: 0,
      progressPercent: 100,
    };
  }

  const daysInCurrentLevel = Math.max(
    0,
    currentStreak - currentLevel.requiredStreak,
  );
  const daysNeededForNextLevel = Math.max(
    1,
    nextLevel.requiredStreak - currentLevel.requiredStreak,
  );
  const progressPercent = Math.min(
    100,
    Math.round((daysInCurrentLevel / daysNeededForNextLevel) * 100),
  );

  return {
    currentLevel,
    nextLevel,
    daysInCurrentLevel,
    daysNeededForNextLevel,
    progressPercent,
  };
}
