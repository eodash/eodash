// functions of this folder can only be consumed inside setup stores,
// setup functions or vue composition api components https://vuejs.org/guide/reusability/composables

import {
  activeTemplate,
  compareIndicator,
  comparePoi,
  currentCompareUrl,
  currentUrl,
  datetime,
  indicator,
  mapCompareEl,
  mapEl,
  mapPosition,
  poi,
} from "@/store/states";
import { useTheme } from "vuetify";
import { inject, nextTick, onMounted, onUnmounted, watch } from "vue";
import { useSTAcStore } from "@/store/stac";
import log from "loglevel";
import { eodashKey, eoxLayersKey } from "@/utils/keys";
import { useEventBus, useMutationObserver } from "@vueuse/core";
import {
  baselineCompareLayerConfigDefaults,
  baselineLayerConfigDefaults,
  hasRestoredView,
  isFirstLoad,
  layerControlFormValue,
  layerControlFormValueCompare,
  layerStateChangeTrigger,
  layerStateChangeTriggerCompare,
  restoredCompareLayersState,
  restoredCompareProcessState,
  restoredLayersState,
  restoredProcessState,
} from "@/utils/states";
import { setCollectionsPalette } from "@/utils";
import mustache from "mustache";
import { toAbsolute } from "@eodash/stac/helpers";
import axios from "@/plugins/axios";
import { storeToRefs } from "pinia";
import { bboxToCenterZoom, sanitizeBbox } from "@eodash/stac/helpers";
import { transform } from "ol/proj";
import { decodeParam, encodeParam } from "@/utils/url-param-codec";
import { computeMapLayersDelta } from "@/utils/layer-delta-helpers";
import {
  activeCompareProcessFormValue,
  activeProcessFormValue,
  baselineCompareProcessDefaults,
  baselineProcessDefaults,
} from "^/EodashProcess/states";
import { diffFormValues } from "@/utils/process-state-helpers";
/**
/** @type {import('@/types').Eodash | null}*/

let _eodash = null;

/**
 * Call this once in a top-level component to inject and store the reactive eodash object.
 * @throws {Error} If eodash is not found in the inject context
 */
export function provideEodashInstance() {
  const injected = inject(eodashKey);
  if (!injected) {
    throw new Error(
      "Missing injected eodash – did you forget to call provideEodashInstance in a component?",
    );
  }
  _eodash = injected;
}

/**
 * Access the reactive eodash configuration anywhere after it has been provided.
 * @returns {import('@/types').Eodash | null}
 * @throws {Error} If eodash was not yet provided
 */
export function useEodash() {
  if (!_eodash) {
    throw new Error(
      "Eodash not yet available – call provideEodashInstance() first.",
    );
  }
  return _eodash;
}

/**
 * @param {import("vue").Ref<string>} absoluteUrl
 * @returns
 */
const createUseAbsoluteUrl = (absoluteUrl) => {
  /**
   * Creates an absolute URL from a relative link and assignes it to `currentUrl`
   *
   * @param {string} [rel=''] Default is `''`
   * @param {string} [base=eodash.stacEndpoint] - Base URL, default value is the
   *   root stac catalog. Default is `eodash.stacEndpoint`
   * @returns {import("vue").Ref<string>} - Returns `currentUrl`
   * @see {@link '@/store/states.js'}
   */
  return (rel = "", base) => {
    const { stacEndpoint, isApi } = storeToRefs(useSTAcStore());
    if (!base) {
      base = stacEndpoint.value ?? undefined;
      if (!base) {
        console.warn(
          "[eodash] No base URL provided for absolute URL construction.",
        );
        return absoluteUrl;
      }
    }
    if (isApi.value) {
      absoluteUrl.value = base + `/collections/${rel}`;
      return absoluteUrl;
    }

    if (rel.includes("http")) {
      absoluteUrl.value = rel;
      return absoluteUrl;
    }
    if (!rel) {
      absoluteUrl.value = base;
      return absoluteUrl;
    }

    const st = base.split("/");
    const arr = rel.split("/");
    st.pop();

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] == ".") continue;
      if (arr[i] == "..") st.pop();
      else st.push(arr[i]);
    }

    absoluteUrl.value = st.join("/");
    return absoluteUrl;
  };
};
export const useAbsoluteUrl = createUseAbsoluteUrl(currentUrl);
export const useCompareAbsoluteUrl = createUseAbsoluteUrl(currentCompareUrl);

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
      theme.themes.value[themeName][key] = /** @type {boolean} */ (
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

/**
 * Resolves the absolute URL for a POI link inside an indicator STAC collection.
 *
 * @param {import("@eodash/stac").STACLink} match
 * @param {string} poiValue
 * @param {string | null} [stacEndpoint]
 * @returns {Promise<string | null>}
 */
const resolvePoiUrl = async (match, poiValue, stacEndpoint) => {
  const indicatorUrl = toAbsolute(match.href, stacEndpoint ?? "");
  /** @type {import("@eodash/stac").STACCollection} */
  const indicatorStac = await axios.get(indicatorUrl).then((resp) => resp.data);
  const poiMatch = indicatorStac?.links?.find(
    (link) =>
      link.rel === "service" &&
      link.type === "application/json; profile=collection",
  );
  if (!poiMatch) {
    return null;
  }
  /** @type {string | Record<string, string>} */
  let viewForMustache = poiValue;
  const tokens = mustache.parse(poiMatch.href);
  const keyToken = tokens.find(
    (token) => token[0] === "name" && token[1] !== ".",
  );
  if (keyToken) {
    const keyName = keyToken[1];
    viewForMustache = { [keyName]: poiValue };
  }
  const poiUrl = mustache.render(poiMatch.href, viewForMustache);
  return toAbsolute(poiUrl, indicatorUrl);
};

/**
 * Loads the selected STAC indicator or collection, handling POI resolution and API items.
 *
 * @param {object} params
 * @param {import("@eodash/stac").STACLink} params.match
 * @param {URLSearchParams} params.searchParams
 * @param {ReturnType<typeof useSTAcStore>} params.store
 * @param {string} [params.poiParam="poi"]
 * @param {boolean} [params.isCompare=false]
 * @returns {Promise<number[] | undefined>} item extent if restored
 */
const loadIndicatorFromUrl = async ({
  match,
  searchParams,
  store,
  poiParam = "poi",
  isCompare = false,
}) => {
  let itemBbox;
  const targetPoi = isCompare ? comparePoi : poi;
  const targetIndicator = isCompare ? compareIndicator : indicator;
  const loader = isCompare
    ? store.loadSelectedCompareSTAC
    : store.loadSelectedSTAC;

  if (searchParams.has(poiParam)) {
    targetPoi.value = searchParams.get(poiParam) ?? "";
    targetIndicator.value = useGetSubCodeId(match);
    const poiAbsoluteUrl = await resolvePoiUrl(
      match,
      targetPoi.value,
      store.stacEndpoint,
    );
    if (poiAbsoluteUrl) {
      log.debug(`Found ${poiParam} match, setting poi`, poiAbsoluteUrl);
      await loader(poiAbsoluteUrl, true);
    }
  } else if (!isCompare && store.isApi && searchParams.has("item")) {
    const itemId = searchParams.get("item");
    const itemUrl = `${store.stacEndpoint}/collections/${match.id}/items/${itemId}`;
    /** @type {import("@eodash/stac").STACItem | null} */
    const item = await axios
      .get(itemUrl)
      .then((resp) => resp.data)
      .catch(() => null);
    await store.loadSelectedSTAC(
      /** @type {string} */ (match.id),
      false,
      item ?? undefined,
    );
    itemBbox = /** @type {any} */ (item)?.bbox;
  } else {
    await loader(/** @type {string} */ (store.isApi ? match.id : match.href));
  }
  return itemBbox;
};

/** Composable that syncs store and URLSearchParameters */
export const useURLSearchParametersSync = () => {
  onMounted(async () => {
    // Analyze currently set url params when first loaded and set them in the store
    if (window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      const store = useSTAcStore();

      /** @type {number[] | undefined} - restored item extent; wins over x/y/z */
      let itemBbox;

      const x = Number(searchParams.get("x"));
      const y = Number(searchParams.get("y"));
      const z = Number(searchParams.get("z"));
      hasRestoredView.value =
        !!(x && y && z) || (store.isApi && searchParams.has("item"));
      if (x && y && z) {
        log.debug("Coordinates found, applying map position", x, y, z);
        mapPosition.value = [x, y, z];
        moveMap([x, y], z);
      }

      const urlDatetime = searchParams.get("datetime");
      if (urlDatetime) {
        try {
          datetime.value = new Date(urlDatetime).toISOString();
        } catch {
          datetime.value = new Date().toISOString();
        }
      }

      if (searchParams.has("layers")) {
        restoredLayersState.value = decodeParam(searchParams.get("layers"));
      }
      if (searchParams.has("comparelayers")) {
        restoredCompareLayersState.value = decodeParam(
          searchParams.get("comparelayers"),
        );
      }
      if (searchParams.has("process")) {
        restoredProcessState.value = decodeParam(searchParams.get("process"));
      }
      if (searchParams.has("compareprocess")) {
        restoredCompareProcessState.value = decodeParam(
          searchParams.get("compareprocess"),
        );
      }

      for (const [key, value] of searchParams) {
        switch (key) {
          case "template": {
            activeTemplate.value = value;
            break;
          }
          case "indicator": {
            log.debug("Found indicator key in url");
            const match = store.stac?.find(
              (link) => useGetSubCodeId(link) === value,
            );
            if (match) {
              log.debug("Found match, loading stac item", match);
              itemBbox = await loadIndicatorFromUrl({
                match,
                searchParams,
                store,
                poiParam: "poi",
                isCompare: false,
              });
            }
            break;
          }
          case "compareindicator": {
            log.debug("Found compareindicator key in url");
            const match = store.stac?.find(
              (link) => useGetSubCodeId(link) === value,
            );
            if (match) {
              log.debug("Found match, loading compare stac item", match);
              await loadIndicatorFromUrl({
                match,
                searchParams,
                store,
                poiParam: "comparepoi",
                isCompare: true,
              });
            }
            break;
          }
          case "poi":
          case "comparepoi":
          case "layers":
          case "comparelayers":
          case "process":
          case "compareprocess": {
            break;
          }

          default:
            break;
        }
      }

      if (itemBbox?.length) {
        // A restored item extent takes precedence over the saved x/y/z.
        const { center, zoom } = bboxToCenterZoom(
          sanitizeBbox(itemBbox),
          mapEl.value?.map?.getSize?.(),
        );
        mapPosition.value = [center[0], center[1], zoom];
        moveMap(center, zoom);
      } else if (!(x && y && z)) {
        hasRestoredView.value = false;
      }

      if (!isFirstLoad.value) {
        isFirstLoad.value = true;
      }
    }

    const { selectedItem } = storeToRefs(useSTAcStore());
    watch(
      [
        indicator,
        mapPosition,
        datetime,
        activeTemplate,
        poi,
        selectedItem,
        compareIndicator,
        comparePoi,
        layerStateChangeTrigger,
        layerStateChangeTriggerCompare,
        activeProcessFormValue,
        activeCompareProcessFormValue,
      ],
      ([
        updatedIndicator,
        updatedMapPosition,
        updatedDatetime,
        updatedTemplate,
        updatedPoi,
        updatedItem,
        updatedCompareIndicator,
        updatedComparePoi,
        _trigger,
        _triggerCompare,
        updatedProcessForm,
        updatedCompareProcessForm,
      ]) => {
        if ("URLSearchParams" in window) {
          const searchParams = new URLSearchParams(window.location.search);
          if (updatedIndicator !== "") {
            searchParams.set("indicator", updatedIndicator);
          } else if (searchParams.has("indicator")) {
            searchParams.delete("indicator");
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

          const itemId = /** @type {any} */ (updatedItem)?.id;
          if (itemId) {
            searchParams.set("item", itemId);
          } else if (searchParams.has("item")) {
            searchParams.delete("item");
          }

          if (!updatedCompareIndicator) {
            if (searchParams.has("compareindicator")) {
              searchParams.delete("compareindicator");
            }
          } else {
            searchParams.set("compareindicator", updatedCompareIndicator);
          }

          if (!updatedComparePoi) {
            if (searchParams.has("comparepoi")) {
              searchParams.delete("comparepoi");
            }
          } else {
            searchParams.set("comparepoi", updatedComparePoi);
          }

          /**
           * Updates or removes an encoded parameter in searchParams.
           * @param {string} param
           * @param {unknown} data
           * @param {boolean} [shouldKeep=true]
           */
          const syncEncodedParam = (param, data, shouldKeep = true) => {
            const encoded = shouldKeep && data ? encodeParam(data) : "";
            if (encoded) {
              searchParams.set(param, encoded);
            } else if (searchParams.has(param)) {
              searchParams.delete(param);
            }
          };

          // LayerControl main & compare deltas
          if (mapEl.value) {
            syncEncodedParam(
              "layers",
              computeMapLayersDelta(
                mapEl.value,
                layerControlFormValue.value,
                baselineLayerConfigDefaults.value,
              ),
            );
          }
          if (mapCompareEl.value && updatedCompareIndicator) {
            syncEncodedParam(
              "comparelayers",
              computeMapLayersDelta(
                mapCompareEl.value,
                layerControlFormValueCompare.value,
                baselineCompareLayerConfigDefaults.value,
              ),
            );
          } else {
            syncEncodedParam("comparelayers", null, false);
          }

          // Process main & compare deltas
          if (
            updatedIndicator &&
            updatedProcessForm &&
            Object.keys(updatedProcessForm).length
          ) {
            syncEncodedParam(
              "process",
              diffFormValues(
                updatedProcessForm,
                baselineProcessDefaults.value || {},
              ),
            );
          } else {
            syncEncodedParam("process", null, false);
          }

          if (
            updatedCompareIndicator &&
            updatedCompareProcessForm &&
            Object.keys(updatedCompareProcessForm).length
          ) {
            syncEncodedParam(
              "compareprocess",
              diffFormValues(
                updatedCompareProcessForm,
                baselineCompareProcessDefaults.value || {},
              ),
            );
          } else {
            syncEncodedParam("compareprocess", null, false);
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
  const eodash = inject(eodashKey);
  if (!eodash) {
    return [];
  }
  return "template" in eodash ? [] : Object.keys(eodash?.templates ?? {});
};

/**
 * Subscribes to layers/time update events on the shared bus, with automatic
 * cleanup on component unmount.
 *
 * @param {import("@vueuse/core").EventBusListener<
 * import("@/types").LayersEventBusKeys,
 * Record<string,any>[] | undefined
 * >} listener
 */
export const useOnLayersUpdate = (listener) => {
  const layersEvents = useEventBus(eoxLayersKey);

  const unsubscribe = layersEvents.on(listener);
  onUnmounted(() => {
    unsubscribe();
  });
  return unsubscribe;
};
/**
 * Emits a layers-update event on the shared bus once the map has rendered a
 * complete frame with its pending updates: every source loaded, no animation
 * in flight. Always pass the full layers array, not a partial subset.
 *
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

  // Use layer ID literal to prevent circular module dependencies
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

    mapEl.map.once("rendercomplete", async () => {
      await emit();
      res(true);
    });
    mapEl.map.render();
  });
};

/**
 * @param {import("@eodash/stac").STACCollection | import("@eodash/stac").STACLink | import("@eodash/stac").STACItem | null} collection
 * @returns {string} - Returns the collection id or subcode if `useSubCode` is enabled
 */
export const useGetSubCodeId = (collection) => {
  const eodash = useEodash();

  if (!collection) {
    return "";
  }

  if (eodash?.options?.useSubCode) {
    return typeof collection.subcode === "string"
      ? collection.subcode
      : /** @type {string} */ (collection.id);
  }
  return /** @type {string} */ (collection.id);
};

/**
 * Composable: Adopt Vuetify styles into eo-dash shadow root
 * - Safe no-op outside Web Component context
 * - Cleans up observers on unmount
 */
/**
 * @param {string[]} [keyWords=["vuetify"]] - list of case-insensitive substrings to match against <style> element IDs
 */
export function useAdoptStyles(keyWords = ["vuetify"]) {
  /** @type {Array<() => void>} */
  let stops = [];

  const eoDash =
    /** @type {HTMLElement & { shadowRoot: ShadowRoot | null }} */ (
      document.querySelector("eo-dash")
    );
  if (!eoDash || !eoDash.shadowRoot) return;
  // Require Constructable Stylesheets support
  if (typeof CSSStyleSheet === "undefined") return;

  const head = document.head;
  const shadow = eoDash.shadowRoot;
  /** @type {Map<string, CSSStyleSheet>} */
  const sheetsById = new Map();

  /**
   * @param {string} id
   * @param {string} cssText
   */
  const updateSheet = (id, cssText) => {
    let sheet = sheetsById.get(id);
    if (!sheet) {
      sheet = new CSSStyleSheet();
      sheet.replaceSync(cssText);
      sheetsById.set(id, sheet);
      shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, sheet];
    } else {
      sheet.replaceSync(cssText);
    }
  };

  /**
   * @param {HTMLStyleElement} el
   */
  const handleStyleEl = (el) => {
    const id = el.id || "";
    const idLc = id.toLowerCase();
    if (!keyWords.some((s) => idLc.includes(String(s).toLowerCase()))) return;
    const cssText = (el.textContent || "").replaceAll(":root", ":host");
    if (!cssText) return;

    updateSheet(id, cssText);

    const observer = useMutationObserver(
      el,
      () => {
        const nextCss = (el.textContent || "").replaceAll(":root", ":host");
        if (nextCss) updateSheet(id, nextCss);
      },
      { childList: true, characterData: true, subtree: true },
    );
    if (observer?.stop) stops.push(() => observer.stop());
  };

  /**
   * @param {Node} node
   */
  const handleNode = (node) => {
    if (node instanceof HTMLStyleElement) handleStyleEl(node);
  };

  head.childNodes.forEach(handleNode);

  const headObserver = useMutationObserver(
    head,
    (mutations) => {
      mutations?.forEach((m) => {
        m.addedNodes?.forEach(handleNode);
      });
    },
    { childList: true },
  );
  if (headObserver?.stop) stops.push(() => headObserver.stop());

  onUnmounted(() => {
    stops.forEach((stop) => stop());
    stops = [];
  });
}

/**
 * Sets the main map view without animating. A restore is initial positioning,
 * and a fly-to gets cancelled by the first layer write (eox-map resets the
 * view zoom limits), leaving the map where it was.
 *
 * @param {number[]} center - [lon, lat]
 * @param {number} zoom
 */
function moveMap(center, zoom) {
  const view = mapEl.value?.map.getView();
  if (!view) {
    return;
  }
  // Sets the OpenLayers view directly, bypassing eox-map's `center`/`zoom`
  // setters, which animate once EodashMap sets `animationOptions`. eox-map's own
  // `center`/`zoom` properties go stale; nothing reads them.
  view.setCenter(transform(center, "EPSG:4326", view.getProjection()));
  view.setZoom(zoom);
}
