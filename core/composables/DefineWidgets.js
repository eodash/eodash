import { defineAsyncComponent, reactive, shallowRef, watch } from 'vue'
import { useSTAcStore } from '@/store/stac'
import { storeToRefs } from 'pinia'

/**
 * @typedef {{
 *   component:import('vue').Component | null;
 *   props: Record<string, unknown>;
 *   title :string;
 *   id:string|number|symbol;
 * }} DefinedWidget
*/

/**
 * @typedef {import('vue').ShallowRef<DefinedWidget>} ReactiveDefinedWidget
*/

const internalWidgets = (() => {
  /**
   * @type {Record<string,() => Promise<import('vue').Component>>}
   */
  const importMap = {
    ...import.meta.glob('^/**/*.vue'),
    ...import.meta.glob("user:widgets/**/*.vue")
  }
  for (const key in importMap) {
    const newKey = /** @type {string} */(key.split('/').at(-1)).slice(0, -4)
    Object.defineProperty(importMap, newKey,
      /** @type {PropertyDescriptor} */(Object.getOwnPropertyDescriptor(importMap, key)));
    delete importMap[key];
  }
  return importMap
})();


/**
 * Composable that converts widgets Configurations to defined imported widgets
 * @param { (import("@/types").Widget | import("@/types").BackgroundWidget | undefined)[] |
 * import("@/types").WidgetsContainerProps['widgets'] | undefined} widgetConfigs
 * @returns {Array<ReactiveDefinedWidget>}
 **/
export const useDefineWidgets = (widgetConfigs) => {
  /**
   * @type {Array<ReactiveDefinedWidget>}
   */
  const definedWidgets = []

  for (const config of (widgetConfigs ?? [])) {
    /**
     * @type {ReactiveDefinedWidget}
     */
    const definedWidget = shallowRef({
      component: null,
      props: {},
      title: '',
      id: Symbol(),
    })

    if ('defineWidget' in (config ?? {})) {
      const { selectedStac } = storeToRefs(useSTAcStore())
      watch(selectedStac, (updatedStac) => {
        const definedConfig = reactive(/** @type {import("@/types").FunctionalWidget} */
          (config)?.defineWidget(updatedStac))
        definedWidget.value = definedWidget.value.id === definedConfig.id ?
          definedWidget.value : getWidgetDefinition(definedConfig);
      }, { immediate: true })
    } else {
      definedWidget.value = getWidgetDefinition(/** @type {import("@/types").StaticWidget} */(config))
    }
    definedWidgets.push(definedWidget)
  }
  return definedWidgets
}


/**
 * Converts a static widget configuration to a defined imported widget
 * @param {import("@/types").StaticWidget| Omit<import("@/types").StaticWidget, "layout">| undefined} config
 * @returns {DefinedWidget}
 **/
const getWidgetDefinition = (config) => {
  /**
   * @type {DefinedWidget}
   */
  const importedWidget = {
    component: null,
    props: {},
    title: '',
    id: Symbol(),
  }
  switch (config?.type) {
    case 'internal':
      importedWidget.component = defineAsyncComponent({
        loader: internalWidgets[/** @type {import("@/types").InternalComponentWidget} **/(config)?.widget.name],
        suspensible: true
      })
      importedWidget.props = reactive(/** @type {import("@/types").InternalComponentWidget} **/(config)?.widget.properties ?? {})

      break;

    case 'web-component':
      importedWidget.component = defineAsyncComponent({
        loader: () => import('@/components/DynamicWebComponent.vue'),
        suspensible: true
      })
      importedWidget.props = reactive(config.widget)

      break;
    case 'iframe':
      importedWidget.component = defineAsyncComponent({
        loader: () => import('@/components/IframeWrapper.vue'),
        suspensible: true
      })
      importedWidget.props = reactive(config.widget)
      break;

    default:
      console.error('Widget type not found')
      break;
  }
  importedWidget.title = config?.title ?? ''
  importedWidget.id = config?.id ?? importedWidget.id
  return importedWidget
}

