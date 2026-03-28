import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { CategoryTabs } from "./category-tabs.js";

const meta: Meta<typeof CategoryTabs> = {
  title: "Common/CategoryTabs",
  component: CategoryTabs,
};
export default meta;

type Story = StoryObj<typeof CategoryTabs>;

function CategoryTabsDemo() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <CategoryTabs
      categories={["회의", "작업", "외근"]}
      selectedCategory={selected}
      onSelect={setSelected}
    />
  );
}

export const Default: Story = {
  render: () => <CategoryTabsDemo />,
};
