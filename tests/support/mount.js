import { render } from "vitest-browser-vue";
import { utils } from "vitest/browser";
import { Suspense, h, reactive } from "vue";
import { createVuetify } from "vuetify";
import { createTestingPinia } from "@pinia/testing";
import { flushPromises } from "@vue/test-utils";
import { setActivePinia } from "pinia";
import { vi } from "vitest";
import { VApp } from "vuetify/components";
import { eodashKey } from "@/utils/keys";
import "vuetify/styles";

/**
 * Options shared by {@link mountComponent} and {@link mountAsyncComponent}.
 * @typedef {object} MountOptions
 * @property {Record<string, unknown>} [props] Props passed to the component.
 * @property {ReturnType<typeof mockEodash>} [eodash] Injected eodash config; defaults to `mockEodash()`.
 * @property {Record<string, unknown>} [initialState] Initial testing-Pinia state.
 * @property {import("vue").Plugin[]} [plugins] Extra Vue plugins to install.
 * @property {Record<PropertyKey, unknown>} [provide] Extra app-level provides.
 * @property {Record<string,any>} [mocks] elements to mock
 * @property {Record<string, () => unknown>} [slots] Slot render functions passed to the component.
 * @property {import("vue").Plugin} [vuetify] Vuetify instance override (e.g. to supply the app's `dashboardTheme`); defaults to a bare `createVuetify()`.
 * @property {Record<string, any>} [stubs] `@vue/test-utils` `global.stubs` — replace child components (e.g. `{ PopUp: true }`).
 * @property {() => void} [rootSetup] Runs inside the root component's setup, before children mount — e.g. pass `provideEodashInstance` for widgets that read the `useEodash()` singleton.
 */

/**
 * Mount a synchronous eodash component in browser mode with the app's context:
 * VApp + Vuetify, a testing Pinia, and the injected eodash config. The trailing
 * `flushPromises()` resolves async children (e.g. web-component widgets) whose
 * own Suspense boundaries live inside the sync root.
 *
 * Not for components with async `<script setup>` at the root — use
 * {@link mountAsyncComponent} for those.
 * @param {import("vue").Component} Component The component under test.
 * @param {MountOptions} [options] Mount options.
 * @returns {Promise<{ screen: ReturnType<typeof utils.getElementLocatorSelectors>, eodash: ReturnType<typeof mockEodash> }>} Browser-mode locators scoped to the mount + the injected eodash mock.
 */
export async function mountComponent(Component, options = {}) {
  const eodash = options.eodash ?? mockEodash();
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: options.initialState,
  });
  setActivePinia(pinia);

  const rendered = await render(
    {
      setup() {
        options.rootSetup?.();
        return () =>
          h(VApp, null, {
            default: () => h(Component, options.props ?? {}, options.slots),
          });
      },
    },
    {
      global: {
        plugins: [
          options.vuetify ?? createVuetify(),
          pinia,
          ...(options.plugins ?? []),
        ],
        provide: { [eodashKey]: eodash, ...(options.provide ?? {}) },
        mocks: options.mocks,
        stubs: options.stubs,
      },
    },
  );

  await flushPromises();
  return {
    screen: utils.getElementLocatorSelectors(rendered.baseElement),
    eodash,
  };
}

/**
 * Mount a component with async `<script setup>` (top-level await). `render`
 * can't take an async root directly — it unwraps the DOM before a root
 * Suspense resolves — so the component is wrapped in a Suspense boundary
 * inside a sync root and the mount awaits the boundary's onResolve. Built on
 * {@link mountComponent}, so all options (stubs, rootSetup, ...) apply and
 * mounts are auto-cleaned by vitest-browser-vue.
 *
 * For widgets that guard heavy imports with `customElements.get(...)`,
 * register the tags first via {@link stubCustomElement} so the awaits
 * short-circuit.
 * @param {import("vue").Component} Component The component under test.
 * @param {MountOptions} [options] Mount options.
 * @returns {ReturnType<typeof mountComponent>} Same shape as {@link mountComponent}.
 */
export async function mountAsyncComponent(
  Component,
  { props, ...options } = {},
) {
  /** @type {() => void} */
  let markReady = () => {};
  /** @type {Promise<void>} */
  const ready = new Promise((resolve) => (markReady = resolve));

  const result = await mountComponent(
    {
      render: () =>
        h(
          Suspense,
          { onResolve: () => markReady() },
          { default: () => h(Component, props ?? {}, options.slots) },
        ),
    },
    options,
  );

  await ready;
  await flushPromises();
  return result;
}

/**
 * Minimal reactive eodash config for component tests. Free of Symbols/functions
 * so it stays reactive and clonable. Extend per-test via `overrides` (brand is
 * deep-merged).
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

/**
 * Define a bare custom element once. Widgets guard their heavy eox imports
 * with `if (!customElements.get(tag)) await import(...)` — pre-defining the
 * tag short-circuits the import so the async setup resolves instantly.
 * @param {string} tag
 * @param {CustomElementConstructor} [Class] Stub with declared fields when a
 *   test asserts property (not attribute) bindings, or when the widget writes
 *   into element properties on mount.
 * @returns {CustomElementConstructor} The registered constructor.
 */
export function stubCustomElement(tag, Class = class extends HTMLElement {}) {
  if (!customElements.get(tag)) {
    customElements.define(tag, Class);
  }
  return /** @type {CustomElementConstructor} */ (customElements.get(tag));
}
