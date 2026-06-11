# EodashTimeSlider

A horizontal timeline control bound to the primary map. It wraps [`eox-timecontrol`](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-timecontrol--docs) and renders a date display, a calendar-popup picker (with dots for each available timestamp), an optional inline `eox-itemfilter` for filtering timeline items, and a timelapse export button. The widget is only shown when the selected collection contains more than one item. Selecting a date updates the global [`datetime`](/eodash-store) state, which drives layer re-rendering across the dashboard.

## Example

Default usage without additional inline filters:

```js
{
  id: "time-slider",
  title: "Timeline",
  type: "internal",
  layout: { x: 0, y: 10, w: 12, h: 2 },
  widget: {
    name: "EodashTimeSlider",
    properties: {
      animate: true,
    },
  },
}
```

With inline item filters to narrow the timeline:

```js
widget: {
  name: "EodashTimeSlider",
  properties: {
    animate: false,
    filters: [
      {
        key: "platform",
        title: "Platform",
        type: "multiselect",
      },
    ],
  },
}
```

<!-- @widget-props -->

## See also

- [Internal widgets overview](/widgets/internal-widgets)
- [EodashDatePicker](/widgets/internal-widgets/EodashDatePicker) — calendar-based date picker for use when a full timeline is not needed.
- [EodashMap](/widgets/internal-widgets/EodashMap)
