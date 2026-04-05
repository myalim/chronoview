/**
 * DateDetailPopup — "더보기" 클릭 시 해당 날짜의 전체 이벤트 목록을 보여주는 팝업.
 * Calendar month list mode에서 사용.
 */

import { useCallback, useEffect, useRef } from "react";
import type { TimelineEvent } from "@chronoview/core";
import { formatTime } from "../utils/format-time.js";

export interface DateDetailPopupProps<TData = unknown> {
  date: Date;
  events: TimelineEvent<TData>[];
  /** Close button aria-label. */
  closeLabel?: string;
  resolveColor: (e: TimelineEvent<TData>) => string;
  /** Format popup header label (e.g., "월 15"). */
  formatHeader?: (date: Date) => string;
  onClose: () => void;
}

export function DateDetailPopup<TData>({
  date,
  events,
  closeLabel = "Close",
  resolveColor,
  formatHeader,
  onClose,
}: DateDetailPopupProps<TData>) {
  const label = formatHeader ? formatHeader(date) : String(date.getDate());
  const popupRef = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // 팝업 열릴 때 포커스 이동
  useEffect(() => {
    popupRef.current?.focus();
  }, []);

  // 팝업 외부 클릭 시 닫기
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop — 키보드는 document-level ESC로 처리
    <div
      className="absolute inset-0 z-[var(--cv-z-popup)]"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={popupRef}
        role="dialog"
        aria-label={label}
        tabIndex={-1}
        className="absolute z-[var(--cv-z-popup)] bg-[var(--cv-color-bg)] border border-[var(--cv-color-border)] rounded-[var(--cv-radius-md)] shadow-[var(--cv-shadow-md)] overflow-hidden outline-none"
        style={{
          width: 240,
          maxHeight: 320,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--cv-color-border)] bg-[var(--cv-color-surface)]">
          <span className="text-[length:var(--cv-font-size-sm)] font-[var(--cv-font-weight-bold)]">
            {label}
          </span>
          <button
            type="button"
            aria-label={closeLabel}
            className="text-[var(--cv-color-text-secondary)] hover:text-[var(--cv-color-text)] cursor-pointer"
            onClick={onClose}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 이벤트 리스트 */}
        <div
          className="overflow-y-auto p-2 flex flex-col gap-1"
          style={{ maxHeight: 270 }}
        >
          {events.map((e) => (
            <div key={e.id} className="flex items-center gap-2 px-1 py-0.5">
              <span
                className="shrink-0 w-2 h-2 rounded-full"
                style={{ background: resolveColor(e) }}
              />
              <span className="text-[length:var(--cv-font-size-xs)] text-[var(--cv-color-text-secondary)] shrink-0">
                {formatTime(e.start)}
              </span>
              <span className="truncate text-[length:var(--cv-font-size-sm)] text-[var(--cv-color-text)]">
                {e.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
