import { defineConfig } from "vitepress";
import { globSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname, basename } from "node:path";
import typedocSidebar from "../api/typedoc-sidebar.json";
import baseConfig from "@eox/pages-theme-eox/config";

const DOCS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

const internalWidgetPageItems = globSync("widgets/internal-widgets/*.md", {
  cwd: DOCS_DIR,
}).map((p) => basename(p, ".md")).sort()
  .map((name) => ({ text: name, link: `/widgets/internal-widgets/${name}` }));

const brandConfig = await baseConfig("eodash");
// brandConfig.themeConfig.logo = {
// };
// https://vitepress.dev/reference/site-config
export default defineConfig({
  extends: brandConfig,
  title: "eodash",
  srcExclude: ["README.md"],
  vite: {
    plugins: [widgetPropsIncludePlugin()],
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
          { text: "Configuration", link: "/configuration" },
          { text: "Templates", link: "/templates" },
          { text: "Branding", link: "/branding" },
          { text: "STAC", link: "/STAC" },
          { text: "Eodash Store", link: "/eodash-store" },
          { text: "CLI", link: "/cli" },
        ],
      },
      {
        text: "Widgets",
        items: [
          { text: "Overview", link: "/widgets/" },
          {
            text: "Web Component Widgets",
            link: "/widgets/webcomponent-widgets",
          },
          {
            text: "Internal Widgets",
            link: "/widgets/internal-widgets",
            collapsed: true,
            items: internalWidgetPageItems,
          },
        ],
      },
      {
        text: "Reference",
        // The widget types are still generated,
        // but they are injected inside the internal widgets pages,
        // only dropped from the Reference section
        items: typedocSidebar.filter((group) => group.text !== "Widgets"),
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/eodash/eodash" }],
  },
});

/**
 * Expands a `<!-- @widget-props -->` marker in a curated internal-widget page
 * into a filename-derived include of that widget's generated prop reference,
 * e.g. in `internal-widgets/EodashMap.md` it becomes
 * `<!--@include: @/api/Widgets/classes/EodashMap.md#widget-props-->`.
 * Runs as a `pre` transform so VitePress resolves the resulting include after.
 */
function widgetPropsIncludePlugin() {
  return {
    name: "eodash:widget-props-include",
    enforce: /** @type {const} */("pre"),
    /**
     * @param {string} code
     * @param {string} id
     */
    transform(code, id) {
      const [file] = id.split("?");
      if (!file.endsWith(".md") || !file.includes("/widgets/internal-widgets/")) {
        return;
      }
      const name = basename(file, ".md");
      const out = code.replace(
        /<!--\s*@widget-props\s*-->/g,
        `<!--@include: @/api/Widgets/classes/${name}.md#widget-props-->`,
      );
      return out === code ? undefined : out;
    },
  };
}
