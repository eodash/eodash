# EodashLayerControl

Layer visibility, opacity, and ordering panel for a map. It wraps [`eox-layercontrol`](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-layercontrol--docs) and binds it to either the primary or compare map. The panel is hidden until a STAC collection is selected; it also handles time-step updates from the embedded `eox-timecontrol` and surfaces render-config changes (e.g. band assignments) to the [store](/eodash-store).

## Example

Default usage bound to the primary map:

```js
{
  id: "layer-control",
  title: "Layers",
  type: "internal",
  layout: { x: 9, y: 0, w: 3, h: 6 },
  widget: {
    name: "EodashLayerControl",
    properties: {
      tools: ["datetime", "info", "config", "legend", "opacity"],
    },
  },
}
```

Bound to the compare (second) map with a reduced tool set:

```js
widget: {
  name: "EodashLayerControl",
  properties: {
    map: "second",
    tools: ["legend", "opacity"],
    title: "Compare layers",
  },
}
```

<!-- @widget-props -->

## See also

- [Internal widgets overview](/widgets/internal-widgets)
- [Compare mode](/widgets/internal-widgets#compare-mode)
- [EodashMap](/widgets/internal-widgets/EodashMap)
