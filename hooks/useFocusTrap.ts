'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * useFocusTrap - A hook to trap focus within a modal/dialog element
 * 
 * This hook ensures keyboard users can't tab outside of a modal when it's open,
 * improving accessibility for modal dialogs.
 * 
 * @param isActive - Whether the focus trap should be active
 * @param options - Configuration options
 */
export function useFocusTrap(
  isActive: boolean,
  options: {
    /** Callback when focus trap is initialized */
    onTrap?: () => void;
    /** Callback when focus trap is released */
    onRelease?: () => void;
  } = {}
) {
  const { onTrap, onRelease } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    );
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || e.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) {
      e.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [isActive, getFocusableElements]);

  useEffect(() => {
    if (!isActive) {
      // Release focus trap
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
      onRelease?.();
      return;
    }

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get focusable elements and focus the first one
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Add event listener for Tab key
    document.addEventListener('keydown', handleKeyDown);

    onTrap?.();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, getFocusableElements, handleKeyDown, onTrap, onRelease]);

  return containerRef;
}

/**
 * useFocusReturn - A hook to return focus to the trigger element after modal closes
 * 
 * This should be used together with useFocusTrap for complete modal accessibility
 */
export function useFocusReturn(isActive: boolean, triggerRef?: React.RefObject<HTMLElement>) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else if (!isActive && previousActiveElement.current) {
      // Return focus to trigger element or previous element
      if (triggerRef?.current) {
        triggerRef.current.focus();
      } else if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      previousActiveElement.current = null;
    }
  }, [isActive, triggerRef]);
}

export default useFocusTrap;
