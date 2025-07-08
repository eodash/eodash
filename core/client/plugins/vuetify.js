/**
 * Plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "vuetify/styles";
import "@eox/ui/vuetify/style.css";
import { eox } from "@eox/ui/vuetify/blueprint.js";

import { createVuetify } from "vuetify";
import { mdiChevronLeft, mdiChevronRight, mdiMenuDown, mdiPlus } from "@mdi/js";

const vuetify = createVuetify({
  blueprint: eox,
  icons: {
    aliases: {
      // mapping v-date-picker and v-tabs default icons to `@mdi/js`
      next: [mdiChevronRight],
      prev: [mdiChevronLeft],
      subgroup: [mdiMenuDown],
      plus: [mdiPlus],
    },
  },
  theme: {
    themes: {
      dashboardTheme: {},
      light: {
        colors: {
          primary: "#1867C0",
          secondary: "#5CBBF6",
        },
      },
    },
  },
});

export default vuetify;
