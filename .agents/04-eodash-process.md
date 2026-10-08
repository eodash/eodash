# EodashProcess: Form & Map Interaction Workflow

The `EodashProcess` widget (`widgets/EodashProcess/`) is the most complex orchestration in eodash, integrating Vue, `eox-jsonform`, and `eox-drawtools`.

## 1. Component Architecture

- **`index.vue`**: Manages `jsonformSchema`. Uses `jsonformKey` (indicator + mapId + schema) to force full destruction and recreation of the form on change.
- **`handling.js`**: Fetches the schema from the STAC collection and resolves identifiers.
- **`composables.js`**: Handles synchronization with map and time updates.

## 2. Layer ID Resolution

Eodash uses complex internal layer IDs: `CollectionId;:;ItemId;:;LinkId;:;EPSG:4326`.

- **The Problem**: STAC jsonform schemas typically use short collection IDs (e.g., `"stormtracker"`).
- **The Solution**: `updateJsonformIdentifier` resolves these at runtime by searching through `eoxMap.#layers` (JSON state) and matching prefixes.
- **Resolution Flow**: `layers:updated` -> prefix search in layer tree -> update schema with full ID -> trigger form re-key.

## 3. Workflow & Execution Trace

1. **Init**: Fetch jsonform schema from STAC `eodash:jsonform` link.
2. **Resolve**: Map short schema IDs to full OpenLayers layer IDs.
3. **Render**: Mount `eox-jsonform` which initializes `eox-drawtools`.
4. **Interact**: User activates selection mode via `eox-drawtools` controller.
5. **Update**: `drawupdate` event from the form updates spatial inputs in the process schema.
6. **Execute**: `startProcess()` validates the form and submits the OGC API Process request.
