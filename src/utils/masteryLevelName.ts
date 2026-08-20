import type { MasteryLevel } from '@/api/generated/models/MasteryLevel';
import type { AppLanguage } from '@/i18n/types';

export function getMasteryLevelName(
  level: MasteryLevel,
  language: AppLanguage,
): string {
  switch (language) {
    case 'en':
      return level.nameEn;
    case 'fr':
      return level.nameFr;
    case 'sr':
      return level.nameSr;
    default:
      return level.nameDe;
  }
}
