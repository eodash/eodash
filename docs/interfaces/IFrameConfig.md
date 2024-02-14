[eodash-v5](../README.md) / IFrameConfig

# Interface: IFrameConfig

Module type: `iframe` specification.
Renders an external HTML file as a module.

## Table of contents

### Properties

- [id](IFrameConfig.md#id)
- [layout](IFrameConfig.md#layout)
- [module](IFrameConfig.md#module)
- [title](IFrameConfig.md#title)
- [type](IFrameConfig.md#type)

## Properties

### id

• **id**: `string` \| `number` \| `symbol`

Unique Identifier, triggers rerender when using `defineModule`

#### Defined in

[core/store/Types.ts:174](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L174)

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

[core/store/Types.ts:182](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L182)

___

### module

• **module**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `src` | `string` | The URL of the page to embed |

#### Defined in

[core/store/Types.ts:200](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L200)

___

### title

• **title**: `string`

Module title

#### Defined in

[core/store/Types.ts:178](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L178)

___

### type

• **type**: ``"iframe"``

Module type

#### Defined in

[core/store/Types.ts:209](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L209)
