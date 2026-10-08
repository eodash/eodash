# Plan for Branch 2: `generate_layer_style` and `find_examples`

## 1. Context & Motivation

This plan specifies the implementation of Branch 2 tools for `@eodash/eodash` MCP server:

1. `generate_layer_style`: Deterministic, semantic generator for OpenLayers vector FlatStyles (vector layers & vector tiles), WebGLTile raster FlatStyles (COG/GeoTIFF), and dynamic `eodash:rasterform` schemas (TiTiler/WMS/XYZ).
2. `find_examples`: Searchable, curated registry of production-tested eodash configurations, collections, indicators, rasterforms, flatstyles, JSON forms, Vega charts, and STAC API items harvested across all catalog repositories:
   - `gtif-austria-public-catalog` / `gtif-austria-public-assets`
   - `eodashboard-catalog` / `eodash-assets`
   - `RACE-catalog`
   - `deside-catalog`
   - `eopf-explorer/eodash-assets`
   - `gtif-cerulean-catalog` / `gtif-cerulean-assets`
   - `gtif-ukif-catalog` / `gtif-ukif-assets`
   - `science-hub-catalog`

---

## 2. Tool: `generate_layer_style`

### Tool Capabilities

- **`vector-flatstyle`**:
  - OpenLayers FlatStyle (`ol/style/flat`) for Vector Layers & Vector Tiles (MVT, GeoJSON, FlatGeobuf).
  - Symbolizers: Fill (`fill-color`), Stroke (`stroke-color`, `stroke-width`), Circle (`circle-radius`, `circle-fill-color`, `circle-stroke-color`), Text labels, and conditional Rules (`filter: ['>', ['get', prop], val]`).
  - Modes:
    - `single`: Unified static styling.
    - `categorical`: Expressions via `['match', ['get', prop], val1, col1, ..., fallback]` with synchronized categorical `legend`.
    - `graduated`: Numeric interpolation via `['interpolate', ['linear'], ['get', prop], stop1, col1, ...]` with synchronized continuous `legend`.
  - Dynamic `variables` linked to `jsonform` (rendered in `EOxLayerControl`).
  - Interactive `tooltip` array configuration (`id`, `title`, `appendix`, `decimals`).
- **`raster-webgl-flatstyle`** (COG / GeoTIFF WebGLTile layer):
  - WebGL shader expressions (`ol/style/expressions`):
    - `single-band-normalized`: Band value normalization using `['/', ['-', ['band', 1], ['var', 'vmin']], ['-', ['var', 'vmax'], ['var', 'vmin']]]` and `interpolate` color ramp.
    - `rgb-composite`: True color / False color using `['array', ['/', ['band', R], divisor], ['/', ['band', G], divisor], ['/', ['band', B], divisor], 1]`.
    - `band-ratio-index`: Normalized difference calculation (e.g. NDVI `(B8 - B4) / (B8 + B4)`).
  - Synchronized `variables: { vmin, vmax }`, `legend: { domainProperties: ['vmin', 'vmax'], range: [...] }`, and `jsonform` min/max range sliders.
- **`rasterform`** (`eodash:rasterform` for TiTiler / WMS / XYZ):
  - Server-side parameter configuration schema powered by `@json-editor/json-editor`.
  - Injects `options.keep_oneof_values: false` for branching `oneOf` / `anyOf`.
  - Injects `options.removeProperties: ["vminmax"]` to prevent intermediate slider objects from polluting tile URLs.
  - Generates parameter templates (e.g. `rescale: "{{vminmax.vmin}},{{vminmax.vmax}}"`).
  - Colormap selector with dynamic legend range binding (`rangeProperty: "colormap"`).

### Output Structure

Returns:

1. `style`: The generated style or rasterform JSON object.
2. `stacItemSnippet`: Ready-to-paste STAC Item Link JSON (`rel: "xyz"`, `eox:flatstyle` or `eodash:rasterform`).
3. `catalogCollectionSnippet`: Ready-to-paste `eodash_catalog` Resource JSON (`Style`, `Dimensions`, `Process.JsonForm`).
4. `notes`: Validation caveats and usage guidelines.

---

## 3. Tool: `find_examples`

### Curated Example Catalog

Indexed across all local catalogs with tags, categories, data types, and target contexts:

1. **Vector FlatStyles (Vector & Vector Tiles)**:
   - Categorized polygons with dynamic legend & filter (`gtif-cerulean-assets/styles/cis-ice-charts.json`).
   - Air quality in situ point stations with interactive circle radius & tooltips (`gtif-ukif-catalog` / `eodash-style-editor`).
   - Threshold-filtered polygons with dynamic variable slider (`gtif-cerulean-assets/styles/harshness.json`).
   - Vector Tile MVT land cover classification.
2. **Raster WebGL FlatStyles (COG)**:
   - Single-band radar/SAR normalized float GeoTIFF with colormap (`gtif-cerulean-assets/styles/polartep_rcm_style.json`).
   - Sentinel-2 true-color RGB GeoTIFF composite (`eodash-style-editor/src/examples/crop_circles/style.json`).
   - GeoZarr / COG NDVI normalized index calculation with color interpolation (`eopf-explorer/eodash-assets/styles/geozarr.json`).
3. **RasterForms**:
   - TiTiler single-band COG rescale & colormap selector with `removeProperties` and dynamic legend.
   - TiTiler multi-band branching `oneOf` (`keep_oneof_values: false`) switching between RGB composite and single-band NDVI.
   - WMS layer style switch form.
4. **JSONForms**:
   - Bounding box map selector (`format: "bounding-box"`, `autoStartSelection: false`, `drawtools.for: "eox-map#main"`).
   - Date / date-range picker form with hidden parameters for OGC Process API.
5. **Catalog Collections & Indicators**:
   - CMEMS WMTS time-series collection with OGC process and Vega definition (`gtif-cerulean-catalog/collections/DIATO_diatoms.json`).
   - Vector GeoJSON station collection with timeseries endpoint (`gtif-ukif-catalog/collections/UCL3-GMIF-air-quality-vector.json`).
   - POST process collection returning GeoTIFF with flatstyle (`gtif-cerulean-catalog/collections/harshness.json`).
   - Indicator grouping multiple collections with subcodes and themes (`gtif-cerulean-catalog/indicators`).
6. **STAC API Items**:
   - Web-map-links with roles (`baselayer`, `overlay`, `data`, `visible`).
   - Direct COG asset with projection extension.

---

## 4. Implementation Steps

1. **`packages/mcp/data/examples.json`**:
   - Create curated, comprehensive database of working examples extracted from all workspace catalogs.
2. **`packages/mcp/generators/style.js`**:
   - Color palette definitions (Viridis, Magma, Plasma, Inferno, Spectral, Grayscale, Algae, Blues, Reds).
   - `generateVectorFlatStyle`: handles Point, Polygon, Line, rules, expressions, legends, tooltips, jsonform.
   - `generateRasterWebglStyle`: handles COG WebGLTile single band, RGB, index calculation with OpenLayers expressions.
   - `generateRasterForm`: handles TiTiler, WMS, XYZ forms with `@json-editor/json-editor` options.
3. **`packages/mcp/generators/examples.js`**:
   - Multi-field scoring search (query text, category, dataType, feature).
4. **`packages/mcp/index.js`**:
   - Register `generate_layer_style` and `find_examples`.
   - Update landing page UI (`packages/mcp/helpers.js`).
5. **`packages/mcp/tests/`**:
   - Comprehensive Vitest unit tests for both tools.
