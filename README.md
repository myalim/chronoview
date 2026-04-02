# ChronoView

[![npm](https://img.shields.io/npm/v/@chronoview/ui)](https://www.npmjs.com/package/@chronoview/ui)
[![license](https://img.shields.io/npm/l/@chronoview/ui)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

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
npm install @chronoview/ui
```

<details>
<summary>Other package managers</summary>

```bash
pnpm add @chronoview/ui
yarn add @chronoview/ui
bun add @chronoview/ui
```

</details>

`@chronoview/ui` includes `@chronoview/core` and `@chronoview/react` as dependencies.

**Peer dependencies:** `react >= 18`, `react-dom >= 18`, `@floating-ui/react >= 0.27`

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

## Dark Mode

Dark mode follows the system preference (`prefers-color-scheme`) automatically. No extra setup needed.

To force a specific theme, use the `theme` prop:

```tsx
<Schedule events={events} resources={resources} theme="dark" />
```

Class-based (`dark`, `[data-theme="dark"]`) selectors are also supported for integration with theme libraries like next-themes.

## Event Detail (Tooltip & Popover)

Hover an event to see a built-in tooltip. Click an event to show a custom popover:

```tsx
<Schedule
  events={events}
  resources={resources}
  renderEventDetail={(event, { close }) => (
    <div>
      <h3>{event.title}</h3>
      <p>{event.data?.description}</p>
      <button onClick={close}>Close</button>
    </div>
  )}
/>
```

To disable the hover tooltip while keeping the popover, add `disableTooltip`:

```tsx
<Schedule
  events={events}
  resources={resources}
  disableTooltip
  renderEventDetail={(event, { close }) => (
    <div>
      <h3>{event.title}</h3>
      <button onClick={close}>Close</button>
    </div>
  )}
/>
```

## Controlled Date

By default, `Schedule` manages date state internally. To control it externally, pass `date` and `onDateChange`:

```tsx
import { useState } from "react";

const [date, setDate] = useState(new Date());

<Schedule
  events={events}
  resources={resources}
  date={date}
  onDateChange={setDate}
/>
```

## Customizing Tokens

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

## License

[MIT](./LICENSE)
