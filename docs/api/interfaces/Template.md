[@eodash/eodash](../index.md) / Template

# Interface: Template\<T\>

Dashboard rendered widgets  specification.
3 types of widgets are supported: `"iframe"`, `"internal"`, and `"web-component"`.
A specific object should be provided based on the type of the widget.

## Type parameters

• **T** extends [`ExecutionTime`](../type-aliases/ExecutionTime.md) = `"compiletime"`

## Properties

### background?

> **`optional`** **background**: [`BackgroundWidget`](../type-aliases/BackgroundWidget.md)\<`T`\>

Widget rendered as the dashboard background.
Has the same specifications of [Widget](../readme#widget) without the `title` and  `layout` properties

#### Source

[core/types.d.ts:227](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L227)

***

### gap?

> **`optional`** **gap**: `number`

Gap between widgets

#### Source

[core/types.d.ts:222](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L222)

***

### widgets

> **widgets**: [`Widget`](../type-aliases/Widget.md)\<`T`\>[]

Array of widgets that will be rendered as dashboard panels.

#### Source

[core/types.d.ts:231](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L231)
