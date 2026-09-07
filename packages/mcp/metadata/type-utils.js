export function stringifyType(t) {
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

export function typeToSchema(t) {
  if (!t) return { type: "unknown" };
  if (t.type === "intrinsic") {
    return { type: t.name === "any" ? "unknown" : t.name };
  }
  if (t.type === "literal") {
    return { const: t.value };
  }
  if (t.type === "array") {
    return { type: "array", items: typeToSchema(t.elementType) };
  }
  if (t.type === "tuple") {
    return { type: "array", items: t.elements.map(typeToSchema) };
  }
  if (t.type === "union") {
    return { anyOf: t.types.map(typeToSchema) };
  }
  if (t.type === "intersection") {
    const merged = { type: "object", properties: {} };
    for (const sub of t.types) {
      const s = typeToSchema(sub);
      if (s.properties) {
        Object.assign(merged.properties, s.properties);
      }
    }
    return Object.keys(merged.properties).length > 0
      ? merged
      : { type: "object" };
  }
  if (t.type === "reference") {
    if (t.typeArguments && t.typeArguments.length > 0) {
      return typeToSchema(t.typeArguments[0]);
    }
    return { type: t.name };
  }
  if (t.type === "reflection") {
    if (t.declaration?.children) {
      const properties = {};
      const required = [];
      for (const child of t.declaration.children) {
        properties[child.name] = {
          ...typeToSchema(child.type),
          ...(child.comment?.summary
            ? {
                description: child.comment.summary
                  .map((s) => s.text)
                  .join("")
                  .trim(),
              }
            : {}),
        };
        if (!child.flags?.isOptional) {
          required.push(child.name);
        }
      }
      return {
        type: "object",
        properties,
        ...(required.length > 0 ? { required } : {}),
      };
    }
    if (t.declaration?.signatures) {
      return { type: "function" };
    }
    return { type: "object" };
  }
  return { type: typeof t === "string" ? t : "object" };
}
