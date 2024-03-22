[@eodash/eodash](../index.md) / FunctionalWidget

# Interface: FunctionalWidget\<T\>

## Type parameters

• **T** extends [`ExecutionTime`](../type-aliases/ExecutionTime.md) = `"compiletime"`

## Properties

### defineWidget()

> **defineWidget**: (`selectedSTAC`) => `Omit`\<[`StaticWidget`](../type-aliases/StaticWidget.md)\<`T`\>, `"layout"`\>

Provides a functional definition of the widget,
gets triggered whenever a stac object is selected.

#### Parameters

• **selectedSTAC**: `null` \| `StacCatalog` \| `StacCollection` \| `StacItem`

currently selected stac object

#### Returns

`Omit`\<[`StaticWidget`](../type-aliases/StaticWidget.md)\<`T`\>, `"layout"`\>

#### Source

[core/types.d.ts:178](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L178)

***

### layout

> **layout**: `Object`

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

[core/types.d.ts:179](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L179)
