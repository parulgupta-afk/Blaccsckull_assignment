import { useEffect, useState } from 'react';

/**
 * Countdown is computed against (targetDate - serverTime), with a captured
 * offset from device "now" -- so a participant with a wrong device clock
 * still sees an accurate countdown anchored to the backend's authoritative
 * `serverTime` field, without needing a fresh network call every tick.
 */
export function useCountdown(targetDate, serverTime) {
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!targetDate || !serverTime) return undefined;

    const target = new Date(targetDate).getTime();
    const offset = new Date(serverTime).getTime() - Date.now();

    const tick = () => setRemainingMs(Math.max(target - (Date.now() + offset), 0));
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
