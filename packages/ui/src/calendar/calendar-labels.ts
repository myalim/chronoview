/**
 * CalendarLabels — i18n 지원을 위한 커스터마이즈 가능한 텍스트 라벨.
 * 기본값은 한국어. Partial override로 개별 항목만 변경 가능.
 */

import { WEEKDAY_LABELS } from "../utils/weekdays.js";

/** Customizable text labels for i18n support */
export interface CalendarLabels {
  /** Weekday labels (Sunday-indexed: [0]=Sun, ..., [6]=Sat). Default: ["일","월","화","수","목","금","토"] */
  weekdays?: string[];
  /** Empty cell label. Default: "데이터 없음" */
  empty?: string;
  /** Close button aria-label. Default: "닫기" */
  close?: string;
  /** Event list section title (bar mode below grid). Default: "진행중인 이벤트" */
  eventListTitle?: string;
  /** "more events" button text. Default: `${count}개 더보기` */
  moreEvents?: (count: number) => string;
  /** Format a date label (e.g., "03.15(월)"). Default: "MM.DD(요일)" */
  formatDate?: (date: Date) => string;
  /** Date detail popup header (e.g., "월 15"). Default: "요일 일" */
  formatPopupHeader?: (date: Date) => string;
}

// ─── Korean defaults ───

export const defaultMoreEvents = (count: number) => `${count}개 더보기`;

export function defaultFormatDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${m}.${day}(${WEEKDAY_LABELS[d.getDay()]})`;
}

export function defaultFormatPopupHeader(d: Date): string {
  return `${WEEKDAY_LABELS[d.getDay()]} ${d.getDate()}`;
}

/** Resolved labels — all fields required (defaults applied) */
export type ResolvedCalendarLabels = Required<CalendarLabels>;

/** Merge partial overrides with Korean defaults */
export function resolveLabels(overrides?: Partial<CalendarLabels>): ResolvedCalendarLabels {
  return {
    weekdays: overrides?.weekdays ?? WEEKDAY_LABELS,
    empty: overrides?.empty ?? "데이터 없음",
    close: overrides?.close ?? "닫기",
    eventListTitle: overrides?.eventListTitle ?? "진행중인 이벤트",
    moreEvents: overrides?.moreEvents ?? defaultMoreEvents,
    formatDate: overrides?.formatDate ?? defaultFormatDate,
    formatPopupHeader: overrides?.formatPopupHeader ?? defaultFormatPopupHeader,
  };
}
