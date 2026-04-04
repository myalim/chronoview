import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";

/**
 * 셀 정보 (renderCellContent 콜백에 전달)
 */
export interface MonthCellInfo {
  isCurrentMonth: boolean;
  isToday: boolean;
}

export interface CalendarMonthGridProps {
  /** 월 그리드 2D 배열 — calculateMonthGrid(date, weekStartsOn) 결과 */
  weeks: Date[][];
  /** 이번 달 판별용 (0-11) */
  currentMonth: number;
  /** 오늘 날짜 하이라이트 */
  today?: Date;
  /** 요일 라벨 (기본: ["일","월","화","수","목","금","토"]) */
  weekdayLabels?: string[];
  /** 셀 내부 콘텐츠 — 날짜 숫자 아래 영역 (list 모드 이벤트 등) */
  renderCellContent?: (date: Date, info: MonthCellInfo) => ReactNode;
  /** 주 단위 오버레이 — position: absolute로 배치됨 (bar 모드 이벤트 바 등) */
  renderWeekOverlay?: (weekDates: Date[], weekIndex: number) => ReactNode;
  /** 이벤트 없는 셀에 빈 상태 라벨 표시 (기본: false) */
  showEmptyLabel?: boolean;
  /** 빈 상태 라벨 텍스트 */
  emptyLabel?: string;
  /** 셀에 이벤트가 있는지 판별 — showEmptyLabel 사용 시 필요 */
  hasEvents?: (date: Date) => boolean;
  className?: string;
}

const DEFAULT_WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

/** 두 Date가 같은 날짜인지 비교 (시간 무시) */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Calendar Month 그리드 레이아웃.
 *
 * 7열 × 4~6행 날짜 그리드를 렌더링한다.
 * 요일 헤더는 sticky, 오늘 날짜/셀은 하이라이트.
 * 이벤트 렌더링은 renderCellContent (셀 내부) 또는 renderWeekOverlay (주 단위 오버레이)로 위임.
 */
export function CalendarMonthGrid({
  weeks,
  currentMonth,
  today,
  weekdayLabels = DEFAULT_WEEKDAY_LABELS,
  renderCellContent,
  renderWeekOverlay,
  showEmptyLabel = false,
  emptyLabel,
  hasEvents,
  className,
}: CalendarMonthGridProps) {
  // 오늘 요일의 열 인덱스 (weekStartsOn=0 기준)
  const todayColIndex = today?.getDay();

  return (
    <div
      className={cn(
        "border border-[var(--cv-color-border)] rounded-[var(--cv-radius-lg)] overflow-hidden",
        className,
      )}
    >
      {/* ── 요일 헤더 (sticky top) ── */}
      <div className="sticky top-0 z-[var(--cv-z-sticky-header)] grid grid-cols-7 border-b border-[var(--cv-color-border)] bg-[var(--cv-color-surface)]">
        {weekdayLabels.map((label, i) => (
          <div
            key={label}
            className={cn(
              "flex items-center justify-center h-[var(--cv-size-date-header-height)] text-[length:var(--cv-font-size-sm)]",
              i < 6 && "border-r border-[var(--cv-color-border)]",
              todayColIndex === i
                ? "font-[var(--cv-font-weight-bold)] text-[var(--cv-color-today-border)]"
                : "font-[var(--cv-font-weight-medium)] text-[var(--cv-color-text-secondary)]",
            )}
          >
            {label}
          </div>
        ))}
      </div>

      {/* ── 주 행 ── */}
      {weeks.map((week, weekIndex) => {
        // 주의 첫 날짜를 key로 사용 (안정적인 고유값)
        const weekKey = `${week[0].getFullYear()}-${week[0].getMonth()}-${week[0].getDate()}`;
        return (
        <div key={weekKey} className="relative">
          <div
            className={cn(
              "grid grid-cols-7",
              weekIndex < weeks.length - 1 &&
                "border-b border-[var(--cv-color-border)]",
            )}
          >
            {week.map((date, colIdx) => {
              const isCurrentMonth = date.getMonth() === currentMonth;
              const isToday = today != null && isSameDay(date, today);
              const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

              return (
                <div
                  key={dayKey}
                  className={cn(
                    "min-h-[var(--cv-size-month-cell-min-height)] p-[var(--cv-spacing-xs)]",
                    colIdx < 6 && "border-r border-[var(--cv-color-border)]",
                    isToday && "bg-[var(--cv-color-today-bg)]",
                  )}
                >
                  {/* 날짜 숫자 */}
                  <div className="flex items-center h-6 mb-[var(--cv-spacing-xs)]">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center text-[length:var(--cv-font-size-base)] leading-none",
                        isToday
                          ? "w-6 h-6 rounded-full bg-[var(--cv-color-today-border)] text-white font-[var(--cv-font-weight-bold)]"
                          : isCurrentMonth
                            ? "text-[var(--cv-color-text)]"
                            : "text-[var(--cv-color-text-muted)]",
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  {/* 셀 콘텐츠 (list 모드 등) */}
                  {renderCellContent?.(date, { isCurrentMonth, isToday })}

                  {/* 빈 셀 라벨 */}
                  {showEmptyLabel && isCurrentMonth && hasEvents && !hasEvents(date) && (
                    <span className="text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-empty)]">
                      {emptyLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* 주 단위 오버레이 (bar 모드 등) */}
          {renderWeekOverlay?.(week, weekIndex)}
        </div>
        );
      })}
    </div>
  );
}
