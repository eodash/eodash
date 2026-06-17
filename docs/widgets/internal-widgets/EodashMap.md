# EodashMap

The primary map widget. It wraps [`eox-map`](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-map--docs) and renders the interactive map, a floating button toolbar, and optional cursor coordinates and scale line. It is most often used as the dashboard `background`, and on mount it provides the map element that the other map-aware widgets read from.

## Example

As the dashboard background (its most common use):

```js
{
  background: {
    id: "background-map",
    type: "internal",
    widget: {
      name: "EodashMap",
      properties: {
        enableCompare: true,
        btns: { enableGlobe: true, enableExportMap: false },
      },
    },
  },
}
```

As a placed grid widget on the left half of the screen:

```js
{
  id: "map",
  title: "Map",
  type: "internal",
  layout: { x: 0, y: 0, w: 6, h: 12 },
  widget: {
    name: "EodashMap",
    properties: { center: [0, 20], zoom: 3 },
  },
}
```

<!-- @widget-props --> 



### Toolbar buttons (`btns`)

Every `btns` flag defaults to `true`; set one to `false` to hide that button.

| Flag | Button |
| --- | --- |
| `enableZoom` | Zoom in and out. |
| `enableExportMap` | Export the current view as an image. |
| `enableChangeProjection` | Switch the map projection. |
| `enableGlobe` | Toggle the 3D globe view. |
| `enableSearch` | Search for a location. |
| `enableFeedback` | Open the feedback form. |
| `enableBackToPOIs` | Return to the points of interest. |
| `enableCompareIndicators` | Pick the dataset shown on the compare map. May also be an object with `compareTemplate`, `fallbackTemplate`, and `itemFilterConfig`. |


## See also

- [Map Layer Visualization](/STAC#map-layer-visualization) - how STAC items become the layers shown on the map.
- [Compare mode](/widgets/internal-widgets#compare-mode) - running two maps side by side.
