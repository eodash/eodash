/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import 'vuetify/styles';


import { createVuetify } from 'vuetify';
import { mdiChevronLeft, mdiChevronRight, mdiMenuDown } from "@mdi/js"

const vuetify = createVuetify({
  icons: {
    aliases: {
      // mapping v-date-picker and v-tabs default icons to `@mdi/js`
      next: [mdiChevronRight],
      prev: [mdiChevronLeft],
      subgroup: [mdiMenuDown]
    },
  },
  theme: {
    themes: {
      dashboardTheme: {},
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
  },
})

export default vuetify
