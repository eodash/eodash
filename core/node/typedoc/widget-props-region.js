/**
 * Wraps the Properties section of each generated Widgets class page in a
 * `#widget-props` region so curated guide pages can transclude just the props via
 * `<!--@include: ../../api/Widgets/classes/<Name>.md#widget-props-->`. Also strips
 * the `Defined in:` source lines and, when a guide page exists, injects a backlink
 * (outside the region, so it is not transcluded back). Runs on MarkdownPageEvent.END.
 */

import { MarkdownPageEvent } from "typedoc-plugin-markdown";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROPS_HEADING = "## Properties";
// Region name is a single machine-readable token ([\w*-]+ per VitePress marker
// regex) — no spaces, so `<!--@include: ...#widget-props-->` resolves cleanly.
const REGION = "widget-props";

// Docs root relative to this file: core/node/typedoc/ -> core/ -> repo root -> docs/
const DOCS_ROOT = resolve(
  fileURLToPath(import.meta.url),
  "../../../..",
  "docs",
);

/**
 * Derive the widget name from a Widgets/classes/<Name> page URL, or null if
 * the page is not a Widgets class page.
 * @param {string} target
 * @returns {string | null}
 */
function widgetNameFromTarget(target) {
  const m = target.match(/Widgets\/classes\/([^/.]+)/);
  return m ? m[1] : null;
}

export function load(app) {
  app.renderer.on(MarkdownPageEvent.END, (page) => {
    const target = page.url ?? page.filename ?? "";
    if (!target.includes("Widgets/classes/") || !page.contents) return;

    const withoutSources = page.contents
      .split("\n")
      .filter((line) => !line.startsWith("Defined in:"))
      .join("\n");

    // Backlink to the curated guide — widget pages only.
    const widgetName = widgetNameFromTarget(target);
    let backlink = "";
    if (widgetName) {
      const guidePath = join(
        DOCS_ROOT,
        "widgets/internal-widgets",
        `${widgetName}.md`,
      );
      if (existsSync(guidePath)) {
        backlink = `> Guide: [${widgetName}](/widgets/internal-widgets/${widgetName})`;
      }
    }

    const idx = withoutSources.indexOf(PROPS_HEADING);
    if (idx === -1) {
      // No Properties section — inject backlink after heading if present.
      const base = withoutSources.trim();
      page.contents = backlink ? `${base}\n\n${backlink}\n` : `${base}\n`;
      return;
    }

    // Split at the Properties heading; backlink goes between head and region.
    let head = withoutSources.slice(0, idx).trim();
    const props = withoutSources.slice(idx).trim();

    if (backlink) {
      // Inject after the first heading line (# Class: <Name>) so it appears
      // directly under the page title, before other sections.
      const headLines = head.split("\n");
      const firstHeadingIdx = headLines.findIndex((l) => l.startsWith("# "));
      if (firstHeadingIdx !== -1) {
        headLines.splice(firstHeadingIdx + 1, 0, "", backlink);
        head = headLines.join("\n");
      } else {
        head = `${head}\n\n${backlink}`;
      }
    }

    page.contents = `${head}\n\n<!-- #region ${REGION} -->\n\n${props}\n\n<!-- #endregion ${REGION} -->\n`;
  });
}
