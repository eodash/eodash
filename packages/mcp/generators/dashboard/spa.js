/**
 * Generate files for a standalone SPA project (Vite + eodash)
 */
export function generateSpaFiles({
  name,
  stacEndpoint,
  template,
  brandName,
  brandColor,
  eodashVersion,
  templateImportList,
}) {
  const files = {};

  files["package.json"] = JSON.stringify(
    {
      name,
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        dev: "eodash dev",
        build: "eodash build",
        preview: "eodash preview",
      },
      dependencies: {
        "@eodash/eodash": eodashVersion,
      },
    },
    null,
    2,
  );

  files["eodash.config.js"] = `import { defineConfig } from "@eodash/eodash/config";

export default defineConfig({
  entryPoint: "src/main.js",
  dev: {
    port: 3000,
  },
});
`;

  files["src/main.js"] = `import { createEodash } from "@eodash/eodash";
import { ${templateImportList} } from "@eodash/eodash/templates";

const selectedTemplate = ${template};

export default createEodash({
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
});
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

  return files;
}
