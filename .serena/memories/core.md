# Core Source Map

## Directory Structure

- `core/`: Core logic
  - `client/`: Vue-based client application (`main.js` entrypoint)
  - `node/`: CLI and build-time logic
- `packages/`: Independent packages/components
  - `EodashItemCatalog/`
  - `EodashMap/`
  - `EodashProcess/`
  - `EodashTimeSlider/`
- `widgets/`: Vue widgets used in eodash
- `templates/`: Predefined configuration templates (baseConfig, explore, etc.)
- `tests/`: Test suites (unit, component, template, cli)

## Invariants

- Uses Vue 3 with Pinia for state management.
- Web component wrapper available via `./webcomponent`.
- Configuration based on STAC and custom `eodash:` properties.
- Integration with EOxElements (e.g., `@eox/map`, `@eox/layercontrol`).

## Architecture & Integration

- Deployment and config details: `mem:deployment_config`
- State and STAC data flow: `mem:state_data_flow`
- EOxElements bridge and quirks: `mem:eox_integration`
- Complex form orchestration: `mem:eodash_process`
