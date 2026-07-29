# EodashChart

A chart panel for process output. It wraps [`eox-chart`](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-chart--docs) and renders a [Vega-Lite](https://vega.github.io/vega-lite/) chart whenever [`EodashProcess`](/widgets/internal-widgets/EodashProcess) has produced a chart spec and data (shared through the [eodash store](/eodash-store)). A toggle button expands the chart into a dedicated full-area layout or collapses it back in place.

## Example

A standalone chart placed in the dashboard grid:

```js
{
  id: "chart",
  title: "Chart",
  type: "internal",
  layout: { x: 0, y: 8, w: 9, h: 4 },
  widget: {
    name: "EodashChart",
    properties: {},
  },
}
```

A compare-mode chart, reading the compare process output (see [compare mode](/widgets/internal-widgets#compare-mode)):

```js
widget: {
  name: "EodashChart",
  properties: {
    enableCompare: true,
    vegaEmbedOptions: { actions: false },
  },
}
```

<!-- @widget-props -->

## See also

- [EodashProcess](/widgets/internal-widgets/EodashProcess) - produces the chart spec and data this widget renders.
- [Eodash Store](/eodash-store) - the shared state the chart reads from.