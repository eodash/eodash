[eodash-v5](../README.md) / TemplateConfig

# Interface: TemplateConfig

Dashboard rendered modules configuration specification.
3 types of modules are supported: `"iframe"`, `"internal"`, and `"web-component"`.
A specific configuration should be provided based on the type of module.

## Table of contents

### Properties

- [background](TemplateConfig.md#background)
- [gap](TemplateConfig.md#gap)
- [modules](TemplateConfig.md#modules)

## Properties

### background

• `Optional` **background**: [`BackgroundModuleConfig`](../README.md#backgroundmoduleconfig)

Module rendered as the dashboard background.
Has the same specifications of [ModuleConfig](../modules.md#moduleconfig) without the `title` and  `layout` properties

#### Defined in

[core/store/Types.ts:256](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L256)

___

### gap

• `Optional` **gap**: `number`

Gap between modules

#### Defined in

[core/store/Types.ts:251](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L251)

___

### modules

• **modules**: [`ModuleConfig`](../README.md#moduleconfig)[]

Array of modules that will be rendered as dashboard panels.

#### Defined in

[core/store/Types.ts:260](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L260)
