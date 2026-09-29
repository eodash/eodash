/**
 * Curated custom widget boilerplate and guides
 */
export const CUSTOM_WIDGET_GUIDES = {
  "web-component": {
    title: "Web Component Custom Widgets in eodash",
    description:
      "Wrap any Custom Element (e.g. EOxElements from @eox/* prefix, or vanilla Web Components) into an eodash widget slot.",
    lifecycleHooks: {
      onMounted: "(el, store) => void",
      onUnmounted: "(el, store) => void",
    },
    example: `
// In your custom widget definition or eodash.config.js
export default createEodash({
  template: {
    widgets: [
      {
        id: "my-custom-chart",
        title: "Custom Time Series",
        type: "web-component",
        layout: { x: 0, y: 6, w: 6, h: 6 },
        widget: {
          tagName: "my-custom-chart",
          // ESM import function or direct CDN bundle URL:
          link: () => import("./src/widgets/MyCustomChart.js"),
          properties: {
            theme: "dark",
            unit: "celsius",
          },
          onMounted: (el, store) => {
            console.log("Custom widget mounted:", el);
            // Listen to reactive store state
            el.addEventListener("range-changed", (e) => {
              store.states.currentUrl.value = e.detail.stacUrl;
            });
          },
          onUnmounted: (el, store) => {
            console.log("Cleaned up widget:", el);
          },
        },
      },
    ],
  },
});
`,
  },
  functional: {
    title: "Functional (Dynamic STAC-Driven) Widgets",
    description:
      "Define widgets dynamically as functions executed whenever the user selects a different STAC indicator or collection.",
    signature:
      "defineWidget: (selectedSTAC: STACCollection | null) => Widget | null",
    example: `
export default createEodash({
  template: {
    widgets: [
      {
        defineWidget: (selectedSTAC) => {
          if (!selectedSTAC) return null;

          // Check if active indicator provides a custom process
          const hasProcess = selectedSTAC?.links?.some((l) => l.rel === "service");
          if (!hasProcess) return null; // Don't render widget if indicator has no process

          return {
            id: "dynamic-process-panel",
            title: "Analysis",
            type: "internal",
            layout: { x: 9, y: 0, w: 3, h: 8 },
            widget: {
              name: "EodashProcess",
              properties: {
                vegaEmbedOptions: { actions: true },
              },
            },
          };
        },
      },
    ],
  },
});
`,
  },
  iframe: {
    title: "IFrame Widgets in eodash",
    description:
      "Embed external websites, dashboards, Jupyter notebook outputs, or web applications inside eodash grid slots.",
    example: `
export default createEodash({
  template: {
    widgets: [
      {
        id: "external-notebooks",
        title: "Live Notebook Explorer",
        type: "iframe",
        layout: { x: 6, y: 0, w: 6, h: 12 },
        widget: {
          src: "https://eoxhub-workspaces.github.io/eoxhub-notebooks/",
        },
      },
    ],
  },
});
`,
  },
};
