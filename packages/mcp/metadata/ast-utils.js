import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

/**
 * Recursively collect all files in a directory
 */
export function collectFiles(dir) {
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

export function cleanMultilineType(typeStr) {
  if (!typeStr) return null;
  return typeStr
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function unwrapPropType(typeStr) {
  if (!typeStr) return "unknown";
  const cleaned = cleanMultilineType(typeStr);
  const match = cleaned.match(
    /^(?:import\(["']vue["']\)\.)?PropType<([\s\S]+)>$/,
  );
  if (match) return match[1].trim();
  return cleaned;
}

/**
 * Clean and parse JSDoc comments attached to AST nodes using TypeScript compiler API
 */
export function getJsDocFromNode(node, sf) {
  const tsType = ts.getJSDocType(node);
  let type = tsType ? tsType.getText(sf) : null;
  let description = "";
  const params = [];
  let returns = null;

  if (node.jsDoc) {
    for (const doc of node.jsDoc) {
      if (doc.comment) {
        description =
          typeof doc.comment === "string"
            ? doc.comment
            : doc.comment
                .map((c) => (typeof c === "string" ? c : c.text || ""))
                .join("");
      }
      for (const tag of doc.tags || []) {
        if (ts.isJSDocTypeTag(tag) && tag.typeExpression?.type) {
          type = tag.typeExpression.type.getText(sf);
        } else if (ts.isJSDocParameterTag(tag)) {
          const pComment = tag.comment
            ? typeof tag.comment === "string"
              ? tag.comment
              : tag.comment
                  .map((c) => (typeof c === "string" ? c : c.text || ""))
                  .join("")
            : "";
          params.push({
            name: tag.name?.getText(sf) || "",
            type:
              cleanMultilineType(tag.typeExpression?.type?.getText(sf)) ||
              "any",
            description: pComment.trim(),
          });
        } else if (ts.isJSDocReturnTag(tag)) {
          const rComment = tag.comment
            ? typeof tag.comment === "string"
              ? tag.comment
              : tag.comment
                  .map((c) => (typeof c === "string" ? c : c.text || ""))
                  .join("")
            : "";
          returns = {
            type:
              cleanMultilineType(tag.typeExpression?.type?.getText(sf)) ||
              "any",
            description: rComment.trim(),
          };
        }
      }
    }
  }

  return {
    description: description.trim(),
    type: cleanMultilineType(type),
    params,
    returns,
  };
}

/**
 * Extract typed AST object literals into JSON Schema format
 */
export function typeNodeToJsonSchema(node) {
  if (ts.isTypeLiteralNode(node)) {
    const properties = {};
    const required = [];
    for (const member of node.members) {
      if (ts.isPropertySignature(member) && member.name) {
        const propName = member.name.getText();
        if (!member.questionToken) required.push(propName);
        properties[propName] = member.type
          ? typeNodeToJsonSchema(member.type)
          : { type: "any" };
      }
    }
    return {
      type: "object",
      properties,
      ...(required.length > 0 ? { required } : {}),
    };
  }
  if (ts.isArrayTypeNode(node)) {
    return {
      type: "array",
      items: typeNodeToJsonSchema(node.elementType),
    };
  }
  if (ts.isUnionTypeNode(node)) {
    return {
      anyOf: node.types.map(typeNodeToJsonSchema),
    };
  }
  if (node.kind === ts.SyntaxKind.StringKeyword) return { type: "string" };
  if (node.kind === ts.SyntaxKind.NumberKeyword) return { type: "number" };
  if (node.kind === ts.SyntaxKind.BooleanKeyword) return { type: "boolean" };
  if (node.kind === ts.SyntaxKind.AnyKeyword) return { type: "any" };

  return { type: node.getText() };
}
