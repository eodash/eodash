import { eodashKey } from "@/utils/keys";
import {
  getCurrentInstance,
  inject,
  ref,
  shallowReactive,
  shallowRef,
  toRefs,
  watch,
} from "vue";
import { useDefineWidgets } from "./DefineWidgets";
import { activeTemplate } from "@/store/states";
import { createSharedComposable, debouncedWatch } from "@vueuse/core";
import log from "loglevel";

/**
 * @typedef {{
 * bgWidget:ReturnType< typeof import("./DefineWidgets").useDefineWidgets>[number]| import("vue").ShallowRef<null>
 * loading: ReturnType< typeof import("./DefineWidgets").useDefineWidgets>[number]| import("vue").ShallowRef<null>
 * importedWidgets:ReturnType< typeof import("./DefineWidgets").useDefineWidgets>
 * gap: import("vue").Ref<number>
 * }} DefinedTemplate
 **/

const useTemplate = () => {
  const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey));

  /** @type {DefinedTemplate} */
  const definedTemplate = shallowReactive({
    bgWidget: shallowRef(null),
    importedWidgets: [],
    loading: shallowRef(null),
    gap: ref(16),
  });

  if ("template" in eodash) {
    [definedTemplate.bgWidget] = useDefineWidgets([eodash.template.background]);
    [definedTemplate.loading] = useDefineWidgets([eodash.template.loading]);
    definedTemplate.importedWidgets = useDefineWidgets(eodash.template.widgets);
    definedTemplate.gap.value = eodash.template.gap ?? 16;
  } else {
    watch(
      activeTemplate,
      (template) => {
        log.debug("Active template watcher triggered, changing to:", template);
        if (!template) {
          template = Object.keys(eodash.templates)[0];
          activeTemplate.value = template ?? "";
          log.debug("No template found, setting to first template", template);
        }

        if (!template || !eodash.templates[template]) {
          console.error(`[eodash] template not found`);
          return;
        }

        const templateConfig = eodash.templates[template];
        const [importedBgWidget] = useDefineWidgets([
          templateConfig.background,
        ]);
        if (importedBgWidget.value.id !== definedTemplate.bgWidget.value?.id) {
          definedTemplate.bgWidget.value = importedBgWidget.value;
        }

        const [importedLoadingWidget] = useDefineWidgets([
          templateConfig.loading,
        ]);

        if (
          importedLoadingWidget.value.id !== definedTemplate.loading.value?.id
        ) {
          definedTemplate.loading.value = importedLoadingWidget.value;
        }

        definedTemplate.importedWidgets = useDefineWidgets(
          templateConfig.widgets,
        );
        definedTemplate.gap.value = templateConfig.gap ?? 16;
      },
      { immediate: true },
    );
  }
  return toRefs(definedTemplate);
};

export const useDefineTemplate = createSharedComposable(useTemplate);
