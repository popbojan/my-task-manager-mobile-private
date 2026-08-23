import type { AppLanguage } from '@/i18n/types';

export type DeadlineBadgeKind = 'overdue' | 'thisWeek';

const LOCALE_MAP: Record<AppLanguage, string> = {
  de: 'de-DE',
  en: 'en-GB',
  sr: 'sr-RS',
  fr: 'fr-FR',
};

function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  end.setMilliseconds(end.getMilliseconds() - 1);
  return end;
}

export function getDeadlineBadge(
  deadline: Date | null | undefined,
  now = new Date(),
): DeadlineBadgeKind | null {
  if (!deadline) {
    return null;
  }

  const target = new Date(deadline);

  if (target.getTime() < now.getTime()) {
    return 'overdue';
  }

  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  if (target >= weekStart && target <= weekEnd) {
    return 'thisWeek';
  }

  return null;
}

export function getTaskDisplayDate(task: {
  deadline?: Date | null;
  updatedAt: Date;
}): Date {
  return task.deadline ?? task.updatedAt;
}

export function formatTaskDateTime(date: Date, language: AppLanguage): string {
  return new Intl.DateTimeFormat(LOCALE_MAP[language], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function parseDeadlineInput(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDeadlineInput(date: Date | null | undefined): string {
  if (!date) {
    return '';
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
