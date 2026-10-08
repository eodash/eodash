# EodashProcess

## Architecture

- Complex orchestration of Vue, `eox-jsonform`, and `eox-drawtools`.
- `jsonformKey` forces full re-mount on indicator/schema change.

## Layer ID Resolution

- STAC schemas use short IDs; eodash uses `CollectionId;:;ItemId;:;LinkId;:;EPSG:4326`.
- `updateJsonformIdentifier` resolves these at runtime by searching `eoxMap.#layers`.

## Execution Flow

1. Fetch schema from `eodash:jsonform` link.
2. Resolve short IDs to full OL IDs.
3. Render `eox-jsonform` (inits `eox-drawtools`).
4. User spatial interaction -> `drawupdate` event.
5. `startProcess()` submits OGC API Process request.
