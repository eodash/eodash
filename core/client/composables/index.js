// functions of this folder can only be consumed inside setup stores,
// setup functions or vue composition api components

import { currentUrl, datetime, indicator, mapPosition } from "@/store/States";
import eodash from "@/eodash";
import { useTheme } from "vuetify/lib/framework.mjs";
import { onMounted, watch } from "vue";
import { useSTAcStore } from "@/store/stac";

/**
 * Creates an absolute URL from a relative link and assignes it to `currentUrl`
 *
 * @param {string} [rel=''] Default is `''`
 * @param {string} [base=eodash.stacEndpoint] - Base URL, default value is the
 *   root stac catalog. Default is `eodash.stacEndpoint`
 * @returns {import("vue").Ref<string>} - Returns `currentUrl`
 * @see {@link '@/store/States.js'}
 */
export const useAbsoluteUrl = (rel = "", base = eodash.stacEndpoint) => {
  if (!rel || rel.includes("http")) {
    currentUrl.value = base;
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
 * Updates an existing Vuetify theme. updates only the values provided in the
 * `ThemeDefinition`
 *
 * @param {string} themeName - Name of the theme to be updated
 * @param {import("vuetify").ThemeDefinition} [themeDefinition={}] - New
 *   defintion to be updated to. Default is `{}`
 * @returns {import("vuetify").ThemeInstance}
 */
export const useUpdateTheme = (themeName, themeDefinition = {}) => {
  const theme = useTheme();

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
      /** @type {number | undefined} */
      let x,
        /** @type {number | undefined} */
        y,
        /** @type {number | undefined} */
        z;
      searchParams.forEach(async (value, key) => {
        switch (key) {
          case "indicator": {
            const { loadSelectedSTAC, stac } = useSTAcStore();
            const match = stac?.find((link) => link.id == value);
            if (match) {
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
              datetime.value = new Date(value).toISOString();
            } catch {
              datetime.value = new Date().toISOString();
            }
            break;
          default:
            break;
        }
      });

      if (x && y && z) {
        mapPosition.value = [x, y, z];
      }
    }

    watch(
      [indicator, mapPosition, datetime],
      ([updatedIndicator, updatedMapPosition, updatedDatetime]) => {
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
          const newRelativePathQuery =
            window.location.pathname + "?" + searchParams.toString();
          history.pushState(null, "", newRelativePathQuery);
        }
      },
    );
  });
};

/** @param {import("vue").Ref<HTMLElement|null>} root - components root element ref*/
export const makePanelTransparent = (root) => {
  onMounted(() => {
    const eoxItem = root.value?.parentElement;
    if (eoxItem?.tagName === "EOX-LAYOUT-ITEM") {
      eoxItem.classList.remove("bg-surface");
      eoxItem.style.background = "transparent";
      eoxItem.style.border = "transparent";
    }
  });
};
