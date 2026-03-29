/**
 * useDateNavigation — Date navigation state management.
 *
 * Manages current date and provides prev/next/goToDate/goToToday actions.
 * Uses core navigation functions for view-aware date shifting.
 */

import { useState, useCallback } from "react";
import { navigatePrev, navigateNext, goToDate as coreGoToDate } from "@chronoview/core";
import type { View } from "@chronoview/core";

export interface UseDateNavigationConfig {
  initialDate?: Date;
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
  view,
}: UseDateNavigationConfig): UseDateNavigationReturn {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate ?? new Date());

  const goToPrev = useCallback(() => {
    setCurrentDate((d) => navigatePrev(d, view));
  }, [view]);

  const goToNext = useCallback(() => {
    setCurrentDate((d) => navigateNext(d, view));
  }, [view]);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(coreGoToDate(date));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(coreGoToDate(new Date()));
  }, []);

  return { currentDate, goToPrev, goToNext, goToDate, goToToday };
}
