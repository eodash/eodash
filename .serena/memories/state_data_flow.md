# State & Data Flow

## State Management

- **Tier 1 (Pinia)**: `stac.js` manages catalog state (`selectedStac`, `selectedItem`).
- **Tier 2 (Global Refs)**: `states.js` flat `ref()` for sync (`indicator`, `datetime`, `mapEl`, etc.).
- **URL Sync**: `useURLSearchParametersSync()` for shareable states.

## STAC to Map Flow

1. Selection in catalog -> `stacStore.loadSelectedSTAC`.
2. Metadata processing via `EodashCollection.js`.
3. Layer conversion via `createLayersJson()`.
4. `useEmitLayersUpdate` notifies map.
5. `EodashMap` binds to `<eox-map> .layers`.
