[@eodash/eodash](../index.md) / InternalComponentWidget

# Interface: InternalComponentWidget

Widget type: `internal` API.
Internal widgets are Vue components provided by eodash.

## Properties

### id

> **id**: `string` \| `number` \| `symbol`

#### Source

[core/types.d.ts:93](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L93)

***

### layout

> **layout**: `Object`

Widget position and size.

#### h

> **h**: `number`

Height. Integer between 1 and 12

#### w

> **w**: `number`

Width. Integer between 1 and 12

#### x

> **x**: `number`

Horizontal start position. Integer between 1 and 12

#### y

> **y**: `number`

Vertical start position. Integer between 1 and 12

#### Source

[core/types.d.ts:98](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L98)

***

### title

> **title**: `string`

#### Source

[core/types.d.ts:94](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L94)

***

### type

> **type**: `"internal"`

#### Source

[core/types.d.ts:127](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L127)

***

### widget

> **widget**: `Object`

#### name

> **name**: `string`

Internal Vue Components inside the [widgets](https://github.com/eodash/eodash/tree/main/widgets) folder can be referenced
using their name without the extention .vue

#### props?

> **`optional`** **props**: `Record`\<`string`, `unknown`\>

Specified Vue component props

#### Source

[core/types.d.ts:116](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L116)
