[@eodash/eodash](../index.md) / WebComponentWidget

# Interface: WebComponentWidget\<T\>

Widget type: `web-component` specification. The web component definition is imported using the `widget.link` property either from
an external endpoint, or an installed node_module.
Installed node_module web components import should be mapped in `/core/modulesMap.ts`,
then setting `widget.link`:`(import-map-key)` and `node_module`:`true`

## Type parameters

• **T** extends [`ExecutionTime`](../type-aliases/ExecutionTime.md) = `"compiletime"`

## Properties

### id

> **id**: `string` \| `number` \| `symbol`

Unique Identifier, triggers rerender when using `defineWidget`

#### Source

[core/types.d.ts:50](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L50)

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

[core/types.d.ts:58](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L58)

***

### title

> **title**: `string`

Widget title

#### Source

[core/types.d.ts:54](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L54)

***

### type

> **type**: `"web-component"`

Widget type

#### Source

[core/types.d.ts:80](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L80)

***

### widget

> **widget**: [`WebComponentProps`](WebComponentProps.md)\<`T`\>

#### Source

[core/types.d.ts:76](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L76)
