# EodashDatePicker

A calendar for picking the global date, built on [`eox-timecontrol`](https://eox-a.github.io/EOxElements/?path=/docs/elements-eox-timecontrol--docs). Every date with data gets a dot, coloured per collection, compare side included. Picking a date updates the global [`datetime`](/eodash-store) that map layers follow.

The date field steps through available dates one at a time. The buttons on either side jump straight to the oldest or latest.

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

In compact mode the calendar stays closed until you hover or click the date field:

```js
widget: {
  name: "EodashDatePicker",
  properties: {
    toggleCalendar: true,
  },
}
```

<!-- @widget-props -->

## See also

- [Internal widgets overview](/widgets/internal-widgets)
- [EodashTimeSlider](/widgets/internal-widgets/EodashTimeSlider) - timeline-based date selection for collections with many timestamps.
