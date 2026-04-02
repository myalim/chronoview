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

/** Event card size presets controlling height */
export type EventCardSize = "xs" | "sm" | "md" | "lg";

export interface EventCardProps {
  /** Event title — supports ReactNode for rich content */
  title: ReactNode;
  /** Subtitle below title (shown in Day/Week, hidden in Month variant) */
  subtitle?: ReactNode;
  /** Event color — used for left color bar + 10% alpha background */
  color: string;
  /** Absolute position style from layout engine (left, top, width, height) */
  style: CSSProperties;
  /** Card variant: "default" for Day/Week, "month" for compact bar */
  variant?: "default" | "month";
  /** Card height preset. Defaults: "md" for default variant, "sm" for month. */
  size?: EventCardSize;
  /** Additional CSS classes for the outer container */
  className?: string;
  /** Click handler — receives the card's DOM element for positioning (tooltip/popover) */
  onClick?: (element: HTMLDivElement) => void;
  /** Mouse enter handler — receives the card's DOM element for positioning */
  onMouseEnter?: (element: HTMLDivElement) => void;
  onMouseLeave?: () => void;
  /** Replace the entire card body with custom content (container is preserved) */
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
  subtitle,
  color,
  style,
  variant = "default",
  size,
  className: userClassName,
  onClick,
  onMouseEnter,
  onMouseLeave,
  children,
}: EventCardProps) {
  const isMonth = variant === "month";

  // Resolve size: explicit size prop > variant default
  const resolvedSize = size ?? (isMonth ? "sm" : "md");

  const positionStyle: CSSProperties = {
    ...style,
    height: `var(--cv-size-event-height-${resolvedSize})`,
  };

  // Only assign button role + tabIndex when onClick is provided
  const interactiveProps = onClick
    ? ({
        role: "button",
        tabIndex: 0,
        onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(e.currentTarget);
          }
        },
      } as const)
    : {};

  const cardClassName = cn(
    "absolute flex items-stretch overflow-hidden rounded-[var(--cv-radius-sm)] min-w-[var(--cv-size-event-min-width)] z-[var(--cv-z-event)] font-[var(--cv-font-family)]",
    "transition-[shadow,filter] duration-[var(--cv-duration-fast)] hover:shadow-[var(--cv-shadow-sm)] hover:brightness-[0.97]",
    onClick ? "cursor-pointer" : "cursor-default",
    userClassName
  );

  // Font size: xs/sm use text-xs, md/lg use text-sm
  const isSmallSize = resolvedSize === "xs" || resolvedSize === "sm";

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: role/tabIndex/onKeyDown are spread via interactiveProps when onClick is provided
    // biome-ignore lint/a11y/useKeyWithClickEvents: onKeyDown is included in interactiveProps spread
    <div
      className={cardClassName}
      style={positionStyle}
      onClick={onClick ? (e) => onClick(e.currentTarget) : undefined}
      onMouseEnter={onMouseEnter ? (e) => onMouseEnter(e.currentTarget) : undefined}
      onMouseLeave={onMouseLeave}
      {...interactiveProps}
    >
      {children ?? (
        <>
          {/* Left color bar */}
          <div className="shrink-0" style={{ width: 3, background: color }} />

          {/* Card body — background generated from dynamic color */}
          <div
            className={cn(
              "flex flex-1 flex-col justify-center overflow-hidden",
              isMonth ? "px-1.5 py-0" : "px-2 py-0.5"
            )}
            style={{ background: hexToRgba(color, 0.1) }}
          >
            <span
              className={cn(
                "truncate font-medium leading-4",
                isSmallSize ? "text-xs" : "text-sm"
              )}
              style={{ color: "var(--cv-color-text)" }}
            >
              {title}
            </span>

            {/* Subtitle: hidden in Month variant and small sizes (xs, sm) */}
            {!isMonth && !isSmallSize && subtitle && (
              <span
                className="truncate text-xs leading-4"
                style={{ color: "var(--cv-color-text-secondary)" }}
              >
                {subtitle}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
