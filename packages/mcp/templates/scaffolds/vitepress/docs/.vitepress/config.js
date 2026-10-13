import { defineConfig } from "vitepress";

export default defineConfig({
  title: "My EO Stories",
  description: "Interactive Earth Observation Narratives",
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (el) => el.includes("-"),
      },
    },
  },
  vite: {
    envPrefix: ["VITE_", "EODASH_"],
    server: {
      allowedHosts: true,
    },
  },
});
