import { type PurchasesError } from 'react-native-purchases';

function formatRevenueCatError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return String(error);
  }

  const purchasesError = error as PurchasesError & { message?: string };
  const code =
    'code' in purchasesError && purchasesError.code !== undefined
      ? String(purchasesError.code)
      : 'unknown_code';
  const message =
    typeof purchasesError.message === 'string' ? purchasesError.message : '';

  return message ? `${code}: ${message}` : code;
}

/** Always logs to the device console (logcat / Xcode) for support debugging. */
export function logRevenueCatIssue(context: string, error?: unknown): void {
  if (error !== undefined) {
    console.warn(`[RevenueCat] ${context} — ${formatRevenueCatError(error)}`, error);
    return;
  }

  console.warn(`[RevenueCat] ${context}`);
}
