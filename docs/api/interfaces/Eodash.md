[@eodash/eodash](../index.md) / Eodash

# Interface: Eodash\<T\>

Eodash instance API

## Type parameters

• **T** extends [`ExecutionTime`](../type-aliases/ExecutionTime.md) = `"compiletime"`

## Properties

### brand

> **brand**: `Object`

Brand specifications.

#### font?

> **`optional`** **font**: `Object`

Automatically fetches the specified font family from google fonts. if the [link](#font-link) property is specified
the font family will be fetched from the provided source instead.

#### font.family

> **family**: `string`

Font family. Use FVD notation to include families. see https://github.com/typekit/fvd

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

[core/types.d.ts:268](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L268)

***

### id

> **id**: `string`

Instance ID.

#### Source

[core/types.d.ts:253](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L253)

***

### routes?

> **`optional`** **routes**: `Object`[]

Renderes to navigation buttons on the app header.

#### Source

[core/types.d.ts:261](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L261)

***

### stacEndpoint

> **stacEndpoint**: ```https://${string}/catalog.json``` \| ```http://${string}/catalog.json```

Root STAC catalog endpoint

#### Source

[core/types.d.ts:257](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L257)

***

### template

> **template**: [`Template`](Template.md)\<`T`\>

Template configuration

#### Source

[core/types.d.ts:303](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L303)
