/**
 * TypeDoc plugin: copy JSDoc descriptions, defaults and optional flags from Vue
 * SFC defineProps into the class property reflections typedoc-plugin-vue creates.
 * Those reflections come from the component instance type, which carries no
 * JSDoc, so we read the source .vue instead. Runs after typedoc-plugin-vue (-100).
 */

import { Converter, ReflectionKind, ReflectionFlag, Comment } from "typedoc";
import ts from "typescript";
import { readFileSync, existsSync } from "node:fs";

export function load(app) {
  app.converter.on(Converter.EVENT_CREATE_DECLARATION, patchVuePropDocs, -100);
}

// Mirrors typedoc-plugin-vue across versions.
function getSymbolFromReflection(context, refl) {
  if ("getSymbolFromReflection" in context) {
    return context.getSymbolFromReflection(refl);
  }
  return refl.project.getSymbolFromReflection(refl);
}

/**
 * From the re-export in core/node/typedoc/widgets.ts, follow the initializer
 * symbol to the imported .d.ts and derive the .vue source path, e.g.
 * dist/types/widgets/EodashMap/index.vue.d.ts → widgets/EodashMap/index.vue
 */
function resolveVuePath(checker, declaration) {
  if (!ts.isVariableDeclaration(declaration) || !declaration.initializer)
    return null;

  // Unwrap any casts: `_x as unknown as T` → `_x`
  let init = declaration.initializer;
  while (ts.isAsExpression(init) || ts.isParenthesizedExpression(init)) {
    init = init.expression;
  }

  let importedSymbol = checker.getSymbolAtLocation(init);
  // Resolve import aliases to the actual declaration in the .d.ts file
  if (importedSymbol && importedSymbol.flags & ts.SymbolFlags.Alias) {
    importedSymbol = checker.getAliasedSymbol(importedSymbol);
  }
  const importedDecl = importedSymbol?.getDeclarations()?.[0];
  const dtsPath = importedDecl?.getSourceFile()?.fileName;

  if (!dtsPath?.endsWith(".vue.d.ts")) return null;

  // Strip dist/types/ from the absolute path and remove the .d.ts suffix.
  const vuePath = dtsPath.replace("/dist/types/", "/").replace(/\.d\.ts$/, "");
  return existsSync(vuePath) ? vuePath : null;
}

function extractScriptSetup(sfcText) {
  const m = sfcText.match(/<script\s[^>]*\bsetup\b[^>]*>([\s\S]*?)<\/script>/);
  return m?.[1] ?? null;
}

/**
 * Leading JSDoc before `node` → its description and optional `@default` value.
 * @returns {{ description: string | null, defaultTag: string | null } | null}
 */
function parseLeadingJSDoc(node, sf) {
  const src = sf.getFullText();
  const ranges = ts.getLeadingCommentRanges(src, node.getFullStart());
  if (!ranges) return null;

  for (let i = ranges.length - 1; i >= 0; i--) {
    const r = ranges[i];
    if (r.kind !== ts.SyntaxKind.MultiLineCommentTrivia) continue;
    const raw = src.slice(r.pos, r.end);
    if (!raw.startsWith("/**")) continue;

    const lines = raw
      .slice(3, -2)
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, ""));

    const descLines = [];
    let defaultTag = null;
    for (const line of lines) {
      const m = line.match(/^\s*@default(?:Value)?\s+(.*)$/);
      if (m) {
        defaultTag = m[1].trim();
        continue;
      }
      descLines.push(line);
    }
    return {
      description: descLines.join("\n").trim() || null,
      defaultTag,
    };
  }
  return null;
}

/** Prop `default` source text, unwrapping `() => x` factory defaults. */
function defaultValueText(initializer, sf) {
  let node = initializer;
  if (ts.isArrowFunction(node) && node.parameters.length === 0) {
    node = node.body;
  }
  if (ts.isParenthesizedExpression(node)) {
    node = node.expression;
  }
  return node.getText(sf).replace(/\s+/g, " ").trim();
}

/**
 * Per-prop description/default from the first `defineProps({...})` call. Only the
 * object form is supported; the type-only `defineProps<T>()` yields an empty map.
 * @returns {Map<string, { description: string | null, defaultValue: string | null, hasDefault: boolean }>}
 */
function extractDefinePropsInfo(scriptContent, filename) {
  const sf = ts.createSourceFile(
    filename,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
  );
  const result = new Map();

  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "defineProps" &&
      node.arguments.length === 1 &&
      ts.isObjectLiteralExpression(node.arguments[0])
    ) {
      for (const prop of node.arguments[0].properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const name = ts.isIdentifier(prop.name) ? prop.name.text : null;
        if (!name) continue;

        const parsed = parseLeadingJSDoc(prop, sf);

        let sourceDefault = null;
        if (ts.isObjectLiteralExpression(prop.initializer)) {
          const defaultProp = prop.initializer.properties.find(
            (p) =>
              ts.isPropertyAssignment(p) &&
              ts.isIdentifier(p.name) &&
              p.name.text === "default",
          );
          if (defaultProp) {
            sourceDefault = defaultValueText(defaultProp.initializer, sf);
          }
        }

        const defaultValue = parsed?.defaultTag ?? sourceDefault;
        result.set(name, {
          description: parsed?.description ?? null,
          defaultValue,
          hasDefault: defaultValue !== null,
        });
      }
      return; // found — stop walking
    }
    ts.forEachChild(node, visit);
  }

  visit(sf);
  return result;
}

function patchVuePropDocs(context, refl) {
  if (!refl.kindOf(ReflectionKind.Class)) return;

  const symbol = getSymbolFromReflection(context, refl);
  const declaration = symbol?.getDeclarations()?.[0];
  if (!declaration) return;

  const vuePath = resolveVuePath(context.checker, declaration);
  if (!vuePath) return;

  // Props come off the component instance type as `readonly`, which is
  // misleading — users do set them via config. Clear it on every prop.
  const props = (refl.children ?? []).filter((c) =>
    c.kindOf(ReflectionKind.Property),
  );
  for (const prop of props) {
    prop.setFlag(ReflectionFlag.Readonly, false);
  }

  let sfc;
  try {
    sfc = readFileSync(vuePath, "utf-8");
  } catch {
    return; // source unreadable — leave the reflection untouched
  }
  const script = extractScriptSetup(sfc);
  if (!script) return;

  const infoByProp = extractDefinePropsInfo(script, vuePath);
  if (infoByProp.size === 0) return;

  for (const prop of props) {
    const info = infoByProp.get(prop.name);
    if (!info) continue;

    // A prop with a default is effectively optional in config.
    if (info.hasDefault) {
      prop.setFlag(ReflectionFlag.Optional, true);
      prop.defaultValue = info.defaultValue;
    }

    if (info.description && !prop.comment?.summary?.length) {
      prop.comment = new Comment([{ kind: "text", text: info.description }]);
    }
  }
}
