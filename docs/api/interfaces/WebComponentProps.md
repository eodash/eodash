[@eodash/eodash](../index.md) / WebComponentProps

# Interface: WebComponentProps\<T\>

## Type parameters

• **T** extends [`ExecutionTime`](../type-aliases/ExecutionTime.md) = `"compiletime"`

## Properties

### constructorProp?

> **`optional`** **constructorProp**: `string`

Exported Constructor, needs to be provided if the web component is not registered in by the
[link](#link) provided

#### Source

[core/types.d.ts:30](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L30)

***

### link

> **link**: `T` extends `"runtime"` ? `string` : `string` \| () => `Promise`\<`unknown`\>

Imports web component file, either using a URL or an import funtion.

#### Example

importing `eox-itemfilter` web component, after installing `@eox/itemfilter` it can be
referenced:
```js
link: async() => import("@eox/itemfilter")
```

::: warning
import maps are not available in runtime config
:::

#### Source

[core/types.d.ts:25](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L25)

***

### onMounted()?

> **`optional`** **onMounted**: (`el`, `store`, `router`) => `void` \| `Promise`\<`void`\>

Triggered when the web component is mounted in the DOM.

#### Parameters

• **el**: `null` \| `Element`

web component

• **store**: `Store`\<`"stac"`, `_UnwrapAll`\<`Pick`\<`Object`, `"stac"` \| `"selectedStac"`\>\>, `Pick`\<`Object`, `never`\>, `Pick`\<`Object`, `"loadSTAC"` \| `"loadSelectedSTAC"`\>\>

return value of the core STAC pinia store in `/core/store/stac.ts`

• **router**: `Router`

#### Returns

`void` \| `Promise`\<`void`\>

#### Source

[core/types.d.ts:39](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L39)

***

### onUnmounted()?

> **`optional`** **onUnmounted**: (`el`, `store`, `router`) => `void` \| `Promise`\<`void`\>

Triggered when the web component is unmounted from the DOM.

#### Parameters

• **el**: `null` \| `Element`

web component

• **store**: `Store`\<`"stac"`, `_UnwrapAll`\<`Pick`\<`Object`, `"stac"` \| `"selectedStac"`\>\>, `Pick`\<`Object`, `never`\>, `Pick`\<`Object`, `"loadSTAC"` \| `"loadSelectedSTAC"`\>\>

return value of the core STAC pinia store in `/core/store/stac.ts`

• **router**: `Router`

#### Returns

`void` \| `Promise`\<`void`\>

#### Source

[core/types.d.ts:45](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L45)

***

### properties?

> **`optional`** **properties**: `Record`\<`string`, `any`\>

Object defining all the properties and attributes of the web component

#### Source

[core/types.d.ts:33](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L33)

***

### tagName

> **tagName**: ```${string}-${string}```

#### Source

[core/types.d.ts:31](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L31)
