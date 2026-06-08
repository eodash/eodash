import { defineConfig } from "vitepress";
import typedocSidebar from "../api/typedoc-sidebar.json";
import baseConfig from "@eox/pages-theme-eox/config";

const brandConfig = await baseConfig("eodash");
// brandConfig.themeConfig.logo = {
// };
// https://vitepress.dev/reference/site-config
export default defineConfig({
  extends: brandConfig,
  title: "eodash",
  vite: {
    build: {
      rollupOptions: {
        external: [/@\//, /\^/, /^@eox/],
      },
    },
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => !tag.includes("v-") && tag.includes("-"),
      },
    },
  },
  description: "Earth Observation Ecosystem",
  themeConfig: {
    logo: {
      light: "https://eodash.org/logos/eodash-light.svg",
      dark: "https://eodash.org/logos/eodash-dark.svg",
    },
    logoLink:{
      link: "https://eodash.org",
      target: "_blank",
    },
    search: {
      provider: "local",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Get Started", link: "/" },
      { text: "API", link: "/api/" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Get Started", link: "/" },
          { text: "Instantiating Eodash", link: "/instantiation" },
          { text: "STAC", link: "/STAC" },
          {
            text: "Widgets",
            link: "/widgets/",
            items: [
              {
                text: "Web Component Widgets",
                link: "/widgets/webcomponent-widgets",
              },
              { text: "Internal Widgets", link: "/widgets/internal-widgets" },
            ],
          },
          { text: "Branding", link: "/branding" },
          { text: "Eodash Store", link: "/eodash-store" },
          { text: "CLI", link: "/cli" },
          { text: "SPA vs Web Component", link: "/spa-vs-webcomponent" },
        ],
      },
      {
        text: "API",
        items: typedocSidebar,
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/eodash/eodash" }],
  },
});
