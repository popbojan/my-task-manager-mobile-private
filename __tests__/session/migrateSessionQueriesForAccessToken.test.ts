import { QueryClient } from '@tanstack/react-query';
import { migrateSessionQueriesForAccessToken } from '@/session/migrateSessionQueriesForAccessToken';

describe('migrateSessionQueriesForAccessToken', () => {
  it('copies cached entries from the old JWT key to the new JWT key', () => {
    const queryClient = new QueryClient();
    const oldToken = 'old-jwt';
    const newToken = 'new-jwt';
    const user = { id: 'u1', email: 'a@b.c' };

    queryClient.setQueryData(['current-user', oldToken], user);
    queryClient.setQueryData(['tasks', oldToken], [{ id: 't1' }]);

    migrateSessionQueriesForAccessToken(queryClient, oldToken, newToken);

    expect(queryClient.getQueryData(['current-user', newToken])).toEqual(user);
    expect(queryClient.getQueryData(['tasks', newToken])).toEqual([{ id: 't1' }]);
  });

  it('no-ops when tokens are identical', () => {
    const queryClient = new QueryClient();
    const setQueryData = jest.spyOn(queryClient, 'setQueryData');
    queryClient.setQueryData(['current-user', 'same'], { id: 'u1' });
    setQueryData.mockClear();

    migrateSessionQueriesForAccessToken(queryClient, 'same', 'same');

    expect(setQueryData).not.toHaveBeenCalled();
  });
});
