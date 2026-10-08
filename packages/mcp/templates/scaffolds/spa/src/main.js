import { createEodash } from "@eodash/eodash";
import { lite } from "@eodash/eodash/templates";

export default createEodash({
  id: "my-eo-dashboard",
  stacEndpoint:
    "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/catalog.json",
  brand: {
    name: "My EO Dashboard",
    theme: {
      colors: {
        primary: "#002742",
        secondary: "#0071C2",
        surface: "#ffffff",
      },
    },
    footerText: "My EO Dashboard - Powered by eodash",
  },
  template: lite,
});
