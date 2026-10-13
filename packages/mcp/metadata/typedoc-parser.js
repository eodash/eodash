import fs from "node:fs";
import path from "node:path";
import { stringifyType, typeToSchema } from "./type-utils.js";

/**
 * Parses widget prop definitions from dist/typedoc.json
 */
export function parseTypedocWidgets(repoRoot) {
  const typedocPath = path.join(repoRoot, "dist/typedoc.json");
  if (!fs.existsSync(typedocPath)) {
    return {};
  }
  try {
    const data = JSON.parse(fs.readFileSync(typedocPath, "utf8"));
    const widgetsModule = data.children?.find((c) => c.name === "Widgets");
    if (!widgetsModule) return {};

    const widgetMap = {};
    for (const w of widgetsModule.children || []) {
      const props = (w.children || []).map((p) => ({
        name: p.name,
        type: stringifyType(p.type),
        schema: typeToSchema(p.type),
        defaultValue: p.defaultValue ?? null,
        description:
          p.comment?.summary
            ?.map((s) => s.text)
            .join("")
            .trim() || "",
        required: !p.flags?.isOptional && p.defaultValue === undefined,
      }));
      widgetMap[w.name] = {
        name: w.name,
        props,
      };
    }
    return widgetMap;
  } catch (err) {
    console.warn("Could not parse dist/typedoc.json:", err.message);
    return {};
  }
}

/**
 * Loads markdown guides from docs/widgets/internal-widgets/
 */
export function loadMarkdownGuides(repoRoot) {
  const guides = {};
  const guideDir = path.join(repoRoot, "docs/widgets/internal-widgets");
  if (!fs.existsSync(guideDir)) return guides;

  const files = fs.readdirSync(guideDir);
  for (const file of files) {
    if (file.endsWith(".md")) {
      const name = path.basename(file, ".md");
      const content = fs.readFileSync(path.join(guideDir, file), "utf8");
      guides[name] = content;
    }
  }
  return guides;
}
