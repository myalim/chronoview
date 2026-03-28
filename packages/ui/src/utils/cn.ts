/**
 * Conditionally join class names.
 * Lightweight alternative to clsx for internal use.
 */
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
