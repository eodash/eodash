//export all actions, states, and pinia stores
/**
 * @template {keyof EodashStore} [K = keyof EodashStore]
* @typedef {Record<K,EodashStore[K]>} EodashStoreImports
*/

const storesImport = /**@type {EodashStoreImports} */(import.meta.glob('../store/**.js', { eager: true }))
/**
 * @type {EodashStore}
 */
const store = await (async () => {
  const stores = /** @type {EodashStore}*/({});
  for (const [filePath, importedstore] of Object.entries(storesImport)) {
    const storeType = filePath.split('/').at(-1)?.slice(0, -3).toLowerCase() ?? ''
    if (!['keys'].includes(storeType)) {
      //@ts-expect-error
      stores[storeType] = importedstore;
    }
  }
  return stores;
})();

export default store;
