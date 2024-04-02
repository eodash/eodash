//export all actions, states, and pinia stores

const storesImport = import.meta.glob('../store/**.js', { eager: true })

const store = /** @type {import("@/types").EodashStore} */((() => {
  const stores = {}
  for (const [filePath, importedstore] of Object.entries(storesImport)) {
    const storeType = filePath.split('/').at(-1)?.slice(0, -3).toLowerCase() ?? ''
    if (!['keys'].includes(storeType)) {
      //@ts-expect-error
      stores[storeType] = importedstore;
    }
  }
  return stores;
})());

export default store;
