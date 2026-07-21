import { reactive } from "vue";

/**
 * Minimal reactive eodash config for component tests. Free of Symbols/functions
 * so it stays reactive and clonable. Extend per-test via `overrides` (brand is
 * deep-merged).
 *
 * @param {{ brand?: Record<string, unknown> } & Record<string, unknown>} [overrides]
 * @returns {import("@/types").Eodash} An intentionally partial config, typed as
 *   Eodash so it can be injected without casts at every call site.
 */
export function mockEodash({ brand = {}, ...rest } = {}) {
  return /** @type {import("@/types").Eodash} */ (
    /** @type {unknown} */ (
      reactive({
        id: "mocked",
        brand: {
          name: "Mock Dashboard",
          footerText: "Mock footer",
          theme: {
            colors: {
              primary: "#004170",
              secondary: "#0d6efd",
              surface: "#ffffff",
            },
          },
          ...brand,
        },
        ...rest,
      })
    )
  );
}

/**
 * A minimal single-template config for layout tests. Widgets are `web-component`
 * divs, so they resolve through the real useDefineTemplate/useDefineWidgets
 * pipeline without pulling in the eox-map / OpenLayers stack. Grid positions are
 * distinct so tests can assert each widget lands at its `x/y/w/h`.
 */
export function mockTemplate() {
  /** @param {string} className */
  const divWidget = (className) => ({
    tagName: "div",
    link: () => Promise.resolve({}),
    properties: { class: className },
  });

  return {
    background: {
      id: "bg",
      type: "web-component",
      widget: divWidget("mock-bg"),
    },
    loading: {
      id: "loading",
      type: "web-component",
      widget: divWidget("mock-loading"),
    },
    widgets: [
      {
        id: "widget-alpha",
        type: "web-component",
        title: "Alpha",
        layout: { x: 0, y: 0, w: 3, h: 6 },
        widget: divWidget("widget-alpha"),
      },
      {
        id: "widget-beta",
        type: "web-component",
        title: "Beta",
        layout: { x: 9, y: 6, w: 3, h: 4 },
        widget: divWidget("widget-beta"),
      },
    ],
  };
}
