# @eodash/mcp-server

Model Context Protocol (MCP) server for `@eodash/eodash`.

Provides intelligent assistance, introspection, type-safe widget definitions, layout orchestration, layer style generation, curated example discovery, catalog validation, and configuration generators for coding agents and developers working on `eodash`-based dashboards.

## Features

- **Widget Introspection & Schema**: Query built-in widgets (`EodashMap`, `EodashItemCatalog`, `EodashItemFilter`, `EodashLayerControl`, `EodashTimeSlider`, `EodashDatePicker`, `EodashProcess`, `EodashChart`, `EodashStacInfo`, `EodashTools`, `EodashLayoutSwitcher`) with structured JSON schemas for complex props (e.g., `EodashMap.btns`), TypeScript signatures, defaults, and usage snippets.
- **Layer Style & Visualization Generator**: Generate OpenLayers styles (`vector-style` for GeoJSON/FlatGeobuf/MVT with optional text labels and reactive width/radius sliders, `raster-style` for client-side COG/GeoTIFF rendering with single-band, RGB, or multi-band compound threshold masking) and dynamic forms (`rasterform` for TiTiler/WMS/XYZ). Supports remote colormap palette fetching (viridis, magma, plasma, etc.) and dynamic slider track calculation (~1.5x headroom on default max).
- **Curated Examples Discovery**: Query working dashboard examples, Vega / Vega-Lite charts (`chart-vega`), layer styles, process forms, and catalog configs filtered by category, tags, and weighted free-text search via Fuse.js.
- **Catalog Schema Validation**: Validate EODash catalog collections and indicators against official schemas (`collection-schema.json`, `indicator-schema.json`) and domain rules (enforcing URL strings for `Style`, rejecting `Resources[].Flatstyle`, checking `keep_oneof_values: false` on branching JSON-Editor forms).
- **Custom Widget Guidance**: Detailed guides and code templates for Web Component (`type: "web-component"`), Functional (`defineWidget: (selectedSTAC) => ...`), and IFrame widgets, including direct integration with `@eox/*` components and the reactive Pinia `eodashStore`.
- **Architecture & Layout Reference**: Detailed explanation of the 12-column responsive grid system, coordinate syntax (`"mobile/tablet/desktop"`), built-in templates (`lite`, `explore`, `expert`, `compare`), reactive state flows, and SPA vs `<eo-dash>` web component deployments.

## Setup & Running

### 1. Build Metadata

Generate widget and architecture metadata from the codebase:

```bash
npm run mcp:generate
```

### 2. Run Server (Stateless HTTP)

```bash
npm run mcp:start
# or custom port:
node packages/mcp/index.js --port 3001
# or globally / via bin:
npx @eodash/mcp-server --port 3001
```

- Operates in stateless MCP mode (`sessionIdGenerator: undefined`, `enableJsonResponse: true`), returning direct JSON-RPC responses over HTTP POST without session state or open SSE streams.
- Open `http://localhost:3001` in your browser to view the interactive server landing page and tool catalog.
- Health check endpoint: `http://localhost:3001/health`.

### 3. MCP Client Configuration

Connect your MCP client (Claude Desktop, Cursor, Pi MCP adapter, MCP Inspector, or custom agents) via Streamable HTTP:

#### MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

Connect to `http://localhost:3001` via Streamable HTTP.

#### Claude Desktop Configuration (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "eodash": {
      "url": "http://localhost:3001"
    }
  }
}
```

## Registered Tools

| Tool                      | Description                                                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list_widgets`            | List all built-in eodash widgets with category, background capability, prop count, store bindings, and filter by capability tags or free-text search.      |
| `get_widget_details`      | Get full TypeScript props, JSON schemas for complex props, defaults, store bindings, STAC extensions, and usage snippets for a specific widget.            |
| `get_custom_widget_guide` | Detailed guides and templates for Web Component, Functional, and IFrame custom widgets.                                                                    |
| `get_eodash_architecture` | Architecture reference covering the 12-column grid, templates, Pinia store states, and deployment modes.                                                   |
| `generate_layer_style`    | Generate complete OpenLayers styles (`vector-style`, `raster-style` for COG) and dynamic forms (`rasterform`) with colormaps and sliders.                  |
| `find_examples`           | Search and discover working eodash dashboard scaffolds, configs, Vega charts, layer styles, and catalog configs with category and tag filters via Fuse.js. |
| `validate_catalog_config` | Validate catalog collection and indicator configurations against official eodash schemas and domain rules.                                                 |

## Running Tests

```bash
npm run test:mcp
```

## Project Structure

```
packages/mcp/
├── index.js                  # Server startup & CLI argument parser
├── server.js                 # Express app & Streamable HTTP transport
├── helpers.js                # Shared utilities & metadata loaders
├── generate-metadata.js      # Metadata build script & CLI
├── helpers/                  # Template, landing page, and guide helpers
├── metadata/                 # AST & TypeDoc extractors for widgets/stores
├── tools/                    # MCP tool registrations & Zod input schemas
│   ├── widgets.js            # list_widgets, get_widget_details
│   ├── architecture.js       # get_custom_widget_guide, get_eodash_architecture
│   ├── discovery.js          # find_examples, validate_catalog_config
│   └── generators/           # generate_layer_style
├── generators/               # Style, example discovery, and validation engines
└── data/                     # Generated metadata JSON artifacts
```
