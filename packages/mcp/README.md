# @eodash/mcp

Model Context Protocol (MCP) server for `@eodash/eodash`.

Provides intelligent assistance, introspection, type-safe widget definitions, layout orchestration, layer style generation, curated example discovery, catalog validation, and configuration generators for coding agents and developers working on `eodash`-based dashboards.

## Features

- **Widget Introspection & Schema**: Query built-in widgets (`EodashMap`, `EodashItemCatalog`, `EodashItemFilter`, `EodashLayerControl`, `EodashTimeSlider`, `EodashDatePicker`, `EodashProcess`, `EodashChart`, `EodashStacInfo`, `EodashTools`, `EodashLayoutSwitcher`) with structured JSON schemas for complex props (e.g., `EodashMap.btns`), TypeScript signatures, defaults, and usage snippets.
- **Curated Examples Discovery**: Query working dashboard examples, Vega / Vega-Lite charts (`chart-vega`), layer styles, process forms, and catalog configs filtered by category, tags, and weighted free-text search via Fuse.js.
- **Catalog Schema Validation**: Validate EODash catalog collections and indicators against official schemas (`collection-schema.json`, `indicator-schema.json`) and domain rules (enforcing URL strings for `Style`, rejecting `Resources[].Flatstyle`, checking `keep_oneof_values: false` on branching JSON-Editor forms).
- **Custom Widget Guidance**: Detailed guides and code templates for Web Component (`type: "web-component"`), Functional (`defineWidget: (selectedSTAC) => ...`), and IFrame widgets, including direct integration with `@eox/*` components and the reactive Pinia `eodashStore`.
- **STAC to EOxMap Generation**: Build complete, ready-to-render `<eox-map>` configurations (layers, center, zoom, projection, datetime, timeControl, legend) directly from STAC Catalogs, Indicators, Collections, or Items with fuzzy search, GeoParquet support, and automatic legend/timeline extraction.
- **Architecture & Layout Reference**: Detailed explanation of the 12-column responsive grid system, coordinate syntax (`"mobile/tablet/desktop"`), built-in templates (`lite`, `explore`, `expert`, `compare`), reactive state flows, and SPA vs `<eo-dash>` web component deployments.

## Setup & Running

### 1. Build Metadata

Generate widget and architecture metadata from the codebase:

```bash
npm run mcp:generate
```

### 2. Run Server

#### STDIO Mode (Recommended for Local Clients & IDEs)

```bash
# Run over stdio:
node packages/mcp/dist/index.js --stdio
# or via npx / bin:
npx @eodash/mcp --stdio
```

#### HTTP / SSE Mode

```bash
npm run mcp:start
# or custom port / host:
node packages/mcp/dist/index.js --port 3001 --host 127.0.0.1
# or globally / via bin:
npx @eodash/mcp --port 3001
```

- Operates in stateless MCP mode (`sessionIdGenerator: undefined`, `enableJsonResponse: true`), returning direct JSON-RPC responses over HTTP POST without session state or open SSE streams.
- Open `http://localhost:3001` in your browser to view the interactive server landing page and tool catalog.
- Health check endpoint: `http://localhost:3001/health`.

### 3. MCP Client Configuration

Connect your MCP client (Claude Desktop, Cursor, Pi MCP adapter, MCP Inspector, or custom agents):

#### Claude Desktop Configuration (`claude_desktop_config.json`) - STDIO

```json
{
  "mcpServers": {
    "eodash": {
      "command": "npx",
      "args": ["-y", "@eodash/mcp", "--stdio"]
    }
  }
}
```

#### Claude Desktop Configuration (`claude_desktop_config.json`) - HTTP

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
| `find_examples`           | Search and discover working eodash dashboard scaffolds, configs, Vega charts, layer styles, and catalog configs with category and tag filters via Fuse.js. |
| `validate_catalog_config` | Validate catalog collection and indicator configurations against official eodash schemas and domain rules.                                                 |
| `generate_map_from_stac`  | Build complete EOxMap layer and view configuration (layers, center, zoom, timeControl, legend) from a STAC catalog, indicator, collection, or item.        |

## STAC Mapping Tool (`generate_map_from_stac`)

The `generate_map_from_stac` tool translates any STAC resource into a complete `<eox-map>` configuration JSON object.

### Capabilities

- **Document Hierarchy Auto-Inference**: Automatically detects whether the provided STAC resource is a Catalog, Indicator Collection, Data Collection, or standalone STAC Item.
- **Catalog Navigation & Indicator Selection**:
  - When a root STAC Catalog is supplied, use `query` (e.g. `'Carbon Dioxide'`, `'NO2'`) to fuzzy-search child indicators by title, subtitle, tags, themes, ID, or description via Fuse.js.
  - Or supply `collection_id` (e.g. `'N2_CO2_mean'`) to directly target a specific collection.
- **Diverse Data Backends**: Resolves GeoParquet collection mirrors (`items.parquet`), TiTiler raster COGs, WMS, WMTS, and XYZ tile layers.
- **Composite Map Assembly**: Automatically bundles default baselayers (Terrain, Cloudless, OSM), data layers, and overlay labels with group tagging and exclusive visibility.
- **Legend Extraction**: Reads color legend definitions directly from STAC layer styling metadata (`eox:colorlegend`, `layerLegend`, or rasterform/style legend configurations) without URL parsing.
- **Temporal Aggregation**: Collects available time steps into `timeControl: { availableDates, minDate, maxDate }` for direct use with `EodashTimeSlider`.

### Limitations

- **No Image Rendering**: Outputs OpenLayers/EOxMap layer definitions; does not download raster tiles or render PNG pixels.
- **Ambiguity Clarification**: If a catalog query matches multiple indicators closely, the tool returns an error with a structured `candidates` array (`id`, `title`, `description`, `score`) so the caller can clarify with `collection_id`.

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
│   ├── widgets.js            # list_widgets, get_widget_details, get_custom_widget_guide
│   ├── architecture.js       # get_eodash_architecture
│   ├── discovery.js          # find_examples, validate_catalog_config
│   └── stac.js               # generate_map_from_stac
├── generators/               # Example discovery, catalog validation, and STAC map engines
│   ├── examples.js           # find_examples query engine
│   ├── validator.js          # validate_catalog_config schema engine
│   └── stac-map.js           # buildStacMap & STAC catalog inference engine
└── data/                     # Generated metadata & example JSON artifacts
```
