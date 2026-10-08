import DefaultTheme from "vitepress/theme";

export default {
  extends: DefaultTheme,
  enhanceApp() {
    if (!import.meta.env.SSR) {
      import("@eodash/eodash/webcomponent");
      import("@eox/storytelling");
    }
  },
};

