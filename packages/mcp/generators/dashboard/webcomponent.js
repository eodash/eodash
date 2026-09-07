/**
 * Generate files for minimal embedded web component dashboard
 */
export function generateWebcomponentFiles({
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

  files["config.js"] = `export default {
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
      config="/config.js"
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

  return files;
}
