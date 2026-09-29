import { defineConfig } from "vitepress";

export default defineConfig({
  title: "My EO Stories",
  description: "Interactive Earth Observation Narratives",
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) =>
          tag.startsWith("eo-") || tag.startsWith("eox-"),
      },
    },
  },
});
