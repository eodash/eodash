[@eodash/eodash](../index.md) / Eodash

# Interface: Eodash\<T\>

Eodash instance specification.

## Type parameters

• **T** extends [`ExecutionTime`](../type-aliases/ExecutionTime.md) = `"compiletime"`

## Properties

### brand

> **brand**: `Object`

Brand specifications.

#### font?

> **`optional`** **font**: `Object`

Automatically fetches the specified font family from google fonts. if the `link` property is specified
the font family will be fetched from the provided source instead.

#### font.family

> **family**: `string`

Font family. Use FVD notation to include families https://github.com/typekit/fvd

#### font.link?

> **`optional`** **link**: `string`

Link to stylesheet that defines font-face.

#### logo?

> **`optional`** **logo**: `string`

brand logo

#### name

> **name**: `string`

Title that will be shown in the app header

#### shortName?

> **`optional`** **shortName**: `string`

Alias that will be shown in the app footer if specified.

#### theme?

> **`optional`** **theme**: `Object`

Dashboard theme as a custom vuetifyJs theme.

#### Source

[core/types.d.ts:264](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L264)

***

### id

> **id**: `string`

Instance ID.

#### Source

[core/types.d.ts:243](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L243)

***

### routes?

> **`optional`** **routes**: `Object`[]

Renderes to navigation buttons on the app header.

#### Source

[core/types.d.ts:251](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L251)

***

### stacEndpoint

> **stacEndpoint**: ```https://${string}/catalog.json``` \| ```http://${string}/catalog.json```

Root STAC catalog endpoint

#### Source

[core/types.d.ts:247](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L247)

***

### template

> **template**: [`Template`](Template.md)\<`T`\>

Template configuration

#### Source

[core/types.d.ts:299](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L299)
