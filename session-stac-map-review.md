# Session: STAC Map Tool & Review Tasks

## Objectives

1. Remove deprecated aliases (`collection`, `item`) from `buildStacMap` function description, implementation, and tests.
2. Support STAC API root catalogs in `buildStacMap`.
3. Fix lint errors.

## Progress

- Removed deprecated aliases (`collection`, `item`) from `buildStacMap` JSDoc, implementation, and test suite.
- Updated legend extraction in `buildStacMap` to return `mapConfig.legends` (plural array).
- Added STAC API root catalog handling in `buildStacMap`.
- Updated `MapConfig` interface to include `legends` and `indicator`.
- Moved `isSTACCatalog` helper to `@eodash/stac/helpers` (`packages/stac/src/helpers/catalog.js`).
- Re-exported `isSTACCatalog` via `@eodash/stac/helpers` and consumed it in `buildStacMap`.
- Added unit tests for `isSTACCatalog` in `@eodash/stac`.
- Added `.refine()` to `generate_map_from_stac` schema in `packages/mcp/tools/stac.js` to enforce either `url` or `stac_object`.
- Added test in `packages/mcp/tests/mcp-server.test.js` verifying schema validation rejection when neither is provided.
- Replaced ambiguous `color`/`colorPalette` options in `createEodashIndicator` with single `colors` array option.
- Defined and exported `DEFAULT_COLLECTIONS_PALETTE` (Bank-Wong palette from `templates/baseConfig.js`) as default fallback.
- Updated `core/client/utils/index.js` `updateEodashCollections` to pass `colors: colorPalette`.
- Added unit tests in `packages/stac/tests/indicator.test.js` verifying default palette and custom `colors` overrides.
- Fixed ESLint errors (`no-empty` block and unused `customItem` variable).
- Moved `normalizeBaseLayers` and `DEFAULT_BASE_LAYERS` to `@eodash/stac/helpers` (`packages/stac/src/helpers/layers.js`).
- Imported real `normalizeBaseLayers` in `tests/unit/EodashTimeSlider/animation-content.test.js` via `@eodash/stac/helpers`, removing 40 lines of duplicate mock implementation.
- Simplified `buildIndicatorDataLayers` mock in `animation-content.test.js` from 60 lines down to ~15 lines.
- Added comprehensive unit tests for `normalizeBaseLayers` in `packages/stac/tests/layer-helpers.test.js`.
- Configured Vite build for `@eodash/mcp-server` (`packages/mcp/vite.config.js`) bundling to `dist/`, inlining monorepo `@eodash/stac` source via path aliases (`@eodash/stac`, `@eodash/stac/helpers`, etc.) so published package ships self-contained without stale `0.1.0` dependency.
- Added `--stdio` / `-s` CLI flag using `@modelcontextprotocol/sdk/server/stdio.js` (`StdioServerTransport`), with error-only stderr logging.
- Added `--help` / `-h` CLI flag documenting STDIO and HTTP modes.
- Added tests verifying STDIO server operation and bundled `dist/index.js` execution in `packages/mcp/tests/mcp-server.test.js` and `packages/mcp/tests/pack.test.js`.
- Updated `packages/mcp/package.json` entry points (`main: dist/index.js`, `bin: dist/index.js`, `build` and `prepack` scripts) and `packages/mcp/README.md`.
- Updated `packages/mcp/tests/pack.test.js` with backward-scanning bracket matcher to parse `npm pack --dry-run --json` output robustly, eliminating syntax errors caused by CI log prefixes.
- Evaluated and addressed all 18 review findings from `mcp-last-review.md`:
  - Fixed `normalizeBaseLayers` in-place mutation by creating shallow clones with fresh properties (Finding 11).
  - Fixed `buildIndicatorDataLayers` to render selected item for its own collection and nearest date item for other collections across the indicator (Finding 10).
  - Optimized `getMapConfig` in `createEodashIndicator` to fetch dates once upfront instead of twice (Finding 12).
  - Added explicit `api` parameter support in `buildStacMap` and tool schema for overriding static/API inference (Finding 13).
  - Fetched authoritative eodash schemas directly from remote URL (`eodash-schemas` GitHub Pages) on server startup (fail fast if endpoint unavailable, restart deployment to refresh schemas). No fallback schemas or local schema files in production package.
  - Relocated schema test fixtures strictly to `packages/mcp/tests/fixtures/schemas/` for hermetic test execution, stripped of UI descriptions and JSON-editor annotations to minimize repository footprint while preserving 100% schema validation fidelity.
  - Added Origin header validation on `POST /` in Express app to block untrusted cross-origin requests (Finding 16).
  - Fixed `store-interactions.js` to exclude missing `loadColormapRegistry` and `loadTileMatrixSetRegistry` actions from store reads (Finding 18).
  - Fixed missing `Description` on examples in `collection.json` and `indicator.json`, and fixed invalid `"type": "date"` in `jsonform.json` (Finding 5, 6).
  - Updated `tests/setup.js` to always regenerate fresh metadata on test runs (Finding 4).
  - Added comprehensive test suites covering all findings in `pack.test.js`, `validator.test.js`, `mcp-server.test.js`, `stac-map.test.js`, `indicator.test.js`, and `layer-helpers.test.js` (Findings 1-3, 7, 14, 15, 17).
  - Added explicit Ajv format validators (`bounding-box`, `point`, `datetime` supporting ISO & YYYYMMDD, `markdown`, `categories`) and silenced noisy warning logger in `packages/mcp/generators/validator/schemas.js`, eliminating unknown format warnings on boot.
- Implemented production security hardening & defense layer across OSS repo:
  - Created `packages/mcp/utils/safe-fetch.js` with SSRF defense: blocks private/loopback/cloud-metadata/link-local/multicast IP addresses (IPv4 & IPv6), enforces protocol allowlist (`http:`, `https:`), limits response streams to 10MB, verifies MIME type, handles redirects with hop inspection, sets configurable User-Agent via `process.env.EODASH_MCP_USER_AGENT`, and provides Axios-compatible `createSafeHttpClient()`.
  - Added inbound body size limit (1MB) and JSON-RPC 413 error handler in `packages/mcp/server.js`.
  - Added concurrent connection tracking per client IP (default max 10, configurable via `MAX_CONNECTIONS_PER_IP`), global connection cap (default max 50 via `MAX_SSE_CONNECTIONS`), idle connection reaper (default 120s via `IDLE_TIMEOUT_MS`), and periodic SSE keepalive heartbeat (`HEARTBEAT_INTERVAL_MS`) with 429 Too Many Requests response in `packages/mcp/server.js`.
  - Added configurable `ALLOWED_ORIGINS` support in `packages/mcp/server.js` while maintaining localhost protection.
  - Implemented STAC crawler boundaries in `packages/mcp/generators/stac-map.js`: max traversal depth (default 5 via `EODASH_MAX_TRAVERSAL_DEPTH`), max collections parsed (default 100 via `EODASH_MAX_COLLECTIONS`), and circular link reference detection via visited URL set.
  - Added input object circular reference detection (`hasCircularReference`), GeoJSON vertex flood defense (`countGeoJsonVertices` rejecting > 50,000 vertices), and text sanitization (`sanitizeText`) stripping null bytes, control characters, and zero-width Unicode characters (`\u200B-\u200D`, `\uFEFF`) while enforcing 1000 char cap on `indicator.description` and layer descriptions.
  - Created `packages/mcp/tests/security.test.js` validating SSRF blocking, 1MB payload enforcement, circular reference errors, zero-width Unicode stripping, description sanitization, GeoJSON vertex rejection, and IP/global connection thresholds.
- Re-architected helper and utility modules under `packages/mcp/`:
  - Moved `safe-fetch.js` from `utils/` to `packages/mcp/helpers/safe-fetch.js`, removed `utils/`.
  - Extracted security & sanitization utilities (`sanitizeText`, `hasCircularReference`, `countGeoJsonVertices`, `MAX_GEOJSON_VERTICES`) to `packages/mcp/helpers/security.js`.
  - Extracted STAC item wrapping and catalog search (`createDummyCollectionForItem`, `selectCatalogIndicator`) to `packages/mcp/helpers/stac.js`.
  - Consolidated template loader utilities (`readDirectoryFiles`, `parseHeaderMetadata`, `loadTemplateExamples`) into `packages/mcp/helpers/templates.js`, deleted `packages/mcp/generators/template-loader.js`.
  - Re-exported all helper modules from `packages/mcp/helpers.js`.
- Configured production containerization & release-please integration:
  - Created `packages/mcp/Dockerfile` using multi-stage `node:26-alpine` build (builder, prod-deps, runner with `USER node`, exposed port 3001, healthcheck on `/health`).
  - Updated `packages/mcp/index.js` to read `process.env.PORT || 3001` and `process.env.HOST || 127.0.0.1`, allowing container `ENV HOST=0.0.0.0` to bind properly without CLI flags.
  - Updated `.github/workflows/release-please.yml` to build and push `ghcr.io/eodash/mcp-server:${MCP_VERSION}` and `:latest` only when `packages/mcp` is released (no dev image pushes).
- Added structured logging & K8s observability:
  - Installed `pino` and `pino-http` in `packages/mcp`.
  - Created `packages/mcp/helpers/logger.js` configured with `pino(process.stderr)` to prevent stdout collision with stdio JSON-RPC transport, header redaction, and `instrumentTool(toolName, handler)` wrapper.
  - Mounted `httpLogger` in `packages/mcp/server.js`, automatically filtering out `/health` probe spam and logging HTTP status, latency (`duration_ms`), and client IP.
  - Structured warnings and info logs for 429 rate limits, 403 CORS rejects, 413 payloads, and idle connection reapers.
  - Wrapped all 6 tools across `stac.js`, `discovery.js`, `widgets.js`, `architecture.js` with `instrumentTool` to track execution duration, status, sanitized params, and semantic metrics.
  - Added test suite `packages/mcp/tests/logger.test.js` (7 new tests).
  - Replaced remaining runtime `console.log` / `console.error` / `console.warn` calls with structured logger methods in `index.js`, `server.js`, `helpers.js`, `generators/examples.js`, and `generators/validator/schemas.js`.
- Ran type checker (`npm run check` passed with 0 errors) and test suites (`test:stac` 211 passed, `test:mcp` 103 passed, `test:unit` 231 passed).
- Fixed Dockerfile runner stage: removed non-existent `packages/mcp/node_modules` copy (npm workspaces hoists all production dependencies to root `/app/node_modules`).
