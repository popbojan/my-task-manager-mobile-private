jest.mock('@/api/authClient', () => ({
  authApi: {
    requestOtp: jest.fn(),
    loginWithOtp: jest.fn(),
  },
  authRequestInit: { credentials: 'include' },
}));

jest.mock('@/device/deviceRequestHeaders', () => ({
  getAuthDeviceHeaders: jest.fn(),
}));

jest.mock('@/device/deviceId', () => ({
  rotateDeviceId: jest.fn(async () => 'new-device-id'),
}));

import { authApi } from '@/api/authClient';
import { Language } from '@/api/generated';
import { ResponseError } from '@/api/generated/runtime';
import {
  loginWithOtpWithDeviceConflictRetry,
  requestOtpWithDeviceConflictRetry,
} from '@/device/authDeviceConflictRetry';
import { rotateDeviceId } from '@/device/deviceId';
import { getAuthDeviceHeaders } from '@/device/deviceRequestHeaders';

const requestOtp = authApi.requestOtp as jest.Mock;
const loginWithOtp = authApi.loginWithOtp as jest.Mock;
const getHeaders = getAuthDeviceHeaders as jest.Mock;
const rotateId = rotateDeviceId as jest.Mock;

function conflictError(code: string): ResponseError {
  return new ResponseError(
    new Response(JSON.stringify({ code, statusCode: 409 }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

const baseHeaders = {
  xDeviceId: 'old-device-id',
  xDevicePlatform: 'ANDROID',
  xAppVersion: '1.3.4',
  xDeviceModel: 'Pixel',
  xDeviceOSName: 'Android',
  xDeviceOSVersion: '14',
};

describe('authDeviceConflictRetry', () => {
  beforeEach(() => {
    requestOtp.mockReset();
    loginWithOtp.mockReset();
    getHeaders.mockReset();
    rotateId.mockClear();
    getHeaders
      .mockResolvedValueOnce(baseHeaders)
      .mockResolvedValueOnce({ ...baseHeaders, xDeviceId: 'new-device-id' });
  });

  it('returns on first success without rotating', async () => {
    requestOtp.mockResolvedValue({ ok: true });

    await requestOtpWithDeviceConflictRetry({
      email: 'a@b.c',
      language: Language.En,
    });

    expect(requestOtp).toHaveBeenCalledTimes(1);
    expect(rotateId).not.toHaveBeenCalled();
  });

  it('rotates device id and retries once on DEVICE_PLATFORM_MISMATCH', async () => {
    requestOtp
      .mockRejectedValueOnce(conflictError('DEVICE_PLATFORM_MISMATCH'))
      .mockResolvedValueOnce({ ok: true });

    await requestOtpWithDeviceConflictRetry({
      email: 'a@b.c',
      language: Language.En,
    });

    expect(rotateId).toHaveBeenCalledTimes(1);
    expect(requestOtp).toHaveBeenCalledTimes(2);
    expect(requestOtp.mock.calls[1][0].xDeviceId).toBe('new-device-id');
  });

  it('rotates device id and retries once on DEVICE_MODEL_MISMATCH for login', async () => {
    loginWithOtp
      .mockRejectedValueOnce(conflictError('DEVICE_MODEL_MISMATCH'))
      .mockResolvedValueOnce({ accessToken: 'token' });

    const result = await loginWithOtpWithDeviceConflictRetry({
      email: 'a@b.c',
      otp: '123456',
      language: Language.En,
    });

    expect(result.accessToken).toBe('token');
    expect(rotateId).toHaveBeenCalledTimes(1);
    expect(loginWithOtp).toHaveBeenCalledTimes(2);
  });

  it('does not retry on unrelated 409', async () => {
    requestOtp.mockRejectedValueOnce(conflictError('DAILY_RESET_REQUIRED'));

    await expect(
      requestOtpWithDeviceConflictRetry({
        email: 'a@b.c',
        language: Language.En,
      }),
    ).rejects.toBeInstanceOf(ResponseError);

    expect(rotateId).not.toHaveBeenCalled();
    expect(requestOtp).toHaveBeenCalledTimes(1);
  });
});
