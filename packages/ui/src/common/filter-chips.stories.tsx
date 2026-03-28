import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FilterChips } from "./filter-chips.js";

const meta: Meta<typeof FilterChips> = {
  title: "Common/FilterChips",
  component: FilterChips,
};
export default meta;

type Story = StoryObj<typeof FilterChips>;

const RESOURCES = [
  { id: "a", title: "Resource A", color: "#3b82f6" },
  { id: "b", title: "Resource B", color: "#8b5cf6" },
  { id: "c", title: "Resource C", color: "#06b6d4" },
  { id: "d", title: "Resource D", color: "#10b981" },
];

function FilterChipsDemo() {
  const [selectedIds, setSelectedIds] = useState(RESOURCES.map((r) => r.id));

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <FilterChips
      resources={RESOURCES}
      selectedIds={selectedIds}
      onToggle={handleToggle}
      onSelectAll={() => setSelectedIds(RESOURCES.map((r) => r.id))}
      onDeselectAll={() => setSelectedIds([])}
    />
  );
}

export const Default: Story = {
  render: () => <FilterChipsDemo />,
};
