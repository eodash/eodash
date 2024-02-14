[eodash-v5](../README.md) / WebComponentConfig

# Interface: WebComponentConfig

Module type: `web-component` specification. The web component definition is imported using the `module.link` property either from
an external endpoint, or an installed node_module.
Installed node_module web components import should be mapped in `/core/modulesMap.ts`,
then setting `module.link`:`(import-map-key)` and `node_module`:`true`

## Table of contents

### Properties

- [id](WebComponentConfig.md#id)
- [layout](WebComponentConfig.md#layout)
- [module](WebComponentConfig.md#module)
- [title](WebComponentConfig.md#title)
- [type](WebComponentConfig.md#type)

## Properties

### id

• **id**: `string` \| `number` \| `symbol`

Unique Identifier, triggers rerender when using `defineModule`

#### Defined in

[core/store/Types.ts:83](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L83)

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

[core/store/Types.ts:91](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L91)

___

### module

• **module**: [`ExternalWebComponentProps`](ExternalWebComponentProps.md) \| [`NodeModuleWebComponentProps`](NodeModuleWebComponentProps.md)

#### Defined in

[core/store/Types.ts:109](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L109)

___

### title

• **title**: `string`

Module title

#### Defined in

[core/store/Types.ts:87](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L87)

___

### type

• **type**: ``"web-component"``

Module type

#### Defined in

[core/store/Types.ts:113](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L113)
