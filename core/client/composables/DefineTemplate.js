import { eodashKey } from "@/utils/keys";
import {  inject, ref, shallowReactive, toRefs, watch } from "vue";
import { useDefineWidgets } from "./DefineWidgets";
import { activeTemplate } from "@/store/States";

 /**
 * @typedef {{
 * bgWidget:ReturnType< typeof import("./DefineWidgets").useDefineWidgets>[number]| null
 * loading: ReturnType< typeof import("./DefineWidgets").useDefineWidgets>[number]| null
 * importedWidgets:ReturnType< typeof import("./DefineWidgets").useDefineWidgets>
 * gap: import("vue").Ref<number>
 * }} DefinedTemplate
 **/

 /** @type {DefinedTemplate} */
let defined;

export const useTemplate = () => {
  // if (defined) {
  //   return toRefs(defined);
  // }

  const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey));

 /** @type {DefinedTemplate} */
    const definedTemplate = shallowReactive({
      bgWidget: null,
      importedWidgets: [],
      loading: null,
      gap: ref(16),
    });

    watch(
      activeTemplate,
      (template,) => {
    if ("template" in eodash) {
      [definedTemplate.bgWidget] =  useDefineWidgets([
        eodash.template.background,
      ]);
      [definedTemplate.loading] = useDefineWidgets([
        eodash.template.loading,
      ]);
      definedTemplate.importedWidgets = useDefineWidgets(
        eodash.template.widgets,
      );
      definedTemplate.gap.value = eodash.template.gap ?? 16;
    } else {
          console.log("watcher triggered",template);

          if (!template) {
            template = Object.keys(eodash.templates)[0];
          }

          if (!template || !eodash.templates[template]) {
            console.error(`[eodash] template ${template ?? ""} not found`);
            return;
          }

          const templateConfig = eodash.templates[template];
          [definedTemplate.bgWidget] = useDefineWidgets([
            templateConfig.background,
          ]);

          [definedTemplate.loading] = useDefineWidgets([
            templateConfig.loading,
          ]);

          definedTemplate.importedWidgets = useDefineWidgets(
            templateConfig.widgets,
          );
          definedTemplate.gap.value = templateConfig.gap ?? 16;

        }
      },
      { immediate: true },
    );
    defined = definedTemplate;
    return toRefs(defined);
};
