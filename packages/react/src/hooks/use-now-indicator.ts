/**
 * useNowIndicator — Real-time now position tracking.
 *
 * Calculates the current time position within the visible time range
 * and updates it at a configurable interval (default: 60s).
 */

import { useState, useMemo, useEffect } from "react";
import { calculateNowPosition } from "@chronoview/core";

export interface UseNowIndicatorConfig {
  rangeStart: Date;
  rangeEnd: Date;
  totalSize: number;
  enabled?: boolean;
  /** Update interval in ms (default: 60000) */
  interval?: number;
}

export interface UseNowIndicatorReturn {
  position: number | null;
  now: Date;
}

export function useNowIndicator({
  rangeStart,
  rangeEnd,
  totalSize,
  enabled = true,
  interval = 60_000,
}: UseNowIndicatorConfig): UseNowIndicatorReturn {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      setNow(new Date());
    }, interval);

    return () => clearInterval(timer);
  }, [enabled, interval]);

  const position = useMemo(() => {
    if (!enabled) return null;
    return calculateNowPosition({ now, rangeStart, rangeEnd, totalSize });
  }, [now, rangeStart, rangeEnd, totalSize, enabled]);

  return { position, now };
}
