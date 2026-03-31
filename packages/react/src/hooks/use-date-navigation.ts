/**
 * useDateNavigation — Date navigation state management.
 *
 * Supports both controlled and uncontrolled modes:
 * - Uncontrolled: pass `initialDate` — hook manages state internally.
 * - Controlled: pass `date` + `onDateChange` — hook delegates state to the consumer.
 *
 * Uses core navigation functions for view-aware date shifting.
 */

import { useState, useCallback, useRef } from "react";
import { navigatePrev, navigateNext, goToDate as coreGoToDate } from "@chronoview/core";
import type { View } from "@chronoview/core";

export interface UseDateNavigationConfig {
  /** Initial date for uncontrolled mode. Ignored when `date` is provided. */
  initialDate?: Date;
  /** Controlled current date. When provided, internal state is bypassed. */
  date?: Date;
  /** Called when navigation occurs in controlled mode. */
  onDateChange?: (date: Date) => void;
  view: View;
}

export interface UseDateNavigationReturn {
  currentDate: Date;
  goToPrev: () => void;
  goToNext: () => void;
  goToDate: (date: Date) => void;
  goToToday: () => void;
}

export function useDateNavigation({
  initialDate,
  date,
  onDateChange,
  view,
}: UseDateNavigationConfig): UseDateNavigationReturn {
  const [internalDate, setInternalDate] = useState<Date>(initialDate ?? new Date());

  const isControlled = date !== undefined;
  const currentDate = isControlled ? date : internalDate;

  // Latest ref: keeps callbacks stable while reading the most recent date.
  const currentDateRef = useRef(currentDate);
  currentDateRef.current = currentDate;

  // Shared setter: updates internal state in uncontrolled mode,
  // notifies consumer in controlled mode.
  const updateDate = useCallback(
    (next: Date) => {
      if (isControlled) {
        onDateChange?.(next);
      } else {
        setInternalDate(next);
      }
    },
    [isControlled, onDateChange],
  );

  const goToPrev = useCallback(() => {
    updateDate(navigatePrev(currentDateRef.current, view));
  }, [view, updateDate]);

  const goToNext = useCallback(() => {
    updateDate(navigateNext(currentDateRef.current, view));
  }, [view, updateDate]);

  const goToDate = useCallback(
    (d: Date) => {
      updateDate(coreGoToDate(d));
    },
    [updateDate],
  );

  const goToToday = useCallback(() => {
    updateDate(coreGoToDate(new Date()));
  }, [updateDate]);

  return { currentDate, goToPrev, goToNext, goToDate, goToToday };
}
