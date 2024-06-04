// functions of this folder can only be consumed inside setup stores,
// setup functions or vue composition api components

import { reactive } from "vue";
import { currentUrl, indicator, mapPosition } from "@/store/States";
import eodash from "@/eodash";
import { useTheme } from "vuetify/lib/framework.mjs";
import { onMounted, watch } from "vue";
import { mdiChevronDoubleDown, mdiChevronDoubleLeft, mdiChevronDoubleRight, mdiChevronDoubleUp } from "@mdi/js"

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
 * Adds slide in and out functionality to Elements
 * @param {import('vue').Ref<HTMLElement[]|null>} elements - elements to add the functionality to
 * @param {import("@/types").Widget[]} configs
 */
export const useSlidePanels = (elements, configs) => {
  /**
   * Sliding direction
   */
  const slideDirs = configs.map((m) =>
    m.layout.x == 0
      ? "left"
      : m.layout.x == 12 - m.layout.w
        ? "right"
        : m.layout.y < 6
          ? "up"
          : "down"
  );

  /**
   * Array of sliding button's style and icons
   */
  const slideBtns = slideDirs.map((dir, _idx) => {
    const btn = reactive({
      style: {},
      icon: { in: "", out: "" },
      active: false,
      enabled: false,
    });

    // temp removal of `slidable` from the  widgets API
    // if (configs[idx].slidable === false) {
    //   btn.enabled = false;
    //   return btn;
    // }

    switch (dir) {
      case "left":
        btn.style = { top: "50%", right: "-11%" };
        btn.icon.in = mdiChevronDoubleRight
        btn.icon.out = mdiChevronDoubleLeft

        break;
      case "right":
        btn.style = { top: "50%", left: "-11%" };
        btn.icon.in = mdiChevronDoubleLeft
        btn.icon.out = mdiChevronDoubleRight

        break;
      case "up":
        btn.style = { right: "50%", bottom: "-17%" };
        btn.icon.in = mdiChevronDoubleDown
        btn.icon.out = mdiChevronDoubleUp

        break;
      case "down":
        btn.style = { right: "50%", top: "-17%" };
        btn.icon.in = mdiChevronDoubleUp
        btn.icon.out = mdiChevronDoubleDown
        break;

      default:
        console.error("sliding error");
        break;
    }
    return btn;
  });

  /**
   * Transforms the element's position based on the direction
   * @param {number} idx - index of the pressed element
   */
  const slideInOut = (idx) => {
    const parentStyle = /** @type {CSSStyleDeclaration} */ (
      elements.value?.[idx].style
    );
    if (parentStyle?.transform.length) {
      slideBtns[idx].active = false;
      parentStyle.transform = "";
    } else {
      slideBtns[idx].active = true;
      parentStyle.transition = "transform 0.3s ease-in-out";
      switch (slideDirs[idx]) {
        case "left":
          parentStyle.transform = "translateX(-100%)";
          break;
        case "right":
          parentStyle.transform = "translateX(100%)";
          break;
        case "up":
          parentStyle.transform = `translateY(-${(configs[idx].layout.y / configs[idx].layout.h) * 100 + 100
            }%)`;
          break;
        case "down":
          parentStyle.transform = `translateY(${(Math.max(0, 12 - configs[idx].layout.y - configs[idx].layout.h) /
            configs[idx].layout.h) *
            100 +
            100
            }%)`;
          break;

        default:
          console.error("sliding error");
          break;
      }
    }
  };
  return { slideBtns, slideInOut };
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
  onMounted(() => {
    // Analyze currently set url params when first loaded and set them in the store
    if ('URLSearchParams' in window) {
      const searchParams = new URLSearchParams(window.location.search);
      let x, y, z;
      searchParams.forEach((value, key) => {
        if (key === "indicator") {
          indicator.value = value;
        }
        if (key === "x") {
          x = value;
        }
        if (key === "y") {
          y = value;
        }
        if (key === "z") {
          z = value;
        }
      })
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
