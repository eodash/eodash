[@eodash/eodash](../index.md) / InternalComponentWidget

# Interface: InternalComponentWidget

Widget type: `internal` specification.
Internal widgets are Vue components inside the `/widgets` directory.

## Properties

### id

> **id**: `string` \| `number` \| `symbol`

Unique Identifier, triggers rerender when using `defineWidget`

#### Source

[core/types.d.ts:91](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L91)

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

[core/types.d.ts:99](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L99)

***

### title

> **title**: `string`

Widget title

#### Source

[core/types.d.ts:95](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L95)

***

### type

> **type**: `"internal"`

Widget type.

#### Source

[core/types.d.ts:130](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L130)

***

### widget

> **widget**: `Object`

#### name

> **name**: `string`

Internal Vue Component file name without the extention .vue

#### props?

> **`optional`** **props**: `Record`\<`string`, `unknown`\>

Specified Vue component props

#### Source

[core/types.d.ts:117](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L117)
