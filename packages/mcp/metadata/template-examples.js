import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

/**
 * AST-based live widget example extraction from templates/*.js
 */
export function extractExamplesFromTemplates(repoRoot) {
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
