// functions of this folder can only be consumed inside setup stores,
// setup functions or vue composition api components https://vuejs.org/guide/reusability/composables

import {
  activeTemplate,
  currentCompareUrl,
  currentUrl,
  datetime,
  indicator,
  mapEl,
  mapPosition,
  poi,
} from "@/store/states";
import eodash from "@/eodash";
import { useTheme } from "vuetify";
import { inject, nextTick, onMounted, onUnmounted, watch } from "vue";
import { useSTAcStore } from "@/store/stac";
import log from "loglevel";
import { eodashKey, eoxLayersKey } from "@/utils/keys";
import { useEventBus } from "@vueuse/core";
import { isFirstLoad } from "@/utils/states";
import { setCollectionsPalette } from "@/utils";
import mustache from "mustache";
import { toAbsolute } from "stac-js/src/http.js";
import axios from "@/plugins/axios";

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
      const store = useSTAcStore();

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
            const eodash = inject(eodashKey);
            const match = store.stac?.find(
              (link) => useGetSubCodeId(link) == value,
            );
            if (match) {
              log.debug("Found match, loading stac item", match);
              if (searchParams.has("poi")) {
                const indicatorUrl = toAbsolute(
                  match.href,
                  eodash?.stacEndpoint ?? "",
                );
                // fetch indicator stac collection without rendering it
                /** @type {import("stac-ts").StacCollection} */
                const indicatorStac = await axios
                  .get(indicatorUrl)
                  .then((resp) => resp.data);
                poi.value = searchParams.get("poi") ?? "";
                // find the process link
                const poiMatch = indicatorStac?.links.find(
                  (link) =>
                    link.rel === "service" &&
                    link.type === "application/json; profile=collection",
                );
                if (poiMatch) {
                  log.debug("Found poi match, setting poi", poiMatch);
                  // render poi value into the link href
                  /** @type {any} */
                  let viewForMustache = poi.value;
                  const tokens = mustache.parse(poiMatch.href);
                  const keyToken = tokens.find(
                    (token) => token[0] === "name" && token[1] !== ".",
                  );
                  // Construct the view object
                  if (keyToken) {
                    const keyName = keyToken[1];
                    viewForMustache = { [keyName]: poi.value };
                  }
                  /** @type {string} */
                  const poiUrl = mustache.render(
                    poiMatch.href,
                    viewForMustache,
                  );
                  const poiAbsoluteUrl = toAbsolute(poiUrl, indicatorUrl);
                  await store.loadSelectedSTAC(poiAbsoluteUrl, true);
                }
              } else {
                await store.loadSelectedSTAC(match.href);
              }
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
        if (mapEl.value) {
          mapEl.value.center = [x, y];
          mapEl.value.zoom = z;
        }
      }

      if (!isFirstLoad.value) {
        isFirstLoad.value = true;
      }
    }

    watch(
      [indicator, mapPosition, datetime, activeTemplate, poi],
      ([
        updatedIndicator,
        updatedMapPosition,
        updatedDatetime,
        updatedTemplate,
        updatedPoi,
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
          if (!updatedPoi) {
            if (searchParams.has("poi")) {
              searchParams.delete("poi");
            }
          } else {
            searchParams.set("poi", updatedPoi);
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
export const useTransparentPanel = (root) => {
  onMounted(() => {
    const backgroundItem = root.value?.parentElement;
    if (backgroundItem?.classList.contains("bg-surface")) {
      backgroundItem.classList.remove("bg-surface");
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
 * import("@/types").LayersEventBusKeys,
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
 * @param {import("@/types").LayersEventBusKeys} event
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

    dl.getLayers().once("change", async () => {
      await emit();
      res(true);
    });
  });
};

/**
 * @param {import("stac-ts").StacCollection | import("stac-ts").StacLink | import("stac-ts").StacItem | null} collection
 * @returns {string} - Returns the collection id or subcode if `useSubCode`import { mustache } from 'mustache';
 is enabled
 */
export const useGetSubCodeId = (collection) => {
  if (!collection) {
    return "";
  }

  if ("useSubCode" in (eodash?.options ?? {}) && eodash?.options?.useSubCode) {
    return typeof collection.subcode === "string"
      ? collection.subcode
      : /** @type {string} */ (collection.id);
  }
  return /** @type {string} */ (collection.id);
};
