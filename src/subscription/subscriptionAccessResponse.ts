import type { SubscriptionAccess } from '@/api/generated/models/SubscriptionAccess';

/** Backend fields not yet in OpenAPI v1.6.0 SubscriptionAccess schema. */
export type SubscriptionAccessResponse = SubscriptionAccess & {
  stripeSyncFailed?: boolean;
  revenueCatSyncFailed?: boolean;
};

export function readStripeSyncFailed(
  access: SubscriptionAccess | undefined,
): boolean {
  return (access as SubscriptionAccessResponse | undefined)?.stripeSyncFailed === true;
}

export function readRevenueCatSyncFailed(
  access: SubscriptionAccess | undefined,
): boolean {
  return (
    (access as SubscriptionAccessResponse | undefined)?.revenueCatSyncFailed === true
  );
}

export function parseSubscriptionAccessResponse(
  json: Record<string, unknown>,
  base: SubscriptionAccess,
): SubscriptionAccessResponse {
  return {
    ...base,
    stripeSyncFailed: json.stripeSyncFailed === true,
    revenueCatSyncFailed: json.revenueCatSyncFailed === true,
  };
}
