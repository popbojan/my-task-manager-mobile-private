import { QueryClient } from '@tanstack/react-query';
import { invalidateAuthenticatedSessionQueries } from '@/session/invalidateAuthenticatedQueries';

describe('invalidateAuthenticatedSessionQueries', () => {
  it('marks history stale so Mein Weg cannot keep yesterday after a session refresh', () => {
    const queryClient = new QueryClient();
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    invalidateAuthenticatedSessionQueries(queryClient);

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['history'] });
  });
});
