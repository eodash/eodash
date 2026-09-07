/**
 * Curated custom widget boilerplate and guides
 */
export const CUSTOM_WIDGET_GUIDES = {
  "web-component": {
    title: "Web Component Custom Widgets in eodash",
    description:
      "Wrap any Custom Element (e.g. from @eox/*, Leaflet, or vanilla Web Components) into an eodash widget slot.",
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
        id: "external-notebook",
        title: "Live Analysis Notebook",
        type: "iframe",
        layout: { x: 6, y: 0, w: 6, h: 12 },
        widget: {
          src: "https://hub.eox.at/services/eox-workspaces/notebooks/my-demo.html",
        },
      },
    ],
  },
});
`,
  },
  "eox-elements": {
    title: "EOxElements Custom Widget Workflow",
    description:
      "Integrate web components from the EOxElements suite (@eox/map, @eox/chart, @eox/layercontrol, @eox/itemfilter, @eox/timecontrol, @eox/jsonform, @eox/stacinfo, @eox/drawtools, @eox/feedback, @eox/geosearch, @eox/layout).",
    workflow: [
      "1. Test and prototype the component isolated in EOxElements playground (https://eox.at/elements).",
      "2. Register component in eodash config via 'web-component' widget type.",
      "3. Configure reactive store callbacks in 'onMounted' lifecycle hook.",
    ],
    supportedElements: [
      "@eox/map: Map rendering and layer control",
      "@eox/chart: Vega-Lite time series visualization",
      "@eox/layercontrol: Layer visibility and dynamic style form controls",
      "@eox/itemfilter: STAC metadata faceted filtering",
      "@eox/timecontrol: Temporal slider and frame navigation",
      "@eox/jsonform: Schema-driven dynamic UI forms",
      "@eox/stacinfo: Formatted STAC metadata display cards",
      "@eox/drawtools: Bounding box and polygon ROI drawing",
      "@eox/geosearch: Nominatim location search input",
      "@eox/feedback: User feedback collection dialog",
      "@eox/layout: CSS Grid container primitives",
    ],
  },
};
