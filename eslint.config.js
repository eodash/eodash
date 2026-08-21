import eox from "@eox/eslint-config";

export default [
  ...eox.filter((c) => !c?.name?.includes("cypress")),
  {
    ignores: ["public/", "**/dist/", ".eodash/", "docs/"],
  },
  {
    files: ["core/client/**/*.vue", "widgets/**/*.vue"],
    rules: {
      "vue/no-deprecated-slot-attribute": [
        "warn",
        {
          // used for the `eox-itemfilter` & `eox-layercontrol` titles and slots
          ignore: ["h4", "eox-map", "span", "div"],
        },
      ],
    },
  },
];
