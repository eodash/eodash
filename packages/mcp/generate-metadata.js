#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { parse as parseVueSFC } from "@vue/compiler-sfc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_REPO_ROOT = path.resolve(__dirname, "../..");

const EXCLUDED_WIDGETS = new Set(["ExportState", "PopUp", "WidgetsContainer"]);

// Known widget fallback categories & STAC extensions if not documented elsewhere
const CATEGORY_MAP = {
  EodashMap: "Visualization & Map",
  EodashLayerControl: "Visualization & Map",
  EodashItemCatalog: "Catalog & Discovery",
  EodashItemFilter: "Filtering & Selection",
  EodashTimeSlider: "Temporal Navigation",
  EodashDatePicker: "Temporal Navigation",
  EodashProcess: "Analysis & Processing",
  EodashChart: "Analysis & Processing",
  EodashStacInfo: "Branding & Metadata",
  EodashTools: "Layout & Orchestration",
  EodashLayoutSwitcher: "Layout & Orchestration",
};

const STAC_EXTENSIONS_MAP = {
  EodashMap: [
    "eox:flatstyle",
    "eodash:rasterform",
    "proj:epsg",
    "eodash:mapProjection",
    "eodash:proj4_def",
    "eodash:merge_assets",
    "eodash:layerExclusive",
  ],
  EodashLayerControl: [
    "eox:flatstyle",
    "eodash:rasterform",
    "eodash:merge_assets",
    "eodash:layerExclusive",
  ],
  EodashItemCatalog: ["eo:cloud_cover", "datetime", "assets.thumbnail"],
  EodashItemFilter: ["themes", "tags"],
  EodashTimeSlider: ["cube:dimensions", "extent.temporal", "datetime"],
  EodashDatePicker: ["extent.temporal", "datetime"],
  EodashProcess: ["eodash:jsonform", "links (rel=service)"],
  EodashChart: [
    "links (rel=service, type=application/json|text/csv)",
    "eodash:vegadefinition",
  ],
  EodashStacInfo: ["sci:citation", "sci:doi", "sci:publication", "providers"],
};

/**
 * 1. Dynamically discover widget names in widgets/
 */
function discoverWidgetNames(repoRoot) {
  const widgetsDir = path.join(repoRoot, "widgets");
  if (!fs.existsSync(widgetsDir)) return [];

  const entries = fs.readdirSync(widgetsDir, { withFileTypes: true });
  const names = new Set();

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".vue")) {
      const name = entry.name.replace(/\.vue$/, "");
      if (!EXCLUDED_WIDGETS.has(name)) names.add(name);
    } else if (entry.isDirectory()) {
      const indexPath = path.join(widgetsDir, entry.name, "index.vue");
      if (fs.existsSync(indexPath) && !EXCLUDED_WIDGETS.has(entry.name)) {
        names.add(entry.name);
      }
    }
  }

  return Array.from(names).sort();
}

/**
 * Recursively collect all files in a directory
 */
function collectFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(collectFiles(fullPath));
    } else if (
      item.name.endsWith(".js") ||
      item.name.endsWith(".ts") ||
      item.name.endsWith(".vue")
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Clean and parse JSDoc comments attached to AST nodes
 */
function cleanDoc(comment) {
  if (!comment)
    return { description: "", type: null, params: [], returns: null };
  const lines = comment
    .replace(/^\/\*\*?/, "")
    .replace(/\*\/$/, "")
    .split("\n")
    .map((l) => l.replace(/^\s*\*\s?/, "").trim())
    .filter(Boolean);

  let type = null;
  let returns = null;
  const params = [];
  const descLines = [];

  for (const line of lines) {
    const typeMatch = line.match(/^@type\s+\{([^}]+)\}/);
    const paramMatch = line.match(
      /^@param\s+\{([^}]+)\}\s+(\[?\w+\]?)(\s+.*)?/,
    );
    const returnMatch = line.match(/^@returns?\s+\{([^}]+)\}(\s+.*)?/);

    if (typeMatch) {
      type = typeMatch[1];
    } else if (paramMatch) {
      params.push({
        name: paramMatch[2].replace(/^\[|\]$/g, ""),
        type: paramMatch[1],
        description: (paramMatch[3] || "").trim(),
      });
    } else if (returnMatch) {
      returns = {
        type: returnMatch[1],
        description: (returnMatch[2] || "").trim(),
      };
    } else if (!line.startsWith("@")) {
      descLines.push(line);
    }
  }
  return { description: descLines.join(" "), type, params, returns };
}

/**
 * 2. AST-based store interaction analysis (reads and writes)
 */
function analyzeStoreInteractions(widgetName, repoRoot) {
  const widgetsDir = path.join(repoRoot, "widgets");
  const filesToScan = [];

  const singleFile = path.join(widgetsDir, `${widgetName}.vue`);
  if (fs.existsSync(singleFile)) {
    filesToScan.push(singleFile);
  }

  const widgetFolder = path.join(widgetsDir, widgetName);
  if (fs.existsSync(widgetFolder)) {
    filesToScan.push(...collectFiles(widgetFolder));
  }

  const reads = new Set();
  const writes = new Set();

  for (const file of filesToScan) {
    let scriptContent = "";
    if (file.endsWith(".vue")) {
      const vueContent = fs.readFileSync(file, "utf8");
      try {
        const parsed = parseVueSFC(vueContent);
        scriptContent =
          (parsed.descriptor.scriptSetup?.content || "") +
          "\n" +
          (parsed.descriptor.script?.content || "");
      } catch {
        scriptContent = vueContent;
      }
    } else {
      scriptContent = fs.readFileSync(file, "utf8");
    }

    const sf = ts.createSourceFile(
      file,
      scriptContent,
      ts.ScriptTarget.Latest,
      true,
    );
    const importedStoreVars = new Set();

    function visit(node) {
      // 1. Identify store imports
      if (ts.isImportDeclaration(node)) {
        const spec = node.moduleSpecifier.text;
        if (spec.includes("store/states") || spec.includes("store")) {
          if (
            node.importClause?.namedBindings &&
            ts.isNamedImports(node.importClause.namedBindings)
          ) {
            for (const el of node.importClause.namedBindings.elements) {
              importedStoreVars.add(el.name.text);
            }
          }
        }
      }

      // 2. Detect store.<prop> or states.<prop> accesses
      if (ts.isPropertyAccessExpression(node)) {
        const propName = node.name.text;
        const target = node.expression.getText(sf);
        if (
          target === "store" ||
          target === "store.states" ||
          target === "states"
        ) {
          if (
            ![
              "init",
              "loadSelectedSTAC",
              "loadSelectedCompareSTAC",
              "resetSelectedCompareSTAC",
            ].includes(propName)
          ) {
            if (
              ts.isBinaryExpression(node.parent) &&
              node.parent.left === node &&
              node.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
            ) {
              writes.add(propName);
            } else {
              reads.add(propName);
            }
          }
        }
      }

      // 3. Detect importedStoreVar.value = ... (mutations)
      if (
        ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.EqualsToken
      ) {
        if (
          ts.isPropertyAccessExpression(node.left) &&
          node.left.name.text === "value"
        ) {
          const baseName = node.left.expression.getText(sf);
          if (importedStoreVars.has(baseName)) {
            writes.add(baseName);
          }
        }
      }

      // 4. Detect importedStoreVar reads
      if (ts.isIdentifier(node)) {
        if (importedStoreVars.has(node.text)) {
          if (!writes.has(node.text)) {
            reads.add(node.text);
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sf);
  }

  return {
    reads: Array.from(reads).sort(),
    writes: Array.from(writes).sort(),
  };
}

/**
 * 3. AST-based live widget example extraction from templates/*.js
 */
function extractExamplesFromTemplates(repoRoot) {
  const templatesDir = path.join(repoRoot, "templates");
  const examples = {};
  if (!fs.existsSync(templatesDir)) return examples;

  const templateFiles = fs
    .readdirSync(templatesDir)
    .filter((f) => f.endsWith(".js") && f !== "index.js");

  for (const tFile of templateFiles) {
    const filePath = path.join(templatesDir, tFile);
    const content = fs.readFileSync(filePath, "utf8");
    const sf = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
    );

    function findWidgetObjects(node, parent) {
      if (ts.isObjectLiteralExpression(node)) {
        for (const prop of node.properties) {
          if (
            ts.isPropertyAssignment(prop) &&
            prop.name.getText(sf) === "name" &&
            ts.isStringLiteral(prop.initializer)
          ) {
            const wName = prop.initializer.text;
            if (!examples[wName]) {
              // Find enclosing widget definition or fallback to object
              let targetNode = node;
              if (
                parent &&
                ts.isPropertyAssignment(parent) &&
                parent.name.getText(sf) === "widget" &&
                parent.parent &&
                ts.isObjectLiteralExpression(parent.parent)
              ) {
                targetNode = parent.parent;
              }
              examples[wName] = {
                sourceTemplate: tFile,
                snippet: targetNode.getText(sf).trim(),
              };
            }
          }
        }
      }
      ts.forEachChild(node, (child) => findWidgetObjects(child, node));
    }

    findWidgetObjects(sf, null);
  }

  return examples;
}

/**
 * 4. AST-based reactive store inference from core/client/store/*.js
 */
function parseStoreFileAst(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
  );
  const items = [];

  function visit(node) {
    // Variable statements: export const currentUrl = ref("");
    if (ts.isVariableStatement(node)) {
      const commentRanges = ts.getLeadingCommentRanges(content, node.pos);
      const rawComment = commentRanges
        ? commentRanges.map((r) => content.slice(r.pos, r.end)).join("\n")
        : "";
      const doc = cleanDoc(rawComment);

      for (const decl of node.declarationList.declarations) {
        const name = decl.name.getText(sf);
        let kind = "ref";
        let isFn = false;

        if (decl.initializer) {
          const initText = decl.initializer.getText(sf);
          if (initText.startsWith("shallowRef")) kind = "shallowRef";
          else if (initText.startsWith("reactive")) kind = "reactive";
          else if (
            ts.isArrowFunction(decl.initializer) ||
            initText.includes("=>")
          ) {
            isFn = true;
          }
        }

        let inferredType = doc.type;
        if (!inferredType) {
          if (isFn) inferredType = "Function";
          else if (kind === "shallowRef") inferredType = "ShallowRef<any>";
          else if (kind === "reactive") inferredType = "Reactive<object>";
          else inferredType = "Ref<any>";
        }

        items.push({
          name,
          category: isFn ? "action" : "state",
          type: inferredType,
          description:
            doc.description ||
            (isFn ? `Action ${name}` : `Reactive ${name} state`),
          ...(doc.params.length > 0 ? { params: doc.params } : {}),
          ...(doc.returns ? { returns: doc.returns } : {}),
        });
      }
    }

    // Function declarations: export async function registerProjection(...)
    if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.getText(sf);
      const commentRanges = ts.getLeadingCommentRanges(content, node.pos);
      const rawComment = commentRanges
        ? commentRanges.map((r) => content.slice(r.pos, r.end)).join("\n")
        : "";
      const doc = cleanDoc(rawComment);

      items.push({
        name,
        category: "action",
        type: "Function",
        description: doc.description || `Action ${name}`,
        ...(doc.params.length > 0 ? { params: doc.params } : {}),
        ...(doc.returns ? { returns: doc.returns } : {}),
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sf);
  return items;
}

function inferReactiveStoreMetadata(repoRoot) {
  const statesFile = path.join(repoRoot, "core/client/store/states.js");
  const stacFile = path.join(repoRoot, "core/client/store/stac.js");
  const actionsFile = path.join(repoRoot, "core/client/store/actions.js");

  return {
    description:
      "Global reactive store and Pinia store managing STAC endpoint, active collection, selected item, datetime, map instances, and chart states. Accessible via window.eodashStore or `import { store } from '@eodash/eodash'`.",
    states: parseStoreFileAst(statesFile),
    stacStore: parseStoreFileAst(stacFile),
    actions: parseStoreFileAst(actionsFile),
  };
}

/**
 * 5. Direct SFC/TS props extraction fallback
 */
function extractPropsFromVueSfc(vueFilePath) {
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
              const commentRanges = ts.getLeadingCommentRanges(
                scriptContent,
                prop.pos,
              );
              const comment = commentRanges
                ? commentRanges
                    .map((r) => scriptContent.slice(r.pos, r.end))
                    .join("\n")
                : "";
              const doc = cleanDoc(comment);

              let defaultValue = null;
              let propType = doc.type || "unknown";

              if (ts.isObjectLiteralExpression(prop.initializer)) {
                for (const subProp of prop.initializer.properties) {
                  if (ts.isPropertyAssignment(subProp)) {
                    const subName = subProp.name.getText(sf);
                    if (subName === "default") {
                      defaultValue = subProp.initializer.getText(sf);
                    }
                    if (subName === "type" && propType === "unknown") {
                      const typeComments = ts.getLeadingCommentRanges(
                        scriptContent,
                        subProp.pos,
                      );
                      const typeDoc = cleanDoc(
                        typeComments
                          ? typeComments
                              .map((r) => scriptContent.slice(r.pos, r.end))
                              .join("\n")
                          : "",
                      );
                      if (typeDoc.type) propType = typeDoc.type;
                      else propType = subProp.initializer.getText(sf);
                    }
                  }
                }
              }

              props.push({
                name,
                type: propType,
                defaultValue,
                description: doc.description,
                required: defaultValue === null,
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

function stringifyType(t) {
  if (!t) return "unknown";
  if (t.type === "intrinsic") return t.name;
  if (t.type === "union") return t.types.map(stringifyType).join(" | ");
  if (t.type === "array") return `${stringifyType(t.elementType)}[]`;
  if (t.type === "reference") {
    return (
      t.name +
      (t.typeArguments
        ? `<${t.typeArguments.map(stringifyType).join(", ")}>`
        : "")
    );
  }
  if (t.type === "reflection") {
    if (t.declaration?.children) {
      return (
        "{\n" +
        t.declaration.children
          .map((c) => `  ${c.name}?: ${stringifyType(c.type)}`)
          .join("\n") +
        "\n}"
      );
    }
    if (t.declaration?.signatures) {
      return "(...) => any";
    }
    return "object";
  }
  if (t.type === "literal") return JSON.stringify(t.value);
  if (t.type === "tuple")
    return `[${t.elements.map(stringifyType).join(", ")}]`;
  return t.type || "unknown";
}

function parseTypedocWidgets(repoRoot) {
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

function loadMarkdownGuides(repoRoot) {
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

export function buildMetadata(repoRoot = DEFAULT_REPO_ROOT) {
  const widgetNames = discoverWidgetNames(repoRoot);
  const typedocWidgets = parseTypedocWidgets(repoRoot);
  const guides = loadMarkdownGuides(repoRoot);
  const templateExamples = extractExamplesFromTemplates(repoRoot);
  const inferredReactiveStore = inferReactiveStoreMetadata(repoRoot);

  const widgetsMetadata = {};

  for (const name of widgetNames) {
    let props = typedocWidgets[name]?.props;
    if (!props || props.length === 0) {
      // Direct SFC AST fallback
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
    const stacExtensions = STAC_EXTENSIONS_MAP[name] || [];
    const isBackground = name === "EodashMap";

    // Extract first summary paragraph from markdown guide if available
    let summary = `Built-in eodash widget: ${name}.`;
    if (guide) {
      const lines = guide
        .split("\n")
        .filter((l) => l.trim() && !l.startsWith("#"));
      if (lines.length > 0) {
        summary = lines[0].trim();
      }
    }

    // Generate structured example
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
      summary,
      isBackground,
      props: props || [],
      storeInteractions,
      stacExtensions,
      example,
      templateExample: templateExamples[name] || null,
      markdownGuide: guide,
    };
  }

  const templatesDir = path.join(repoRoot, "templates");
  const discoveredTemplateFiles = fs.existsSync(templatesDir)
    ? fs
        .readdirSync(templatesDir)
        .filter(
          (f) => f.endsWith(".js") && f !== "index.js" && f !== "baseConfig.js",
        )
        .map((f) => path.basename(f, ".js"))
    : ["lite", "explore", "expert", "compare"];

  const knownTemplateDescriptions = {
    lite: "Streamlined view for public dissemination with minimal controls (Map, Header Tools, Layers, StacInfo, DatePicker).",
    explore:
      "Feature-rich discovery layout featuring ItemFilter, Catalog explorer, Map, LayerControl, TimeSlider, StacInfo, and Process analysis.",
    expert:
      "Power-user dashboard with comprehensive layer manipulation and full analysis tooling.",
    compare:
      "Dual-map side-by-side or split comparison mode with synchronized or independent layer sets and charts.",
  };

  const architectureMetadata = {
    overview:
      "eodash is a modular earth observation dashboard builder designed to visualize STAC catalogs, time-series data, vector/raster layers, and OGC API Processes. It can run as a standalone Single Page App (SPA) or be embedded as a Web Component (<eo-dash>).",
    gridSystem: {
      columns: 12,
      notation:
        "x/y/w/h where coordinates can be numbers (1-12) or breakpoint strings 'mobile/tablet/desktop' (e.g. '12/9/10').",
      examples: [
        { label: "Full width sidebar", layout: { x: 0, y: 0, w: 3, h: 12 } },
        {
          label: "Responsive drawer",
          layout: { x: "9/9/10", y: 0, w: "3/3/2", h: 12 },
        },
        { label: "Bottom time slider", layout: { x: 3, y: 10, w: 6, h: 2 } },
      ],
    },
    templateSystem: {
      description: `Templates compose dashboard layouts. eodash provides standard built-in templates: ${discoveredTemplateFiles.map((t) => `'${t}'`).join(", ")}. Custom templates can define static widgets, background widgets, loading animations, and dynamic functional widgets.`,
      builtInTemplates: discoveredTemplateFiles.map((name) => ({
        name,
        description:
          knownTemplateDescriptions[name] ||
          `${name} dashboard template layout.`,
      })),
    },
    customWidgetSystem: {
      description:
        "eodash supports 3 types of custom widgets: 'web-component' (dynamic import or CDN URL), 'functional' (Vue component / render function), and 'iframe' (embedded HTML / notebook).",
      types: [
        {
          type: "web-component",
          description:
            "Loads any standard Custom Element via ESM dynamic import function or CDN URL. Provides lifecycle hooks onMounted(el, store) and onUnmounted(el, store).",
        },
        {
          type: "functional",
          description:
            "Dynamic function `defineWidget: (selectedSTAC) => Widget | null` executed reactively when selected STAC indicator changes.",
        },
        {
          type: "iframe",
          description:
            "Embeds external web application or notebook in sandboxed iframe.",
        },
      ],
    },
    reactiveStore: inferredReactiveStore,
  };

  return { widgetsMetadata, architectureMetadata };
}

// CLI execution
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename)
) {
  const outputDir = path.join(__dirname, "data");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const { widgetsMetadata, architectureMetadata } =
    buildMetadata(DEFAULT_REPO_ROOT);

  fs.writeFileSync(
    path.join(outputDir, "widgets-metadata.json"),
    JSON.stringify(widgetsMetadata, null, 2),
  );
  fs.writeFileSync(
    path.join(outputDir, "architecture-metadata.json"),
    JSON.stringify(architectureMetadata, null, 2),
  );

  console.log(
    `Auto-generated metadata for ${Object.keys(widgetsMetadata).length} widgets and reactiveStore (${architectureMetadata.reactiveStore.states.length} states, ${architectureMetadata.reactiveStore.stacStore.length} STAC store items, ${architectureMetadata.reactiveStore.actions.length} actions) in packages/mcp/data/`,
  );
}
