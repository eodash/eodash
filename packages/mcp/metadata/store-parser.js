import path from "node:path";
import { parseTopLevelStoreAst, parsePiniaStoreAst } from "./store-ast.js";

export { analyzeStoreInteractions } from "./store-interactions.js";
export { extractExamplesFromTemplates } from "./template-examples.js";
export { parseTopLevelStoreAst, parsePiniaStoreAst };

export function inferReactiveStoreMetadata(repoRoot) {
  const statesFile = path.join(repoRoot, "core/client/store/states.js");
  const stacFile = path.join(repoRoot, "core/client/store/stac.js");
  const actionsFile = path.join(repoRoot, "core/client/store/actions.js");

  return {
    description:
      "Global reactive store and Pinia store managing STAC endpoint, active collection, selected item, datetime, map instances, and chart states. Accessible via window.eodashStore or `import { store } from '@eodash/eodash'`.",
    states: parseTopLevelStoreAst(statesFile),
    stacStore: parsePiniaStoreAst(stacFile),
    actions: parseTopLevelStoreAst(actionsFile),
  };
}
