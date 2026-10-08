# eodash Architecture, State & Data Flow

## 1. Deployment Modes

eodash supports two primary delivery modes:

- **Vue 3 SPA**: Standalone application deployed via the eodash CLI.
- **Web Component (`<eo-dash>`)**: Encapsulated element (`core/client/asWebComponent.js`) for embedding in any HTML page.

## 2. Configuration Pipeline

eodash uses a hierarchical, runtime-resolved configuration:

- **Hierarchy**: `Root Config` (stacEndpoint, brand, templates) -> `Template Definitions` (layouts, widgets).
- **Runtime Loading**: Resolves from `process.env.EODASH_RUNTIME_CONFIG`, `/config.js` (public), or the `user:config` alias.
- **Functional Widgets**: Widgets can be defined as functions `(selectedSTAC, compareSTAC) => config`, allowing conditional rendering based on selected data.

## 3. State Management

### Two-Tier Reactivity

- **Tier 1 (Pinia)**: `core/client/store/stac.js` manages STAC navigation and catalog state (`selectedStac`, `selectedItem`).
- **Tier 2 (Global Refs)**: `core/client/store/states.js` contains flat `ref()` instances for synchronization (`indicator`, `datetime`, `mapEl`, `mapPosition`, `loading`).

### URL Synchronization

`useURLSearchParametersSync()` maintains a two-way sync between browser URL parameters and global refs, enabling shareable dashboard states.

## 4. STAC Data Flow

The core lifecycle of translating STAC assets into interactive components:

1. **Selection**: User selects an indicator/item via catalog or tools.
2. **Mutation**: `stacStore.loadSelectedSTAC(path)` updates the Pinia store.
3. **Parsing**: `EodashCollection.js` processes metadata.
4. **Transformation**: `createLayersJson()` converts STAC assets (TIFF, GeoJSON, FlatGeoBuf) into declarative layer configurations.
5. **Emission**: `useEmitLayersUpdate` notifies subscribers (e.g., the map).
6. **Rendering**: `EodashMap` binds the JSON definition to the `<eox-map>` `.layers` property.

## 5. Module Aliases

Defined in `core/node/cli/viteConfig.js`:

- `@/*` -> `./core/client/*` (App Core)
- `^/*` -> `./widgets/*` (Built-in Widgets)
- `user:widgets` -> Custom widget directory
- `user:config` -> Active configuration file
