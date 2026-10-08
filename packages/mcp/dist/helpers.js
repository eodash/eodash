import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import net from "node:net";
import dns from "node:dns/promises";
import Fuse from "fuse.js";
import pino from "pino";
import pinoHttp from "pino-http";
//#region helpers/guides.js
/**
 * Curated custom widget boilerplate and guides
 */
var CUSTOM_WIDGET_GUIDES = {
  "web-component": {
    title: "Web Component Custom Widgets in eodash",
    description:
      "Wrap any Custom Element (e.g. EOxElements from @eox/* prefix, or vanilla Web Components) into an eodash widget slot.",
    lifecycleHooks: {
      onMounted: "(el, store) => void",
      onUnmounted: "(el, store) => void",
    },
    example: `
// In your custom widget definition or eodash.config.js
export default createEodash({
  template: {
    widgets: [
      {
        id: "my-custom-chart",
        title: "Custom Time Series",
        type: "web-component",
        layout: { x: 0, y: 6, w: 6, h: 6 },
        widget: {
          tagName: "my-custom-chart",
          // ESM import function or direct CDN bundle URL:
          link: () => import("./src/widgets/MyCustomChart.js"),
          properties: {
            theme: "dark",
            unit: "celsius",
          },
          onMounted: (el, store) => {
            console.log("Custom widget mounted:", el);
            // Listen to reactive store state
            el.addEventListener("range-changed", (e) => {
              store.states.currentUrl.value = e.detail.stacUrl;
            });
          },
          onUnmounted: (el, store) => {
            console.log("Cleaned up widget:", el);
          },
        },
      },
    ],
  },
});
`,
  },
  functional: {
    title: "Functional (Dynamic STAC-Driven) Widgets",
    description:
      "Define widgets dynamically as functions executed whenever the user selects a different STAC indicator or collection.",
    signature:
      "defineWidget: (selectedSTAC: STACCollection | null, selectedCompareSTAC?: STACCollection | null) => StaticWidget | undefined | null | false",
    example: `
export default createEodash({
  template: {
    widgets: [
      {
        defineWidget: (selectedSTAC) => {
          if (!selectedSTAC) return null;

          // Check if active indicator provides a custom process
          const hasProcess = selectedSTAC?.links?.some((l) => l.rel === "service");
          if (!hasProcess) return null; // Don't render widget if indicator has no process

          return {
            id: "dynamic-process-panel",
            title: "Analysis",
            type: "internal",
            layout: { x: 9, y: 0, w: 3, h: 8 },
            widget: {
              name: "EodashProcess",
              properties: {
                vegaEmbedOptions: { actions: true },
              },
            },
          };
        },
      },
    ],
  },
});
`,
  },
  iframe: {
    title: "IFrame Widgets in eodash",
    description:
      "Embed external websites, dashboards, Jupyter notebook outputs, or web applications inside eodash grid slots.",
    example: `
export default createEodash({
  template: {
    widgets: [
      {
        id: "external-notebooks",
        title: "Live Notebook Explorer",
        type: "iframe",
        layout: { x: 6, y: 0, w: 6, h: 12 },
        widget: {
          src: "https://eoxhub-workspaces.github.io/eoxhub-notebooks/",
        },
      },
    ],
  },
});
`,
  },
};
//#endregion
//#region helpers/landing-page.js
/**
 * Lightweight markdown-like renderer for links and inline code.
 * @param {string} text
 */
function renderSimpleMarkdown(text) {
  if (!text) return "";
  return text
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
/**
 * Renders a lightweight HTML landing page showing widget catalog, MCP tools, and instructions.
 * @param {Record<string, any>} widgetsData
 * @param {Record<string, any>} _architectureData
 * @param {object} [options]
 * @returns {string}
 */
function generateLandingPage(
  widgetsData = {},
  _architectureData = {},
  options = {},
) {
  const widgetList = Object.values(widgetsData || {});
  const tools = options.tools || [
    {
      name: "list_widgets",
      description: "List all built-in widgets with capabilities.",
    },
    {
      name: "get_widget_details",
      description: "Get schema, props, and store interactions.",
    },
    {
      name: "get_custom_widget_guide",
      description: "Guides for web-component and functional widgets.",
    },
    {
      name: "get_eodash_architecture",
      description: "Architecture docs for grid, store, and templates.",
    },
    {
      name: "find_examples",
      description:
        "Discover working dashboard snippets, scaffolds, and configs.",
    },
    {
      name: "validate_catalog_config",
      description: "Validate catalog configs against official schemas.",
    },
  ];
  const templates = options.templates || [
    "lite",
    "explore",
    "expert",
    "compare",
  ];
  const examplesCount = options.examplesCount ?? 15;
  const widgetCards = widgetList
    .map(
      (w) => `
    <div class="card">
      <div class="card-header">
        <span class="widget-name">${w.name || "Unknown"}</span>
        <span class="badge ${w.isBackground ? "badge-bg" : "badge-ui"}">${w.isBackground ? "Background" : "UI"}</span>
      </div>
      <div class="category">${w.category || "General"}</div>
      <div class="summary">${renderSimpleMarkdown(w.summary || "No summary provided.")}</div>
      <div class="tags">
        ${(w.tags || []).map((t) => `<span class="tag">${t}</span>`).join("")}
      </div>
      <div class="meta">
        <span>Props: ${w.props?.length || 0}</span>
        <span>Reads: ${w.storeInteractions?.reads?.length || 0}</span>
        <span>Writes: ${w.storeInteractions?.writes?.length || 0}</span>
      </div>
    </div>
  `,
    )
    .join("\n");
  const toolRows = tools
    .map(
      (t) => `
    <tr>
      <td><code>${t.name}</code></td>
      <td>${renderSimpleMarkdown(t.description || "")}</td>
    </tr>
  `,
    )
    .join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>eodash MCP Server</title>
  <style>
    :root {
      --primary: #002742;
      --secondary: #0071C2;
      --surface: #f8fafc;
      --text: #0f172a;
      --border: #e2e8f0;
      --bg-badge: #64748b;
      --ui-badge: #0284c7;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 2rem;
      background: var(--surface);
      color: var(--text);
      line-height: 1.5;
    }
    .container { max-width: 1100px; margin: 0 auto; }
    header { margin-bottom: 2rem; border-bottom: 2px solid var(--border); padding-bottom: 1rem; }
    h1 { margin: 0 0 0.5rem 0; color: var(--primary); }
    .stats { display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .stat-box { background: white; padding: 1rem 1.5rem; border-radius: 8px; border: 1px solid var(--border); }
    .stat-num { font-size: 1.5rem; font-weight: bold; color: var(--secondary); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
    .card { background: white; padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border); }
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .widget-name { font-weight: 600; font-size: 1.1rem; color: var(--primary); }
    .category { font-size: 0.85rem; color: #64748b; margin: 0.25rem 0 0.5rem; }
    .summary { font-size: 0.9rem; color: #334155; margin: 0.5rem 0; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin: 0.5rem 0; }
    .tag { background: #f1f5f9; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.75rem; }
    .badge { font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 4px; color: white; }
    .badge-bg { background: var(--bg-badge); }
    .badge-ui { background: var(--ui-badge); }
    .meta { display: flex; gap: 1rem; font-size: 0.8rem; color: #64748b; margin-top: 0.75rem; border-top: 1px dashed var(--border); padding-top: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; background: white; border-radius: 8px; overflow: hidden; }
    th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
    th { background: #f8fafc; color: var(--primary); }
    code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.85rem; }
    a { color: var(--secondary); text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>eodash MCP Server</h1>
      <p>Model Context Protocol Server for inspect, scaffold, and configure @eodash/eodash instances, widgets, and styles.</p>
    </header>

    <div class="stats">
      <div class="stat-box"><div class="stat-num">${widgetList.length}</div>Widgets</div>
      <div class="stat-box"><div class="stat-num">${tools.length}</div>MCP Tools</div>
      <div class="stat-box"><div class="stat-num">${examplesCount}</div>Curated Examples</div>
      <div class="stat-box"><div class="stat-num">${templates.join(", ")}</div>Templates</div>
    </div>

    <h2>Supported MCP Tools (${tools.length})</h2>
    <table>
      <thead><tr><th>Tool</th><th>Description</th></tr></thead>
      <tbody>${toolRows}</tbody>
    </table>

    <h2 style="margin-top: 2.5rem;">Available Widgets (${widgetList.length})</h2>
    <div class="grid">${widgetCards}</div>
  </div>
</body>
</html>`;
}
//#endregion
//#region helpers/templates.js
var __filename$1 = fileURLToPath(import.meta.url);
var __dirname$1 = path.dirname(__filename$1);
var REPO_ROOT = path.resolve(__dirname$1, "../../..");
var DEFAULT_STAC_ENDPOINT =
  "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json";
var DEFAULT_BRAND_NAME = "EOxHub Demo Dashboard";
var cachedTemplates = null;
function getRootPackage() {
  try {
    const pkgPath = path.join(REPO_ROOT, "package.json");
    if (fs.existsSync(pkgPath))
      return JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  } catch {}
  return { version: "5.9.0" };
}
/**
 * Dynamically discovers available built-in templates from templates/*.js
 */
function getAvailableTemplates() {
  if (cachedTemplates) return cachedTemplates;
  const templatesDir = path.join(REPO_ROOT, "templates");
  if (fs.existsSync(templatesDir)) {
    const discovered = fs
      .readdirSync(templatesDir)
      .filter(
        (f) => f.endsWith(".js") && f !== "index.js" && f !== "baseConfig.js",
      )
      .map((f) => path.basename(f, ".js"));
    if (discovered.length > 0) {
      cachedTemplates = discovered;
      return cachedTemplates;
    }
  }
  const archFile = path.join(__dirname$1, "../data/architecture-metadata.json");
  if (fs.existsSync(archFile))
    try {
      const arch = JSON.parse(fs.readFileSync(archFile, "utf8"));
      if (arch.templateSystem?.builtInTemplates?.length) {
        cachedTemplates = arch.templateSystem.builtInTemplates.map(
          (t) => t.name,
        );
        return cachedTemplates;
      }
    } catch {}
  cachedTemplates = ["explore", "lite", "expert", "compare"];
  return cachedTemplates;
}
/**
 * Gets the current @eodash/eodash version from the root package.json
 */
function getEodashVersion() {
  const rootPkg = getRootPackage();
  return rootPkg.version ? `^${rootPkg.version}` : "^5.9.0";
}
var DEFAULT_TEMPLATES_DIR = path.resolve(__dirname$1, "../templates");
/**
 * Recursively read directory into a map of { relativePath: utf8Content }
 * @param {string} dir
 * @param {string} [baseDir]
 * @returns {Record<string, string>}
 */
function readDirectoryFiles(dir, baseDir = dir) {
  const files = {};
  if (!fs.existsSync(dir)) return files;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory())
      Object.assign(files, readDirectoryFiles(fullPath, baseDir));
    else if (entry.isFile() && entry.name !== "manifest.json") {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
      files[relPath] = fs.readFileSync(fullPath, "utf8");
    }
  }
  return files;
}
/**
 * Parse metadata from header comments (// @tag value or JSDoc)
 * @param {string} content
 * @returns {Record<string, string>}
 */
function parseHeaderMetadata(content) {
  const meta = {};
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) {
      const match = trimmed.match(/@(\w+)\s+(.*)/);
      if (match) {
        const [, tag, value] = match;
        meta[tag] = value.trim();
      }
    } else if (trimmed && !trimmed.startsWith("/*")) break;
  }
  return meta;
}
/**
 * Dynamically load scaffold and config templates from disk
 * @param {string} [templatesDir]
 * @returns {Array<{ id: string, title: string, category: string, tags: string[], description: string, targetContext: string, code: any }>}
 */
function loadTemplateExamples(templatesDir = DEFAULT_TEMPLATES_DIR) {
  const examples = [];
  if (!fs.existsSync(templatesDir)) return examples;
  const scaffoldsDir = path.join(templatesDir, "scaffolds");
  if (fs.existsSync(scaffoldsDir)) {
    const folders = fs.readdirSync(scaffoldsDir, { withFileTypes: true });
    for (const folder of folders)
      if (folder.isDirectory()) {
        const folderPath = path.join(scaffoldsDir, folder.name);
        const manifestPath = path.join(folderPath, "manifest.json");
        let manifest = {};
        if (fs.existsSync(manifestPath))
          try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
          } catch {
            manifest = {};
          }
        const files = readDirectoryFiles(folderPath);
        const tags = manifest.tags || [];
        examples.push({
          id: manifest.id || `dashboard-scaffold-${folder.name}`,
          title: manifest.title || `Scaffold for ${folder.name}`,
          category: "dashboard-scaffold",
          tags,
          description: manifest.description || "",
          targetContext: manifest.targetContext || "",
          code: files,
        });
      }
  }
  const configsDir = path.join(templatesDir, "configs");
  if (fs.existsSync(configsDir)) {
    const files = fs.readdirSync(configsDir, { withFileTypes: true });
    for (const file of files)
      if (file.isFile() && file.name.endsWith(".js")) {
        const filePath = path.join(configsDir, file.name);
        const content = fs.readFileSync(filePath, "utf8");
        const doc = parseHeaderMetadata(content);
        const baseName = path.basename(file.name, ".js");
        const tags = doc.tags
          ? doc.tags
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        examples.push({
          id: doc.id || `dashboard-config-${baseName}`,
          title: doc.title || baseName,
          category: "dashboard-config",
          tags,
          tagsList: tags,
          description: doc.description || "",
          targetContext:
            "Place into src/main.js or config.js in an eodash application.",
          code: content,
        });
      }
  }
  return examples;
}
//#endregion
//#region helpers/safe-fetch.js
var DEFAULT_TIMEOUT_MS = 1e4;
var DEFAULT_MAX_BYTES = 10485760;
var MAX_REDIRECTS = 3;
/**
 * Checks whether an IP string is a private, loopback, link-local, or reserved address.
 *
 * @param {string} ip
 * @returns {boolean}
 */
function isPrivateOrReservedIP(ip) {
  const version = net.isIP(ip);
  if (!version) return false;
  if (version === 4) {
    const parts = ip.split(".").map(Number);
    if (
      parts.length !== 4 ||
      parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)
    )
      return true;
    const [a, b, c] = parts;
    if (a === 0) return true;
    if (a === 10) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 0 && c === 0) return true;
    if (a === 192 && b === 0 && c === 2) return true;
    if (a === 192 && b === 168) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
    if (a === 198 && b === 51 && c === 100) return true;
    if (a === 203 && b === 0 && c === 113) return true;
    if (a >= 224) return true;
    return false;
  }
  if (version === 6) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("::ffff:")) {
      const v4Part = lower.slice(7);
      if (net.isIP(v4Part) === 4) return isPrivateOrReservedIP(v4Part);
    }
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (/^fe[89ab]/i.test(lower)) return true;
    if (lower.startsWith("ff")) return true;
    return false;
  }
  return true;
}
/**
 * Validates that a URL is safe to fetch and does not resolve to private/reserved network space.
 *
 * @param {string} urlStr
 * @param {object} [options]
 * @param {boolean} [options.allowLocalhost=false] - For local testing
 * @returns {Promise<URL>}
 */
async function validateUrlIsSafe(urlStr, { allowLocalhost = false } = {}) {
  let parsed;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error(`Invalid URL format: "${urlStr}"`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
    throw new Error(
      `Forbidden protocol "${parsed.protocol}". Only "http:" and "https:" are permitted.`,
    );
  const hostname = parsed.hostname;
  if (
    !allowLocalhost &&
    (hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal"))
  )
    throw new Error(
      `Forbidden hostname "${hostname}". Localhost/internal domains are not allowed.`,
    );
  if (net.isIP(hostname)) {
    if (!allowLocalhost && isPrivateOrReservedIP(hostname))
      throw new Error(
        `Forbidden target IP address "${hostname}". Access to private/reserved IPs is blocked.`,
      );
    return parsed;
  }
  let addresses = [];
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch (err) {
    if (process.env.VITEST || process.env.NODE_ENV === "test") return parsed;
    throw new Error(
      `DNS resolution failed for hostname "${hostname}": ${err.message}`,
    );
  }
  if (!allowLocalhost) {
    for (const record of addresses)
      if (isPrivateOrReservedIP(record.address))
        throw new Error(
          `Forbidden target IP address "${record.address}" (resolved from "${hostname}"). Access to private/reserved IPs is blocked.`,
        );
  }
  return parsed;
}
/**
 * Performs a safe HTTP fetch with SSRF validation, redirect inspection, response size limits,
 * timeout controls, and MIME verification.
 *
 * @param {string} urlStr
 * @param {object} [options]
 * @param {number} [options.timeout=10000]
 * @param {number} [options.maxBytes=10485760]
 * @param {string} [options.userAgent]
 * @param {boolean} [options.allowLocalhost=false]
 * @param {Record<string, string>} [options.headers]
 * @returns {Promise<any>} Parsed JSON response
 */
async function safeFetch(urlStr, options = {}) {
  const {
    timeout = DEFAULT_TIMEOUT_MS,
    maxBytes = DEFAULT_MAX_BYTES,
    userAgent = process.env.EODASH_MCP_USER_AGENT ||
      "eodash-mcp/0.2.0 (+https://github.com/eodash/eodash)",
    allowLocalhost = process.env.ALLOW_LOCAL_STAC_ENDPOINTS === "true",
    headers = {},
  } = options;
  let currentUrl = urlStr;
  let redirectsRemaining = MAX_REDIRECTS;
  while (redirectsRemaining >= 0) {
    await validateUrlIsSafe(currentUrl, { allowLocalhost });
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () =>
        controller.abort(
          /* @__PURE__ */ new Error(`Request timed out after ${timeout}ms`),
        ),
      timeout,
    );
    try {
      const response = await fetch(currentUrl, {
        method: "GET",
        headers: {
          "User-Agent": userAgent,
          Accept:
            "application/json, application/geo+json, application/vnd.stac.*, text/json, */*",
          ...headers,
        },
        redirect: "manual",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location)
          throw new Error(
            `Received redirect status ${response.status} without Location header`,
          );
        currentUrl = new URL(location, currentUrl).toString();
        redirectsRemaining -= 1;
        if (redirectsRemaining < 0)
          throw new Error(`Exceeded maximum redirect limit (${MAX_REDIRECTS})`);
        continue;
      }
      if (!response.ok)
        throw new Error(
          `HTTP ${response.status} ${response.statusText} for ${currentUrl}`,
        );
      const contentType = response.headers?.get
        ? response.headers.get("content-type") || ""
        : "";
      if (!(
        !contentType ||
        contentType.includes("json") ||
        contentType.includes("geo+json") ||
        contentType.includes("stac") ||
        contentType.includes("text/plain")
      ))
        throw new Error(
          `Invalid response Content-Type "${contentType}". Expected JSON or STAC metadata.`,
        );
      const contentLengthHeader = response.headers?.get
        ? response.headers.get("content-length")
        : null;
      if (contentLengthHeader) {
        const declaredLength = parseInt(contentLengthHeader, 10);
        if (!Number.isNaN(declaredLength) && declaredLength > maxBytes)
          throw new Error(
            `Response Content-Length (${declaredLength} bytes) exceeds maximum limit (${maxBytes} bytes)`,
          );
      }
      if (response.body?.getReader) {
        const reader = response.body.getReader();
        const chunks = [];
        let totalBytes = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            totalBytes += value.length;
            if (totalBytes > maxBytes) {
              reader.cancel();
              throw new Error(
                `Response exceeded maximum allowed size of ${maxBytes} bytes`,
              );
            }
            chunks.push(value);
          }
        }
        const totalBuffer = new Uint8Array(totalBytes);
        let offset = 0;
        for (const chunk of chunks) {
          totalBuffer.set(chunk, offset);
          offset += chunk.length;
        }
        const text = new TextDecoder("utf-8").decode(totalBuffer);
        try {
          return JSON.parse(text);
        } catch (parseErr) {
          throw new Error(
            `Failed to parse response as JSON: ${parseErr.message}`,
          );
        }
      }
      if (typeof response.json === "function") return await response.json();
      if (typeof response.text === "function") {
        const text = await response.text();
        if (text.length > maxBytes)
          throw new Error(
            `Response exceeded maximum allowed size of ${maxBytes} bytes`,
          );
        return JSON.parse(text);
      }
      return null;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
  throw new Error(`Failed to complete request after redirects`);
}
/**
 * Creates an Axios-compatible safe HTTP client that can be passed to @eodash/stac.
 *
 * @param {object} [options]
 * @returns {{ get: (url: string, config?: { params?: Record<string, string | number | undefined> }) => Promise<{ data: any }> }}
 */
function createSafeHttpClient(options = {}) {
  return {
    get: async (url, config = {}) => {
      let finalUrl = url;
      if (config.params) {
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries(config.params))
          if (value !== void 0) query.set(key, String(value));
        const qs = query.toString();
        if (qs) finalUrl = `${url}${url.includes("?") ? "&" : "?"}${qs}`;
      }
      return { data: await safeFetch(finalUrl, options) };
    },
  };
}
//#endregion
//#region helpers/security.js
/**
 * Text and payload sanitization utilities for safe ingestion and output.
 */
/**
 * Sanitizes input string by stripping null bytes, control characters,
 * and invisible zero-width Unicode characters. Enforces maximum length.
 *
 * @param {string} str
 * @param {number} [maxLength=1000]
 * @returns {string}
 */
function sanitizeText(str, maxLength = 1e3) {
  if (typeof str !== "string") return "";
  const cleaned = str.replace(
    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u200B-\u200D\uFEFF]/g,
    "",
  );
  return cleaned.length <= maxLength ? cleaned : cleaned.slice(0, maxLength);
}
var MAX_GEOJSON_VERTICES = 1e4;
/**
 * Counts coordinate vertices in a GeoJSON geometry.
 *
 * @param {any} geometry
 * @returns {number}
 */
function countGeoJsonVertices(geometry) {
  if (!geometry || !geometry.coordinates) return 0;
  let count = 0;
  function walk(coords) {
    if (!Array.isArray(coords)) return;
    if (
      coords.length >= 2 &&
      typeof coords[0] === "number" &&
      typeof coords[1] === "number"
    ) {
      count += 1;
      return;
    }
    for (const c of coords) {
      walk(c);
      if (count > 1e4) return;
    }
  }
  walk(geometry.coordinates);
  return count;
}
/**
 * Checks if an object contains circular references.
 *
 * @param {any} obj
 * @param {WeakSet<object>} [seen=new WeakSet()]
 * @returns {boolean}
 */
function hasCircularReference(obj, seen = /* @__PURE__ */ new WeakSet()) {
  if (!obj || typeof obj !== "object") return false;
  if (seen.has(obj)) return true;
  seen.add(obj);
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === "object") {
      if (hasCircularReference(val, seen)) return true;
    }
  }
  return false;
}
/**
 * Fuse.js configuration for fuzzy-searching catalog indicators.
 */
var CATALOG_FUSE_OPTIONS = {
  keys: [
    {
      name: "title",
      weight: 0.35,
    },
    {
      name: "subtitle",
      weight: 0.2,
    },
    {
      name: "tags",
      weight: 0.2,
    },
    {
      name: "themes",
      weight: 0.1,
    },
    {
      name: "id",
      weight: 0.1,
    },
    {
      name: "description",
      weight: 0.05,
    },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
};
/**
 * Creates a minimal standalone STAC Collection document to wrap a self-contained STAC Item.
 *
 * @param {import("@eodash/stac").STACItem} item
 * @param {string} [fallbackUrl]
 * @returns {import("@eodash/stac").STACCollection}
 */
function createDummyCollectionForItem(item, fallbackUrl = "") {
  const collectionId = "single-item-collection";
  const selfHref =
    item.links?.find((l) => l.rel === "self")?.href || fallbackUrl || "";
  return {
    type: "Collection",
    stac_version: "1.0.0",
    id: collectionId,
    title: collectionId,
    description: "Auto-generated collection for STAC Item",
    license: "proprietary",
    extent: {
      spatial: { bbox: [item.bbox || [-180, -90, 180, 90]] },
      temporal: {
        interval: [
          [
            item.properties?.datetime ||
              item.properties?.start_datetime ||
              "1970-01-01T00:00:00Z",
            item.properties?.datetime ||
              item.properties?.end_datetime ||
              "2099-12-31T23:59:59Z",
          ],
        ],
      },
    },
    links: [
      ...(selfHref
        ? [
            {
              rel: "self",
              href: selfHref,
              type: "application/json",
            },
          ]
        : []),
    ],
  };
}
/**
 * Selects an indicator child link from a STAC Catalog using exact matches or Fuse.js fuzzy search.
 *
 * @param {Record<string, any>} catalog - The STAC catalog document
 * @param {object} [options]
 * @param {string} [options.collection_id] - Specific collection ID
 * @param {string} [options.query] - Free-text search query
 * @returns {Record<string, any>} Selected child link object
 */
function selectCatalogIndicator(catalog, { collection_id, query } = {}) {
  const maxCollections = parseInt(
    process.env.EODASH_MAX_COLLECTIONS || String(100),
    10,
  );
  const childLinks = (catalog.links || [])
    .filter(
      (l) => l.rel === "child" && (l.type ? l.type.includes("json") : true),
    )
    .slice(0, maxCollections);
  if (childLinks.length === 0)
    throw new Error(
      `STAC Catalog "${catalog.id || "root"}" does not contain any child indicator collections.`,
    );
  if (collection_id) {
    const targetId = collection_id.trim();
    const matched = childLinks.find(
      (l) => l.id === targetId || l.href?.includes(targetId),
    );
    if (!matched) {
      const sample = childLinks
        .slice(0, 10)
        .map((l) => l.id || l.title || l.href)
        .join(", ");
      throw new Error(
        `Collection "${targetId}" not found in catalog. Available examples: ${sample}${childLinks.length > 10 ? ` (and ${childLinks.length - 10} more)` : ""}`,
      );
    }
    return matched;
  }
  if (query) {
    const trimmed = query.trim().toLowerCase();
    const exactMatch = childLinks.find((l) => {
      const id = String(l.id || "").toLowerCase();
      const title = String(l.title || "").toLowerCase();
      if (id === trimmed) return true;
      if (title.split(/[\s,()[\]\-_]+/).includes(trimmed)) return true;
      return false;
    });
    if (exactMatch) return exactMatch;
    const fuse = new Fuse(childLinks, CATALOG_FUSE_OPTIONS);
    const searchResults = fuse.search(query.trim());
    if (searchResults.length > 0) {
      const topScore = searchResults[0].score ?? 0;
      const closeMatches = searchResults.filter(
        (r) => (r.score ?? 0) <= topScore + 0.08 && (r.score ?? 0) <= 0.4,
      );
      if (closeMatches.length > 1) {
        const candidates = closeMatches.map((r) => ({
          id: r.item.id,
          title: r.item.title,
          description: r.item.subtitle || r.item.description || "",
          score: Number((1 - (r.score ?? 0)).toFixed(2)),
          href: r.item.href,
        }));
        const candidateDescriptions = candidates
          .map(
            (c, i) =>
              `${i + 1}. "${c.title}" (id: ${c.id}) - ${c.description || "Score: " + c.score}`,
          )
          .join("\n");
        /** @type {any} */
        const ambiguityError = /* @__PURE__ */ new Error(
          `Multiple close indicator matches found for query "${query.trim()}". Please clarify by providing a specific 'collection_id':\n${candidateDescriptions}`,
        );
        ambiguityError.candidates = candidates;
        throw ambiguityError;
      }
      return searchResults[0].item;
    }
    if (query.trim().includes(" ")) {
      const terms = query.trim().split(/\s+/).filter(Boolean);
      const scoreMap = /* @__PURE__ */ new Map();
      for (const term of terms)
        for (const res of fuse.search(term)) {
          const key = res.item.id || res.item.href;
          const current = scoreMap.get(key) || {
            item: res.item,
            score: 0,
          };
          current.score += 1 - (res.score ?? 0);
          scoreMap.set(key, current);
        }
      if (scoreMap.size > 0)
        return Array.from(scoreMap.values()).sort(
          (a, b) => b.score - a.score,
        )[0].item;
    }
    const sample = childLinks
      .slice(0, 8)
      .map((l) => `"${l.title || l.id}"`)
      .join(", ");
    throw new Error(
      `No indicator in catalog matched query "${query.trim()}". Available indicators include: ${sample}...`,
    );
  }
  const available = childLinks
    .slice(0, 10)
    .map((l) => `"${l.title || l.id}" (id: ${l.id})`)
    .join("\n- ");
  throw new Error(
    `The provided URL is a STAC Catalog containing ${childLinks.length} indicator collections. Please provide a 'query' (e.g. 'Carbon Dioxide') or 'collection_id' to select an indicator.\nAvailable indicators include:\n- ${available}`,
  );
}
//#endregion
//#region helpers/logger.js
var isTest = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);
var defaultLevel =
  process.env.LOG_LEVEL ||
  (isTest
    ? "silent"
    : process.env.NODE_ENV === "production"
      ? "info"
      : "debug");
/**
 * Root Pino logger writing to stderr to keep stdout clean for stdio JSON-RPC transport
 */
var logger = pino(
  {
    level: defaultLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "headers.authorization",
        "headers.cookie",
        "authorization",
        "cookie",
      ],
      censor: "[REDACTED]",
    },
  },
  process.stderr,
);
/**
 * Express HTTP access logging middleware
 */
var httpLogger = pinoHttp({
  logger,
  autoLogging: { ignore: (req) => req.url === "/health" },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res, responseTime) => {
    return `${req.method} ${req.url} ${res.statusCode} (${Math.round(responseTime)}ms)`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
  customAttributeKeys: { responseTime: "duration_ms" },
});
/**
 * Summarize input params to prevent logging huge JSON documents
 */
function summarizeParams(params) {
  if (!params || typeof params !== "object") return params;
  const summary = { ...params };
  if (summary.stac_object)
    summary.stac_object = {
      type: summary.stac_object.type,
      id: summary.stac_object.id,
      size_bytes: JSON.stringify(summary.stac_object).length,
    };
  if (summary.config)
    summary.config = {
      type:
        typeof summary.config === "string"
          ? "raw_json_string"
          : summary.config?.type,
      id: typeof summary.config === "object" ? summary.config?.id : void 0,
      size_bytes: JSON.stringify(summary.config).length,
    };
  return summary;
}
/**
 * Extract semantic metrics from tool output
 */
function extractResultMetrics(toolName, result) {
  if (!result?.content?.[0]?.text) return void 0;
  try {
    const text = result.content[0].text;
    const parsed = JSON.parse(text);
    if (toolName === "generate_map_from_stac")
      return {
        layers_count: Array.isArray(parsed.layers) ? parsed.layers.length : 0,
        projection: parsed.viewProjection || parsed.projection,
        has_time_control: Boolean(parsed.timeControl),
        legends_count: Array.isArray(parsed.legends)
          ? parsed.legends.length
          : 0,
      };
    if (toolName === "validate_catalog_config")
      return {
        valid: parsed.valid,
        schema: parsed.schema,
        errors_count: Array.isArray(parsed.errors) ? parsed.errors.length : 0,
      };
    if (toolName === "find_examples")
      return { matches_count: Array.isArray(parsed) ? parsed.length : 0 };
    if (toolName === "list_widgets")
      return { widgets_count: Array.isArray(parsed) ? parsed.length : 0 };
    if (toolName === "get_widget_details")
      return {
        widget: parsed.name,
        category: parsed.category,
      };
  } catch {}
}
function extractErrorText(result) {
  if (!result?.content?.[0]?.text) return "Unknown error";
  try {
    const parsed = JSON.parse(result.content[0].text);
    return parsed.error || parsed.message || result.content[0].text;
  } catch {
    return result.content[0].text;
  }
}
/**
 * Higher-order function to instrument an MCP tool handler with timing, metrics, and structured logs
 * @param {string} toolName
 * @param {Function} handler
 * @returns {Function}
 */
function instrumentTool(toolName, handler) {
  return async (params) => {
    const start = performance.now();
    logger.debug({
      event: "tool_start",
      tool: toolName,
      params: summarizeParams(params),
    });
    try {
      const result = await handler(params);
      const durationMs = Math.round(performance.now() - start);
      if (result?.isError)
        logger.warn({
          event: "tool_call",
          tool: toolName,
          status: "error",
          duration_ms: durationMs,
          params: summarizeParams(params),
          error: extractErrorText(result),
        });
      else
        logger.info({
          event: "tool_call",
          tool: toolName,
          status: "success",
          duration_ms: durationMs,
          params: summarizeParams(params),
          metrics: extractResultMetrics(toolName, result),
        });
      return result;
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      logger.error({
        event: "tool_call",
        tool: toolName,
        status: "failure",
        duration_ms: durationMs,
        params: summarizeParams(params),
        error: err.message,
        stack: err.stack,
      });
      throw err;
    }
  };
}
//#endregion
//#region helpers.js
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var cachedMetadata = null;
function _resetMetadataCache() {
  cachedMetadata = null;
}
/**
 * Loads cached metadata from pre-generated JSON files in data/
 */
function getMetadata() {
  if (cachedMetadata) return cachedMetadata;
  const baseDir = fs.existsSync(path.join(__dirname, "data"))
    ? __dirname
    : path.join(__dirname, "..");
  const widgetsFile = path.join(baseDir, "data/widgets-metadata.json");
  const archFile = path.join(baseDir, "data/architecture-metadata.json");
  if (fs.existsSync(widgetsFile) && fs.existsSync(archFile))
    try {
      const widgetsData = JSON.parse(fs.readFileSync(widgetsFile, "utf8"));
      const architectureData = JSON.parse(fs.readFileSync(archFile, "utf8"));
      let examplesCount = 0;
      const examplesDir = path.join(baseDir, "data/examples");
      if (fs.existsSync(examplesDir)) {
        const exampleFiles = fs.readdirSync(examplesDir);
        for (const file of exampleFiles)
          if (file.endsWith(".json"))
            try {
              const content = JSON.parse(
                fs.readFileSync(path.join(examplesDir, file), "utf8"),
              );
              if (Array.isArray(content)) examplesCount += content.length;
            } catch (err) {
              logger.warn({
                event: "parse_example_file_warn",
                file,
                error: err.message,
              });
            }
      }
      cachedMetadata = {
        widgetsData,
        architectureData,
        examplesCount,
      };
      return cachedMetadata;
    } catch (err) {
      logger.warn({
        event: "read_cached_metadata_warn",
        error: err.message,
      });
    }
  throw new Error(
    "Metadata not found in @eodash/mcp-server/data/. Run 'npm run mcp:generate' or ensure data/*.json is packaged.",
  );
}
//#endregion
export {
  CUSTOM_WIDGET_GUIDES,
  DEFAULT_BRAND_NAME,
  DEFAULT_STAC_ENDPOINT,
  MAX_GEOJSON_VERTICES,
  _resetMetadataCache,
  countGeoJsonVertices,
  createDummyCollectionForItem,
  createSafeHttpClient,
  generateLandingPage,
  getAvailableTemplates,
  getEodashVersion,
  getMetadata,
  hasCircularReference,
  httpLogger,
  instrumentTool,
  isPrivateOrReservedIP,
  loadTemplateExamples,
  logger,
  parseHeaderMetadata,
  readDirectoryFiles,
  safeFetch,
  sanitizeText,
  selectCatalogIndicator,
  validateUrlIsSafe,
};
