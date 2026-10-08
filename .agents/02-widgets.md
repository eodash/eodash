# eodash Widget System & Layouts

## 1. Widget Categories

- **`internal`**: Native Vue components in `widgets/`. Resolved via `import.meta.glob`.
- **`web-component`**: Custom elements rendered via `DynamicWebComponent.vue`. Supports complex object props and lifecycle hooks.
- **`iframe`**: External content embedded via `IframeWrapper.vue`.

## 2. Layout & Grid System

eodash uses a 12-column grid layout resolved in `DashboardLayout.vue`.

- **Coordinates**: Widgets use `x, y, w, h` for positioning.
- **Responsive Breakpoints**: Supports `"mobile/tablet/desktop"` string format (e.g., `w: "12/6/4"`) for automatic adjustment across screen sizes.

## 3. Dynamic Loading Workflow

1. **`useDefineTemplate`**: Resolves the current widget set based on the active STAC collection.
2. **`useDefineWidgets`**: Maps configurations to `shallowRef` component instances.
3. **`Suspense`**: Widgets are wrapped in `defineAsyncComponent` for smooth loading transitions.

## 4. Special Widget Slots

- **`background`**: Typically an `EodashMap`, rendered behind the grid without a layout wrapper or title.
- **`loading`**: A custom widget (e.g., `<eox-map-loading>`) displayed while the dashboard initializes.
