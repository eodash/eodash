[@eodash/eodash](../index.md) / EodashConfig

# Interface: EodashConfig

Eodash server, build and setup configuration

## Properties

### base?

> **`optional`** **base**: `string`

base public path

#### Source

[core/types.d.ts:358](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L358)

***

### cacheDir?

> **`optional`** **cacheDir**: `string`

cache folder

#### Source

[core/types.d.ts:370](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L370)

***

### dev?

> **`optional`** **dev**: `Object`

#### host?

> **`optional`** **host**: `string` \| `boolean`

#### open?

> **`optional`** **open**: `boolean`

open default browser when the server starts

#### port?

> **`optional`** **port**: `string` \| `number`

serving  port

#### Source

[core/types.d.ts:341](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L341)

***

### entryPoint?

> **`optional`** **entryPoint**: `string`

specifies main entry file, exporting `createEodash`

#### Source

[core/types.d.ts:372](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L372)

***

### outDir?

> **`optional`** **outDir**: `string`

build target folder path

#### Source

[core/types.d.ts:362](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L362)

***

### preview?

> **`optional`** **preview**: `Object`

#### host?

> **`optional`** **host**: `string` \| `boolean`

#### open?

> **`optional`** **open**: `boolean`

open default browser when the server starts

#### port?

> **`optional`** **port**: `string` \| `number`

serving  port

#### Source

[core/types.d.ts:348](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L348)

***

### publicDir?

> **`optional`** **publicDir**: `string` \| `false`

path to statically served assets folder, can be set to `false`
 to disable serving assets statically

#### Source

[core/types.d.ts:366](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L366)

***

### runtime?

> **`optional`** **runtime**: `string`

file exporting eodash client runtime config

#### Source

[core/types.d.ts:376](https://github.com/eodash/eodash/blob/700e395/core/types.d.ts#L376)
