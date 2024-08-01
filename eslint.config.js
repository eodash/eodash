import pluginVue from "eslint-plugin-vue";
import eox from "@eox/eslint-config";

export default [
  ...eox,
  ...pluginVue.configs["flat/essential"],
  {
    ignores: ["public/", "dist/", ".eodash/", "docs/"],
  },
  {
    files: ["core/client/**/*.vue", "widgets/**/*.vue"],
    rules: {
      "vue/no-deprecated-html-element-is": "warn",
      "vue/multi-word-component-names": "off",
      "vue/no-deprecated-slot-attribute": [
        "error",
        {
          // used for the `eox-itemfilter` titles and slots in eox-map
          ignore: ["h4", "eox-map"],
        },
      ],
    },
  },
];
