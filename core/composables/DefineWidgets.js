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



/**
 * import map to all vue components inside `widgets` directory.
 * @type {Record<string,() => Promise<import('vue').Component>>}
 */
const internalWidgets = import.meta.glob('^/**/*.vue')

/**
 * Composable that converts widgets Configurations to defined imported widgets
 * @param { (WidgetConfig | BackgroundWidgetConfig | undefined)[] |
 * WidgetsContainerProps['widgets'] | undefined} widgetConfigs
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
      no: '4'
    })

    if ('defineWidget' in (config ?? {})) {
      const { selectedStac } = storeToRefs(useSTAcStore())
      watch(selectedStac, (updatedStac) => {
        const definedConfig = /** @type {FunctionalWidget} */
          (config)?.defineWidget(updatedStac)
        definedWidget.value = definedWidget.value.id === definedConfig.id ?
          definedWidget.value : getWidgetDefinition(definedConfig);
      }, { immediate: true })
    } else {
      definedWidget.value = getWidgetDefinition(/** @type {StaticWidget} */(config))
    }
    definedWidgets.push(definedWidget)
  }
  return definedWidgets
}


/**
 * Converts a static widget configuration to a defined imported widget
 * @param {StaticWidget| Omit<StaticWidget, "layout">| undefined} config
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
        loader: internalWidgets[`/widgets/${/** @type {InternalComponentConfig} **/(config)?.widget.name}.vue`],
        suspensible: true
      })
      importedWidget.props = reactive(/** @type {InternalComponentConfig} **/(config)?.widget.props ?? {})

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

