# EodashLayoutSwitcher

A single icon button that switches the dashboard to a named [template](/templates). Clicking it sets the global `activeTemplate` state to the value of `target`, which triggers a layout transition defined in the dashboard configuration. On desktop it renders with a tooltip ("Switch to `<target>` mode"); on mobile the tooltip is omitted. It is typically embedded inside other widgets (e.g. `EodashTools`, `EodashItemCatalog`) rather than placed as a standalone panel.

## Example

As a standalone widget switching to a named template:

```js
{
  id: "layout-switcher",
  type: "internal",
  layout: { x: 11, y: 0, w: 1, h: 1 },
  widget: {
    name: "EodashLayoutSwitcher",
    properties: {
      target: "expert",
    },
  },
}
```

Switching to a custom named template with a different icon:

```js
widget: {
  name: "EodashLayoutSwitcher",
  properties: {
    target: "minimal",
    icon: "mdi-view-compact",
  },
}
```

<!-- @widget-props -->

## See also

- [Internal widgets overview](/widgets/internal-widgets)
- [EodashTools](/widgets/internal-widgets/EodashTools) — toolbar that embeds this widget.
- [EodashItemCatalog](/widgets/internal-widgets/EodashItemCatalog) — catalog panel that embeds this widget in its title row.
- [Templates](/templates) — how named templates and layout transitions are defined.