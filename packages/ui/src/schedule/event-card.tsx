/**
 * EventCard — Time-proportional event card for Schedule views.
 *
 * Handles both Day/Week (tall cards with time) and Month (compact bars) variants.
 * Color bar on the left, background with 10% alpha of the event color.
 *
 * Reference: docs/design/schedule/schedule-day.md §5
 */

import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { cn } from "../utils/cn.js";

export interface EventCardProps {
  title: string;
  /** Time text (shown in Day/Week, hidden in Month) */
  timeLabel?: string;
  /** resolveColor() result — used for left color bar + background */
  color: string;
  /** absolute position style (left, top, width, height) */
  style: CSSProperties;
  /** "day" | "week" -> 36px tall card, "month" -> 24px tall bar */
  variant?: "default" | "month";
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  /** Custom rendering */
  children?: ReactNode;
}

/** hex → rgba with alpha */
function hexToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function EventCard({
  title,
  timeLabel,
  color,
  style,
  variant = "default",
  onClick,
  onMouseEnter,
  onMouseLeave,
  children,
}: EventCardProps) {
  const isMonth = variant === "month";

  // Keep only dynamic position/size as inline styles
  const positionStyle: CSSProperties = {
    ...style,
    height: isMonth ? "var(--cv-size-month-bar-height)" : "var(--cv-size-event-height)",
  };

  // Only assign button role + tabIndex when onClick is provided
  const interactiveProps = onClick
    ? ({
        role: "button",
        tabIndex: 0,
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        },
      } as const)
    : {};

  const cardClassName = cn(
    "absolute flex items-stretch overflow-hidden rounded-[var(--cv-radius-sm)] min-w-[var(--cv-size-event-min-width)] z-[var(--cv-z-event)] font-[var(--cv-font-family)] transition-shadow duration-[var(--cv-duration-fast)]",
    onClick ? "cursor-pointer" : "cursor-default",
  );

  if (children) {
    return (
      <div
        className={cardClassName}
        style={positionStyle}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        {...interactiveProps}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cardClassName}
      style={positionStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...interactiveProps}
    >
      {/* Left color bar */}
      <div
        className="shrink-0"
        style={{ width: 3, background: color }}
      />

      {/* Card body — background generated from dynamic color */}
      <div
        className={cn(
          "flex flex-1 flex-col justify-center overflow-hidden",
          isMonth ? "px-1.5 py-0" : "px-2 py-0.5",
        )}
        style={{ background: hexToRgba(color, 0.1) }}
      >
        <span
          className={cn(
            "truncate font-medium leading-tight",
            isMonth ? "text-xs" : "text-sm",
          )}
          style={{ color: "var(--cv-color-text)" }}
        >
          {title}
        </span>

        {/* Time label (always hidden in Month) */}
        {!isMonth && timeLabel && (
          <span
            className="truncate text-xs leading-tight"
            style={{ color: "var(--cv-color-text-secondary)" }}
          >
            {timeLabel}
          </span>
        )}
      </div>
    </div>
  );
}
