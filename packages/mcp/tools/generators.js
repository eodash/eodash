import { registerStyleGeneratorTool } from "./generators/style.js";

/**
 * Register code/style generation tools
 */
export function registerGeneratorTools(server) {
  registerStyleGeneratorTool(server);
}
