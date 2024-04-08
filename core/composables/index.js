// functions of this folder can only be consumed inside setup stores,
// setup functions or vue composition api components

import { reactive } from "vue";
import { currentUrl, datetime, mapInstance, indicator } from "@/store/States";
import eodashConfig from "@/eodash";
import { useTheme } from "vuetify/lib/framework.mjs";
import { useRouter } from "vue-router";
import { onMounted, onUnmounted, watch } from "vue";

/**
 * Creates an absolute URL from a relative link and assignes it to `currentUrl`
 * @param {string} [rel = '']
 * @param {string} [base = eodashConfig.stacEndpoint] - base URL, default value is the root stac catalog
 * @returns {import('vue').Ref<string>} - returns `currentUrl`
 * @see {@link '@/store/States.js'}
 */
export const useAbsoluteUrl = (rel = "", base = eodashConfig.stacEndpoint) => {
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
  const slideBtns = slideDirs.map((dir, idx) => {
    const btn = reactive({
      style: {},
      icon: { in: "", out: "" },
      active: false,
      enabled: true,
    });
    if (configs[idx].slidable === false) {
      btn.enabled = false;
      return btn;
    }

    switch (dir) {
      case "left":
        btn.style = { top: "50%", right: "-11%" };
        btn.icon.in = "mdi-chevron-double-right";
        btn.icon.out = "mdi-chevron-double-left";

        break;
      case "right":
        btn.style = { top: "50%", left: "-11%" };
        btn.icon.in = "mdi-chevron-double-left";
        btn.icon.out = "mdi-chevron-double-right";

        break;
      case "up":
        btn.style = { right: "50%", bottom: "-17%" };
        btn.icon.in = "mdi-chevron-double-down";
        btn.icon.out = "mdi-chevron-double-up";

        break;
      case "down":
        btn.style = { right: "50%", top: "-17%" };
        btn.icon.in = "mdi-chevron-double-up";
        btn.icon.out = "mdi-chevron-double-down";
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
 * Composable that initiates route query params to store
 * STAC related values
 */
export const useRouteParams = () => {
  const router = useRouter();
  /**
   * @type {import("openlayers").EventsListenerFunctionType}
   */
  const handleMoveEnd = (evt) => {
    const map = /** @type {import("openlayers").Map | undefined} */ (
      /** @type {*} */ (evt).map
    );
    const [x, y] = map?.getView().getCenter() ?? [0, 0];
    const z = map?.getView().getZoom();
    const currentQuery = router.currentRoute.value.query;
    router.push({
      query: {
        ...currentQuery,
        x: x.toFixed(4),
        y: y.toFixed(4),
        z: z?.toFixed(4),
      },
    });
  };
  onMounted(() => {
    // Set datetime based on kvp
    if (
      "datetime" in router.currentRoute.value.query &&
      router.currentRoute.value.query["datetime"] !== ""
    ) {
      // @ts-ignore
      datetime.value =
        /** @type {string} */ router.currentRoute.value.query["datetime"];
    }
    watch(
      [datetime, mapInstance, currentUrl, indicator],
      ([updatedDate, updatedMap, _updatedUrl, updatedIndicator]) => {
        const [x, y] = updatedMap?.getView().getCenter() ?? [0, 0];
        // lets reduce unnecessary accuracy
        const currentQuery = router.currentRoute.value.query;
        router.push({
          query: {
            ...currentQuery,
            indicator: updatedIndicator,
            x: x.toFixed(4),
            y: y.toFixed(4),
            z: updatedMap?.getView().getZoom().toFixed(),
            datetime: updatedDate,
            // url: updatedUrl,
          },
        });
        updatedMap?.on("moveend", handleMoveEnd);
      }
    );
  });

  onUnmounted(() => {
    mapInstance.value?.un("moveend", handleMoveEnd);
  });
};
