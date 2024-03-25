[@eodash/eodash](../index.md) / EodashStore

# Interface: EodashStore

## Properties

### actions

> **actions**: `Object`

#### loadFont()

> **loadFont**: (`family`?, `link`?) => `Promise`\<`string`\>

##### Parameters

• **family?**: `string`

• **link?**: `string`

##### Returns

`Promise`\<`string`\>

#### Source

[core/types.d.ts:325](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L325)

***

### stac

> **stac**: `Object`

Pinia store definition used to navigate the root STAC catalog.

#### useSTAcStore

> **useSTAcStore**: `StoreDefinition`\<`"stac"`, `_UnwrapAll`\<`Pick`\<`Object`, `"stac"` \| `"selectedStac"`\>\>, `Pick`\<`Object`, `never`\>, `Pick`\<`Object`, `"loadSTAC"` \| `"loadSelectedSTAC"`\>\>

#### Source

[core/types.d.ts:331](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L331)

***

### states

> **states**: `Object`

Stateful Reactive variables

#### currentUrl

> **currentUrl**: `Ref`\<`string`\>

Currently selected STAC endpoint

#### mapInstance

> **mapInstance**: `Ref`\<`null` \| `Map`\>

OpenLayers map instance

#### Source

[core/types.d.ts:315](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L315)
