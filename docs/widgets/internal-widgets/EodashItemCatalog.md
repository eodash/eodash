# EodashItemCatalog

A STAC item search and browse panel. It wraps [`eox-itemfilter`](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-itemfilter--docs), fetches items from `<stacEndpoint>/search?limit=100` on mount, and renders configurable filters alongside a results list. A declared `filters`, `sortBy`, or `hoverProperties` entry is shown only while the current result items actually carry that property, so entries that do not apply to the selected collection are hidden. Selecting an item loads it into the map. Item footprints are drawn on the map and highlighted on hover; when `bboxFilter` is true the search re-runs on every map move.

## Example

Default configuration with a cloud-cover filter and bbox-linked search:

```js
{
  id: "catalog",
  title: "Catalog",
  type: "internal",
  layout: { x: 0, y: 0, w: 3, h: 12 },
  widget: {
    name: "EodashItemCatalog",
    properties: {
      filtersTitle: "Filters:",
      resultsTitle: "Items:",
      bboxFilter: true,
      imageProperty: "assets.thumbnail.href",
      filters: [
        {
          property: "eo:cloud_cover",
          type: "range",
          title: "Cloud Cover (%)",
          min: 0,
          max: 100,
          unitLabel: "%",
        },
      ],
    },
  },
}
```

Adding a second filter on a custom property:

```js
widget: {
  name: "EodashItemCatalog",
  properties: {
    bboxFilter: false,
    filters: [
      { property: "platform", type: "multiselect", title: "Platform" },
      { property: "eo:cloud_cover", type: "range", title: "Cloud Cover (%)", min: 0, max: 100 },
    ],
  },
}
```

<!-- @widget-props -->

### Filters (`filters`)

Each entry in the `filters` array configures one filter panel in `eox-itemfilter`. The defaults provide a single cloud-cover range filter.

To bootstrap this config from a live STAC API, run `node core/node/scripts/suggestFilters.js <stac-api-endpoint>`; it inspects the collections' queryables and summaries and prints a suggested `filters` array to review and paste.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `property` | `string` | yes | STAC property key to filter on. |
| `type` | `"range" \| "multiselect" \| "select"` | yes | Control type rendered for this filter. |
| `title` | `string` | no | Label shown above the filter control. |
| `min` | `number` | no | Minimum value for `type: "range"`. |
| `max` | `number` | no | Maximum value for `type: "range"`. |
| `step` | `number` | no | Step increment for `type: "range"` sliders. |
| `format` | `string` | no | Value format string applied to `range` labels. |
| `filterKeys` | `string[]` | no | Additional STAC keys matched by this filter entry. |
| `state` | `Record<string, boolean> \| { min: number, max: number }` | no | Initial selection state: a boolean map for `multiselect`/`select`, or `{ min, max }` for `range`. |
| `placeholder` | `string` | no | Placeholder text for `select` inputs. |
| `icon` | `string` | no | SVG markup rendered next to the filter label. |
| `unitLabel` | `string` | no | Unit suffix appended to range values (e.g. `"%"`). |

## See also

- [Internal widgets overview](/widgets/internal-widgets)
- [EodashItemFilter](/widgets/internal-widgets/EodashItemFilter) - collection-level filter panel (wraps the same `eox-itemfilter` element but operates on the STAC catalog root).
- [EodashLayoutSwitcher](/widgets/internal-widgets/EodashLayoutSwitcher) - the layout-toggle icon rendered in this widget's title row.
