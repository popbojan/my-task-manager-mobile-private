import {
  formatDeadlineInput,
  getDefaultDeadlineInput,
  parseDeadlineInput,
} from '@/pages/tasks/taskDeadlineUtils';

describe('parseDeadlineInput', () => {
  it('accepts valid local datetime strings', () => {
    const parsed = parseDeadlineInput('2026-08-19T13:41');
    expect(parsed).not.toBeNull();
    expect(parsed!.getFullYear()).toBe(2026);
    expect(parsed!.getMonth()).toBe(7);
    expect(parsed!.getDate()).toBe(19);
    expect(parsed!.getHours()).toBe(13);
    expect(parsed!.getMinutes()).toBe(41);
  });

  it('rejects impossible clock values', () => {
    expect(parseDeadlineInput('2026-08-19T38:41')).toBeNull();
    expect(parseDeadlineInput('2026-08-19T12:99')).toBeNull();
  });

  it('rejects invalid calendar dates', () => {
    expect(parseDeadlineInput('2026-02-30T12:00')).toBeNull();
  });

  it('rejects values that JS Date would roll over', () => {
    expect(parseDeadlineInput('2026-08-19T24:00')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(parseDeadlineInput('')).toBeNull();
    expect(parseDeadlineInput('   ')).toBeNull();
  });
});

describe('formatDeadlineInput', () => {
  it('round-trips with parseDeadlineInput', () => {
    const value = getDefaultDeadlineInput(new Date('2026-01-01T10:00:00'));
    expect(parseDeadlineInput(value)).not.toBeNull();
    expect(formatDeadlineInput(parseDeadlineInput(value)!)).toBe(value);
  });
});
