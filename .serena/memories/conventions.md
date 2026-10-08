# Conventions

## Code Style

- Follows `@eox/eslint-config`.
- Prettier for formatting.
- Vue 3 Composition API preferred.
- **Type Safety**: Use JS with JSDoc-based typing. Avoid greedy `any`. Prefer targeted casts or inline JSDoc shapes for third-party types.

## Naming & Patterns

- Widgets in `widgets/` are Vue components named `Eodash*.vue`.
- Custom STAC properties prefixed with `eodash:`.
- `Style` and `eox:flatstyle` must be URL strings in catalog data.
- `eodash:rasterform` supports both URL and JSON objects.

## EODash Specifics

- `window.location.href` as base for relative URL parsing.
- Use real OpenLayers classes in tests where possible.
- Standard logical tile size: 512x512.
