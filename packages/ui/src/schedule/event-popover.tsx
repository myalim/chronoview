/**
 * EventPopover — Popover container shown on event click.
 *
 * Renders the consumer's renderEventDetail output.
 * Uses useDismiss for click-outside and Escape key dismissal.
 * Renders via FloatingPortal outside the scroll container to prevent clipping.
 */

import { useEffect, type ReactNode } from "react";
import {
  useFloating,
  useInteractions,
  useDismiss,
  autoUpdate,
  offset,
  flip,
  shift,
  hide,
  FloatingPortal,
} from "@floating-ui/react";

export interface EventPopoverProps {
  /** DOM element the popover anchors to (EventCard) */
  reference: HTMLElement;
  /** Callback to close the popover */
  onClose: () => void;
  /** Theme class for dark mode in the portal */
  themeClass?: string;
  /** Boundary element for flip/shift — popover stays within this area */
  boundary?: HTMLElement;
  /** Inner padding to exclude sticky sidebar/header areas */
  boundaryPadding?: { top?: number; right?: number; bottom?: number; left?: number };
  /** Output of renderEventDetail */
  children: ReactNode;
}

export function EventPopover({
  reference,
  onClose,
  themeClass,
  boundary,
  boundaryPadding,
  children,
}: EventPopoverProps) {
  const { refs, floatingStyles, context, middlewareData } = useFloating({
    open: true,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
    placement: "right-start",
    strategy: "fixed",
    middleware: [
      offset(12),
      flip({ boundary, padding: boundaryPadding }),
      shift({ boundary, padding: boundaryPadding, crossAxis: true }),
      hide({ strategy: "referenceHidden" }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

  // Connect the reference element to floating-ui
  useEffect(() => {
    refs.setReference(reference);
  }, [reference, refs]);

  // Auto-close popover when reference scrolls out of the visible area
  const referenceHidden = middlewareData.hide?.referenceHidden;
  useEffect(() => {
    if (referenceHidden) {
      onClose();
    }
  }, [referenceHidden, onClose]);

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        className={themeClass}
        style={{
          ...floatingStyles,
          zIndex: "var(--cv-z-popup)",
        }}
        {...getFloatingProps()}
      >
        <div
          style={{
            background: "var(--cv-color-surface)",
            border: "1px solid var(--cv-color-border)",
            boxShadow: "var(--cv-shadow-lg)",
            borderRadius: "var(--cv-radius-md)",
            padding: "var(--cv-spacing-md)",
            fontFamily: "var(--cv-font-family)",
            fontSize: "var(--cv-font-size-base)",
            color: "var(--cv-color-text)",
            minWidth: 200,
            maxWidth: 320,
          }}
        >
          {children}
        </div>
      </div>
    </FloatingPortal>
  );
}
