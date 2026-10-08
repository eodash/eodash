// @id dashboard-config-custom-widgets
// @title Dashboard Configuration with Custom Widgets
// @features config, custom-widgets, web-components, iframe
// @tags config, custom-widgets, eox-elements, web-component, iframe
// @description Dashboard configuration combining the standard template layout with custom web-component and iframe widgets.
import { createEodash } from "@eodash/eodash";
import { explore } from "@eodash/eodash/templates";

/** @type {import("@eodash/eodash").Eodash} */
export default createEodash({
  id: "custom-widgets-dashboard",
  stacEndpoint:
    "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json",
  brand: {
    name: "Custom Widgets EO Dashboard",
  },
  template: {
    ...explore,
    widgets: [
      ...(explore.widgets || []),
      {
        id: "CustomSensorChart",
        title: "Sensor Telemetry",
        type: "web-component",
        widget: {
          link: "https://cdn.example.com/widgets/sensor-chart.js",
          tagName: "sensor-chart",
          properties: {
            theme: "dark",
          },
        },
        layout: {
          x: 0,
          y: 8,
          w: 6,
          h: 4,
        },
      },
      {
        id: "ExternalAnalytics",
        title: "External Analytics",
        type: "iframe",
        widget: {
          src: "https://analytics.example.com/embedded",
        },
        layout: {
          x: 6,
          y: 8,
          w: 6,
          h: 4,
        },
      },
    ],
  },
});
