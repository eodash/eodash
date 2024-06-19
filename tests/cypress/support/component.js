import { mount } from "cypress/vue";
import { Suspense, h } from "vue";
import "./commands";
import { VApp } from "vuetify/components";
import { registerPlugins } from "./utils";
import { eodashKey } from "@/utils/keys";
import eodash from "@/eodash";
import "vuetify/styles";
/**
 * @param {import("vue").DefineComponent<{}, {}, any> | Element} OriginalComponent
 * @param {import("./cypress-types").VueMountOptions} options
 */
export const vMountComponent = (OriginalComponent, options = {}) => {
  options.global = options.global ?? {};
  options.global.plugins = options.global.plugins ?? [];

  const props = options.props ?? {};
  delete options.props;

  // Add plugins
  options.global.plugins.push({
    async install(app) {
      await registerPlugins(app, options);
    },
  });

  options.global.provide = {
    [eodashKey]: eodash,
  };

  return mount(
    {
      render: () => h(Suspense, [h(VApp, [h(OriginalComponent, props)])]),
    },
    options,
  ).then((app) => {
    return cy
      .wrap({ wrapper: app.wrapper.getComponent(OriginalComponent), options })
      .as("vue");
  });
};

Cypress.Commands.add("vMount", vMountComponent);
Cypress.Commands.add("mount", mount);
// Example use:
// cy.mount(MyComponent)
