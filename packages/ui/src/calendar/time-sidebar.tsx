import { cn } from "../utils/cn.js";

export interface TimeSidebarProps {
  /** Time slots with display labels */
  timeSlots: Array<{ label: string }>;
  /** Height of each time slot in px */
  slotHeight: number;
  /** Total height of the sidebar (includes padding) */
  totalHeight: number;
  /** Vertical offset for labels (padding above content area) */
  offsetTop?: number;
  className?: string;
}

/**
 * Vertical time sidebar for Calendar layout.
 * Each label is aligned with the corresponding horizontal grid line.
 */
export function TimeSidebar({ timeSlots, slotHeight, totalHeight, offsetTop = 0, className }: TimeSidebarProps) {
  return (
    <div
      className={cn(
        "shrink-0 relative bg-[var(--cv-color-bg)] border-r border-[var(--cv-color-border)]",
        className,
      )}
      style={{
        width: "var(--cv-size-calendar-sidebar-width)",
        height: totalHeight,
      }}
    >
      {timeSlots.map((slot, i) => (
        <div
          key={slot.label}
          className="absolute right-0 pr-2 text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-text-secondary)]"
          style={{
            top: offsetTop + i * slotHeight,
            // 첫 번째 라벨은 컨테이너 밖으로 올라가지 않도록 translateY 생략
            transform: i === 0 ? undefined : "translateY(-7px)",
            lineHeight: "14px",
          }}
        >
          {slot.label}
        </div>
      ))}
    </div>
  );
}
