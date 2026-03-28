import type { Preview } from "@storybook/react-vite";

import "./styles.css";

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          "Schedule",
          ["Day", "Week", "Month"],
          "Common",
          ["Button", "Toolbar", "DateNavigator", "ViewToggle", "FilterChips", "CategoryTabs"],
          "Wireframes",
          [
            "Schedule Day",
            "Schedule Week",
            "Schedule Month",
            "Calendar Day",
            "Calendar Week",
            "Calendar Month",
            "Grid Day",
          ],
          "*",
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
