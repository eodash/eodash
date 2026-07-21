import { createApp } from "vue";
import App from "@/App.vue";
import { registerPlugins } from "@/plugins";

/**
 * Bootstrap the full eodash app like `render.js` does — `createApp(App)` with
 * the real plugin stack — into a test container. No `config` prop is passed,
 * so config resolves through the real runtime path (App -> Dashboard ->
 * useEodashRuntime), landing on the `user:config` module. NOTE: no
 * `user:config` alias is wired in vitest.config.js yet — the template tier must
 * add one before the first mountApp consumer, or the import will fail.
 *
 * Known limit: `registerPlugins` installs a module-singleton Pinia, and store
 * states are singletons too, so state bleeds across mounts. Keep one
 * meaningful boot per file until a shared reset helper exists.
 *
 * @param {{ initialUrl?: string }} [options]
 * @returns {{ app: import("vue").App, container: HTMLElement, unmount: () => void }}
 */
export function mountApp({ initialUrl } = {}) {
  if (initialUrl) {
    window.history.replaceState({}, "", initialUrl);
  }

  const container = document.body.appendChild(document.createElement("div"));
  container.id = "app";

  const app = createApp(App);
  registerPlugins(app);
  app.mount(container);

  return {
    app,
    container,
    unmount: () => {
      app.unmount();
      container.remove();
    },
  };
}
