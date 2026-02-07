'use client';

import { useEffect, useCallback } from 'react';

type KeyCombo = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
};

export function useKeyboardShortcut(combo: KeyCombo, callback: () => void) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      // Don't trigger in input fields
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (
        event.key.toLowerCase() === combo.key.toLowerCase() &&
        !!event.ctrlKey === !!combo.ctrl &&
        !!event.shiftKey === !!combo.shift &&
        !!event.altKey === !!combo.alt
      ) {
        event.preventDefault();
        callback();
      }
    },
    [combo, callback]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
