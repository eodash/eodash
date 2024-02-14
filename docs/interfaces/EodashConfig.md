[eodash-v5](../README.md) / EodashConfig

# Interface: EodashConfig

Eodash configuration specification.

## Table of contents

### Properties

- [brand](EodashConfig.md#brand)
- [id](EodashConfig.md#id)
- [routes](EodashConfig.md#routes)
- [stacEndpoint](EodashConfig.md#stacendpoint)
- [template](EodashConfig.md#template)

## Properties

### brand

• **brand**: `Object`

Brand specifications.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `font?` | \{ `family`: `string` ; `link?`: `string`  } | Automatically fetches the specified font family from google fonts. if the `link` property is specified the font family will be fetched from the provided source instead. |
| `font.family` | `string` | Font family. Use FVD notation to include families https://github.com/typekit/fvd |
| `font.link?` | `string` | Link to stylesheet that defines font-face. |
| `logo?` | `string` | brand logo |
| `name` | `string` | Title that will be shown in the app header |
| `shortName?` | `string` | Alias that will be shown in the app footer if specified. |
| `theme?` | \{ `colors?`: \{ `background?`: `string` ; `error?`: `string` ; `info?`: `string` ; `on-background?`: `string` ; `on-error?`: `string` ; `on-info?`: `string` ; `on-primary?`: `string` ; `on-secondary?`: `string` ; `on-success?`: `string` ; `on-surface?`: `string` ; `on-warning?`: `string` ; `primary?`: `string` ; `secondary?`: `string` ; `success?`: `string` ; `surface?`: `string` ; `warning?`: `string`  } ; `dark?`: `boolean` ; `variables?`: {}  } | Dashboard theme as a custom vuetifyJs theme. |
| `theme.colors?` | \{ `background?`: `string` ; `error?`: `string` ; `info?`: `string` ; `on-background?`: `string` ; `on-error?`: `string` ; `on-info?`: `string` ; `on-primary?`: `string` ; `on-secondary?`: `string` ; `on-success?`: `string` ; `on-surface?`: `string` ; `on-warning?`: `string` ; `primary?`: `string` ; `secondary?`: `string` ; `success?`: `string` ; `surface?`: `string` ; `warning?`: `string`  } | - |
| `theme.colors.background?` | `string` | - |
| `theme.colors.error?` | `string` | - |
| `theme.colors.info?` | `string` | - |
| `theme.colors.on-background?` | `string` | - |
| `theme.colors.on-error?` | `string` | - |
| `theme.colors.on-info?` | `string` | - |
| `theme.colors.on-primary?` | `string` | - |
| `theme.colors.on-secondary?` | `string` | - |
| `theme.colors.on-success?` | `string` | - |
| `theme.colors.on-surface?` | `string` | - |
| `theme.colors.on-warning?` | `string` | - |
| `theme.colors.primary?` | `string` | - |
| `theme.colors.secondary?` | `string` | - |
| `theme.colors.success?` | `string` | - |
| `theme.colors.surface?` | `string` | - |
| `theme.colors.warning?` | `string` | - |
| `theme.dark?` | `boolean` | - |
| `theme.variables?` | {} | - |

#### Defined in

[core/store/Types.ts:296](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L296)

___

### id

• **id**: `string`

Configuration ID that defines the route of the dashboard.
Rendered dashboard can be accessed on route `/dashboard/config-id`

#### Defined in

[core/store/Types.ts:275](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L275)

___

### routes

• `Optional` **routes**: \{ `title`: `string` ; `to`: \`https://$\{string}\` \| \`http://$\{string}\` \| \`/$\{string}\`  }[]

Renderes to navigation buttons on the app header.

#### Defined in

[core/store/Types.ts:283](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L283)

___

### stacEndpoint

• **stacEndpoint**: `` `https://${string}/catalog.json` `` | `` `http://${string}/catalog.json` ``

Root STAC catalog endpoint

#### Defined in

[core/store/Types.ts:279](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L279)

___

### template

• **template**: [`TemplateConfig`](TemplateConfig.md)

Rendered modules configuration

#### Defined in

[core/store/Types.ts:331](https://github.com/EOX-A/eodash-v5/blob/06b9523/core/store/Types.ts#L331)
