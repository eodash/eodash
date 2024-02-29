 # EodashConfig

Eodash configuration specification.

## Properties

### brand

> **brand**: `Object`

Brand specifications.

#### brand.font?

> **`optional`** **font**: `Object`

Automatically fetches the specified font family from google fonts. if the `link` property is specified
the font family will be fetched from the provided source instead.

#### brand.font.family

> **family**: `string`

Font family. Use FVD notation to include families https://github.com/typekit/fvd

#### brand.font.link?

> **`optional`** **link**: `string`

Link to stylesheet that defines font-face.

#### brand.logo?

> **`optional`** **logo**: `string`

brand logo

#### brand.name

> **name**: `string`

Title that will be shown in the app header

#### brand.shortName?

> **`optional`** **shortName**: `string`

Alias that will be shown in the app footer if specified.

#### brand.theme?

> **`optional`** **theme**: `Object`

Dashboard theme as a custom vuetifyJs theme.

#### Source

[core/eodash-d.ts:34](https://github.com/eodash/eodash/blob/5e215db/core/eodash-d.ts#L34)

***

### id

> **id**: `string`

Configuration ID that defines the route of the dashboard.
Rendered dashboard can be accessed on route `/dashboard/config-id`

#### Source

[core/eodash-d.ts:13](https://github.com/eodash/eodash/blob/5e215db/core/eodash-d.ts#L13)

***

### routes?

> **`optional`** **routes**: `Object`[]

Renderes to navigation buttons on the app header.

#### Source

[core/eodash-d.ts:21](https://github.com/eodash/eodash/blob/5e215db/core/eodash-d.ts#L21)

***

### stacEndpoint

> **stacEndpoint**: \`https://${string}/catalog.json\` \| \`http://${string}/catalog.json\`

Root STAC catalog endpoint

#### Source

[core/eodash-d.ts:17](https://github.com/eodash/eodash/blob/5e215db/core/eodash-d.ts#L17)

***

### template

> **template**: [`TemplateConfig`](../../global/interfaces/TemplateConfig.md)

Rendered widgets configuration

#### Source

[core/eodash-d.ts:69](https://github.com/eodash/eodash/blob/5e215db/core/eodash-d.ts#L69)
