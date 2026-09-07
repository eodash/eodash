import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { parse as parseVueSFC } from "@vue/compiler-sfc";
import { getJsDocFromNode, unwrapPropType } from "./ast-utils.js";
import {
  CATEGORY_MAP,
  TAGS_MAP,
  STAC_EXTENSIONS_MAP,
  STAC_CORE_FIELDS_MAP,
} from "./constants.js";
import {
  analyzeStoreInteractions,
  extractExamplesFromTemplates,
} from "./store-parser.js";
import {
  parseTypedocWidgets,
  loadMarkdownGuides,
} from "./typedoc-parser.js";
import { discoverWidgetNames } from "../../../core/node/widgets.js";

export { stringifyType, typeToSchema } from "./type-utils.js";

/**
 * Direct SFC/TS props extraction fallback
 */
export function extractPropsFromVueSfc(vueFilePath) {
  if (!fs.existsSync(vueFilePath)) return [];
  const vueContent = fs.readFileSync(vueFilePath, "utf8");
  let scriptContent = "";
  try {
    const parsed = parseVueSFC(vueContent);
    scriptContent =
      (parsed.descriptor.scriptSetup?.content || "") +
      "\n" +
      (parsed.descriptor.script?.content || "");
  } catch {
    return [];
  }

  const sf = ts.createSourceFile(
    vueFilePath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
  );
  const props = [];

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const fnName = node.expression.getText(sf);
      if (fnName === "defineProps") {
        const arg = node.arguments[0];
        if (arg && ts.isObjectLiteralExpression(arg)) {
          for (const prop of arg.properties) {
            if (ts.isPropertyAssignment(prop)) {
              const name = prop.name.getText(sf);
              const doc = getJsDocFromNode(prop, sf);
              let propType = doc.type ? unwrapPropType(doc.type) : "unknown";
              let defaultValue = null;
              let required = false;

              if (ts.isObjectLiteralExpression(prop.initializer)) {
                for (const subProp of prop.initializer.properties) {
                  const subDoc = getJsDocFromNode(subProp, sf);
                  if (ts.isPropertyAssignment(subProp)) {
                    const subName = subProp.name.getText(sf);
                    if (subName === "required") {
                      required =
                        subProp.initializer.kind === ts.SyntaxKind.TrueKeyword;
                    }
                    if (subName === "default") {
                      defaultValue = subProp.initializer.getText(sf);
                    }
                    if (subName === "type") {
                      if (subDoc.type) {
                        propType = unwrapPropType(subDoc.type);
                      } else {
                        const innerDoc = getJsDocFromNode(
                          subProp.initializer,
                          sf,
                        );
                        if (innerDoc.type) {
                          propType = unwrapPropType(innerDoc.type);
                        } else if (propType === "unknown") {
                          propType = subProp.initializer.getText(sf);
                        }
                      }
                    }
                  } else if (ts.isMethodDeclaration(subProp)) {
                    const subName = subProp.name.getText(sf);
                    if (subName === "default") {
                      const ret = subProp.body?.statements.find((s) =>
                        ts.isReturnStatement(s),
                      );
                      defaultValue = ret?.expression
                        ? ret.expression.getText(sf)
                        : subProp.getText(sf);
                    }
                  }
                }
              } else if (ts.isIdentifier(prop.initializer)) {
                if (propType === "unknown") {
                  propType = prop.initializer.getText(sf);
                }
              }

              props.push({
                name,
                type: propType,
                defaultValue,
                description: doc.description,
                required,
              });
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return props;
}

export function buildWidgetsMetadata(repoRoot) {
  const widgetNames = discoverWidgetNames(repoRoot);
  const typedocWidgets = parseTypedocWidgets(repoRoot);
  const guides = loadMarkdownGuides(repoRoot);
  const templateExamples = extractExamplesFromTemplates(repoRoot);

  const widgetsMetadata = {};

  for (const name of widgetNames) {
    let props = typedocWidgets[name]?.props;
    if (!props || props.length === 0) {
      const sfcPath = fs.existsSync(
        path.join(repoRoot, "widgets", name, "index.vue"),
      )
        ? path.join(repoRoot, "widgets", name, "index.vue")
        : path.join(repoRoot, "widgets", `${name}.vue`);
      props = extractPropsFromVueSfc(sfcPath);
    }

    const guide = guides[name] || "";
    const storeInteractions = analyzeStoreInteractions(name, repoRoot);
    const category = CATEGORY_MAP[name] || "General";
    const tags = TAGS_MAP[name] || [];
    const stacExtensions = STAC_EXTENSIONS_MAP[name] || [];
    const stacCoreFields = STAC_CORE_FIELDS_MAP[name] || [];
    const isBackground = name === "EodashMap";

    let summary = `Built-in eodash widget: ${name}.`;
    if (guide) {
      const lines = guide
        .split("\n")
        .filter((l) => l.trim() && !l.startsWith("#"));
      if (lines.length > 0) {
        summary = lines[0].trim();
      }
    }

    const example = isBackground
      ? {
          type: "internal",
          id: `${name.toLowerCase()}-bg`,
          widget: {
            name,
            properties: {},
          },
        }
      : {
          id: name.toLowerCase(),
          title: name.replace(/^Eodash/, ""),
          type: "internal",
          layout: { x: 0, y: 0, w: 3, h: 6 },
          widget: {
            name,
            properties: {},
          },
        };

    widgetsMetadata[name] = {
      name,
      category,
      tags,
      summary,
      isBackground,
      props: props || [],
      storeInteractions,
      stacExtensions,
      stacCoreFields,
      example,
      templateExample: templateExamples[name] || null,
      markdownGuide: guide,
    };
  }

  return widgetsMetadata;
}
