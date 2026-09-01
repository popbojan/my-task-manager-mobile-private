export const subscriptionQueryKey = ['subscription'] as const;

export const subscriptionQueryOptions = {
  staleTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;
