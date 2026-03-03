import { defineAsyncComponent, reactive, shallowRef, watch } from "vue";
import { useSTAcStore } from "@/store/stac";
import { storeToRefs } from "pinia";
import {
  areChartsSeparateLayout,
  chartSpec,
  compareChartSpec,
} from "@/store/states";
/**
 * @typedef {{
 *   component: import("vue").Component | null;
 *   props: Record<string, unknown>;
 *   title: string;
 *   id: string | number | symbol;
 *   layout: { x: number | string; y: number | string; h: number | string; w: number | string };
 * }} DefinedWidget
 */

/** @typedef {import("vue").ShallowRef<DefinedWidget>} ReactiveDefinedWidget */
/**
 * Widgets import map that is created from eodash internals and user defined widgets
 */
const internalWidgets = (() => {
  /** @type {Record<string, () => Promise<import("vue").Component>>} */
  const importMap = {
    ...import.meta.glob("^/**/*.vue"),
    ...import.meta.glob("user:widgets/**/*.vue"),
  };
  for (const key in importMap) {
    // Remove the extention and "widgets" from the key path
    const path = key.split("/");
    path.splice(0, path.findIndex((el) => el === "widgets") + 1);
    const lastIdx = path.length - 1;
    path[lastIdx] = path[lastIdx].split(".")[0];
    const newKey =
      path[lastIdx] == "index" ? path[lastIdx - 1] : path.join("/");

    Object.defineProperty(
      importMap,
      newKey,
      /** @type {PropertyDescriptor} */ (
        Object.getOwnPropertyDescriptor(importMap, key)
      ),
    );
    delete importMap[key];
  }
  return importMap;
})();

/**
 * Composable that converts widgets Configurations to defined imported widgets
 *
 * @param {(
 *       | import("@/types").Widget
 *       | import("@/types").BackgroundWidget
 *       | Omit<import("@/types").Widget, "layout">
 *       | undefined
 *     )[]
 *   | undefined} widgetConfigs
 */
export const useDefineWidgets = (widgetConfigs) => {
  /** @type {ReactiveDefinedWidget[]} */
  const definedWidgets = [];

  for (const config of widgetConfigs ?? []) {
    /** @type {ReactiveDefinedWidget} */
    const definedWidget = shallowRef({
      component: null,
      props: {},
      title: "",
      id: Symbol(),
      layout: { x: 0, y: 0, h: 0, w: 0 },
    });

    if ("defineWidget" in (config ?? {})) {
      const { selectedStac, selectedCompareStac } = storeToRefs(useSTAcStore());
      watch(
        [
          selectedStac,
          selectedCompareStac,
          areChartsSeparateLayout,
          chartSpec,
          compareChartSpec,
        ],
        ([updatedStac, updatedCompareStac]) => {
          let definedConfig =
            /** @type {import("@/types").FunctionalWidget} */ (
              config
            )?.defineWidget(updatedStac, updatedCompareStac);
          if (definedConfig) {
            definedConfig = reactive(definedConfig);
          }
          definedWidget.value =
            definedConfig && definedWidget.value.id === definedConfig.id
              ? definedWidget.value
              : getWidgetDefinition(definedConfig);
        },
        { immediate: true },
      );
    } else {
      definedWidget.value = getWidgetDefinition(
        /** @type {import("@/types").StaticWidget} */ (config),
      );
    }
    definedWidgets.push(definedWidget);
  }
  return definedWidgets;
};

/**
 * Converts a static widget configuration to a defined imported widget
 *
 * @param {import("@/types").StaticWidget
 *   | Omit<import("@/types").StaticWidget, "layout">
 *   | undefined
 *   | null
 *   | false
 * } [config]
 * @returns {DefinedWidget}
 */
const getWidgetDefinition = (config) => {
  /** @type {DefinedWidget} */
  const importedWidget = {
    component: null,
    props: {},
    title: "",
    id: Symbol(),
    layout: reactive({ x: 0, y: 0, h: 0, w: 0 }),
  };
  if (!config) {
    return importedWidget;
  }

  switch (config.type) {
    case "internal":
      importedWidget.component = defineAsyncComponent({
        loader: () => {
          const widgetName =
            /** @type {import("@/types").InternalComponentWidget} * */ (config)
              ?.widget.name;

          return (
            internalWidgets[widgetName]?.() ??
            Promise.reject(`Widget ${widgetName} not found`)
          );
        },
        suspensible: true,
      });
      importedWidget.props = reactive(
        /** @type {import("@/types").InternalComponentWidget} * */ (config)
          ?.widget.properties ?? {},
      );

      break;

    case "web-component":
      importedWidget.component = defineAsyncComponent({
        loader: () => import("@/components/DynamicWebComponent.vue"),
        suspensible: true,
      });
      importedWidget.props = reactive(config.widget);

      break;
    case "iframe":
      importedWidget.component = defineAsyncComponent({
        loader: () => import("@/components/IframeWrapper.vue"),
        suspensible: true,
      });
      importedWidget.props = reactive(config.widget);
      break;

    default:
      if (!config) {
        return importedWidget;
      } else {
        console.error("Widget type not found");
      }
      break;
  }
  importedWidget.title = config?.title ?? "";
  importedWidget.id = config?.id ?? importedWidget.id;

  if ("layout" in config) {
    importedWidget.layout.x = config.layout.x;
    importedWidget.layout.y = config.layout.y;
    importedWidget.layout.h = config.layout.h;
    importedWidget.layout.w = config.layout.w;
  }
  return importedWidget;
};
