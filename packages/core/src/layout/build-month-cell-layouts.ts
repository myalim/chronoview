/**
 * buildMonthCellLayouts — 월간 그리드의 각 셀에 대한 레이아웃 데이터를 생성한다.
 *
 * 각 셀에 해당 날짜의 이벤트를 필터링하고, truncateEvents로 표시/숨김 이벤트를
 * 분리한다. hook이 이 결과를 그대로 반환하므로 Calendar 컴포넌트는 추가 계산 없이
 * 렌더링에 사용할 수 있다.
 */

import { isSameDay } from "date-fns";
import type { MonthCellLayout, TimelineEvent } from "../types/index.js";
import { truncateEvents } from "./truncate-events.js";

export function buildMonthCellLayouts(
  /** calculateMonthGrid 결과 (Date[][] — 주별 날짜 배열) */
  grid: Date[][],
  /** dateRange로 필터된 이벤트 */
  visibleEvents: TimelineEvent[],
  /** 현재 표시 중인 월 (0-11) */
  currentMonth: number,
  /** 셀당 최대 표시 이벤트 수 */
  maxVisible: number,
  /** 오늘 날짜 (isToday 판별용) */
  today: Date,
): MonthCellLayout[][] {
  return grid.map((weekDates, weekIndex) =>
    weekDates.map((cellDate) => {
      // 해당 날짜의 자정~익일 자정 범위로 이벤트 필터
      const dayStart = new Date(
        cellDate.getFullYear(),
        cellDate.getMonth(),
        cellDate.getDate(),
        0, 0, 0, 0,
      );
      const dayEnd = new Date(
        cellDate.getFullYear(),
        cellDate.getMonth(),
        cellDate.getDate() + 1,
        0, 0, 0, 0,
      );

      const cellEvents = visibleEvents.filter(
        (e) => e.end > dayStart && e.start < dayEnd,
      );

      const truncated = truncateEvents({ events: cellEvents, maxVisible });

      return {
        date: cellDate,
        isToday: isSameDay(cellDate, today),
        isCurrentMonth: cellDate.getMonth() === currentMonth,
        events: cellEvents,
        visibleEvents: truncated.visible,
        visibleCount: truncated.visible.length,
        hiddenCount: truncated.hiddenCount,
        weekIndex,
      };
    }),
  );
}
