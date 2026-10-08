# Session: MCP Examples Enrichment with Real-World GTIF Patterns

## Overview

Enrich `@eodash/mcp-server` curated examples database with verified real-world patterns from GTIF Austria:

1. `chart-vega-dual-axis-reference-bands`: Dual-axis time-series with calendar/holiday background interval spans (`rect` mark with `x`/`x2`), single-dataset metric folding into dual axes with unified color scale and shared interactive legend toggle (`bind: "legend"`), and `break-paths-filter-domains`.
2. `indicator-inline-feature-properties-process`: Indicator Process endpoint using inline `data:application/json` templating clicked vector feature properties client-side (`{{feature.values_.*}}`) without external backend.
3. `chart-vega-kpi-metrics-dashboard`: Composite KPI summary cards (`mark: "text"` with SI and percent format), dynamic dictionary lookup in calculate transform (`{'code':'Label'}[datum.field]`), and axis-less comparison bar charts with direct value labels.
4. `indicator-overlay-layers-cors-proxy`: Indicator configuring GeoJSON + XYZ OverlayLayers, selective collection activation via `Disable`, and external hazard API endpoint wrapped in EOX CORS proxy (`cors.eox.at/get?url=...`) with CQL2 spatial intersection.
5. `chart-vega-tabular-scorecard-flatten`: Tabular hazard scorecard / status card list unrolling multi-endpoint responses via `calculate` arrays and `flatten` transform into discrete styled pill/badge rows.

## Implementation Details

- `packages/mcp/data/examples/chart-vega.json`: Added 3 Vega-Lite specifications (now 10 total).
- `packages/mcp/data/examples/indicator.json`: Added 2 Indicator configurations (now 6 total).
- `packages/mcp/tests/style-and-examples.test.js`: Added discovery and tag retrieval tests for all 5 new patterns.

## Verification

- `npm run test:mcp`: 48/48 tests passed.
- `npm run test:stac`: 190/190 tests passed.
- `npm run test:cli`: 43/43 tests passed.
- Schema validation via `validateCatalogConfig`: 0 errors.
- Prettier formatting verified.
