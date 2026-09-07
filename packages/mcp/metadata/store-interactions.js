import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { parse as parseVueSFC } from "@vue/compiler-sfc";
import { collectFiles } from "./ast-utils.js";

/**
 * AST-based store interaction analysis (reads and writes) for a widget
 */
export function analyzeStoreInteractions(widgetName, repoRoot) {
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
    let templateContent = "";
    if (file.endsWith(".vue")) {
      const vueContent = fs.readFileSync(file, "utf8");
      try {
        const parsed = parseVueSFC(vueContent);
        scriptContent =
          (parsed.descriptor.scriptSetup?.content || "") +
          "\n" +
          (parsed.descriptor.script?.content || "");
        templateContent = parsed.descriptor.template?.content || "";
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
    const piniaStoreInstances = new Set();

    function visit(node) {
      if (ts.isImportDeclaration(node)) {
        const spec = node.moduleSpecifier.text;
        if (
          spec.includes("store/states") ||
          spec.includes("store/actions") ||
          spec.includes("@/store/states") ||
          spec.includes("@/utils/states") ||
          spec === "@/store" ||
          spec === "@eodash/eodash"
        ) {
          if (
            node.importClause?.namedBindings &&
            ts.isNamedImports(node.importClause.namedBindings)
          ) {
            for (const el of node.importClause.namedBindings.elements) {
              const varName = el.name.text;
              if (varName !== "useSTAcStore" && varName !== "store") {
                importedStoreVars.add(varName);
              }
            }
          }
        }
      }

      if (ts.isVariableDeclaration(node)) {
        if (node.initializer && ts.isCallExpression(node.initializer)) {
          const fnText = node.initializer.expression.getText(sf);
          if (fnText === "useSTAcStore") {
            if (ts.isIdentifier(node.name)) {
              piniaStoreInstances.add(node.name.text);
            }
          } else if (fnText === "toRefs" || fnText === "storeToRefs") {
            const innerArg = node.initializer.arguments[0];
            if (innerArg && innerArg.getText(sf).includes("useSTAcStore")) {
              if (ts.isObjectBindingPattern(node.name)) {
                for (const el of node.name.elements) {
                  if (ts.isIdentifier(el.name)) {
                    importedStoreVars.add(el.name.text);
                  }
                }
              }
            }
          }
        }
      }

      if (ts.isPropertyAccessExpression(node)) {
        const propName = node.name.text;
        const target = node.expression.getText(sf);
        if (
          target === "store" ||
          target === "store.states" ||
          target === "states" ||
          piniaStoreInstances.has(target)
        ) {
          if (
            ![
              "init",
              "loadSTAC",
              "loadSelectedSTAC",
              "loadSelectedCompareSTAC",
              "resetSelectedCompareSTAC",
              "$reset",
              "$patch",
              "$subscribe",
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

      if (ts.isIdentifier(node)) {
        const varName = node.text;
        if (importedStoreVars.has(varName)) {
          let isImport = false;
          let p = node.parent;
          while (p) {
            if (ts.isImportDeclaration(p) || ts.isImportSpecifier(p)) {
              isImport = true;
              break;
            }
            p = p.parent;
          }

          const isCallee =
            ts.isCallExpression(node.parent) && node.parent.expression === node;
          const isObjectKey =
            ts.isPropertyAssignment(node.parent) && node.parent.name === node;
          const isLhsAssignment =
            (ts.isBinaryExpression(node.parent) &&
              node.parent.left === node &&
              node.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) ||
            (ts.isPropertyAccessExpression(node.parent) &&
              node.parent.expression === node &&
              node.parent.name.text === "value" &&
              ts.isBinaryExpression(node.parent.parent) &&
              node.parent.parent.left === node.parent &&
              node.parent.parent.operatorToken.kind ===
                ts.SyntaxKind.EqualsToken);

          if (!isImport && !isCallee && !isObjectKey && !isLhsAssignment) {
            reads.add(varName);
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sf);

    if (templateContent) {
      for (const varName of importedStoreVars) {
        const regex = new RegExp(`\\b${varName}\\b`);
        if (regex.test(templateContent)) {
          reads.add(varName);
        }
      }
    }
  }

  return {
    reads: Array.from(reads).sort(),
    writes: Array.from(writes).sort(),
  };
}
