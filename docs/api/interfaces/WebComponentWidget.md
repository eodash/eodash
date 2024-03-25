[@eodash/eodash](../index.md) / WebComponentWidget

# Interface: WebComponentWidget\<T\>

Widget type: `web-component` API

## Type parameters

• **T** extends [`ExecutionTime`](../type-aliases/ExecutionTime.md) = `"compiletime"`

## Properties

### id

> **id**: `string` \| `number` \| `symbol`

#### Source

[core/types.d.ts:60](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L60)

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

[core/types.d.ts:65](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L65)

***

### title

> **title**: `string`

#### Source

[core/types.d.ts:61](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L61)

***

### type

> **type**: `"web-component"`

#### Source

[core/types.d.ts:84](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L84)

***

### widget

> **widget**: [`WebComponentProps`](WebComponentProps.md)\<`T`\>

#### Source

[core/types.d.ts:83](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L83)
