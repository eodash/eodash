[@eodash/eodash](../index.md) / WebComponentProps

# Interface: WebComponentProps\<T\>

Web Component configuration

## Type parameters

• **T** extends [`ExecutionTime`](../type-aliases/ExecutionTime.md) = `"compiletime"`

## Properties

### constructorProp?

> **`optional`** **constructorProp**: `string`

Exported Constructor, needs to be provided if the web component is not registered by the `link` provided

#### Source

[core/types.d.ts:14](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L14)

***

### link

> **link**: `T` extends `"runtime"` ? `string` : `string` \| () => `Promise`\<`unknown`\>

Web component definition file URL

#### Source

[core/types.d.ts:12](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L12)

***

### onMounted()?

> **`optional`** **onMounted**: (`el`, `store`, `router`) => `void` \| `Promise`\<`void`\>

Function that is triggered when the web component is mounted in the DOM.

#### Parameters

• **el**: `null` \| `Element`

web component

• **store**: `Store`\<`"stac"`, `_UnwrapAll`\<`Pick`\<`Object`, `"stac"` \| `"selectedStac"`\>\>, `Pick`\<`Object`, `never`\>, `Pick`\<`Object`, `"loadSTAC"` \| `"loadSelectedSTAC"`\>\>

return value of the core STAC pinia store in `/core/store/stac.ts`

• **router**: `Router`

#### Returns

`void` \| `Promise`\<`void`\>

#### Source

[core/types.d.ts:24](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L24)

***

### onUnmounted()?

> **`optional`** **onUnmounted**: (`el`, `store`, `router`) => `void` \| `Promise`\<`void`\>

Function that is triggered when the web component is unmounted from the DOM.

#### Parameters

• **el**: `null` \| `Element`

web component

• **store**: `Store`\<`"stac"`, `_UnwrapAll`\<`Pick`\<`Object`, `"stac"` \| `"selectedStac"`\>\>, `Pick`\<`Object`, `never`\>, `Pick`\<`Object`, `"loadSTAC"` \| `"loadSelectedSTAC"`\>\>

return value of the core STAC pinia store in `/core/store/stac.ts`

• **router**: `Router`

#### Returns

`void` \| `Promise`\<`void`\>

#### Source

[core/types.d.ts:30](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L30)

***

### properties?

> **`optional`** **properties**: `Record`\<`string`, `any`\>

Object defining all the properties and attributes of the web component

#### Source

[core/types.d.ts:18](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L18)

***

### tagName

> **tagName**: ```${string}-${string}```

Custom tag name

#### Source

[core/types.d.ts:16](https://github.com/eodash/eodash/blob/b4a2d86/core/types.d.ts#L16)
