/**
 * Build-time loader for the Eodash Store reference. Parses the store source
 * (`core/client/store/{states,actions,stac}.js`) with the TypeScript compiler
 * and extracts each public property's name, type, and JSDoc description, so the
 * store page renders clean tables straight from source — no hand-maintenance.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import ts from "typescript";

const STORE_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "core/client/store",
);

/** Last leading `/** … *\/` block comment before a node, or null. */
function leadingJsDoc(node, sf) {
  const full = sf.getFullText();
  const ranges = ts.getLeadingCommentRanges(full, node.getFullStart());
  if (!ranges) return null;
  for (let i = ranges.length - 1; i >= 0; i--) {
    if (ranges[i].kind !== ts.SyntaxKind.MultiLineCommentTrivia) continue;
    const raw = full.slice(ranges[i].pos, ranges[i].end);
    if (raw.startsWith("/**")) return raw;
  }
  return null;
}

/** JSDoc description text (everything before the first `@tag`). */
function description(raw) {
  if (!raw) return "";
  const out = [];
  // `\*+` tolerates a stray `* *` typo so a tag line still terminates the text.
  for (const line of raw
    .slice(3, -2)
    .split("\n")
    .map((l) => l.replace(/^\s*\*+\s?/, ""))) {
    if (/^\s*@\w+/.test(line)) break;
    out.push(line);
  }
  return out
    .join(" ")
    .replace(/\{@link\s+([^}]+)\}/g, "`$1`")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

/** Drop `import("…").` qualifiers and a stray leading union pipe. */
const stripImports = (t) =>
  t.replace(/import\((?:"[^"]+"|'[^']+')\)\./g, "").replace(/<\s*\|\s*/g, "<");

/** Type from a `@type {…}` tag (brace-matched, multi-line aware), or null. */
function jsdocType(raw) {
  if (!raw) return null;
  const at = raw.indexOf("@type");
  if (at === -1) return null;
  const open = raw.indexOf("{", at);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < raw.length; i++) {
    if (raw[i] === "{") depth++;
    else if (raw[i] === "}" && --depth === 0) {
      return stripImports(
        raw
          .slice(open + 1, i)
          .replace(/\n\s*\*\s?/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      );
    }
  }
  return null;
}

/** `(p1, p2?) => Promise<…>`-style hint for a function-like node. */
function signature(fn) {
  const params = fn.parameters.map((p) => {
    const name = p.name.getText();
    return p.questionToken || p.initializer || p.dotDotDotToken ? `${name}?` : name;
  });
  const isAsync = fn.modifiers?.some(
    (m) => m.kind === ts.SyntaxKind.AsyncKeyword,
  );
  return `(${params.join(", ")})${isAsync ? " => Promise" : ""}`;
}

/** Best-effort type for a state value without an explicit `@type`. */
function inferType(init) {
  if (!init) return "";
  if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) {
    return signature(init);
  }
  if (ts.isArrayLiteralExpression(init)) return "string[]";
  if (
    ts.isCallExpression(init) &&
    ts.isIdentifier(init.expression) &&
    /^(ref|shallowRef)$/.test(init.expression.text)
  ) {
    const a = init.arguments[0];
    const inner =
      a?.kind === ts.SyntaxKind.StringLiteral
        ? "string"
        : a?.kind === ts.SyntaxKind.TrueKeyword ||
            a?.kind === ts.SyntaxKind.FalseKeyword
          ? "boolean"
          : a?.kind === ts.SyntaxKind.NumericLiteral
            ? "number"
            : a && ts.isArrayLiteralExpression(a)
              ? "any[]"
              : "any";
    return `Ref<${inner}>`;
  }
  return "";
}

const parse = (file) =>
  ts.createSourceFile(
    file,
    readFileSync(resolve(STORE_DIR, file), "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );

/** All `export const` members of a module (states, actions). */
function moduleExports(file) {
  const sf = parse(file);
  const items = [];
  sf.forEachChild((node) => {
    if (
      !ts.isVariableStatement(node) ||
      !node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      return;
    }
    const decl = node.declarationList.declarations[0];
    const raw = leadingJsDoc(node, sf);
    items.push({
      name: decl.name.getText(sf),
      type: jsdocType(raw) ?? inferType(decl.initializer),
      description: description(raw),
    });
  });
  return items;
}

/** Public surface of the `defineStore` setup store in stac.js (its `return`). */
function storeExports(file) {
  const sf = parse(file);
  let setup = null;
  const findSetup = (n) => {
    if (
      ts.isCallExpression(n) &&
      ts.isIdentifier(n.expression) &&
      n.expression.text === "defineStore" &&
      (ts.isArrowFunction(n.arguments[1]) ||
        ts.isFunctionExpression(n.arguments[1]))
    ) {
      setup = n.arguments[1];
    }
    ts.forEachChild(n, findSetup);
  };
  findSetup(sf);
  if (!setup || !ts.isBlock(setup.body)) return [];

  const decls = new Map();
  let returned = [];
  for (const stmt of setup.body.statements) {
    if (ts.isVariableStatement(stmt)) {
      const d = stmt.declarationList.declarations[0];
      const raw = leadingJsDoc(stmt, sf);
      decls.set(d.name.getText(sf), {
        type: jsdocType(raw) ?? inferType(d.initializer),
        description: description(raw),
      });
    } else if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      const raw = leadingJsDoc(stmt, sf);
      decls.set(stmt.name.text, {
        type: jsdocType(raw) ?? signature(stmt),
        description: description(raw),
      });
    } else if (
      ts.isReturnStatement(stmt) &&
      stmt.expression &&
      ts.isObjectLiteralExpression(stmt.expression)
    ) {
      returned = stmt.expression.properties
        .map((p) => p.name?.getText(sf))
        .filter(Boolean);
    }
  }
  return returned.map((name) => ({
    name,
    ...(decls.get(name) ?? { type: "", description: "" }),
  }));
}

export default {
  watch: [resolve(STORE_DIR, "*.js")],
  load() {
    return {
      states: moduleExports("states.js"),
      actions: moduleExports("actions.js"),
      stac: storeExports("stac.js"),
    };
  },
};