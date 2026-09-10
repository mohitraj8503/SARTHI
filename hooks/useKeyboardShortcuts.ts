'use client';

import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
};

type ShortcutAction = () => void;

interface ShortcutConfig {
  combo: KeyCombo;
  action: ShortcutAction;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global shortcuts map
      // You can expand this array or pass it as an argument
      const shortcuts: ShortcutConfig[] = [
        {
          combo: { key: 'k', meta: true }, // Cmd+K
          action: () => {
            // Dispatch event to open command palette
            const e = new CustomEvent('open-command-palette');
            window.dispatchEvent(e);
          },
          preventDefault: true
        },
        {
          combo: { key: 'k', ctrl: true }, // Ctrl+K
          action: () => {
            const e = new CustomEvent('open-command-palette');
            window.dispatchEvent(e);
          },
          preventDefault: true
        }
      ];

      shortcuts.forEach(({ combo, action, preventDefault }) => {
        const keyMatch = (event.key || '').toLowerCase() === (combo.key || '').toLowerCase();
        const ctrlMatch = !!combo.ctrl === event.ctrlKey;
        const metaMatch = !!combo.meta === event.metaKey;
        const shiftMatch = !!combo.shift === event.shiftKey;
        const altMatch = !!combo.alt === event.altKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          if (preventDefault) {
            event.preventDefault();
          }
          action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
