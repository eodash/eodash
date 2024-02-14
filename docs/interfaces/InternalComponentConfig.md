[eodash-v5](../README.md) / InternalComponentConfig

# Interface: InternalComponentConfig

Module type: `internal` specification.
Internal modules are Vue components inside the `/modules` directory.

## Table of contents

### Properties

- [id](InternalComponentConfig.md#id)
- [layout](InternalComponentConfig.md#layout)
- [module](InternalComponentConfig.md#module)
- [title](InternalComponentConfig.md#title)
- [type](InternalComponentConfig.md#type)

## Properties

### id

• **id**: `string` \| `number` \| `symbol`

Unique Identifier, triggers rerender when using `defineModule`

#### Defined in

[core/store/Types.ts:124](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L124)

___

### layout

• **layout**: `Object`

Module position and size.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `h` | `number` | Height. Integer (1 - 12) |
| `w` | `number` | Width. Integer (1 - 12) |
| `x` | `number` | Horizontal start position. Integer (1 - 12) |
| `y` | `number` | Vertical start position. Integer (1 - 12) |

#### Defined in

[core/store/Types.ts:132](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L132)

___

### module

• **module**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `name` | `string` | Internal Vue Component file name without the extention .vue |
| `props?` | `Record`\<`string`, `unknown`\> | Specified Vue component props |

#### Defined in

[core/store/Types.ts:150](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L150)

___

### title

• **title**: `string`

Module title

#### Defined in

[core/store/Types.ts:128](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L128)

___

### type

• **type**: ``"internal"``

Module type.

#### Defined in

[core/store/Types.ts:163](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L163)
