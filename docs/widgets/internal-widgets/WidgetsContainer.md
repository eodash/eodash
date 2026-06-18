# WidgetsContainer

An accordion-style container that renders a list of widgets as stacked, animated `<details>` elements. Each widget becomes one collapsible panel with its `title` as the summary label. Only one panel can be open at a time (`exclusive` mode). The content height is calculated on mount to fill the available space below all summary bars. It uses `animated-details` for smooth expand/collapse transitions.

## Example

Grouping several widgets into a single accordion column:

```js
{
  id: "sidebar",
  title: "Sidebar",
  type: "internal",
  layout: { x: 9, y: 0, w: 3, h: 12 },
  widget: {
    name: "WidgetsContainer",
    properties: {
      widgets: [
        {
          id: "info",
          title: "Info",
          widget: { name: "EodashStacInfo", properties: {} },
        },
        {
          id: "layers",
          title: "Layers",
          widget: { name: "EodashLayerControl", properties: {} },
        },
        {
          id: "process",
          title: "Analysis",
          widget: { name: "EodashProcess", properties: {} },
        },
      ],
    },
  },
}
```

<!-- @widget-props -->

## See also

- [Internal widgets overview](/widgets/internal-widgets)
- [EodashStacInfo](/widgets/internal-widgets/EodashStacInfo)
- [EodashLayerControl](/widgets/internal-widgets/EodashLayerControl)
- [EodashProcess](/widgets/internal-widgets/EodashProcess)