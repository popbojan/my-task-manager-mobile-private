import { ResponseError } from '@/api/generated/runtime';

export function isApiPremiumRequiredError(error: unknown): boolean {
  return error instanceof ResponseError && error.response.status === 403;
}

export function isApiConflictError(error: unknown): boolean {
  return error instanceof ResponseError && error.response.status === 409;
}

export function shouldRetryApiQuery(failureCount: number, error: unknown) {
  if (isApiPremiumRequiredError(error)) {
    return false;
  }

  return failureCount < 2;
}
