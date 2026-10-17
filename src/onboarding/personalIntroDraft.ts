export type PersonalIntroDraft = {
  stepIndex: number;
  taskName: string;
  whyText: string;
};

export const EMPTY_PERSONAL_INTRO_DRAFT: PersonalIntroDraft = {
  stepIndex: 0,
  taskName: '',
  whyText: '',
};
