[eodash-v5](../README.md) / FunctionalModule

# Interface: FunctionalModule

## Table of contents

### Properties

- [defineModule](FunctionalModule.md#definemodule)
- [layout](FunctionalModule.md#layout)

## Properties

### defineModule

• **defineModule**: (`selectedSTAC`: ``null`` \| `StacCatalog` \| `StacCollection` \| `StacItem`) => [`StaticModule`](../README.md#staticmodule)

Provides a functional definition of the module,
gets triggered whenever a stac object is selected.

**`Param`**

currently selected stac object

#### Type declaration

▸ (`selectedSTAC`): [`StaticModule`](../README.md#staticmodule)

Provides a functional definition of the module,
gets triggered whenever a stac object is selected.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `selectedSTAC` | ``null`` \| `StacCatalog` \| `StacCollection` \| `StacItem` | currently selected stac object |

##### Returns

[`StaticModule`](../README.md#staticmodule)

#### Defined in

[core/store/Types.ts:217](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L217)

___

### layout

• **layout**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `h` | `number` | Height. Integer (1 - 12) |
| `w` | `number` | Width. Integer (1 - 12) |
| `x` | `number` | Horizontal start position. Integer (1 - 12) |
| `y` | `number` | Vertical start position. Integer (1 - 12) |

#### Defined in

[core/store/Types.ts:218](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L218)
