import { ResponseError } from '@/api/generated/runtime';
import { isApiDailyResetRequiredError } from '@/utils/apiError';

function conflictError(body: Record<string, unknown>): ResponseError {
  return new ResponseError(
    new Response(JSON.stringify(body), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('isApiDailyResetRequiredError', () => {
  it('detects DAILY_RESET_REQUIRED conflicts', async () => {
    const error = conflictError({
      code: 'DAILY_RESET_REQUIRED',
      statusCode: 409,
      error: 'Conflict',
      message: 'Daily reset required',
    });

    await expect(isApiDailyResetRequiredError(error)).resolves.toBe(true);
  });

  it('ignores other 409 conflicts', async () => {
    const error = conflictError({
      code: 'HISTORY_DAY_NOT_REPAIRABLE',
      statusCode: 409,
      error: 'Conflict',
      message: 'Not repairable',
    });

    await expect(isApiDailyResetRequiredError(error)).resolves.toBe(false);
  });

  it('ignores non-conflict errors', async () => {
    await expect(isApiDailyResetRequiredError(new Error('boom'))).resolves.toBe(
      false,
    );
  });
});
