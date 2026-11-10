type ReminderRescheduleListener = () => void;

const listeners = new Set<ReminderRescheduleListener>();

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
