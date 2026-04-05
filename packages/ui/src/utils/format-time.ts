/** Format a Date as "HH:MM" (24-hour) */
export function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Format event start/end as "HH:MM - HH:MM" */
export function formatTimeLabel(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}
