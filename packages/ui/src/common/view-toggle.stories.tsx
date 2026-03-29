import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ViewToggle } from "./view-toggle.js";

const meta: Meta<typeof ViewToggle> = {
  title: "Common/ViewToggle",
  component: ViewToggle,
};
export default meta;

type Story = StoryObj<typeof ViewToggle>;

function ViewToggleDemo() {
  const [view, setView] = useState<"day" | "week" | "month">("day");
  return <ViewToggle currentView={view} onViewChange={setView} />;
}

export const Default: Story = {
  render: () => <ViewToggleDemo />,
};

export const GridDayOnly: Story = {
  render: () => {
    const [view, setView] = useState<"day" | "week" | "month">("day");
    return <ViewToggle currentView={view} onViewChange={setView} availableViews={["day"]} />;
  },
};
