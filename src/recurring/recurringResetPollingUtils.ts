import type { RecurringTask } from '@/api/generated';
import { isPremiumPreviewTask } from '@/utils/recurringPremiumPreview';

export const RESET_POLL_START_MINUTE = 5;
export const RESET_POLL_END_MINUTE = 10;
/** First local minute after the poll window — used to avoid re-arming until the window ends. */
export const RESET_POLL_COOLDOWN_MINUTE = 11;
const MS_PER_MINUTE = 60_000;

export type LocalTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function isValidIanaTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function resolveRecurringResetTimezone(
  userTimezone: string | null | undefined,
): string {
  const trimmed = userTimezone?.trim();
  if (trimmed && isValidIanaTimeZone(trimmed)) {
    return trimmed;
  }

  try {
    const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (deviceTimezone && isValidIanaTimeZone(deviceTimezone)) {
      return deviceTimezone;
    }
  } catch {
    // Fall through to UTC.
  }

  return 'UTC';
}

export function readLocalTimeParts(date: Date, timeZone: string): LocalTimeParts {
  const safeTimeZone = isValidIanaTimeZone(timeZone) ? timeZone : 'UTC';
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: safeTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find(part => part.type === type)?.value ?? '0');

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
  };
}

export function isInResetPollWindow(parts: LocalTimeParts): boolean {
  return (
    parts.hour === 0 &&
    parts.minute >= RESET_POLL_START_MINUTE &&
    parts.minute <= RESET_POLL_END_MINUTE
  );
}

/** Milliseconds from `from` until the next local clock time (hour:minute) in `timeZone`. */
export function msUntilLocalClock(
  timeZone: string,
  hour: number,
  minute: number,
  from = new Date(),
): number {
  const fromMs = from.getTime();

  for (let minuteOffset = 0; minuteOffset <= 48 * 60; minuteOffset++) {
    const candidate = new Date(fromMs + minuteOffset * MS_PER_MINUTE);
    const parts = readLocalTimeParts(candidate, timeZone);

    if (parts.hour === hour && parts.minute === minute && candidate.getTime() >= fromMs) {
      return candidate.getTime() - fromMs;
    }
  }

  return 24 * 60 * MS_PER_MINUTE;
}

export function fullWindowPollDelaysMs(): number[] {
  const count = RESET_POLL_END_MINUTE - RESET_POLL_START_MINUTE + 1;
  return Array.from({ length: count }, (_, index) => index * MS_PER_MINUTE);
}

export type ResetPollSchedulePlan =
  | {
      mode: 'active';
      delaysMs: number[];
    }
  | {
      mode: 'wait';
      waitMs: number;
      delaysMs: number[];
    };

/**
 * Poll once per minute from 00:05 through 00:10 (user timezone), max six GETs.
 */
/** Wait until the next 00:05, or until 00:11 if still inside today's poll window. */
export function msUntilNextResetPollCycle(
  timeZone: string,
  from = new Date(),
): number {
  const parts = readLocalTimeParts(from, timeZone);

  if (isInResetPollWindow(parts)) {
    return msUntilLocalClock(timeZone, 0, RESET_POLL_COOLDOWN_MINUTE, from);
  }

  return msUntilLocalClock(timeZone, 0, RESET_POLL_START_MINUTE, from);
}

export function buildResetPollSchedule(
  timeZone: string,
  from = new Date(),
): ResetPollSchedulePlan {
  const parts = readLocalTimeParts(from, timeZone);
  const fullWindow = fullWindowPollDelaysMs();

  if (isInResetPollWindow(parts)) {
    const firstMinute = Math.max(parts.minute, RESET_POLL_START_MINUTE);
    const delaysMs: number[] = [];

    for (let minute = firstMinute; minute <= RESET_POLL_END_MINUTE; minute++) {
      delaysMs.push(msUntilLocalClock(timeZone, 0, minute, from));
    }

    return { mode: 'active', delaysMs };
  }

  const waitMs = msUntilLocalClock(timeZone, 0, RESET_POLL_START_MINUTE, from);

  return {
    mode: 'wait',
    waitMs,
    delaysMs: fullWindow,
  };
}

/** UTC instant of 00:05 on the given local calendar day in `timeZone`. */
export function localDailyResetInstantMs(
  timeZone: string,
  localDay: Pick<LocalTimeParts, 'year' | 'month' | 'day'>,
): number {
  const guess = Date.UTC(localDay.year, localDay.month - 1, localDay.day, 0, 0, 0);

  for (let offsetMin = -12 * 60; offsetMin <= 36 * 60; offsetMin++) {
    const candidate = new Date(guess + offsetMin * MS_PER_MINUTE);
    const parts = readLocalTimeParts(candidate, timeZone);

    if (
      parts.year === localDay.year &&
      parts.month === localDay.month &&
      parts.day === localDay.day &&
      parts.hour === 0 &&
      parts.minute === RESET_POLL_START_MINUTE
    ) {
      return candidate.getTime();
    }
  }

  return guess;
}

export function maxLastResetAtMs(tasks: RecurringTask[]): number | null {
  let max: number | null = null;

  for (const task of tasks) {
    if (isPremiumPreviewTask(task.id) || !task.lastResetAt) {
      continue;
    }

    const ms = task.lastResetAt.getTime();
    if (max === null || ms > max) {
      max = ms;
    }
  }

  return max;
}

/**
 * True when the backend already recorded today's 00:05 reset (e.g. first poll after the job).
 */
export function hasTodaysResetRecorded(
  tasks: RecurringTask[],
  timeZone: string,
  now = new Date(),
): boolean {
  const localNow = readLocalTimeParts(now, timeZone);

  if (localNow.hour === 0 && localNow.minute < RESET_POLL_START_MINUTE) {
    return false;
  }

  const todaysResetMs = localDailyResetInstantMs(timeZone, localNow);
  const lastResetMs = maxLastResetAtMs(tasks);

  if (lastResetMs === null) {
    return false;
  }

  return lastResetMs >= todaysResetMs - MS_PER_MINUTE;
}

export function minNextResetAtMs(tasks: RecurringTask[]): number | null {
  let min: number | null = null;

  for (const task of tasks) {
    if (isPremiumPreviewTask(task.id)) {
      continue;
    }

    const ms = task.nextResetAt.getTime();
    if (min === null || ms < min) {
      min = ms;
    }
  }

  return min;
}

/** True when the backend advanced at least one task's nextResetAt after `baselineMs`. */
export function hasNextResetAdvanced(
  baselineMs: number | null,
  tasks: RecurringTask[],
): boolean {
  if (baselineMs === null) {
    return false;
  }

  const nextMin = minNextResetAtMs(tasks);
  return nextMin !== null && nextMin > baselineMs;
}
