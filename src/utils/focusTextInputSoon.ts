import type { RefObject } from 'react';
import type { TextInput } from 'react-native';
import { Platform } from 'react-native';

/** Focus after the modal overlay is on screen (autoFocus alone is unreliable in RN Modal). */
export function focusTextInputSoon(inputRef: RefObject<TextInput | null>): void {
  const focus = () => {
    inputRef.current?.focus();
  };

  // RN 0.87+ removed InteractionManager from core — rAF after mount is enough here.
  requestAnimationFrame(() => {
    focus();
    if (Platform.OS === 'android') {
      requestAnimationFrame(focus);
    }
  });
}
