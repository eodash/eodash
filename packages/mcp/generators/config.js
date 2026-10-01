import { DEFAULT_STAC_ENDPOINT, DEFAULT_BRAND_NAME } from "../helpers.js";

/**
 * Generate eodash.config.js / baseConfig.js conforming to eodash types and conventions.
 */
export function generateEodashConfig({
  id = "demo-dashboard",
  stacEndpoint = DEFAULT_STAC_ENDPOINT,
  template = "explore",
  brand = {},
  customWidgets = [],
  options = {},
} = {}) {
  const brandConfig = {
    name: brand.name || DEFAULT_BRAND_NAME,
    font: brand.font || {
      headers: {
        family: "Open Sans",
        link: "https://eox.at/fonts/opensans/opensans.css",
      },
      body: {
        family: "Sintony",
        link: "https://eox.at/fonts/sintony/sintony.css",
      },
    },
    theme: {
      colors: {
        primary: brand.theme?.colors?.primary || "#002742",
        secondary: brand.theme?.colors?.secondary || "#0071C2",
        surface: brand.theme?.colors?.surface || "#ffffff",
      },
      variables: {
        "surface-opacity": 0.8,
        "primary-opacity": 0.8,
        ...(brand.theme?.variables || {}),
      },
      collectionsPalette: brand.theme?.collectionsPalette || [
        "#009E73",
        "#E69F00",
        "#56B4E9",
        "#F0E442",
        "#0072B2",
        "#D55E00",
        "#CC79A7",
        "#994F00",
      ],
    },
    footerText:
      brand.footerText || `${brand.name || "EO Dashboard"} - Built with eodash`,
  };

  const isCustomTemplate = template === "custom" || customWidgets.length > 0;

  let imports = `import { deepmergeCustom } from "deepmerge-ts";\n`;
  if (!isCustomTemplate) {
    imports += `import { ${template} } from "@eodash/eodash/templates";\n`;
  } else {
    imports += `import { explore } from "@eodash/eodash/templates";\n`;
  }

  let templateSection = "";
  if (!isCustomTemplate) {
    templateSection = `  template: ${template},`;
  } else {
    const formattedWidgets = JSON.stringify(customWidgets, null, 4).replace(
      /\n/g,
      "\n    ",
    );
    templateSection = `  template: {
    // Custom widget layout definition
    widgets: ${formattedWidgets},
  },`;
  }

  const endpointSection =
    typeof stacEndpoint === "string"
      ? `  stacEndpoint: "${stacEndpoint}",`
      : `  stacEndpoint: ${JSON.stringify(stacEndpoint, null, 4).replace(/\n/g, "\n  ")},`;

  const optionsSection =
    Object.keys(options).length > 0
      ? `\n  options: ${JSON.stringify(options, null, 4).replace(/\n/g, "\n  ")},`
      : "";

  const configCode = `${imports}
/** @type {import("@eodash/eodash").Eodash} */
const config = {
  id: "${id}",${optionsSection}
${endpointSection}
  brand: ${JSON.stringify(brandConfig, null, 4).replace(/\n/g, "\n  ")},
${templateSection}
};

export default config;
`;

  return {
    id,
    template: isCustomTemplate ? "custom" : template,
    configCode,
    summary: `Generated eodash config for '${id}' with '${isCustomTemplate ? "custom layout" : template}' template.`,
  };
}
