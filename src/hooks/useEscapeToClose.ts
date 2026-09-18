import { useEffect, useRef } from 'react';

/**
 * Close a dialog on Escape and restore focus to the element that opened it.
 * Works with both Escape and existing close-button paths because focus is
 * restored whenever `isOpen` transitions from true to false.
 */
export function useEscapeToClose(isOpen: boolean, onClose: () => void): void {
  const onCloseRef = useRef(onClose);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      onCloseRef.current();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    const opener = openerRef.current;
    openerRef.current = null;
    if (opener && typeof opener.focus === 'function') {
      opener.focus();
    }
  }, [isOpen]);
}
