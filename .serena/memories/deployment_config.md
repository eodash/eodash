# Deployment & Configuration

## Deployment Modes

- **Vue 3 SPA**: Standalone dashboard.
- **Web Component**: `<eo-dash>` for embedding (`core/client/asWebComponent.js`).

## Configuration

- Hierarchical: `Root Config` -> `Template Definitions`.
- Runtime resolution via `process.env.EODASH_RUNTIME_CONFIG` or `/config.js`.
- Functional widgets: `(selectedSTAC, compareSTAC) => config`.

## Module Aliases

- `@/*`: `./core/client/*`
- `^/*`: `./widgets/*`
- `user:widgets`: Custom widget directory.
- `user:config`: Active config file.
