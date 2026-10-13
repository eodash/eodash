import fs from "node:fs";
import ts from "typescript";
import { getJsDocFromNode } from "./ast-utils.js";

/**
 * Parses top-level exported variables and functions from a store module AST
 */
export function parseTopLevelStoreAst(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
  );
  const items = [];

  for (const stmt of sf.statements) {
    if (ts.isVariableStatement(stmt)) {
      const isExported = stmt.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword,
      );
      if (!isExported) continue;

      const doc = getJsDocFromNode(stmt, sf);

      for (const decl of stmt.declarationList.declarations) {
        const name = decl.name.getText(sf);
        let kind = "value";
        let isFn = false;

        if (decl.initializer) {
          if (ts.isCallExpression(decl.initializer)) {
            const callee = decl.initializer.expression.getText(sf);
            if (
              ["ref", "shallowRef", "reactive", "computed"].includes(callee)
            ) {
              kind = callee;
            }
          } else if (
            ts.isArrowFunction(decl.initializer) ||
            ts.isFunctionExpression(decl.initializer)
          ) {
            isFn = true;
          }
        }

        let inferredType = doc.type;
        if (!inferredType) {
          if (isFn) inferredType = "Function";
          else if (kind === "shallowRef") inferredType = "ShallowRef<any>";
          else if (kind === "reactive") inferredType = "Reactive<object>";
          else if (kind === "computed") inferredType = "ComputedRef<any>";
          else if (kind === "ref") inferredType = "Ref<any>";
          else inferredType = "any";
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

    if (ts.isFunctionDeclaration(stmt) && stmt.name) {
      const isExported = stmt.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword,
      );
      if (!isExported) continue;

      const name = stmt.name.getText(sf);
      const doc = getJsDocFromNode(stmt, sf);

      items.push({
        name,
        category: "action",
        type: doc.type || "Function",
        description: doc.description || `Action ${name}`,
        ...(doc.params.length > 0 ? { params: doc.params } : {}),
        ...(doc.returns ? { returns: doc.returns } : {}),
      });
    }
  }

  return items;
}

/**
 * Parses Pinia store definition (defineStore) AST
 */
export function parsePiniaStoreAst(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
  );
  const items = [];

  for (const stmt of sf.statements) {
    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (decl.initializer && ts.isCallExpression(decl.initializer)) {
          const callee = decl.initializer.expression.getText(sf);
          if (callee === "defineStore") {
            const setupFn = decl.initializer.arguments[1];
            if (
              setupFn &&
              (ts.isArrowFunction(setupFn) ||
                ts.isFunctionExpression(setupFn)) &&
              ts.isBlock(setupFn.body)
            ) {
              const scopeDecls = new Map();
              let returnStmt = null;

              for (const bodyStmt of setupFn.body.statements) {
                if (ts.isVariableStatement(bodyStmt)) {
                  const doc = getJsDocFromNode(bodyStmt, sf);
                  for (const d of bodyStmt.declarationList.declarations) {
                    const dName = d.name.getText(sf);
                    let kind = "value";
                    let isFn = false;

                    if (d.initializer) {
                      if (ts.isCallExpression(d.initializer)) {
                        const cName = d.initializer.expression.getText(sf);
                        if (
                          [
                            "ref",
                            "shallowRef",
                            "reactive",
                            "computed",
                          ].includes(cName)
                        ) {
                          kind = cName;
                        }
                      } else if (
                        ts.isArrowFunction(d.initializer) ||
                        ts.isFunctionExpression(d.initializer)
                      ) {
                        isFn = true;
                      }
                    }
                    scopeDecls.set(dName, {
                      name: dName,
                      isFn,
                      kind,
                      doc,
                    });
                  }
                } else if (
                  ts.isFunctionDeclaration(bodyStmt) &&
                  bodyStmt.name
                ) {
                  const fName = bodyStmt.name.getText(sf);
                  const doc = getJsDocFromNode(bodyStmt, sf);
                  scopeDecls.set(fName, {
                    name: fName,
                    isFn: true,
                    kind: "function",
                    doc,
                  });
                } else if (ts.isReturnStatement(bodyStmt)) {
                  returnStmt = bodyStmt;
                }
              }

              if (
                returnStmt &&
                returnStmt.expression &&
                ts.isObjectLiteralExpression(returnStmt.expression)
              ) {
                for (const prop of returnStmt.expression.properties) {
                  const pName = prop.name?.getText(sf);
                  if (!pName) continue;
                  const info = scopeDecls.get(pName);
                  if (info) {
                    let inferredType = info.doc.type;
                    if (!inferredType) {
                      if (info.isFn) inferredType = "Function";
                      else if (info.kind === "shallowRef")
                        inferredType = "ShallowRef<any>";
                      else if (info.kind === "reactive")
                        inferredType = "Reactive<object>";
                      else if (info.kind === "computed")
                        inferredType = "ComputedRef<any>";
                      else if (info.kind === "ref") inferredType = "Ref<any>";
                      else inferredType = "any";
                    }

                    items.push({
                      name: pName,
                      category: info.isFn ? "action" : "state",
                      type: inferredType,
                      description:
                        info.doc.description ||
                        (info.isFn
                          ? `Action ${pName}`
                          : `Reactive ${pName} state`),
                      ...(info.doc.params.length > 0
                        ? { params: info.doc.params }
                        : {}),
                      ...(info.doc.returns
                        ? { returns: info.doc.returns }
                        : {}),
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return items;
}
