import {
  buildPersonalIntroPreferencesPatch,
  normalizePersonalFocusMotivation,
  normalizePersonalFocusTaskName,
} from '@/onboarding/personalIntroPreferences';

describe('personalIntroPreferences', () => {
  it('normalizes focus task and motivation lengths', () => {
    expect(normalizePersonalFocusTaskName('  Meditieren  ')).toBe('Meditieren');
    expect(normalizePersonalFocusTaskName('a'.repeat(250))).toHaveLength(200);
    expect(normalizePersonalFocusMotivation('  Weil ich stärker werden will  ')).toBe(
      'Weil ich stärker werden will',
    );
    expect(normalizePersonalFocusMotivation('   ')).toBeUndefined();
  });

  it('builds a preferences patch with seen timestamp and optional focus fields', () => {
    const patch = buildPersonalIntroPreferencesPatch({
      taskName: '  Morning run  ',
      motivation: '  Stay healthy  ',
    });

    expect(patch.personalIntroSeenAt).toBeInstanceOf(Date);
    expect(patch.personalFocusTaskName).toBe('Morning run');
    expect(patch.personalFocusMotivation).toBe('Stay healthy');
  });

  it('omits empty focus fields from the patch', () => {
    const patch = buildPersonalIntroPreferencesPatch({
      taskName: '   ',
      motivation: '',
    });

    expect(patch.personalIntroSeenAt).toBeInstanceOf(Date);
    expect(patch).not.toHaveProperty('personalFocusTaskName');
    expect(patch).not.toHaveProperty('personalFocusMotivation');
  });
});
