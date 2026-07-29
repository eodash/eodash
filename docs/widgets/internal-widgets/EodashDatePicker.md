# EodashDatePicker

A calendar-based date selector. It renders a `v-calendar` date picker populated with colored dots for each date that has available data in the currently selected collection(s). Selecting a date updates the global [`datetime`](/eodash-store) state used by map layers. Arrow buttons jump to the oldest or latest available date. On desktop the widget is positioned as a floating overlay anchored to the bottom of the map.

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

Compact input-only mode with no full calendar grid:

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
