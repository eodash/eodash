# Plan: STAC Map Builder Tool for eodash MCP Server (`generate_map_from_stac`)

## Overview

Expose a new MCP tool `generate_map_from_stac` on `@eodash/mcp-server` that takes a STAC collection/indicator URL or STAC API endpoint, resolves target items/datetime, and builds the complete EOxMap layer configuration and map view parameters (`layers`, `center`, `zoom`, `projection`, `projections`, `item`, `datetime`).

---

## 1. Dependencies

Add `@eodash/stac` as direct dependency in `packages/mcp/package.json`:

```json
"dependencies": {
  "@eodash/stac": "^0.1.0",
  ...
}
```

---

## 2. Autoinference Logic & Zero-Config Defaults

- **`api` autoinference**:
  - Check if sanitized URL path ends with `.json`:
    - Ends with `.json` -> Static catalog (`api: false`).
    - Does not end with `.json` -> STAC API endpoint (`api: true`).
- **`projection` autoinference**:
  - Inspect top-level STAC document for `eodash:mapProjection`, `proj:code`, `proj:epsg`, or `eodash:proj4_def`.
  - Fallback: `"EPSG:3857"`.
- **Title**:
  - Extracted directly from STAC collection/item `title` or `id`.
- **Raster endpoints**:
  - Preserved directly as specified inside STAC links/assets and Render extensions.

---

## 3. Indicator Multi-Collection Handling (Inside `@eodash/stac`)

To avoid duplicating multi-collection resolution logic across `core` and `packages/mcp`, add `createEodashIndicator` (or composite indicator reader) directly into `@eodash/stac`:

- **Export `createEodashIndicator(url, options)` from `@eodash/stac`**:
  1. Fetches root STAC document (`stac`) if not provided.
  2. Uses `extractCollectionUrls(stac, url)` to resolve all child collection URLs (or `[url]` if flat).
  3. Creates `createEodashCollection(childUrl, options)` reader instances for all collections.
  4. Collects indicator base layers and overlays via `getIndicatorLayers(stac)`.
  5. Implements unified methods:
     - `getDates(datetime?, bbox?)`: Aggregates and sorts all distinct observation dates across child readers.
     - `getLayers(datetime?, context?)`: Builds base layers + child collection data layers + overlay layers, and aggregates required custom `projections`.
     - `buildLayers(item, context?)`: Builds layers for a specific STAC item across collections.
     - `getMapConfig(datetime?, context?)`: High-level convenience method returning `{ layers, center, zoom, projection, projections, datetime, item }`.
  6. Exposes `.readers` array so `core/client` can bind them to Pinia store directly without separate fetching logic.

- **Benefits**:
  - Both eodash core and `@eodash/mcp-server` consume the exact same STAC indicator logic from `@eodash/stac`.
  - Zero logic duplication.
  - Complete test coverage in `@eodash/stac` unit tests.

---

## 4. MCP Tool Specification (`generate_map_from_stac`)

### Tool Name

`generate_map_from_stac`

### Input Schema (Zod)

- `url` (string, required): STAC collection URL, indicator URL, or STAC API endpoint.
- `datetime` (string, optional): ISO date or datetime string (e.g. `"2024-06-01T00:00:00Z"`). If omitted, resolves the latest date from the collection.
- `item` (object, optional): Explicit STAC Item JSON object.
- `bbox` (array of 4 numbers, optional): Bounding box `[minX, minY, maxX, maxY]` in EPSG:4326.

### JSON Output Shape

```json
{
  "layers": [
    {
      "type": "Tile",
      "properties": {
        "id": "collection-id;:;item-id;:;link-id;:;EPSG:3857",
        "title": "Layer Title"
      },
      "source": {
        "type": "TileWMS",
        "url": "https://..."
      }
    }
  ],
  "center": [12.49, 41.89],
  "zoom": 6,
  "projection": "EPSG:3857",
  "projections": [],
  "datetime": "2024-06-01T00:00:00Z",
  "item": {
    "id": "item-id",
    "bbox": [12.0, 41.0, 13.0, 42.0]
  }
}
```

---

## 5. File Layout & Changes

1. `packages/mcp/package.json`: Add `@eodash/stac: "^0.1.0"` to `dependencies`.
2. `packages/mcp/generators/stac-map.js`: Implement `buildStacMap(options)` core generator.
3. `packages/mcp/tools/stac.js`: Implement `registerStacTools(server)` tool registration.
4. `packages/mcp/index.js`: Wire `registerStacTools(server)` into `createMcpServer()`.
5. `packages/mcp/tests/stac-map.test.js`: Vitest test suite testing:
   - Single static collection URL with latest date fallback.
   - Specific datetime query.
   - Indicator with multiple child collections.
   - Direct STAC Item object.
   - Autoinferred API vs Static mode.
   - Autoinferred projection and custom proj4 extraction.
   - Custom bbox calculation for center and zoom.
   - Error handling for invalid URLs / unresolvable items.

---

## 6. Verification

- `npm run test:mcp` (Vitest MCP test suite)
- `npm run check` (TypeScript and ESLint validation)
