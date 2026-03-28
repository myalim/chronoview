/**
 * DateNavigator — Date navigation control with prev/next buttons.
 *
 * Displays the current date in a view-dependent format
 * with navigation arrows.
 *
 * Reference: docs/design/common/component-specs.md §1
 */

import { cn } from "../utils/cn.js";
import { Button } from "./button.js";

type View = "day" | "week" | "month";

export interface DateNavigatorProps {
  currentDate: Date;
  view: View;
  onPrev: () => void;
  onNext: () => void;
  onDateClick?: () => void;
  formatDate?: (date: Date, view: View) => string;
  className?: string;
}

/** Default date format per view */
function defaultFormatDate(date: Date, view: View): string {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = dayNames[date.getDay()];

  if (view === "day") {
    return `${y}년 ${String(m).padStart(2, "0")}월 ${String(d).padStart(
      2,
      "0"
    )}일 ${dayOfWeek}요일`;
  }

  if (view === "week") {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const sm = String(start.getMonth() + 1).padStart(2, "0");
    const sd = String(start.getDate()).padStart(2, "0");
    const em = String(end.getMonth() + 1).padStart(2, "0");
    const ed = String(end.getDate()).padStart(2, "0");
    return `${start.getFullYear()}.${sm}.${sd} - ${em}.${ed}`;
  }

  return `${y}년 ${m}월`;
}

export function DateNavigator({
  currentDate,
  view,
  onPrev,
  onNext,
  onDateClick,
  formatDate = defaultFormatDate,
  className,
}: DateNavigatorProps) {
  const dateText = formatDate(currentDate, view);

  return (
    <div className={cn("flex items-center gap-1 h-10", className)}>
      <Button variant="ghost" size="icon" onClick={onPrev} aria-label="이전">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 12L6 8L10 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>

      <span
        role={onDateClick ? "button" : undefined}
        tabIndex={onDateClick ? 0 : undefined}
        onClick={onDateClick}
        onKeyDown={
          onDateClick
            ? ({ key }) => {
                if (key === "Enter") onDateClick();
              }
            : undefined
        }
        className={cn(
          "select-none whitespace-nowrap text-xl font-semibold text-[var(--cv-color-text)]",
          onDateClick ? "cursor-pointer" : "cursor-default"
        )}
      >
        {dateText}
      </span>

      <Button variant="ghost" size="icon" onClick={onNext} aria-label="다음">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
    </div>
  );
}
