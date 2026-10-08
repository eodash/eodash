# Session: STAC to EOxMap Generator & Catalog Inference

## Overview

Added full STAC to EOxMap generation capabilities in `@eodash/mcp-server` via tool `generate_map_from_stac`, supporting STAC Catalogs, Indicators, Collections, and Items.

## Features & Implementation

1. **Catalog Auto-Inference (`isSTACCatalog`)**:
   - Detects STAC Catalogs via `type: "Catalog"` and structure (`links` with `rel: "child"` without spatial `extent` or `geometry`).
2. **Indicator Fuzzy Search & Disambiguation (`selectCatalogIndicator`)**:
   - Integrates Fuse.js with weighted keys (title, subtitle, tags, themes, id, code, description).
   - Priority matching for exact acronyms / tags (e.g. `CO2`, `NO2`).
   - Ambiguity feedback: returns candidate list (`id`, `title`, `description`, `score`) when top matches have close scores.
3. **Legend Extraction**:
   - Reuses eodash styling metadata (`eox:colorlegend`, `layerLegend`, rasterform/style legend configurations) directly from built layer properties.
4. **Time Series Aggregation (`timeControl`)**:
   - Aggregates available dates across collection readers, returning `{ availableDates, minDate, maxDate }` for `EodashTimeSlider`.
5. **Documentation & Schemas**:
   - Updated `packages/mcp/tools/stac.js` with comprehensive capability, limitation, and parameter descriptions.
   - Updated `packages/mcp/README.md` with feature list, registered tools table, detailed usage section, and directory layout.

## Verification

- `packages/mcp/tests/stac-map.test.js` (15/15 passed).
- All workspace unit and STAC tests passing (785 passed).
- `npm run check` completed with 0 errors.
- Live test against `https://ESA-eodashboards.github.io/eodashboard-catalog/trilateral/catalog.json` for "Carbon Dioxide" on 2017-05-18 verified.
