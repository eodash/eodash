import { globSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const DOCS_DIR = join(REPO_ROOT, "docs");

/** Widgets present in widgets/ but intentionally excluded from public docs. */
const EXCLUDED = new Set(["ExportState", "PopUp"]);

function resolveWidgetNames() {
  const fileWidgets = globSync("widgets/*.vue", { cwd: REPO_ROOT }).map(
    (p) => p.replace(/^widgets\//, "").replace(/\.vue$/, ""),
  );

  const dirWidgets = globSync("widgets/*/index.vue", { cwd: REPO_ROOT }).map(
    (p) => p.replace(/^widgets\//, "").replace(/\/index\.vue$/, ""),
  );

  return [...fileWidgets, ...dirWidgets]
    .filter((name) => !EXCLUDED.has(name))
    .sort();
}

function resolveRegisteredNames() {
  const src = readFileSync(
    join(REPO_ROOT, "core/node/typedoc/widgets.ts"),
    "utf-8",
  );
  const registered = new Set();
  for (const [, name] of src.matchAll(/export const (\w+)/g)) {
    registered.add(name);
  }
  return registered;
}

function assertAllRegistered(widgetNames, registeredNames) {
  const missing = widgetNames.filter((n) => !registeredNames.has(n));
  if (missing.length === 0) return;

  const details = missing
    .map(
      (n) =>
        `  - "${n}": add an import and \`export const ${n} = ...\` to core/node/typedoc/widgets.ts` +
        ` so its API page is generated, or add it to EXCLUDED in docs/widgets/internal-widgets.data.js` +
        ` if it is an internal helper.`,
    )
    .join("\n");

  throw new Error(
    `Build guard: the following widget(s) exist in widgets/ but are not registered in` +
      ` core/node/typedoc/widgets.ts:\n${details}`,
  );
}

export default {
  load() {
    const widgetNames = resolveWidgetNames();
    const registeredNames = resolveRegisteredNames();

    assertAllRegistered(widgetNames, registeredNames);

    return widgetNames.map((name) => {
      const docPath = join(DOCS_DIR, "widgets/internal-widgets", `${name}.md`);
      const documented = existsSync(docPath);
      return {
        name,
        apiLink: `/api/Widgets/classes/${name}`,
        docLink: `/widgets/internal-widgets/${name}`,
        documented,
      };
    });
  },
};
