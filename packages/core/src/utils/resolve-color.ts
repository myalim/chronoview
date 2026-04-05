/** Default event color (Tailwind blue-500) */
export const DEFAULT_EVENT_COLOR = "#3b82f6";

/**
 * Resolves the final color for an event based on priority:
 * event.color > resource.color > DEFAULT_EVENT_COLOR.
 * Empty strings are treated as falsy (skipped).
 */
export function resolveColor(config: {
  eventColor?: string;
  resourceColor?: string;
}): string {
  const { eventColor, resourceColor } = config;

  if (eventColor) return eventColor;
  if (resourceColor) return resourceColor;
  return DEFAULT_EVENT_COLOR;
}
