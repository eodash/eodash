# @eodash/mcp-server

Model Context Protocol (MCP) server for `@eodash/eodash`.

Provides intelligent assistance, introspection, type-safe widget definitions, layout orchestration, and configuration generators for coding agents and developers working on `eodash`-based dashboards.

## Features

- **Widget Introspection**: Query built-in widgets (`EodashMap`, `EodashItemCatalog`, `EodashItemFilter`, `EodashLayerControl`, `EodashTimeSlider`, `EodashDatePicker`, `EodashProcess`, `EodashChart`, `EodashStacInfo`, `EodashTools`, `EodashLayoutSwitcher`, `WidgetsContainer`) with complete TypeScript prop signatures, defaults, descriptions, and usage snippets.
- **Custom Widget Guidance**: Detailed guides and code templates for Web Component (`type: "web-component"`), Functional (`defineWidget: (selectedSTAC) => ...`), and IFrame widgets, including direct integration with `@eox/*` components and the reactive Pinia `eodashStore`.
- **Architecture & Layout Reference**: Detailed explanation of the 12-column responsive grid system, coordinate syntax (`"mobile/tablet/desktop"`), built-in templates (`lite`, `explore`, `expert`, `compare`), reactive state flows, and SPA vs `<eo-dash>` web component deployments.

## Setup & Running

### 1. Build Metadata
Generate widget metadata from the codebase:
```bash
npm run mcp:generate
```

### 2. Run with stdio (Coding Agents / Claude Desktop / Pi)
```bash
npm run mcp:stdio
# or
node mcp-server/index.js --stdio
```

#### Claude Desktop Configuration (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "eodash": {
      "command": "node",
      "args": [
        "/path/to/eodash/mcp-server/index.js",
        "--stdio"
      ]
    }
  }
}
```

### 3. Run with HTTP / Streamable HTTP Server
```bash
node mcp-server/index.js --port 3001
```
Open `http://localhost:3001` in your browser to view the interactive server landing page and registered tool inventory.

## Registered Tools

| Tool | Description |
| --- | --- |
| `list_widgets` | List all built-in eodash widgets with category, background capability, prop count, and store bindings. |
| `get_widget_details` | Get full TypeScript props, defaults, store reads/writes, STAC extensions, example config, and markdown guide for a specific widget. |
| `get_custom_widget_guide` | Detailed guides and templates for Web Component, Functional, and IFrame custom widgets. |
| `get_eodash_architecture` | Architecture reference covering the 12-column grid, templates, Pinia store states, and deployment modes. |

## Running Tests
```bash
npm run test:mcp
```
