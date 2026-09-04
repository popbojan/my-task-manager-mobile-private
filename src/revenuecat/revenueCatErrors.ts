import Purchases, { type PurchasesError } from 'react-native-purchases';

export function isRevenueCatUserCancelledError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const purchasesError = error as PurchasesError & { userCancelled?: boolean };
  if (purchasesError.userCancelled === true) {
    return true;
  }

  return purchasesError.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
}

export function isRevenueCatConfigurationError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return false;
  }

  return (
    (error as PurchasesError).code === Purchases.PURCHASES_ERROR_CODE.CONFIGURATION_ERROR
  );
}

export function isRevenueCatPurchaseNotAllowedError(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return false;
  }

  return (
    (error as PurchasesError).code ===
    Purchases.PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR
  );
}

export function getRevenueCatErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('message' in error)) {
    return null;
  }

  const message = (error as { message?: unknown }).message;
  return typeof message === 'string' && message.trim().length > 0 ? message : null;
}
