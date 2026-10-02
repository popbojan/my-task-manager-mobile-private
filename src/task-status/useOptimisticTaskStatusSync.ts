import { useCallback, useRef } from 'react';
import { shouldApplyOptimisticStatusSync } from '@/utils/shouldApplyOptimisticStatusSync';

type UseOptimisticTaskStatusSyncOptions<TStatus, TTask extends { id: string; status: TStatus }> =
  {
    getNextStatus: (current: TStatus) => TStatus;
    updateStatusOnServer: (taskId: string, status: TStatus) => Promise<TTask>;
    applyServerTask: (task: TTask) => void;
    applyOptimisticStatus: (taskId: string, status: TStatus) => void;
    onSyncSettled?: () => void;
    onSyncFailed?: (taskId: string) => void | Promise<void>;
  };

export function useOptimisticTaskStatusSync<
  TStatus,
  TTask extends { id: string; status: TStatus },
>({
  getNextStatus,
  updateStatusOnServer,
  applyServerTask,
  applyOptimisticStatus,
  onSyncSettled,
  onSyncFailed,
}: UseOptimisticTaskStatusSyncOptions<TStatus, TTask>) {
  const statusTargetsRef = useRef(new Map<string, TStatus>());
  const statusSyncRunningRef = useRef(new Set<string>());
  const liveStatusRef = useRef(new Map<string, TStatus>());

  const clearLiveStatus = useCallback((taskId: string) => {
    liveStatusRef.current.delete(taskId);
  }, []);

  const setLiveStatus = useCallback((taskId: string, status: TStatus) => {
    liveStatusRef.current.set(taskId, status);
  }, []);

  const resolveStatus = useCallback((taskId: string, cachedStatus: TStatus): TStatus => {
    const live = liveStatusRef.current.get(taskId);
    if (live !== undefined) {
      return live;
    }

    const pending = statusTargetsRef.current.get(taskId);
    if (pending !== undefined) {
      return pending;
    }

    return cachedStatus;
  }, []);

  const taskForDisplay = useCallback(
    (task: TTask): TTask => {
      const status = resolveStatus(task.id, task.status);
      return status === task.status ? task : { ...task, status };
    },
    [resolveStatus],
  );

  const drainStatusSync = useCallback(
    async (taskId: string) => {
      if (statusSyncRunningRef.current.has(taskId)) {
        return;
      }

      statusSyncRunningRef.current.add(taskId);

      try {
        while (statusTargetsRef.current.has(taskId)) {
          const status = statusTargetsRef.current.get(taskId)!;

          try {
            const updated = await updateStatusOnServer(taskId, status);
            const pendingTarget = statusTargetsRef.current.get(taskId);

            if (!shouldApplyOptimisticStatusSync(pendingTarget, status)) {
              continue;
            }

            applyServerTask(updated);
            statusTargetsRef.current.delete(taskId);
            clearLiveStatus(taskId);
          } catch {
            statusTargetsRef.current.delete(taskId);
            clearLiveStatus(taskId);
            await onSyncFailed?.(taskId);
            break;
          }
        }
      } finally {
        statusSyncRunningRef.current.delete(taskId);
        onSyncSettled?.();
      }
    },
    [
      applyServerTask,
      clearLiveStatus,
      onSyncFailed,
      onSyncSettled,
      updateStatusOnServer,
    ],
  );

  const toggleStatus = useCallback(
    (task: TTask) => {
      const currentStatus = resolveStatus(task.id, task.status);
      const nextStatus = getNextStatus(currentStatus);

      statusTargetsRef.current.set(task.id, nextStatus);
      setLiveStatus(task.id, nextStatus);
      applyOptimisticStatus(task.id, nextStatus);
      drainStatusSync(task.id).catch(() => {});
    },
    [applyOptimisticStatus, drainStatusSync, getNextStatus, resolveStatus, setLiveStatus],
  );

  return {
    toggleStatus,
    taskForDisplay,
  };
}
