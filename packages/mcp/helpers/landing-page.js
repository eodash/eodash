/**
 * Lightweight markdown-like renderer for links and inline code.
 * @param {string} text
 */
function renderSimpleMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

/**
 * Renders a lightweight HTML landing page showing widget catalog, MCP tools, and instructions.
 * @param {Record<string, any>} widgetsData
 * @param {Record<string, any>} _architectureData
 * @param {object} [options]
 * @returns {string}
 */
export function generateLandingPage(
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
      name: "scaffold_dashboard",
      description: "Generate complete project boilerplate.",
    },
    {
      name: "generate_eodash_config",
      description: "Generate type-safe eodash.config.js file.",
    },
    {
      name: "generate_layer_style",
      description: "Generate OpenLayers flat styles and raster forms.",
    },
    {
      name: "find_examples",
      description: "Discover working dashboard snippets and configs.",
    },
    {
      name: "validate_catalog_config",
      description: "Validate catalog configs against official schemas.",
    },
  ];

  const templates = options.templates || ["lite", "explore", "expert", "compare"];
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
