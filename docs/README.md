eodash-v5

# eodash-v5

## Table of contents

### Interfaces

- [EodashConfig](interfaces/EodashConfig.md)
- [EodashStore](interfaces/EodashStore.md)
- [ExternalWebComponentProps](interfaces/ExternalWebComponentProps.md)
- [FunctionalModule](interfaces/FunctionalModule.md)
- [IFrameConfig](interfaces/IFrameConfig.md)
- [InternalComponentConfig](interfaces/InternalComponentConfig.md)
- [NodeModuleWebComponentProps](interfaces/NodeModuleWebComponentProps.md)
- [TemplateConfig](interfaces/TemplateConfig.md)
- [WebComponentConfig](interfaces/WebComponentConfig.md)

### Type Aliases

- [BackgroundModuleConfig](README.md#backgroundmoduleconfig)
- [ModuleConfig](README.md#moduleconfig)
- [StaticModule](README.md#staticmodule)

## Type Aliases

### BackgroundModuleConfig

Ƭ **BackgroundModuleConfig**: `Omit`\<[`WebComponentConfig`](interfaces/WebComponentConfig.md), ``"layout"`` \| ``"title"``\> \| `Omit`\<[`InternalComponentConfig`](interfaces/InternalComponentConfig.md), ``"layout"`` \| ``"title"``\> \| `Omit`\<[`IFrameConfig`](interfaces/IFrameConfig.md), ``"layout"`` \| ``"title"``\> \| `Omit`\<[`FunctionalModule`](interfaces/FunctionalModule.md), ``"layout"``\>

#### Defined in

[core/store/Types.ts:241](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L241)

___

### ModuleConfig

Ƭ **ModuleConfig**: [`StaticModule`](README.md#staticmodule) \| [`FunctionalModule`](interfaces/FunctionalModule.md)

#### Defined in

[core/store/Types.ts:238](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L238)

___

### StaticModule

Ƭ **StaticModule**: [`WebComponentConfig`](interfaces/WebComponentConfig.md) \| [`InternalComponentConfig`](interfaces/InternalComponentConfig.md) \| [`IFrameConfig`](interfaces/IFrameConfig.md)

#### Defined in

[core/store/Types.ts:237](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L237)
