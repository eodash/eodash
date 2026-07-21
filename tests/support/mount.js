import { render } from "vitest-browser-vue";
//@ts-expect-error todo
import { utils } from "vitest/browser";
import { Suspense, h } from "vue";
import { createVuetify } from "vuetify";
import { createTestingPinia } from "@pinia/testing";
import { flushPromises } from "@vue/test-utils";
import { setActivePinia } from "pinia";
import { vi } from "vitest";
import { VApp } from "vuetify/components";
import { eodashKey } from "@/utils/keys";
import { mockEodash } from "./eodash";
import "vuetify/styles";

/**
 * Options shared by {@link mountComponent} and {@link mountAsyncComponent}.
 *
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
 *
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
 * register the tags first via `support/elements.js` so the awaits
 * short-circuit.
 *
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
