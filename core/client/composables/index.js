// functions of this folder can only be consumed inside setup stores,
// setup functions or vue composition api components https://vuejs.org/guide/reusability/composables

import {
  activeTemplate,
  currentCompareUrl,
  currentUrl,
  datetime,
  indicator,
  mapPosition,
  // poi,
} from "@/store/states";
import eodash from "@/eodash";
import { useTheme } from "vuetify";
import { inject, nextTick, onMounted, onUnmounted, watch } from "vue";
import { useSTAcStore } from "@/store/stac";
import log from "loglevel";
import { eodashKey, eoxLayersKey } from "@/utils/keys";
import { useEventBus } from "@vueuse/core";
import { posIsSetFromUrl } from "@/utils/states";
import { setCollectionsPalette } from "@/utils";
// import { toAbsolute } from "stac-js/src/http.js";

/**
 * Creates an absolute URL from a relative link and assignes it to `currentUrl`
 *
 * @param {string} [rel=''] Default is `''`
 * @param {string} [base=eodash.stacEndpoint] - Base URL, default value is the
 *   root stac catalog. Default is `eodash.stacEndpoint`
 * @returns {import("vue").Ref<string>} - Returns `currentUrl`
 * @see {@link '@/store/states.js'}
 */
export const useAbsoluteUrl = (rel = "", base = eodash.stacEndpoint) => {
  if (!rel || rel.includes("http")) {
    currentUrl.value = rel;
    return currentUrl;
  }

  const st = base.split("/");
  const arr = rel.split("/");
  st.pop();

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == ".") continue;
    if (arr[i] == "..") st.pop();
    else st.push(arr[i]);
  }

  currentUrl.value = st.join("/");
  return currentUrl;
};

/**
 * Use the absolute compare URL from a relative link
 *
 * @param {string} [rel=''] Default is `''`
 * @param {string} [base=eodash.stacEndpoint] - Base URL, default value is the
 *   root stac catalog. Default is `eodash.stacEndpoint`
 * @returns {import("vue").Ref<string>} - Returns `currentUrl`
 * @see {@link '@/store/states.js'}
 */
export const useCompareAbsoluteUrl = (rel = "", base = eodash.stacEndpoint) => {
  if (!rel || rel.includes("http")) {
    currentCompareUrl.value = base;
    return currentCompareUrl;
  }

  const st = base.split("/");
  const arr = rel.split("/");
  st.pop();

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] == ".") continue;
    if (arr[i] == "..") st.pop();
    else st.push(arr[i]);
  }

  currentCompareUrl.value = st.join("/");
  return currentCompareUrl;
};

/**
 * Updates an existing Vuetify theme. updates only the values provided in the
 * `ThemeDefinition`
 *
 * @param {string} themeName - Name of the theme to be updated
 * @param {import("@/types").Eodash["brand"]["theme"]} [themeDefinition={}] - New
 *   defintion to be updated to. Default is `{}`
 * @returns {import("vuetify").ThemeInstance}
 */
export const useUpdateTheme = (themeName, themeDefinition = {}) => {
  const theme = useTheme();

  // extract collections palette from the theme
  if (themeDefinition.collectionsPalette?.length) {
    setCollectionsPalette(themeDefinition.collectionsPalette);
    delete themeDefinition.collectionsPalette;
  }

  /** @type {(keyof import("vuetify").ThemeDefinition)[]} */ (
    Object.keys(themeDefinition)
  ).forEach((key) => {
    if (key === "dark") {
      theme.themes.value[themeName][key] = /** @type {Boolean} */ (
        themeDefinition[key]
      );
    } else {
      //@ts-expect-error to do
      theme.themes.value[themeName][key] = {
        ...theme.themes.value[themeName][key],
        ...themeDefinition[key],
      };
    }
  });
  return theme;
};

/** Composable that syncs store and URLSearchParameters */
export const useURLSearchParametersSync = () => {
  onMounted(async () => {
    // Analyze currently set url params when first loaded and set them in the store
    if (window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      const { loadSelectedSTAC, stac } = useSTAcStore();

      /** @type {number | undefined} */
      let x,
        /** @type {number | undefined} */
        y,
        /** @type {number | undefined} */
        z;
      for (const [key, value] of searchParams) {
        switch (key) {
          case "template": {
            activeTemplate.value = value;
            break;
          }
          case "indicator": {
            log.debug("Found indicator key in url");

            let match = stac?.find((link) => link.id == value);
            const eodash = inject(eodashKey);
            if ("useSubCode" in (eodash?.options ?? {}) && eodash?.options.useSubCode) {
              match = stac?.find((link) => link.subcode == value);
            }
            if (match) {
              log.debug("Found match, loading stac item", match);
              await loadSelectedSTAC(match.href);
            }
            break;
          }

          case "x":
            x = Number(value);
            break;

          case "y":
            y = Number(value);
            break;

          case "z":
            z = Number(value);
            break;

          case "datetime":
            try {
              const datetimeiso = new Date(value).toISOString();
              log.debug("Valid datetime found", datetimeiso);
              datetime.value = datetimeiso;
            } catch {
              datetime.value = new Date().toISOString();
            }
            break;

          default:
            break;
        }
      }

      if (x && y && z) {
        log.debug("Coordinates found, applying map poisition", x, y, z);
        mapPosition.value = [x, y, z];
        if (!posIsSetFromUrl.value) {
          posIsSetFromUrl.value = true;
        }
      }
    }

    watch(
      [indicator, mapPosition, datetime, activeTemplate],
      ([
        updatedIndicator,
        updatedMapPosition,
        updatedDatetime,
        updatedTemplate,
      ]) => {
        if ("URLSearchParams" in window) {
          const searchParams = new URLSearchParams(window.location.search);
          if (updatedIndicator !== "") {
            searchParams.set("indicator", updatedIndicator);
          }

          if (updatedMapPosition && updatedMapPosition.length === 3) {
            searchParams.set("x", updatedMapPosition[0]?.toFixed(4) ?? "");
            searchParams.set("y", updatedMapPosition[1]?.toFixed(4) ?? "");
            searchParams.set("z", updatedMapPosition[2]?.toFixed(4) ?? "");
          }

          if (updatedDatetime) {
            searchParams.set("datetime", updatedDatetime.split("T")?.[0] ?? "");
          }
          if (updatedTemplate) {
            searchParams.set("template", updatedTemplate);
          }
          const newRelativePathQuery =
            window.location.pathname + "?" + searchParams.toString();
          history.pushState(null, "", newRelativePathQuery);
        }
      },
    );
  });
};

/**
 * Converts eox-layout-item to transparent
 *
 *  @param {import("vue").Ref<HTMLElement|null>} root - components root element ref*/
export const makePanelTransparent = (root) => {
  onMounted(() => {
    const eoxItem = root.value?.parentElement;
    if (eoxItem?.tagName === "EOX-LAYOUT-ITEM") {
      eoxItem.classList.remove("bg-surface");
    }
  });
};

export const useGetTemplates = () => {
  const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey));
  return "template" in eodash ? [] : Object.keys(eodash.templates);
};

/**
 * Listens to the `layers:updated` and `time:updated` events and calls
 *
 * @param {import("@vueuse/core").EventBusListener<
 * "layers:updated"|"time:updated" | "process:updated",
 * {layers:Record<string,any>[]| undefined}
 * >} listener
 */
export const useOnLayersUpdate = (listener) => {
  const layersEvents = useEventBus(eoxLayersKey);

  const unsubscribe = layersEvents.on(listener);

  onUnmounted(() => {
    unsubscribe();
  });
};
/**
 * @param {"layers:updated"|"time:updated"|"process:updated"} event
 * @param {import("@eox/map").EOxMap | null} mapEl
 * @param {Record<string,any>[]} layers
 */
export const useEmitLayersUpdate = async (event, mapEl, layers) => {
  if (!mapEl) {
    return;
  }

  const layersEvents = useEventBus(eoxLayersKey);

  const emit = async () =>
    mapEl?.updateComplete.then(async () => {
      await nextTick(() => {
        layersEvents.emit(event, layers);
      });
    });

  const dl = /** @type {import("ol/layer").Group} */ (
    mapEl.getLayerById("AnalysisGroup")
  );
  await new Promise((res, _rej) => {
    if (!dl) {
      mapEl.map.getLayers().once("add", async () => {
        await emit();
        res(true);
      });
      return;
    }

    dl.getLayers().once("add", async () => {
      await emit();
      res(true);
    });
  });
};
