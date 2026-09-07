/**
 * Generate files for a VitePress + EOx storytelling + eodash dashboard
 */
export function generateVitepressFiles({
  name,
  stacEndpoint,
  template,
  brandName,
  brandColor,
  eodashVersion,
}) {
  const files = {};

  files["package.json"] = JSON.stringify(
    {
      name,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        "docs:dev": "vitepress dev docs --port 3333",
        "docs:build": "vitepress build docs",
        "docs:preview": "vitepress preview docs",
      },
      dependencies: {
        "@eodash/eodash": eodashVersion,
        "@eox/storytelling": "^1.13.0",
      },
      devDependencies: {
        vitepress: "^1.5.0",
      },
    },
    null,
    2,
  );

  files["docs/.vitepress/config.js"] = `import { defineConfig } from "vitepress";

export default defineConfig({
  title: "${brandName}",
  description: "Narratives and Earth Observation Dashboard",
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (el) => el.includes("-"),
      },
    },
  },
  themeConfig: {
    nav: [
      { text: "Dashboard", link: "/dashboard" },
      { text: "Stories", link: "/narratives/story-1" },
    ],
    sidebar: {
      "/narratives/": [
        {
          text: "Earth Observation Stories",
          items: [
            { text: "Introduction", link: "/narratives/story-1" },
          ],
        },
      ],
    },
  },
});
`;

  files["docs/.vitepress/theme/index.js"] = `import DefaultTheme from "vitepress/theme";

/** @type {import('vitepress').Theme} */
export default {
  ...DefaultTheme,
  async enhanceApp({ app, router, siteData }) {
    if (!import.meta.env.SSR) {
      await import("@eodash/eodash/webcomponent");
      await import("@eox/storytelling");
    }
  },
};
`;

  files["docs/public/config.js"] = `export default {
  id: "${name}",
  stacEndpoint: "${stacEndpoint}",
  brand: {
    name: "${brandName}",
    theme: {
      colors: {
        primary: "${brandColor}",
      },
    },
    footerText: "${brandName} - Powered by eodash",
  },
  template: "${template}",
};
`;

  files["docs/public/story-content.md"] = `# ${brandName} Story

Welcome to the interactive narrative. This markdown content is rendered dynamically by \`<eox-storytelling>\`.

## Key Indicators
- **STAC Catalog**: [${stacEndpoint}](${stacEndpoint})
- **Template Layout**: ${template}
`;

  files["docs/index.md"] = `---
layout: home
hero:
  name: ${brandName}
  text: Earth Observation Insights
  tagline: Interactive dashboards and EO storytelling powered by eodash
  actions:
    - theme: brand
      text: Open Dashboard
      link: /dashboard
    - theme: alt
      text: Explore Stories
      link: /narratives/story-1
---
`;

  files["docs/dashboard.md"] = `---
layout: page
---

# ${brandName} Interactive Dashboard

<client-only>
  <eo-dash
    config="/config.js"
    style="width: 100%; height: 800px; display: block;"
  ></eo-dash>
</client-only>
`;

  files["docs/narratives/story-1.md"] = `# Environmental Monitoring Narrative

Interactive indicators and story narrative combining markdown narratives and live map widgets.

<client-only>
  <eox-storytelling
    show-nav
    markdown-url="/story-content.md"
  ></eox-storytelling>
</client-only>

<client-only>
  <eo-dash
    config="/config.js"
    style="width: 100%; height: 500px; display: block; margin-top: 2rem;"
  ></eo-dash>
</client-only>
`;

  files["README.md"] = `# ${brandName} (VitePress Narratives)

Dashboard and narrative documentation built with VitePress, [@eox/storytelling](https://github.com/EOX-A/EOxElements), and [@eodash/eodash](https://github.com/eodash/eodash).

## Features
- **Client-Side Rendering Guard**: SSR-safe loading of custom elements via \`.vitepress/theme/index.js\`.
- **Custom Element Compiler**: VitePress configured with \`isCustomElement: (el) => el.includes('-')\`.
- **Interactive Storytelling**: Narrative articles embedded with \`<eox-storytelling>\` and \`<eo-dash>\`.

## Quick Start

\`\`\`bash
npm install
npm run docs:dev
\`\`\`
`;

  return files;
}
