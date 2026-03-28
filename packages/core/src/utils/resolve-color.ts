/**
 * Resolves the final color for an event based on priority:
 * event.color > resource.color > theme default color.
 * Empty strings are treated as falsy (skipped).
 */
export function resolveColor(config: {
  eventColor?: string;
  resourceColor?: string;
  defaultColor: string;
}): string {
  const { eventColor, resourceColor, defaultColor } = config;

  if (eventColor) return eventColor;
  if (resourceColor) return resourceColor;
  return defaultColor;
}
