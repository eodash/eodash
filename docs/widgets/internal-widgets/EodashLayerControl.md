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

## Layer Configuration Forms

Layers can expose configuration forms in the panel, defined through [eodash Flat Styles](/STAC#eodash-flat-styles) or [`eodash:rasterform`](/STAC#eodash-raster-form) in the STAC metadata.

### State persistence

Form values are remembered per collection and per map (main/compare), and re-applied when the map rebuilds its layers (datetime change, item selection). Opt a form out when its values are only valid for a specific item:

```json
{
  "jsonform": {
    "options": { "persist_state": false }
  }
}
```

### Item templating

Form definitions may contain `${...}` placeholders, resolved as dotted paths against the STAC item being rendered — so one definition can serve item-dependent variants:

```json
{
  "expression": {
    "type": "string",
    "enum": [
      "/${properties.sat:orbit_state}:vv",
      "/${properties.sat:orbit_state}:vh"
    ],
    "default": "/${properties.sat:orbit_state}:vv"
  }
}
```

For an item with `"sat:orbit_state": "ascending"`, the form renders with `/ascending:vv`. <span v-pre>`{{ }}`</span> templates are untouched and still evaluated by the form at runtime. see [json-editor](https://github.com/json-editor/json-editor#templates)

<!-- @widget-props -->

## See also

- [Internal widgets overview](/widgets/internal-widgets)
- [Compare mode](/widgets/internal-widgets#compare-mode)
- [EodashMap](/widgets/internal-widgets/EodashMap)
