import { HistoryDayStatus } from '@/api/generated/models/HistoryDayStatus';
import type { HistoryResponse } from '@/api/generated/models/HistoryResponse';
import { applyHistoryNoteToCache } from '@/history/updateHistoryNoteCache';

function createHistoryResponse(days: HistoryResponse['days']): HistoryResponse {
  return {
    month: '2026-10',
    today: new Date('2026-10-17'),
    timezone: 'Europe/Berlin',
    days,
  };
}

describe('applyHistoryNoteToCache', () => {
  it('updates the note on an existing day', () => {
    const data = createHistoryResponse([
      {
        date: new Date('2026-10-05'),
        status: HistoryDayStatus.Success,
        completedTasks: 3,
        totalTasks: 3,
        note: null,
        finalizedAt: new Date('2026-10-06T00:05:00.000Z'),
        currentStreak: 4,
        currentLevel: 2,
      },
    ]);

    const next = applyHistoryNoteToCache(data, '2026-10-05', 'Guter Tag');

    expect(next?.days).toHaveLength(1);
    expect(next?.days[0].note).toBe('Guter Tag');
    expect(next?.days[0].status).toBe(HistoryDayStatus.Success);
  });

  it('adds a note-only day when no entry exists yet', () => {
    const data = createHistoryResponse([]);

    const next = applyHistoryNoteToCache(data, '2026-10-12', 'Planung');

    expect(next?.days).toHaveLength(1);
    expect(next?.days[0].status).toBe(HistoryDayStatus.Unknown);
    expect(next?.days[0].note).toBe('Planung');
  });

  it('removes note-only days when the note is deleted', () => {
    const data = createHistoryResponse([
      {
        date: new Date('2026-10-12'),
        status: HistoryDayStatus.Unknown,
        completedTasks: null,
        totalTasks: null,
        note: 'Planung',
        finalizedAt: null,
        currentStreak: null,
        currentLevel: null,
      },
    ]);

    const next = applyHistoryNoteToCache(data, '2026-10-12', null);

    expect(next?.days).toHaveLength(0);
  });

  it('keeps task days when only the note is deleted', () => {
    const data = createHistoryResponse([
      {
        date: new Date('2026-10-05'),
        status: HistoryDayStatus.Missed,
        completedTasks: 1,
        totalTasks: 3,
        note: 'Zu viel los',
        finalizedAt: new Date('2026-10-06T00:05:00.000Z'),
        currentStreak: 0,
        currentLevel: 1,
      },
    ]);

    const next = applyHistoryNoteToCache(data, '2026-10-05', null);

    expect(next?.days).toHaveLength(1);
    expect(next?.days[0].note).toBeNull();
    expect(next?.days[0].status).toBe(HistoryDayStatus.Missed);
  });
});
