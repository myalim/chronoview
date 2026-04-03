import { forwardRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../utils/cn.js";

export interface CalendarContainerProps {
  /** Time sidebar (sticky left) */
  sidebar: ReactNode;
  /** Grid body (events, grid lines, NowIndicator) — position: relative internally */
  body: ReactNode;
  /** Total main axis size in px (height of all time slots) */
  totalMainSize: number;
  /** Day header row (sticky top) — Week view에서 사용 */
  header?: ReactNode;
  /** Corner cell content at header×sidebar intersection */
  corner?: ReactNode;
  /** Header row height (number → px, string → as-is) */
  headerHeight?: number | string;
  className?: string;
}

/**
 * Scroll container for Calendar layouts (Day/Week).
 *
 * - Day (header 없음): sidebar + body flex row
 * - Week (header 있음): sticky header row (corner + header) + sidebar + body flex row
 *
 * Calendar는 가로 스크롤 없음 — 열이 컨테이너 너비에 맞춰 fluid.
 */
export const CalendarContainer = forwardRef<HTMLDivElement, CalendarContainerProps>(
  function CalendarContainer(
    { sidebar, body, totalMainSize, header, corner, headerHeight, className },
    ref,
  ) {
    const normalizedHeight =
      typeof headerHeight === "number" ? `${headerHeight}px` : headerHeight;

    return (
      // 외부 wrapper: border-radius + overflow:hidden으로 모서리 클리핑 담당
      // 내부 scroll div와 분리해야 콘텐츠가 border-radius에 잘리지 않음
      <div
        className={cn(
          "overflow-hidden border border-[var(--cv-color-border)] rounded-[var(--cv-radius-lg)]",
          className,
        )}
      >
        <div
          ref={ref}
          className="overflow-y-auto overflow-x-hidden h-full"
        >
          {/* Sticky header row — Week view에서만 렌더 */}
          {header && (
            <div className="sticky top-0 z-[var(--cv-z-sticky-corner)] flex border-b border-[var(--cv-color-border)] bg-[var(--cv-color-bg)]">
              {/* Corner cell: header × sidebar 교차 영역 */}
              <div
                className="shrink-0 bg-[var(--cv-color-bg)] border-r border-[var(--cv-color-border)]"
                style={{
                  width: "var(--cv-size-calendar-sidebar-width)",
                  height: normalizedHeight,
                }}
              >
                {corner}
              </div>
              <div className="flex-1">{header}</div>
            </div>
          )}

          {/* Content row: sidebar + body */}
          <div className="flex">
            <div className="sticky left-0 z-[var(--cv-z-sticky-sidebar)] shrink-0">
              {sidebar}
            </div>
            <div className="relative flex-1" style={{ height: totalMainSize }}>
              {body}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
