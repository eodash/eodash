// functions of this folder can only be consumed inside setup stores,
// setup functions or vue composition api components

import { currentUrl, indicator, mapPosition } from "@/store/States";
import eodash from "@/eodash";
import { useTheme } from "vuetify/lib/framework.mjs";
import { onMounted, watch } from "vue";
import { useSTAcStore } from "@/store/stac";

/**
 * Creates an absolute URL from a relative link and assignes it to `currentUrl`
 * @param {string} [rel = '']
 * @param {string} [base = eodash.stacEndpoint] - base URL, default value is the root stac catalog
 * @returns {import('vue').Ref<string>} - returns `currentUrl`
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
 * Updates an existing Vuetify theme.
 * updates only the values provided in the `ThemeDefinition`
 * @param {string} themeName - Name of the theme to be updated
 * @param {import('vuetify').ThemeDefinition} [themeDefinition = {}] - New defintion to be updated to
 * @returns {import('vuetify').ThemeInstance}
 */
export const useUpdateTheme = (themeName, themeDefinition = {}) => {
  const theme = useTheme();

  /** @type {Array<keyof import('vuetify').ThemeDefinition>} */ (
    Object.keys(themeDefinition)
  ).forEach((key) => {
    if (key === "dark") {
      theme.themes.value[themeName][key] = /** @type {Boolean} */ (
        themeDefinition[key]
      );
    } else {
      //@ts-expect-error
      theme.themes.value[themeName][key] = {
        ...theme.themes.value[themeName][key],
        ...themeDefinition[key],
      };
    }
  });
  return theme;
};

/**
 * Composable that syncs store and  URLSearchParameters
 */

export const useURLSearchParametersSync = () => {
  onMounted(async () => {
    // Analyze currently set url params when first loaded and set them in the store
    if ('URLSearchParams' in window) {
      const searchParams = new URLSearchParams(window.location.search);
      /** @type {number} */
      let x,
        /** @type {number} */
        y,
        /** @type {number} */
        z;
      searchParams.forEach(async (value, key) => {
        if (key === "indicator") {
          const { loadSelectedSTAC, stac } = useSTAcStore()
          const match = stac?.find(link => link.id == value)
          if (match) {
            await loadSelectedSTAC(match.href)
          }
        }
        if (key === "x") {
          x = Number(value);
        }
        if (key === "y") {
          y = Number(value);
        }
        if (key === "z") {
          z = Number(value);
        }
      })
      //@ts-expect-error
      if (x !== undefined && y !== undefined && z !== undefined) {
        mapPosition.value = [x, y, z];
      }
    }
    watch(
      [indicator, mapPosition],
      ([updatedIndicator, updatedMapPosition]) => {
        if ('URLSearchParams' in window) {
          const searchParams = new URLSearchParams(window.location.search);
          if (updatedIndicator !== "") {
            searchParams.set("indicator", updatedIndicator);
          }
          if (updatedMapPosition && updatedMapPosition.length === 3) {
            searchParams.set("x", updatedMapPosition[0]?.toFixed(4) ?? '');
            searchParams.set("y", updatedMapPosition[1]?.toFixed(4) ?? '');
            searchParams.set("z", updatedMapPosition[2]?.toFixed(4) ?? '');
          }
          const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
          history.pushState(null, '', newRelativePathQuery);
        }
      })
  });
};
