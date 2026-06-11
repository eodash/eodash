# EodashItemFilter

A collection-level search and filter panel. It wraps [`eox-itemfilter`](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-itemfilter--docs) and populates it with the top-level STAC catalog links (child collections in catalog mode, or all items in API mode). Selecting an entry loads the corresponding collection or item into the active or compare map. It emits a `select` event when the user picks a result.

## Example

Minimal usage with default filters:

```js
{
  id: "item-filter",
  title: "Indicators",
  type: "internal",
  layout: { x: 0, y: 0, w: 3, h: 12 },
  widget: {
    name: "EodashItemFilter",
    properties: {
      filtersTitle: "Indicators",
      resultsTitle: "Results",
    },
  },
}
```

Compare-mode variant that loads the selection into the second map:

```js
widget: {
  name: "EodashItemFilter",
  properties: {
    enableCompare: true,
    filtersTitle: "Compare dataset",
    titleProperty: "title",
  },
}
```

<!-- @widget-props -->

### Filter properties (`filterProperties`)

Each entry in `filterProperties` configures one filter section. The default provides a free-text search and a multiselect on `themes`.

| Field | Type | Description |
| --- | --- | --- |
| `keys` / `key` | `string \| string[]` | STAC property key(s) matched by this filter. Use `keys` (array) for text search across multiple fields, `key` (string) for discrete filters. |
| `title` | `string` | Label shown above the filter control. |
| `type` | `string` | Control type: `"text"`, `"multiselect"`, `"select"`, `"range"`, etc. |
| `expanded` | `boolean` | Whether the filter section starts open. |

## See also

- [Internal widgets overview](/widgets/internal-widgets)
- [EodashItemCatalog](/widgets/internal-widgets/EodashItemCatalog) — item-level search inside a selected collection.
- [EodashTools](/widgets/internal-widgets/EodashTools) — toolbar that embeds `EodashItemFilter` inside a dialog.
