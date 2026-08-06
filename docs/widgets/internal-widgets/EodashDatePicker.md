# EodashDatePicker

A calendar-based date selector. It renders an [`eox-timecontrol`](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-timecontrol--docs) picker bound to a map, with colored dots for each date that has available data on that map's layers. Selecting a date updates the global [`datetime`](/eodash-store) state used by map layers. The date field steps one available date at a time, and the outer arrow buttons jump to the oldest or latest available date. Set `map: "second"` to bind it to the compare map instead. On desktop the widget is positioned as a floating overlay anchored to the bottom of the map.

## Example

Default usage:

```js
{
  id: "date-picker",
  title: "Date",
  type: "internal",
  layout: { x: 3, y: 9, w: 3, h: 3 },
  widget: {
    name: "EodashDatePicker",
    properties: {},
  },
}
```

Compact mode, where the calendar opens as a popup from the date field:

```js
widget: {
  name: "EodashDatePicker",
  properties: {
    toggleCalendar: true,
    hideArrows: false,
    hideInputField: false,
  },
}
```

<!-- @widget-props -->

## See also

- [Internal widgets overview](/widgets/internal-widgets)
- [EodashTimeSlider](/widgets/internal-widgets/EodashTimeSlider) - timeline-based date selection for collections with many timestamps.
