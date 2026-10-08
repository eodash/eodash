# Plan for Building @eodash/eodash MCP Server

## Architecture & Tech Stack

- **Location**: `mcp-server/` inside `eodash-eodash` repository.
- **Runtime & Dependencies**: Node.js (ESM), `@modelcontextprotocol/sdk`, `zod`, `express`, `cors`, TypeScript AST & `@vue/compiler-sfc`.
- **Transport**: Streamable HTTP (Express) on port 3001 with interactive web landing page UI for local use and permanent deployment.
- **Core Design Principle**: Domain-reasoning & semantic action layer for AI agents following the workflow:
  `Intent -> Inspect STAC Data -> Recommend / Plan Layout -> Generate Config & Scaffolding -> Validate & Auto-Repair -> Final Deployment`.

---

## Stacked PR Breakdown

### Branch 1: `mcp/01-server-scaffold-and-widget-inspector` (Completed)

- MCP server foundation with Streamable HTTP transport and interactive landing page dashboard.
- Automated AST metadata extraction from `.vue` SFC components, TypeDoc, store states, and templates.
- **Tools**:
  - `list_widgets`: Lists all built-in eodash widgets with category filtering, summaries, and store reads/writes. DONE
  - `get_widget_details`: TypeScript props, store bindings, STAC extension compatibility, and copy-pasteable example snippets. DONE
  - `get_custom_widget_guide`: Boilerplate and lifecycle guides for Web Component, Functional, and IFrame custom widgets. DONE
  - `get_eodash_architecture`: 12-column grid layout rules, built-in templates, and reactive Pinia store state reference. DONE

### Branch 2: `mcp/02-scaffolding-and-config-generators` (Completed)

- Generators for project bootstrapping, configuration creation, styling, and working snippet discovery.
- **Tools**:
  - `scaffold_dashboard`: Generates complete project boilerplate (SPA, VitePress narratives, or Web Component with catalog, indicators, package.json, Dockerfile). DONE
  - `generate_eodash_config`: Creates/updates `baseConfig.js` / `eodash.config.js` with brand theme, template selection, and validated widget properties. DONE
  - `generate_layer_style`: Generates flatstyles, rasterforms (`keep_oneof_values: false`), colormaps, legends, and non-standard tilegrids. DONE
  - `find_examples`: Searches and retrieves curated, working eodash configuration snippets (rasterform, flatstyle, processes, custom widgets). DONE

### Branch 3: `mcp/03-stac-visualization-bridge`

- Direct STAC endpoint inspection and data-to-visualization mapping.
- **Tools**:
  - `inspect_stac_endpoint` & `inspect_stac_collection`: Inspects remote STAC catalogs/APIs to extract assets, bands, projections, temporal/spatial extents, and eodash-relevant metadata.
  - `configure_stac_visualization`: Maps STAC assets to TiTiler, GeoZarr, FlatGeobuf, WMTS, WMS, or vector layers.
  - `configure_stac_api_endpoint`: Generates STAC API configuration and provides exact recommendations on links/extensions (`proj:epsg`, `eox:flatstyle`, `eodash:rasterform`) to attach to STAC collections.

### Branch 4: `mcp/04-processes-and-validation-feedback-loop`

- OGC API Processes integration and diagnostic self-healing validation.
- **Tools**:
  - `generate_process_config` & `convert_ogc_process_to_config`: Converts OGC API Processes `DescribeProcess` JSON into eodash process + jsonform configurations.
  - `validate_eodash_config`: Validates configurations against official schemas and widget `defineProps`, returning structured errors with actionable remediation fixes for agent self-repair.
  - `validate_stac_endpoint`: Verifies STAC API/catalog compliance against eodash visualization rules.

### Branch 5: `mcp/05-agentic-workflows-and-composition`

- High-level orchestration prompts and cross-server interop.
- **Tools / Prompts**:
  - MCP Prompts (`create-dashboard-from-stac`, `onboard-stac-indicator`, `add-custom-widget`).
  - Interoperability recipes for chaining with `@eox/elements-mcp-server` and STAC MCP servers.
