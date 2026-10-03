import type { TranslationKey } from '@/i18n/locales/de';
import { ResponseError } from '@/api/generated/runtime';
import { getApiErrorMessage, parseApiErrorBody } from '@/utils/apiError';

const DELETE_ACCOUNT_ERROR_KEYS: Partial<Record<string, TranslationKey>> = {
  ACCOUNT_DELETION_BLOCKED_BY_SUBSCRIPTION:
    'profile.deleteAccount.errorBlockedBySubscription',
  REAUTHENTICATION_REQUIRED: 'profile.deleteAccount.errorReauthenticationRequired',
  SUBSCRIPTION_VERIFICATION_UNAVAILABLE:
    'profile.deleteAccount.errorSubscriptionVerificationUnavailable',
};

export async function resolveDeleteAccountErrorMessage(
  error: unknown,
  t: (key: TranslationKey) => string,
): Promise<string> {
  const body = await parseApiErrorBody(error);
  const mappedKey = body?.code ? DELETE_ACCOUNT_ERROR_KEYS[body.code] : undefined;

  if (mappedKey) {
    return t(mappedKey);
  }

  if (error instanceof ResponseError) {
    if (error.response.status === 401) {
      return t('profile.deleteAccount.errorUnauthorized');
    }
    if (error.response.status === 500) {
      return t('profile.deleteAccount.errorServer');
    }
  }

  const apiMessage = await getApiErrorMessage(error);
  return apiMessage ?? t('profile.deleteAccount.errorGeneric');
}
