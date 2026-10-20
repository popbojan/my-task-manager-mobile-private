export type PersonalIntroFocusInput = {
  taskName?: string;
  motivation?: string;
};

const MAX_FOCUS_TASK_NAME_LENGTH = 200;
const MAX_FOCUS_MOTIVATION_LENGTH = 2000;

export function normalizePersonalFocusTaskName(value: string): string | undefined {
  const trimmed = value.trim().slice(0, MAX_FOCUS_TASK_NAME_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizePersonalFocusMotivation(value: string): string | undefined {
  const trimmed = value.trim().slice(0, MAX_FOCUS_MOTIVATION_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildPersonalIntroPreferencesPatch(focus?: PersonalIntroFocusInput) {
  const personalFocusTaskName = focus?.taskName
    ? normalizePersonalFocusTaskName(focus.taskName)
    : undefined;
  const personalFocusMotivation = focus?.motivation
    ? normalizePersonalFocusMotivation(focus.motivation)
    : undefined;

  return {
    personalIntroSeenAt: new Date(),
    ...(personalFocusTaskName ? { personalFocusTaskName } : {}),
    ...(personalFocusMotivation ? { personalFocusMotivation } : {}),
  };
}
