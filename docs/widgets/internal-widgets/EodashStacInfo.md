# EodashStacInfo

Renders metadata for the currently selected STAC collection or item. It wraps [`eox-stacinfo`](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-stacinfo--docs) and automatically tracks the active URL from the [store](/eodash-store), so it updates whenever the user selects a different indicator. Each of the five section props (`header`, `tags`, `body`, `featured`, `footer`) takes a list of STAC property keys; `eox-stacinfo` renders only the sections whose keys resolve to non-empty values.

## Example

Default configuration:

```js
{
  id: "stac-info",
  title: "Info",
  type: "internal",
  layout: { x: 9, y: 0, w: 3, h: 12 },
  widget: {
    name: "EodashStacInfo",
    properties: {
      allowHtml: true,
    },
  },
}
```

Showing only title and description:

```js
widget: {
  name: "EodashStacInfo",
  properties: {
    header: ["title"],
    tags: [],
    body: [],
    featured: ["description"],
    footer: [],
  },
}
```

<!-- @widget-props -->

### Section props

Each section prop accepts an array of strings (STAC property keys) or objects of the form `{ key: string; filter?: (item: any) => boolean }`. The table below shows the default keys for each section.

| Prop | Default keys | Typical placement |
| --- | --- | --- |
| `header` | `["title"]` | Title area at the top. |
| `tags` | `["themes"]` | Chip list below the header. |
| `body` | `["satellite","sensor","insituSources","otherSources","agency","extent"]` | Main content area. |
| `featured` | `["description","providers","assets","links"]` | Expandable rich-content section. |
| `footer` | `["sci:citation","sci:doi","sci:publication"]` | Citation / publication info at the bottom. |

## See also

- [Internal widgets overview](/widgets/internal-widgets)
- [Map Layer Visualization](/STAC#map-layer-visualization)
