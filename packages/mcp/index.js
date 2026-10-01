#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getMetadata } from "./helpers.js";
import { registerWidgetTools } from "./tools/widgets.js";
import { registerArchitectureTools } from "./tools/architecture.js";
import { registerGeneratorTools } from "./tools/generators.js";
import { registerDiscoveryTools } from "./tools/discovery.js";
import { createExpressApp as createExpressAppInternal } from "./server.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8"),
);

export { getMetadata };

/**
 * Creates and registers tools on an McpServer instance
 */
export function createMcpServer() {
  const { widgetsData, architectureData } = getMetadata();

  const server = new McpServer(
    {
      name: pkg.name || "@eodash/mcp-server",
      version: pkg.version || "1.0.0",
    },
    {
      instructions:
        "Inspect, configure, and scaffold @eodash/eodash instances, widgets, layouts, styles, and STAC integrations. " +
        "NOTE: MCP generation tools return code/files in-memory and do NOT write directly to disk; use file writing tools to write returned files.",
      capabilities: {
        tools: {
          call: {},
        },
      },
    },
  );

  registerWidgetTools(server, widgetsData);
  registerArchitectureTools(server, architectureData);
  registerGeneratorTools(server);
  registerDiscoveryTools(server);

  return server;
}

export function createExpressApp() {
  return createExpressAppInternal(createMcpServer);
}

async function startServer() {
  const app = createExpressApp();
  let port = 3001;

  const portArgIndex = process.argv.indexOf("--port");
  if (portArgIndex > -1 && process.argv[portArgIndex + 1]) {
    port = parseInt(process.argv[portArgIndex + 1], 10);
  }

  app.listen(port, () => {
    console.log(`eodash MCP Server running at http://localhost:${port}`);
  });
}

function isDirectExecution() {
  if (!process.argv[1]) return false;
  try {
    const realArgv1 = fs.realpathSync(path.resolve(process.argv[1]));
    const realFilename = fs.realpathSync(__filename);
    return realArgv1 === realFilename;
  } catch {
    return path.resolve(process.argv[1]) === path.resolve(__filename);
  }
}

// Auto start if executed directly
if (isDirectExecution()) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}
