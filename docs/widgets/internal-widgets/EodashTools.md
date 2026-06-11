# EodashTools

A compact toolbar row. It renders an "Select indicator" button that opens a full-screen dialog containing an `EodashItemFilter`, and an `EodashLayoutSwitcher` icon. Both elements are individually toggleable. `itemFilterConfig` is forwarded verbatim as props to the embedded `EodashItemFilter`, so all filter customization is handled there.

## Example

Default toolbar with indicator selector and layout switcher:

```js
{
  id: "tools",
  title: "Tools",
  type: "internal",
  layout: { x: 0, y: 0, w: 12, h: 1 },
  widget: {
    name: "EodashTools",
    properties: {
      indicatorBtnText: "Select indicator",
      showIndicatorsBtn: true,
      showLayoutSwitcher: true,
      layoutTarget: "lite",
    },
  },
}
```

Toolbar with a customised filter passed through `itemFilterConfig`:

```js
widget: {
  name: "EodashTools",
  properties: {
    indicatorBtnText: "Add dataset",
    itemFilterConfig: {
      filtersTitle: "Datasets",
      filterProperties: [
        {
          keys: ["title", "description"],
          title: "Search",
          type: "text",
          expanded: true,
        },
      ],
    },
  },
}
```

<!-- @widget-props -->

## See also

- [Internal widgets overview](/widgets/internal-widgets)
- [EodashItemFilter](/widgets/internal-widgets/EodashItemFilter) — the filter panel opened inside the dialog.
- [EodashLayoutSwitcher](/widgets/internal-widgets/EodashLayoutSwitcher) — the layout-toggle icon embedded in this widget.
