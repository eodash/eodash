import pluginVue from "eslint-plugin-vue";
import eox from "@eox/eslint-config";

export default [
  { ignores: ["public/", "dist/", ".eodash/"] },
  ...eox,
  ...pluginVue.configs["flat/essential"],
];
