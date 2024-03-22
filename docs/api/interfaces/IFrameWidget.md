[@eodash/eodash](../index.md) / IFrameWidget

# Interface: IFrameWidget

Widget type: `iframe` specification.
Renders an external HTML file as a widget.

## Properties

### id

> **id**: `string` \| `number` \| `symbol`

Unique Identifier, triggers rerender when using `defineWidget`

#### Source

[core/types.d.ts:141](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L141)

***

### layout

> **layout**: `Object`

Widget position and size.

#### h

> **h**: `number`

Height. Integer (1 - 12)

#### w

> **w**: `number`

Width. Integer (1 - 12)

#### x

> **x**: `number`

Horizontal start position. Integer (1 - 12)

#### y

> **y**: `number`

Vertical start position. Integer (1 - 12)

#### Source

[core/types.d.ts:149](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L149)

***

### title

> **title**: `string`

Widget title

#### Source

[core/types.d.ts:145](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L145)

***

### type

> **type**: `"iframe"`

Widget type

#### Source

[core/types.d.ts:176](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L176)

***

### widget

> **widget**: `Object`

#### src

> **src**: `string`

The URL of the page to embed

#### Source

[core/types.d.ts:167](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L167)
