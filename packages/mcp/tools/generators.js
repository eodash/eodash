import { registerDashboardScaffoldTool } from "./generators/dashboard.js";
import { registerConfigGeneratorTool } from "./generators/config.js";
import { registerStyleGeneratorTool } from "./generators/style.js";

/**
 * Register all generation tools (scaffold, config, styles)
 */
export function registerGeneratorTools(server) {
  registerDashboardScaffoldTool(server);
  registerConfigGeneratorTool(server);
  registerStyleGeneratorTool(server);
}
