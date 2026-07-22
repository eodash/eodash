import eox from "@eox/eslint-config";
import jsdoc from "eslint-plugin-jsdoc";

const jsdocOff = {
  "jsdoc/require-jsdoc": "off",
  "jsdoc/require-param": "off",
  "jsdoc/require-param-type": "off",
  "jsdoc/require-param-description": "off",
  "jsdoc/require-returns": "off",
  "jsdoc/require-returns-type": "off",
  "jsdoc/require-returns-description": "off",
  "jsdoc/require-property": "off",
  "jsdoc/require-property-type": "off",
  "jsdoc/require-property-description": "off",
  "jsdoc/require-description": "off",
  "jsdoc/reject-any-type": "off",
  "jsdoc/reject-function-type": "off",
  "jsdoc/tag-lines": "off",
  "jsdoc/no-multi-asterisks": "off",
  "jsdoc/no-defaults": "off",
  "jsdoc/multiline-blocks": "off",
  "jsdoc/escape-inline-tags": "off",
  "jsdoc/check-alignment": "off",
  "jsdoc/check-line-alignment": "off",
  "jsdoc/lines-before-block": "off",
};

const allJsdocOff = Object.fromEntries(
  Object.keys(jsdoc.configs["flat/recommended-typescript-flavor"].rules).map(
    (rule) => [rule, "off"],
  ),
);

export default [
  ...eox,
  {
    ignores: ["public/", "dist/", ".eodash/", "docs/"],
  },
  {
    rules: jsdocOff,
  },
  {
    files: ["tests/**"],
    rules: allJsdocOff,
  },
  {
    files: ["core/client/**/*.vue", "widgets/**/*.vue"],
    rules: {
      "vue/no-deprecated-html-element-is": "warn",
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "vue/require-valid-default-prop": "off",
      // eox web components expose camelCase properties bound via `.prop` /
      // `:attr` and namespaced (`@x:y`) events; hyphenating them sets the wrong
      // property/attribute name and silently breaks the binding.
      "vue/attribute-hyphenation": "off",
      "vue/v-on-event-hyphenation": "off",
      "vue/no-deprecated-slot-attribute": [
        "error",
        {
          // used for the `eox-itemfilter` & `eox-layercontrol` titles and slots in eox-map
          ignore: ["h4", "eox-map", "span", "div"],
        },
      ],
    },
  },
];
