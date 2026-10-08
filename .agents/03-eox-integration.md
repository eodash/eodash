# EOxElements Integration & Runtime Quirks

## 1. The Reactive Bridge Pattern

eodash Vue widgets act as a **reactive bridge** to `@eox/*` web components.

- **Data Flow (Vue -> EOx)**: Pass complex data via `.` property prefix (e.g., `.layers="layersArray"`). Use `toRaw()` to avoid proxy overhead.
- **Event Flow (EOx -> Vue)**: Listen for native DOM events via `@` syntax (e.g., `@layerchange`).
- **Lifecycle**: `mapEl.value` is assigned in `EodashMap.onMounted`, becoming the source of truth for other widgets.

## 2. Component Entanglements

| Widget               | EOx Component         | Role                                                |
| -------------------- | --------------------- | --------------------------------------------------- |
| `EodashMap`          | `<eox-map>`           | Base layers, indicator layers, and comparison mode. |
| `EodashTimeSlider`   | `<eox-timecontrol-*>` | Synchronizes global `datetime` ref.                 |
| `EodashLayerControl` | `<eox-layercontrol>`  | Manages visibility for the active map element.      |
| `EodashItemFilter`   | `<eox-itemfilter>`    | Maps STAC items to filterable results.              |
| `EodashProcess`      | `<eox-jsonform>`      | Maps OGC API Process schemas to dynamic forms.      |

## 3. eox-map Architecture & Sync

- **Deep Copy**: `eox-map` deep-copies `.layers` using `eval` (historical quirk).
- **Update Logic**: When `.layers` updates, existing interactions NOT in the new config are removed. This can impact `eox-drawtools` if not handled carefully.
- **Source of Truth**: Read back from `eoxMap.layers` (JSON) to get the current state for identification or saving.

## 4. Known Quirks & Troubleshooting

- **Memory Leaks**: `eox-drawtools` may leak `select` listeners if destroyed/re-rendered without explicit cleanup (e.g., when the parent form re-keys).
- **Resolution Races**: `initSelection` or `forEachFeatureAtPixel` may fail on first load if the OpenLayers layer or its source isn't fully ready.
- **Selection Trace**: `layers:updated` -> schema resolution -> form re-key -> `eox-drawtools` init -> user interaction.

## 5. Testability Hurdles

- **Shadow DOM**: Standard CSS selectors fail. Use `.shadow()` in Cypress or focus on logic-only testing in Vitest.
- **Async Rendering**: Lit-based components require `await element.updateComplete` to ensure internal state is reflected in the DOM.
