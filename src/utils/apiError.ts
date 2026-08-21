export function isApiPremiumRequiredError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status: number }).status === 402
  );
}

export function isApiConflictError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as { status: number }).status === 409
  );
}

export function shouldRetryApiQuery(_failureCount: number, error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as { status: number }).status === 'number'
  ) {
    const status = (error as { status: number }).status;
    if (status >= 400 && status < 500) {
      return false;
    }
  }

  return _failureCount < 2;
}
