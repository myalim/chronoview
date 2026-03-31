# ChronoView

Headless schedule timeline library for React.

One data model, multiple views — Schedule, Calendar, Grid across Day, Week, and Month.

## Features

- **Headless core + ready-to-use UI** — Use pre-built components or build your own with hooks
- **Multiple views** — Schedule (resource × time), Calendar, Grid × Day/Week/Month
- **Large datasets** — Virtual scrolling for 10,000+ events at 60fps
- **Customizable** — CSS variables for theming, dark mode, custom renderers
- **TypeScript** — Fully typed API
- **MIT licensed** — Free for commercial use

## Packages

| Package | Description |
| --- | --- |
| `@chronoview/core` | Framework-agnostic core engine (time calculations, layout, stacking) |
| `@chronoview/react` | React hooks and context (headless) |
| `@chronoview/ui` | Pre-built UI components with design tokens |

## Quick Start

### Install

```bash
# npm
npm install @chronoview/ui

# pnpm
pnpm add @chronoview/ui

# yarn
yarn add @chronoview/ui

# bun
bun add @chronoview/ui
```

`@chronoview/ui` includes `@chronoview/core` and `@chronoview/react` as dependencies.

**Peer dependencies:** `react >= 18`, `react-dom >= 18`, `date-fns >= 3`

### Setup CSS

Import the stylesheet in your app's entry CSS file or root component:

```css
@import "@chronoview/ui/styles.css";
```

This single file includes all design tokens and component styles. No Tailwind CSS required in your project.

### Basic Usage

```tsx
import { Schedule } from "@chronoview/ui";
import type { Resource, TimelineEvent } from "@chronoview/core";

const resources: Resource[] = [
  { id: "room-1", title: "Meeting Room A", color: "#3b82f6" },
  { id: "room-2", title: "Meeting Room B", color: "#8b5cf6" },
];

const events: TimelineEvent[] = [
  {
    id: "evt-1",
    resourceId: "room-1",
    start: new Date(2026, 2, 29, 9, 0),
    end: new Date(2026, 2, 29, 10, 30),
    title: "Team Standup",
  },
  {
    id: "evt-2",
    resourceId: "room-1",
    start: new Date(2026, 2, 29, 14, 0),
    end: new Date(2026, 2, 29, 15, 30),
    title: "Client Meeting",
  },
  {
    id: "evt-3",
    resourceId: "room-2",
    start: new Date(2026, 2, 29, 10, 0),
    end: new Date(2026, 2, 29, 11, 30),
    title: "Design Review",
    color: "#10b981",
  },
];

function App() {
  return <Schedule events={events} resources={resources} />;
}
```

This renders a day schedule with a toolbar (date navigation + view toggle), resource sidebar, time header, event cards, and a now indicator — all with sensible defaults.

### Views

Switch between Day, Week, and Month views:

```tsx
<Schedule
  events={events}
  resources={resources}
  view="week"
  startDate={new Date(2026, 2, 23)}
/>
```

### Dark Mode

Add the `dark` class to any parent element. Works with popular theme libraries out of the box:

```tsx
// With next-themes, Tailwind dark mode, or any class-based toggle
<div className="dark">
  <Schedule events={events} resources={resources} />
</div>
```

The `[data-theme="dark"]` selector is also supported.

### Customizing Tokens

Override CSS variables to match your design system:

```css
:root {
  --cv-color-event-default: #ff6b00;
  --cv-color-bg: #fafafa;
  --cv-size-sidebar-width: 240px;
}
```

All available tokens are listed in [`docs/design/common/design-tokens.md`](https://github.com/myalim/chronoview/blob/main/docs/design/common/design-tokens.md).

## Headless Usage

Use `@chronoview/react` hooks directly for full control over rendering:

```bash
pnpm add @chronoview/react @chronoview/core
```

```tsx
import { useScheduleView } from "@chronoview/react";
import type { Resource, TimelineEvent } from "@chronoview/core";

function CustomSchedule({ events, resources }: {
  events: TimelineEvent[];
  resources: Resource[];
}) {
  const { rows, getEventStyle } = useScheduleView({
    events,
    resources,
    view: "day",
    startDate: new Date(),
  });

  return (
    <div style={{ position: "relative" }}>
      {rows.map((row) => (
        <div key={row.resource.id} style={{ position: "relative", height: row.height }}>
          <span>{row.resource.title}</span>
          {row.events.map((layout) => (
            <div key={layout.event.id} style={getEventStyle(layout)}>
              {layout.event.title}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

## Current Status

> **0.1.0-alpha** — Schedule layout (Day/Week/Month) is available.
> Calendar and Grid layouts are coming in future releases.

- Schedule Day/Week/Month: available
- Calendar Day/Week/Month: planned (0.2.0)
- Grid Day: planned (0.3.0)
- Drag & Drop, Resize: planned (0.4.0)
- Optimized for desktop (1024px+). Responsive support is planned for a future release.

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm lint
```

## License

[MIT](./LICENSE)
