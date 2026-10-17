import type { RefObject } from 'react';
import type { TextInputInstance } from 'react-native';
import { Platform } from 'react-native';

type FocusTextInputOptions = {
  /** Extra delayed attempts — needed when the field sits inside RN `Modal`. */
  modal?: boolean;
};

/** Focus after the modal overlay is on screen (autoFocus alone is unreliable in RN Modal). */
export function focusTextInputSoon(
  inputRef: RefObject<TextInputInstance | null>,
  options?: FocusTextInputOptions,
): void {
  const focus = () => {
    inputRef.current?.focus();
  };

  const schedule = (delayMs: number) => {
    if (delayMs === 0) {
      requestAnimationFrame(() => {
        focus();
        if (Platform.OS === 'android') {
          requestAnimationFrame(focus);
        }
      });
      return;
    }

    setTimeout(focus, delayMs);
  };

  schedule(0);

  if (options?.modal) {
    schedule(100);
    schedule(250);
  }
}
