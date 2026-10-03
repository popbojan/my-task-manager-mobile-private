export const DELETE_ACCOUNT_OTP_LENGTH = 6;

export function normalizeDeleteAccountOtp(value: string): string {
  return value.replace(/\D/g, '').slice(0, DELETE_ACCOUNT_OTP_LENGTH);
}

export function isDeleteAccountOtpComplete(otp: string): boolean {
  return normalizeDeleteAccountOtp(otp).length === DELETE_ACCOUNT_OTP_LENGTH;
}
