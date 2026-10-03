import { ResponseError } from '@/api/generated/runtime';

type ApiErrorBody = {
  message?: string;
  code?: string;
};

export async function parseApiErrorBody(error: unknown): Promise<ApiErrorBody | null> {
  if (!(error instanceof ResponseError)) {
    return null;
  }

  try {
    return (await error.response.clone().json()) as ApiErrorBody;
  } catch {
    return null;
  }
}

export async function getApiErrorMessage(error: unknown): Promise<string | null> {
  const body = await parseApiErrorBody(error);
  return body?.message ?? null;
}

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
