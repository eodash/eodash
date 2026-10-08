# EOxElements Integration

## Bridge Pattern

- **Vue -> EOx**: Reactive properties via `.` prefix (e.g., `.layers`). Use `toRaw()`.
- **EOx -> Vue**: Native DOM events (e.g., `@layerchange`).

## Key Component Mapping

- `EodashMap` <-> `<eox-map>`
- `EodashTimeSlider` <-> `<eox-timecontrol-*>`
- `EodashLayerControl` <-> `<eox-layercontrol>`
- `EodashItemFilter` <-> `<eox-itemfilter>`
- `EodashProcess` <-> `<eox-jsonform>`

## Architecture Quirks

- `eox-map` deep-copies `.layers`.
- `eox-drawtools` requires careful cleanup to avoid memory leaks.
- Shadow DOM testing challenges; use `.shadow()` in Cypress.
