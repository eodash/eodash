import { globSync } from "node:fs";

/**
 * Widgets present in widgets/ but intentionally excluded from public docs and MCP server catalog.
 */
export const EXCLUDED_WIDGETS = new Set([
  "ExportState",
  "PopUp",
  "WidgetsContainer",
]);

/**
 * Discovers built-in widget names by scanning widgets/ directory.
 *
 * @param {string} repoRoot - Absolute or relative path to repo root.
 * @returns {string[]} Sorted array of widget component names.
 */
export function discoverWidgetNames(repoRoot = ".") {
  const fileWidgets = globSync("widgets/*.vue", { cwd: repoRoot }).map((p) =>
    p.replace(/^widgets[/\\]/, "").replace(/\.vue$/, ""),
  );

  const dirWidgets = globSync("widgets/*/index.vue", { cwd: repoRoot }).map(
    (p) => p.replace(/^widgets[/\\]/, "").replace(/[/\\]index\.vue$/, ""),
  );

  return Array.from(new Set([...fileWidgets, ...dirWidgets]))
    .filter((name) => !EXCLUDED_WIDGETS.has(name))
    .sort();
}
