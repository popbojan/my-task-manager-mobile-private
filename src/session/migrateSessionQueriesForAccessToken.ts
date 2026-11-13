import type { QueryClient } from '@tanstack/react-query';

/**
 * Query keys embed the access JWT. A foreground token refresh would otherwise
 * create empty keys → current-user looks unfetched → AppLaunchView for 10–20s.
 * Copy cached data onto the new-token keys before swapping the token in React.
 */
export function migrateSessionQueriesForAccessToken(
  queryClient: QueryClient,
  previousToken: string,
  nextToken: string,
): void {
  if (previousToken === nextToken) {
    return;
  }

  for (const query of queryClient.getQueryCache().getAll()) {
    const key = query.queryKey;
    if (!Array.isArray(key) || !key.includes(previousToken)) {
      continue;
    }

    if (query.state.data === undefined) {
      continue;
    }

    const nextKey = key.map(part =>
      part === previousToken ? nextToken : part,
    );
    queryClient.setQueryData(nextKey, query.state.data);
  }
}
