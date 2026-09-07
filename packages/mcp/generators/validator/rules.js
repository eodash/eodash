/**
 * Performs custom EODash domain/business rule validations
 * on parsed catalog config object.
 */
export function validateCustomRules(parsed, errors, warnings) {
  // Business Rules Checks for EODash Catalog Configs (PascalCase)
  if (parsed.Resources && Array.isArray(parsed.Resources)) {
    for (let i = 0; i < parsed.Resources.length; i++) {
      const res = parsed.Resources[i];
      // Rule 1: Style must be URL string, not JSON object
      if (res.Style && typeof res.Style === "object") {
        errors.push({
          path: `/Resources/${i}/Style`,
          keyword: "type",
          message: "Style MUST be a URL string, not a direct JSON object.",
          suggestion:
            "Save the style to an external JSON file and provide the relative or absolute URL in Style.",
        });
      }

      // Rule 1b: Resources[].Flatstyle does not exist
      if (res.Flatstyle !== undefined) {
        errors.push({
          path: `/Resources/${i}/Flatstyle`,
          keyword: "additionalProperties",
          message:
            "Property 'Flatstyle' does not exist on Resources. Use 'Style' for resource styles (Flatstyle is only valid under Process outputs).",
          suggestion: "Rename 'Flatstyle' to 'Style' with a valid URL string.",
        });
      }

      // Rule 2: Rasterform branching keep_oneof_values check
      if (res.Rasterform && typeof res.Rasterform === "object") {
        if (
          (res.Rasterform.oneOf || res.Rasterform.anyOf) &&
          res.Rasterform.options?.keep_oneof_values !== false
        ) {
          warnings.push(
            `Resource[${i}] Rasterform uses branching (oneOf/anyOf) without "keep_oneof_values": false in options. This may cause values to leak between branches in json-editor.`,
          );
        }
      }
    }
  }

  // Top-level Style object check
  if (parsed.Style && typeof parsed.Style === "object") {
    errors.push({
      path: "/Style",
      keyword: "type",
      message: "Style MUST be a URL string, not a direct JSON object.",
      suggestion:
        "Save the style to an external JSON file and provide the relative or absolute URL in Style.",
    });
  }

  // Top-level Flatstyle check on catalog collection
  if (parsed.Flatstyle !== undefined) {
    errors.push({
      path: "/Flatstyle",
      keyword: "additionalProperties",
      message:
        "Property 'Flatstyle' does not exist on catalog collection. Use 'Style' (Flatstyle is only valid under Process outputs).",
      suggestion: "Rename 'Flatstyle' to 'Style' with a valid URL string.",
    });
  }
}
