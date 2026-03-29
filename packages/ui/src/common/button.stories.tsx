import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button.js";

const meta: Meta<typeof Button> = {
  title: "Common/Button",
  component: Button,
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Outline: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm">Small</Button>
      <Button variant="outline" size="md">Medium</Button>
      <Button variant="outline" disabled>Disabled</Button>
    </div>
  ),
};

export const Ghost: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm">Small</Button>
      <Button variant="ghost" size="md">Medium</Button>
      <Button variant="ghost" disabled>Disabled</Button>
    </div>
  ),
};

export const Icon: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" aria-label="이전">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>
      <Button variant="outline" size="icon" aria-label="다음">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>
      <Button variant="ghost" size="icon" disabled aria-label="Disabled">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Button>
    </div>
  ),
};
