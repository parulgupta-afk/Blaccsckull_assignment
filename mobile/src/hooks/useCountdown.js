import { useEffect, useState, useRef } from 'react';

/**
 * Countdown is computed against (targetDate - authoritativeNow).
 * We maintain a smooth second-by-second countdown without erratic jumping
 * caused by frequent network refetches or uninitialized zero states.
 */
export function useCountdown(targetDate, serverTime) {
  const serverOffsetRef = useRef(null);

  if (serverOffsetRef.current === null && serverTime) {
    serverOffsetRef.current = new Date(serverTime).getTime() - Date.now();
  }

  const computeRemaining = () => {
    if (!targetDate) return 0;
    const target = new Date(targetDate).getTime();
    if (isNaN(target)) return 0;
    const offset = serverOffsetRef.current !== null ? serverOffsetRef.current : 0;
    const currentVirtualTime = Date.now() + offset;
    return Math.max(target - currentVirtualTime, 0);
  };

  const [remainingMs, setRemainingMs] = useState(() => computeRemaining());

  useEffect(() => {
    if (!targetDate) return undefined;

    if (serverTime) {
      const freshOffset = new Date(serverTime).getTime() - Date.now();
      if (serverOffsetRef.current === null || Math.abs(freshOffset - serverOffsetRef.current) > 3000) {
        serverOffsetRef.current = freshOffset;
      }
    }

    const tick = () => setRemainingMs(computeRemaining());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate, serverTime]);

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { remainingMs, days, hours, minutes, seconds, isExpired: remainingMs <= 0 };
}
