import { createVuetify } from "vuetify";
import { createTestingPinia } from "@pinia/testing";
/**
 * @param {import("vue").App} app
 * @param {import("./cypress-types").VueMountOptions} options
 */
export const registerPlugins = async (app, options) => {
  options.vuetify = options.vuetify ?? {};
  const vuetify = createVuetify(options.vuetify);
  app.use(vuetify);

  options.pinia = options.pinia ?? createTestingPinia({ createSpy: cy.stub() });
  app.use(options.pinia);
};
