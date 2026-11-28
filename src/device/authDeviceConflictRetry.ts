import type {
  LoginRequest,
  LoginResponse,
  OTPRequest,
  RequestOtp200Response,
} from '@/api/generated';
import { authApi, authRequestInit } from '@/api/authClient';
import { getAuthDeviceHeaders } from '@/device/deviceRequestHeaders';
import { rotateDeviceId } from '@/device/deviceId';
import {
  getApiErrorCode,
  isApiConflictError,
} from '@/utils/apiError';

const DEVICE_CONFLICT_CODES = new Set([
  'DEVICE_PLATFORM_MISMATCH',
  'DEVICE_MODEL_MISMATCH',
]);

export async function isAuthDeviceConflictError(
  error: unknown,
): Promise<boolean> {
  if (!isApiConflictError(error)) {
    return false;
  }

  const code = await getApiErrorCode(error);
  return code != null && DEVICE_CONFLICT_CODES.has(code);
}

/**
 * request-otp with one retry on device platform/model mismatch:
 * rotate installation UUID, persist, retry once (spec 1.17.9 / 1.17.10).
 */
export async function requestOtpWithDeviceConflictRetry(
  oTPRequest: OTPRequest,
): Promise<RequestOtp200Response> {
  const deviceHeaders = await getAuthDeviceHeaders();
  try {
    return await authApi.requestOtp({
      oTPRequest,
      ...deviceHeaders,
    });
  } catch (error) {
    if (!(await isAuthDeviceConflictError(error))) {
      throw error;
    }

    await rotateDeviceId();
    const retryHeaders = await getAuthDeviceHeaders();
    return authApi.requestOtp({
      oTPRequest,
      ...retryHeaders,
    });
  }
}

/**
 * login-with-otp with one retry on device platform/model mismatch.
 * OTP is not consumed on conflict, so the same OTP may be retried.
 */
export async function loginWithOtpWithDeviceConflictRetry(
  loginRequest: LoginRequest,
): Promise<LoginResponse> {
  const deviceHeaders = await getAuthDeviceHeaders();
  try {
    return await authApi.loginWithOtp(
      {
        loginRequest,
        ...deviceHeaders,
      },
      authRequestInit,
    );
  } catch (error) {
    if (!(await isAuthDeviceConflictError(error))) {
      throw error;
    }

    await rotateDeviceId();
    const retryHeaders = await getAuthDeviceHeaders();
    return authApi.loginWithOtp(
      {
        loginRequest,
        ...retryHeaders,
      },
      authRequestInit,
    );
  }
}
