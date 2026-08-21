import {
  DEFAULT_STAC_ENDPOINT,
  DEFAULT_BRAND_NAME,
  getEodashVersion,
} from "../helpers.js";

/**
 * Scaffold eodash dashboard projects: SPA, VitePress Narratives, or Web Component.
 */
export function scaffoldDashboard({
  name = "my-eo-dashboard",
  projectType = "standalone-spa",
  stacEndpoint = DEFAULT_STAC_ENDPOINT,
  template = "explore",
  brandName = DEFAULT_BRAND_NAME,
  brandColor = "#002742",
} = {}) {
  const files = {};
  const eodashVersion = getEodashVersion();

  const gitignore = `node_modules
dist
.eodash
.env
.DS_Store
*.local
`;

  const dockerfile = `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

  const nginxConf = `server {
  listen 80;
  server_name localhost;
  location / {
    root /usr/share/nginx/html;
    index index.html;
    try_files $uri $uri/ /index.html;
  }
}
`;

  if (projectType === "standalone-spa") {
    files["package.json"] = JSON.stringify(
      {
        name,
        version: "0.1.0",
        private: true,
        type: "module",
        scripts: {
          dev: "eodash dev --entryPoint eodash.config.js",
          build: "eodash build --entryPoint eodash.config.js",
          preview: "eodash preview",
        },
        dependencies: {
          "@eodash/eodash": eodashVersion,
        },
      },
      null,
      2,
    );

    files["eodash.config.js"] = `import { deepmergeCustom } from "deepmerge-ts";
import explore from "@eodash/eodash/templates/explore";
import lite from "@eodash/eodash/templates/lite";
import expert from "@eodash/eodash/templates/expert";
import compare from "@eodash/eodash/templates/compare";

const selectedTemplate = ${template};

/** @type {import("@eodash/eodash").Eodash} */
export default {
  id: "${name}",
  stacEndpoint: "${stacEndpoint}",
  brand: {
    name: "${brandName}",
    theme: {
      colors: {
        primary: "${brandColor}",
        secondary: "#0071C2",
        surface: "#ffffff",
      },
    },
    footerText: "${brandName} - Powered by eodash",
  },
  template: selectedTemplate,
};
`;

    files["index.html"] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${brandName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/node_modules/@eodash/eodash/dist/client/main.js"></script>
  </body>
</html>
`;

    files["README.md"] = `# ${brandName}

An Earth Observation dashboard built with [@eodash/eodash](https://github.com/eodash/eodash).

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview build
npm run preview
\`\`\`
`;
  } else if (projectType === "vitepress-narratives") {
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

    files["docs/.vitepress/config.js"] =
      `import { defineConfig } from "vitepress";

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

    files["docs/.vitepress/theme/index.js"] =
      `import DefaultTheme from "vitepress/theme";

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
    stac-endpoint="${stacEndpoint}"
    template="${template}"
    style="width: 100%; height: 800px; display: block;"
  ></eo-dash>
</client-only>
`;

    files["docs/narratives/story-1.md"] = `# Environmental Monitoring Narrative

Interactive indicators and story narrative combining markdown narratives and live map widgets.

<client-only>
  <eox-storytelling
    show-nav
    markdown-url="./story-content.md"
  ></eox-storytelling>
</client-only>

<eo-dash
  stac-endpoint="${stacEndpoint}"
  template="lite"
  style="width: 100%; height: 500px; display: block; margin-top: 2rem;"
></eo-dash>
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
  } else if (projectType === "web-component") {
    files["package.json"] = JSON.stringify(
      {
        name,
        version: "0.1.0",
        private: true,
        type: "module",
        scripts: {
          dev: "vite",
          build: "vite build",
          preview: "vite preview",
        },
        devDependencies: {
          "@eodash/eodash": eodashVersion,
          vite: "^7.0.0",
        },
      },
      null,
      2,
    );

    files["index.html"] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${brandName}</title>
    <style>
      body { margin: 0; font-family: sans-serif; }
      eo-dash { width: 100vw; height: 100vh; display: block; }
    </style>
    <script type="module">
      import "@eodash/eodash/webcomponent";
    </script>
  </head>
  <body>
    <eo-dash
      id="${name}"
      stac-endpoint="${stacEndpoint}"
      template="${template}"
    ></eo-dash>
  </body>
</html>
`;

    files["README.md"] = `# ${brandName} (Web Component)

Embedded \`<eo-dash>\` web component dashboard.

\`\`\`bash
npm install
npm run dev
\`\`\`
`;
  }

  files[".gitignore"] = gitignore;
  files["Dockerfile"] = dockerfile;
  files["nginx.conf"] = nginxConf;

  return {
    projectType,
    name,
    files,
    instructions: `Project '${name}' scaffolded with ${Object.keys(files).length} files. Run 'npm install' and 'npm run ${projectType === "vitepress-narratives" ? "docs:dev" : "dev"}' to start.`,
  };
}
