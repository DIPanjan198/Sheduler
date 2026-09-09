import { useEffect, useRef } from 'react';

/**
 * Custom hook to automatically synchronize UI state in real-time.
 * Listens for instant mutation actions and runs silent background polling.
 */
export function useDataSync(callback: () => void | Promise<void>, pollIntervalMs: number = 5000) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // Initial fetch
    savedCallback.current();

    // 1. Instant event listener for local mutation actions
    const handleDataChanged = () => {
      savedCallback.current();
    };

    window.addEventListener('shift-scheduler:data-changed', handleDataChanged);

    // 2. Silent background polling interval for cross-device/tab synchronization
    const timer = setInterval(() => {
      savedCallback.current();
    }, pollIntervalMs);

    return () => {
      window.removeEventListener('shift-scheduler:data-changed', handleDataChanged);
      clearInterval(timer);
    };
  }, [pollIntervalMs]);
}
