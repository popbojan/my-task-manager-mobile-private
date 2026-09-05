import { useMemo } from 'react';
import { RefreshControl } from 'react-native';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type UseRefreshControlOptions = {
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
};

export function useRefreshControl({
  refreshing,
  onRefresh,
}: UseRefreshControlOptions) {
  return useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={recurringTheme.accentBright}
        colors={[recurringTheme.accent, recurringTheme.accentBright]}
        progressBackgroundColor={recurringTheme.surfaceCard}
      />
    ),
    [onRefresh, refreshing],
  );
}
