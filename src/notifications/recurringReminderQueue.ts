type ReminderRescheduleListener = () => void;

const listeners = new Set<ReminderRescheduleListener>();

/** While true, idle sync must not run native Notifee work (keeps form open snappy). */
let syncSuspended = false;

/** Ask the idle reminder sync to rebuild local alarms soon (non-blocking). */
export function requestRecurringReminderReschedule(): void {
  listeners.forEach(listener => {
    try {
      listener();
    } catch {
      // Listener failures must not break save/UI.
    }
  });
}

export function subscribeRecurringReminderReschedule(
  listener: ReminderRescheduleListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isRecurringReminderSyncSuspended(): boolean {
  return syncSuspended;
}

/** Pause native reminder sync while the form modal is open. */
export function setRecurringReminderSyncSuspended(suspended: boolean): void {
  syncSuspended = suspended;
}
