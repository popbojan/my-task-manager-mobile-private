import { getApiBaseUrl } from '@/config/api';

export function historyMonthQueryKey(
  accessToken: string | null,
  month: string,
  calendarDate?: string | null,
) {
  if (calendarDate) {
    return ['history', getApiBaseUrl(), accessToken, month, calendarDate] as const;
  }

  return ['history', getApiBaseUrl(), accessToken, month] as const;
}

export function historyQueryKeyPrefix(accessToken: string | null) {
  return ['history', getApiBaseUrl(), accessToken] as const;
}
