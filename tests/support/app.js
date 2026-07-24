import { createApp } from "vue";
import App from "@/App.vue";
import { registerPlugins } from "@/plugins";

/**
 * Boot the full eodash app for template-tier tests. `config` flows to App's
 * `config` prop; the template is picked via the `?template=` URL param. App's
 * `<Suspense>` resolves over the network, so assert readiness with `expect.poll`.
 *
 * @param {object} options
 * @param {string | (() => unknown)} options.config Eodash config.
 * @param {string} [options.template] Active template key (sets `?template=`).
 * @param {string} [options.initialUrl] Full initial URL (overrides `template`).
 * @returns {{ app: import("vue").App, container: HTMLElement, unmount: () => void }}
 */
export function mountApp({ config, template, initialUrl }) {
  const url = initialUrl ?? (template ? `?template=${template}` : undefined);
  if (url) {
    window.history.replaceState({}, "", url);
  }

  const container = document.body.appendChild(document.createElement("div"));
  container.id = "app";

  container.style.height = "100vh";

  const app = createApp(App, { config });
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
