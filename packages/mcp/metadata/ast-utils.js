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
function getJsDocFromNode(node, sf) {
  const tsType = ts.getJSDocType(node);
  let type = tsType ? tsType.getText(sf) : null;
  let typeNode = tsType || null;
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
          typeNode = tag.typeExpression.type;
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
    typeNode,
    params,
    returns,
  };
}

/**
 * Extract TypeScript AST type node into JSON Schema format
 */
export function tsTypeNodeToSchema(typeNode, sf) {
  if (!typeNode) return { type: "unknown" };

  if (ts.isImportTypeNode(typeNode)) {
    if (typeNode.typeArguments && typeNode.typeArguments.length > 0) {
      return tsTypeNodeToSchema(typeNode.typeArguments[0], sf);
    }
    return { type: "object" };
  }

  if (ts.isTypeReferenceNode(typeNode)) {
    const typeName = typeNode.typeName.getText(sf);
    if (
      typeName.endsWith("PropType") &&
      typeNode.typeArguments &&
      typeNode.typeArguments.length > 0
    ) {
      return tsTypeNodeToSchema(typeNode.typeArguments[0], sf);
    }
    if (typeNode.typeArguments && typeNode.typeArguments.length > 0) {
      return tsTypeNodeToSchema(typeNode.typeArguments[0], sf);
    }
    return { type: typeName };
  }

  if (ts.isTypeLiteralNode(typeNode)) {
    const properties = {};
    const required = [];
    for (const member of typeNode.members) {
      if (ts.isPropertySignature(member)) {
        const propName = member.name.getText(sf);
        properties[propName] = member.type
          ? tsTypeNodeToSchema(member.type, sf)
          : { type: "unknown" };
        if (!member.questionToken) {
          required.push(propName);
        }
      }
    }
    return {
      type: "object",
      properties,
      ...(required.length > 0 ? { required } : {}),
    };
  }

  if (ts.isUnionTypeNode(typeNode)) {
    return { anyOf: typeNode.types.map((t) => tsTypeNodeToSchema(t, sf)) };
  }

  if (ts.isIntersectionTypeNode(typeNode)) {
    const merged = { type: "object", properties: {} };
    for (const sub of typeNode.types) {
      const s = tsTypeNodeToSchema(sub, sf);
      if (s.properties) {
        Object.assign(merged.properties, s.properties);
      }
    }
    return Object.keys(merged.properties).length > 0
      ? merged
      : { type: "object" };
  }

  if (ts.isArrayTypeNode(typeNode)) {
    return {
      type: "array",
      items: tsTypeNodeToSchema(typeNode.elementType, sf),
    };
  }

  if (ts.isTupleTypeNode(typeNode)) {
    return {
      type: "array",
      items: typeNode.elements.map((t) => tsTypeNodeToSchema(t, sf)),
    };
  }

  if (ts.isLiteralTypeNode(typeNode)) {
    let val;
    try {
      val = JSON.parse(typeNode.getText(sf));
    } catch {
      val = typeNode.getText(sf);
    }
    return { const: val };
  }

  if (ts.isFunctionTypeNode(typeNode)) {
    return { type: "function" };
  }

  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return { type: "string" };
    case ts.SyntaxKind.NumberKeyword:
      return { type: "number" };
    case ts.SyntaxKind.BooleanKeyword:
      return { type: "boolean" };
    case ts.SyntaxKind.ObjectKeyword:
      return { type: "object" };
    case ts.SyntaxKind.AnyKeyword:
    case ts.SyntaxKind.UnknownKeyword:
      return { type: "unknown" };
    case ts.SyntaxKind.VoidKeyword:
    case ts.SyntaxKind.UndefinedKeyword:
      return { type: "undefined" };
    default:
      return { type: "object" };
  }
}

export function identifierToSchema(idText) {
  if (!idText) return { type: "unknown" };
  const lower = idText.toLowerCase();
  if (lower.includes("boolean")) return { type: "boolean" };
  if (lower.includes("string")) return { type: "string" };
  if (lower.includes("number")) return { type: "number" };
  if (lower.includes("array")) return { type: "array" };
  if (lower.includes("function")) return { type: "function" };
  if (lower.includes("object")) return { type: "object" };
  return { type: idText };
}

export { getJsDocFromNode };
